from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from ..auth import get_current_user
from ..database import db_session
from ..schemas import (
    CreateHostedZoneRequest,
    HostedZoneOut,
    Paginated,
    UpdateHostedZoneRequest,
)
from ..services import (
    generate_zone_id,
    seed_system_records,
    utc_now_iso,
    zone_to_dict,
)
from ..validators import normalize_domain, validate_domain_name

router = APIRouter(prefix="/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=Paginated[HostedZoneOut])
def list_zones(
    search: str | None = None,
    type: str | None = Query(default=None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    clauses = ["user_id = ?"]
    params: list = [user["id"]]
    if search:
        like = f"%{search.strip().lower()}%"
        clauses.append(
            "(lower(domain_name) LIKE ? OR lower(id) LIKE ? OR "
            "lower(COALESCE(comment,'')) LIKE ? OR lower(COALESCE(description,'')) LIKE ?)"
        )
        params.extend([like, like, like, like])
    if type in {"Public", "Private"}:
        clauses.append("type = ?")
        params.append(type)

    where = " AND ".join(clauses)
    with db_session() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) AS c FROM hosted_zones WHERE {where}", params
        ).fetchone()["c"]
        rows = conn.execute(
            f"""
            SELECT * FROM hosted_zones
            WHERE {where}
            ORDER BY lower(domain_name) ASC
            LIMIT ? OFFSET ?
            """,
            [*params, page_size, (page - 1) * page_size],
        ).fetchall()
        items = [
            HostedZoneOut(**zone_to_dict(row, user["display_name"])) for row in rows
        ]
    return Paginated(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=HostedZoneOut, status_code=status.HTTP_201_CREATED)
def create_zone(
    payload: CreateHostedZoneRequest,
    user: dict = Depends(get_current_user),
):
    domain = normalize_domain(payload.domain_name)
    err = validate_domain_name(domain)
    if err:
        raise HTTPException(status_code=422, detail=err)

    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM hosted_zones WHERE user_id = ? AND domain_name = ?",
            (user["id"], domain),
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=409,
                detail="A hosted zone with this domain name already exists.",
            )

        zone_id = generate_zone_id()
        now = utc_now_iso()
        conn.execute(
            """
            INSERT INTO hosted_zones
            (id, user_id, domain_name, type, comment, description, record_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 2, ?, ?)
            """,
            (
                zone_id,
                user["id"],
                domain,
                payload.type,
                (payload.comment or "").strip() or None,
                (payload.description or "").strip() or None,
                now,
                now,
            ),
        )
        seed_system_records(conn, zone_id, domain)
        row = conn.execute(
            "SELECT * FROM hosted_zones WHERE id = ?", (zone_id,)
        ).fetchone()
        return HostedZoneOut(**zone_to_dict(row, user["display_name"]))


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_zone(zone_id: str, user: dict = Depends(get_current_user)):
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM hosted_zones WHERE id = ? AND user_id = ?",
            (zone_id, user["id"]),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Hosted zone not found.")
    return HostedZoneOut(**zone_to_dict(row, user["display_name"]))


@router.patch("/{zone_id}", response_model=HostedZoneOut)
def update_zone(
    zone_id: str,
    payload: UpdateHostedZoneRequest,
    user: dict = Depends(get_current_user),
):
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM hosted_zones WHERE id = ? AND user_id = ?",
            (zone_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Hosted zone not found.")

        comment = row["comment"]
        description = row["description"]
        if payload.comment is not None:
            comment = payload.comment.strip() or None
        if payload.description is not None:
            description = payload.description.strip() or None

        conn.execute(
            """
            UPDATE hosted_zones
            SET comment = ?, description = ?, updated_at = ?
            WHERE id = ?
            """,
            (comment, description, utc_now_iso(), zone_id),
        )
        updated = conn.execute(
            "SELECT * FROM hosted_zones WHERE id = ?", (zone_id,)
        ).fetchone()
        return HostedZoneOut(**zone_to_dict(updated, user["display_name"]))


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: str, user: dict = Depends(get_current_user)):
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM hosted_zones WHERE id = ? AND user_id = ?",
            (zone_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Hosted zone not found.")

        non_system = conn.execute(
            """
            SELECT COUNT(*) AS c FROM dns_records
            WHERE hosted_zone_id = ? AND is_system_record = 0
            """,
            (zone_id,),
        ).fetchone()["c"]
        if non_system > 0:
            raise HTTPException(
                status_code=400,
                detail="The hosted zone cannot be deleted until all non-system records are removed.",
            )

        conn.execute("DELETE FROM hosted_zones WHERE id = ?", (zone_id,))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
