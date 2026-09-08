import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from ..auth import get_current_user
from ..database import db_session
from ..schemas import (
    BulkDeleteRequest,
    CreateRecordRequest,
    DnsRecordOut,
    Paginated,
    UpdateRecordRequest,
)
from ..services import (
    fqdn,
    insert_record_values,
    record_to_dict,
    refresh_record_count,
    utc_now_iso,
)
from ..validators import validate_record_values

router = APIRouter(prefix="/hosted-zones/{zone_id}/records", tags=["records"])

ALLOWED_CREATE_TYPES = {
    "A",
    "AAAA",
    "CNAME",
    "TXT",
    "MX",
    "NS",
    "PTR",
    "SRV",
    "CAA",
}


def _get_owned_zone(conn, zone_id: str, user_id: int):
    row = conn.execute(
        "SELECT * FROM hosted_zones WHERE id = ? AND user_id = ?",
        (zone_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Hosted zone not found.")
    return row


@router.get("", response_model=Paginated[DnsRecordOut])
def list_records(
    zone_id: str,
    search: str | None = None,
    type: str | None = Query(default=None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    with db_session() as conn:
        _get_owned_zone(conn, zone_id, user["id"])
        clauses = ["hosted_zone_id = ?"]
        params: list = [zone_id]
        if search:
            like = f"%{search.strip().lower()}%"
            clauses.append("(lower(name) LIKE ? OR lower(type) LIKE ?)")
            params.extend([like, like])
        if type:
            clauses.append("type = ?")
            params.append(type.upper())
        where = " AND ".join(clauses)
        total = conn.execute(
            f"SELECT COUNT(*) AS c FROM dns_records WHERE {where}", params
        ).fetchone()["c"]
        rows = conn.execute(
            f"""
            SELECT * FROM dns_records
            WHERE {where}
            ORDER BY lower(name) ASC, type ASC
            LIMIT ? OFFSET ?
            """,
            [*params, page_size, (page - 1) * page_size],
        ).fetchall()
        items = [DnsRecordOut(**record_to_dict(conn, row)) for row in rows]
    return Paginated(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=DnsRecordOut, status_code=status.HTTP_201_CREATED)
def create_record(
    zone_id: str,
    payload: CreateRecordRequest,
    user: dict = Depends(get_current_user),
):
    if payload.type not in ALLOWED_CREATE_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported record type.")
    if payload.ttl < 0:
        raise HTTPException(status_code=422, detail="TTL must be 0 or greater.")

    values = [v.model_dump() for v in payload.values]
    err = validate_record_values(payload.type, values)
    if err:
        raise HTTPException(status_code=422, detail=err)

    with db_session() as conn:
        zone = _get_owned_zone(conn, zone_id, user["id"])
        name = fqdn(payload.name, zone["domain_name"])
        conflict = conn.execute(
            """
            SELECT id FROM dns_records
            WHERE hosted_zone_id = ? AND name = ? AND type = ?
            """,
            (zone_id, name, payload.type),
        ).fetchone()
        if conflict:
            raise HTTPException(
                status_code=409,
                detail=f"A {payload.type} record set already exists for {name}. Edit the existing record instead.",
            )

        record_id = str(uuid.uuid4())
        now = utc_now_iso()
        conn.execute(
            """
            INSERT INTO dns_records
            (id, hosted_zone_id, name, type, ttl, routing_policy, is_system_record, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
            """,
            (
                record_id,
                zone_id,
                name,
                payload.type,
                payload.ttl,
                payload.routing_policy,
                now,
                now,
            ),
        )
        insert_record_values(conn, record_id, values)
        refresh_record_count(conn, zone_id)
        row = conn.execute(
            "SELECT * FROM dns_records WHERE id = ?", (record_id,)
        ).fetchone()
        return DnsRecordOut(**record_to_dict(conn, row))


@router.get("/{record_id}", response_model=DnsRecordOut)
def get_record(
    zone_id: str,
    record_id: str,
    user: dict = Depends(get_current_user),
):
    with db_session() as conn:
        _get_owned_zone(conn, zone_id, user["id"])
        row = conn.execute(
            """
            SELECT * FROM dns_records
            WHERE id = ? AND hosted_zone_id = ?
            """,
            (record_id, zone_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Record not found.")
        return DnsRecordOut(**record_to_dict(conn, row))


@router.patch("/{record_id}", response_model=DnsRecordOut)
def update_record(
    zone_id: str,
    record_id: str,
    payload: UpdateRecordRequest,
    user: dict = Depends(get_current_user),
):
    with db_session() as conn:
        zone = _get_owned_zone(conn, zone_id, user["id"])
        row = conn.execute(
            """
            SELECT * FROM dns_records
            WHERE id = ? AND hosted_zone_id = ?
            """,
            (record_id, zone_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Record not found.")

        is_system = bool(row["is_system_record"])
        next_type = payload.type or row["type"]
        next_name = (
            fqdn(payload.name, zone["domain_name"])
            if payload.name is not None
            else row["name"]
        )
        next_ttl = payload.ttl if payload.ttl is not None else row["ttl"]
        next_policy = payload.routing_policy or row["routing_policy"]

        if is_system and (payload.name is not None or payload.type is not None):
            raise HTTPException(
                status_code=400,
                detail="System records cannot change name or type.",
            )
        if next_ttl < 0:
            raise HTTPException(status_code=422, detail="TTL must be 0 or greater.")

        if payload.values is not None:
            values = [v.model_dump() for v in payload.values]
            err = validate_record_values(next_type, values)
            if err:
                raise HTTPException(status_code=422, detail=err)
        else:
            values = None

        conflict = conn.execute(
            """
            SELECT id FROM dns_records
            WHERE hosted_zone_id = ? AND name = ? AND type = ? AND id != ?
            """,
            (zone_id, next_name, next_type, record_id),
        ).fetchone()
        if conflict:
            raise HTTPException(
                status_code=409,
                detail=f"A {next_type} record set already exists for {next_name}.",
            )

        conn.execute(
            """
            UPDATE dns_records
            SET name = ?, type = ?, ttl = ?, routing_policy = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_name, next_type, next_ttl, next_policy, utc_now_iso(), record_id),
        )
        if values is not None:
            conn.execute(
                "DELETE FROM dns_record_values WHERE record_id = ?", (record_id,)
            )
            insert_record_values(conn, record_id, values)

        updated = conn.execute(
            "SELECT * FROM dns_records WHERE id = ?", (record_id,)
        ).fetchone()
        return DnsRecordOut(**record_to_dict(conn, updated))


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    zone_id: str,
    record_id: str,
    user: dict = Depends(get_current_user),
):
    with db_session() as conn:
        _get_owned_zone(conn, zone_id, user["id"])
        row = conn.execute(
            """
            SELECT * FROM dns_records
            WHERE id = ? AND hosted_zone_id = ?
            """,
            (record_id, zone_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Record not found.")
        if row["is_system_record"]:
            raise HTTPException(
                status_code=400,
                detail="System NS and SOA records cannot be deleted.",
            )
        conn.execute("DELETE FROM dns_records WHERE id = ?", (record_id,))
        refresh_record_count(conn, zone_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/bulk-delete")
def bulk_delete(
    zone_id: str,
    payload: BulkDeleteRequest,
    user: dict = Depends(get_current_user),
):
    if not payload.record_ids:
        raise HTTPException(status_code=422, detail="No record IDs provided.")

    with db_session() as conn:
        _get_owned_zone(conn, zone_id, user["id"])
        placeholders = ",".join("?" for _ in payload.record_ids)
        rows = conn.execute(
            f"""
            SELECT * FROM dns_records
            WHERE hosted_zone_id = ? AND id IN ({placeholders})
            """,
            [zone_id, *payload.record_ids],
        ).fetchall()
        if any(r["is_system_record"] for r in rows):
            raise HTTPException(
                status_code=400,
                detail="System NS and SOA records cannot be deleted.",
            )
        conn.execute(
            f"""
            DELETE FROM dns_records
            WHERE hosted_zone_id = ? AND id IN ({placeholders})
            """,
            [zone_id, *payload.record_ids],
        )
        refresh_record_count(conn, zone_id)
    return {"deleted": len(rows)}
