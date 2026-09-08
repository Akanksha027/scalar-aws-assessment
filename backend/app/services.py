from __future__ import annotations

import random
import string
import uuid
from datetime import datetime, timezone

from .database import db_session
from .validators import normalize_domain


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def generate_zone_id() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "Z" + "".join(random.choice(alphabet) for _ in range(13))


def fqdn(name: str, zone_domain: str) -> str:
    cleaned = name.strip().rstrip(".")
    zone = normalize_domain(zone_domain)
    if not cleaned or cleaned == "@":
        return zone
    lower = cleaned.lower()
    if lower == zone or lower.endswith(f".{zone}"):
        return lower
    return f"{lower}.{zone}"


def refresh_record_count(conn, zone_id: str) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS c FROM dns_records WHERE hosted_zone_id = ?",
        (zone_id,),
    ).fetchone()
    count = int(row["c"])
    conn.execute(
        "UPDATE hosted_zones SET record_count = ?, updated_at = ? WHERE id = ?",
        (count, utc_now_iso(), zone_id),
    )
    return count


def seed_system_records(conn, zone_id: str, domain: str) -> None:
    now = utc_now_iso()
    ns_id = str(uuid.uuid4())
    soa_id = str(uuid.uuid4())
    ns_values = [
        "ns-1536.awsdns-00.co.uk.",
        "ns-0.awsdns-00.com.",
        "ns-1024.awsdns-00.org.",
        "ns-512.awsdns-00.net.",
    ]
    conn.execute(
        """
        INSERT INTO dns_records
        (id, hosted_zone_id, name, type, ttl, routing_policy, is_system_record, created_at, updated_at)
        VALUES (?, ?, ?, 'NS', 172800, 'Simple', 1, ?, ?)
        """,
        (ns_id, zone_id, domain, now, now),
    )
    for i, value in enumerate(ns_values):
        conn.execute(
            """
            INSERT INTO dns_record_values (record_id, value, sort_order)
            VALUES (?, ?, ?)
            """,
            (ns_id, value, i),
        )

    soa_value = (
        "ns-1536.awsdns-00.co.uk. awsdns-hostmaster.amazon.com. "
        "1 7200 900 1209600 86400"
    )
    conn.execute(
        """
        INSERT INTO dns_records
        (id, hosted_zone_id, name, type, ttl, routing_policy, is_system_record, created_at, updated_at)
        VALUES (?, ?, ?, 'SOA', 900, 'Simple', 1, ?, ?)
        """,
        (soa_id, zone_id, domain, now, now),
    )
    conn.execute(
        """
        INSERT INTO dns_record_values (record_id, value, sort_order)
        VALUES (?, ?, 0)
        """,
        (soa_id, soa_value),
    )


def zone_to_dict(row, created_by: str) -> dict:
    return {
        "id": row["id"],
        "domain_name": row["domain_name"],
        "type": row["type"],
        "comment": row["comment"],
        "description": row["description"],
        "created_by": created_by,
        "record_count": row["record_count"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def fetch_record_values(conn, record_id: str) -> list[dict]:
    rows = conn.execute(
        """
        SELECT value, priority, weight, port, flag, tag
        FROM dns_record_values
        WHERE record_id = ?
        ORDER BY sort_order, id
        """,
        (record_id,),
    ).fetchall()
    return [
        {
            "value": r["value"],
            "priority": r["priority"],
            "weight": r["weight"],
            "port": r["port"],
            "flag": r["flag"],
            "tag": r["tag"],
        }
        for r in rows
    ]


def record_to_dict(conn, row) -> dict:
    return {
        "id": row["id"],
        "hosted_zone_id": row["hosted_zone_id"],
        "name": row["name"],
        "type": row["type"],
        "ttl": row["ttl"],
        "routing_policy": row["routing_policy"],
        "alias": False,
        "is_system_record": bool(row["is_system_record"]),
        "values": fetch_record_values(conn, row["id"]),
        "health_check": None,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def insert_record_values(conn, record_id: str, values: list[dict]) -> None:
    for i, entry in enumerate(values):
        conn.execute(
            """
            INSERT INTO dns_record_values
            (record_id, value, priority, weight, port, flag, tag, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                entry["value"].strip(),
                entry.get("priority"),
                entry.get("weight"),
                entry.get("port"),
                entry.get("flag"),
                entry.get("tag"),
                i,
            ),
        )
