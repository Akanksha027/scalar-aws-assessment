from __future__ import annotations

import re
from typing import Any

IPV4_RE = re.compile(
    r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}"
    r"(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$"
)
IPV6_RE = re.compile(
    r"^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|"
    r"([0-9a-fA-F]{1,4}:){1,7}:|"
    r"([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|"
    r"([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|"
    r"([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|"
    r"([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|"
    r"([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|"
    r"[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|"
    r":((:[0-9a-fA-F]{1,4}){1,7}|:))$"
)
DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+"
    r"[a-zA-Z]{2,}\.?$"
)


def normalize_domain(domain: str) -> str:
    return domain.strip().lower().rstrip(".")


def validate_domain_name(domain: str) -> str | None:
    value = normalize_domain(domain)
    if not value:
        return "Domain name is required."
    if not DOMAIN_RE.match(value) and not re.match(r"^[a-zA-Z0-9-]+$", value):
        return "Enter a valid domain name (for example, example.com)."
    return None


def is_hostname(value: str) -> bool:
    cleaned = value.strip().rstrip(".")
    return bool(DOMAIN_RE.match(cleaned) or re.match(r"^[a-zA-Z0-9-]+$", cleaned))


def validate_record_values(record_type: str, values: list[dict[str, Any]]) -> str | None:
    if not values or all(not str(v.get("value", "")).strip() for v in values):
        return "At least one value is required."

    for entry in values:
        value = str(entry.get("value", "")).strip()
        if record_type == "A" and not IPV4_RE.match(value):
            return f'"{value}" is not a valid IPv4 address.'
        if record_type == "AAAA" and not IPV6_RE.match(value):
            return f'"{value}" is not a valid IPv6 address.'
        if record_type in {"CNAME", "NS", "PTR"} and not is_hostname(value):
            return f'"{value}" is not a valid domain name.'
        if record_type == "TXT" and len(value) > 255:
            return "Each TXT value chunk must be 255 characters or fewer."
        if record_type == "MX":
            priority = entry.get("priority")
            if priority is None or int(priority) < 0:
                return "MX records require a non-negative priority."
            if not is_hostname(value):
                return f'"{value}" is not a valid mail server hostname.'
        if record_type == "SRV":
            if entry.get("priority") is None or entry.get("weight") is None or entry.get("port") is None:
                return "SRV records require priority, weight, and port."
            port = int(entry["port"])
            if port < 0 or port > 65535:
                return "SRV port must be between 0 and 65535."
            if not is_hostname(value):
                return f'"{value}" is not a valid SRV target.'
        if record_type == "CAA":
            flag = entry.get("flag")
            tag = entry.get("tag")
            if flag not in (0, 128):
                return "CAA flag must be 0 or 128."
            if tag not in {"issue", "issuewild", "iodef"}:
                return "CAA tag must be issue, issuewild, or iodef."
            if not value:
                return "CAA value is required."

    if record_type == "CNAME" and len(values) > 1:
        return "CNAME records can only have a single value."
    return None
