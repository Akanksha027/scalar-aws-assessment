from datetime import datetime
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, Field

T = TypeVar("T")

RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "SOA", "PTR", "SRV", "CAA"]
ZoneType = Literal["Public", "Private"]
RoutingPolicy = Literal[
    "Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"
]


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    account_id: str


class HostedZoneOut(BaseModel):
    id: str
    domain_name: str
    type: ZoneType
    comment: str | None = None
    description: str | None = None
    created_by: str
    record_count: int
    created_at: datetime
    updated_at: datetime


class CreateHostedZoneRequest(BaseModel):
    domain_name: str = Field(min_length=1)
    type: ZoneType = "Public"
    comment: str | None = None
    description: str | None = None


class UpdateHostedZoneRequest(BaseModel):
    comment: str | None = None
    description: str | None = None


class DnsRecordValueIn(BaseModel):
    value: str
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    flag: int | None = None
    tag: str | None = None


class DnsRecordValueOut(DnsRecordValueIn):
    pass


class DnsRecordOut(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: RecordType
    ttl: int
    routing_policy: RoutingPolicy
    alias: bool = False
    is_system_record: bool
    values: list[DnsRecordValueOut]
    health_check: str | None = None
    created_at: datetime
    updated_at: datetime


class CreateRecordRequest(BaseModel):
    name: str
    type: RecordType
    ttl: int = 300
    routing_policy: RoutingPolicy = "Simple"
    values: list[DnsRecordValueIn]


class UpdateRecordRequest(BaseModel):
    name: str | None = None
    type: RecordType | None = None
    ttl: int | None = None
    routing_policy: RoutingPolicy | None = None
    values: list[DnsRecordValueIn] | None = None


class BulkDeleteRequest(BaseModel):
    record_ids: list[str]


class ErrorDetail(BaseModel):
    detail: str
    errors: list[dict[str, Any]] | None = None
