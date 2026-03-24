from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator, EmailStr
from .models import PolicyType, PolicyStatus


class WalletSignatureRequest(BaseModel):
    stellar_address: str = Field(
        ...,
        min_length=56,
        max_length=56,
        description="Stellar wallet address (56 characters, starts with 'G')"
    )
    signature: str = Field(..., min_length=1, description="Cryptographic signature")
    message: str = Field(..., min_length=1, description="Message that was signed")

    @field_validator('stellar_address')
    @classmethod
    def validate_stellar_address(cls, v: str) -> str:
        if not v.startswith('G'):
            raise ValueError('Stellar address must start with "G"')
        if not all(c.isalnum() for c in v):
            raise ValueError('Stellar address must contain only alphanumeric characters')
        return v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1, description="Refresh token for authentication")


class UserResponse(BaseModel):
    id: int
    stellar_address: str
    email: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="User email address")

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) > 255:
                raise ValueError('Email must not exceed 255 characters')
        return v


class PolicyCreateRequest(BaseModel):
    policy_type: PolicyType = Field(..., description="Type of insurance policy")
    coverage_amount: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Coverage amount in Stellar lumens (must be positive, max 1 billion)"
    )
    premium: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Premium amount in Stellar lumens (must be positive, max 1 billion)"
    )
    start_time: int = Field(
        ...,
        gt=0,
        description="Policy start time as Unix timestamp (must be in the future)"
    )
    end_time: int = Field(
        ...,
        gt=0,
        description="Policy end time as Unix timestamp (must be greater than start_time)"
    )
    trigger_condition: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Condition that triggers claim payout"
    )

    @field_validator('policy_type')
    @classmethod
    def validate_policy_type(cls, v: PolicyType) -> PolicyType:
        valid_types = [PolicyType.weather, PolicyType.smart_contract, 
                       PolicyType.flight, PolicyType.health, PolicyType.asset]
        if v not in valid_types:
            raise ValueError(f'Invalid policy type. Must be one of: {", ".join([t.value for t in valid_types])}')
        return v

    @field_validator('coverage_amount', 'premium')
    @classmethod
    def validate_amount_precision(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1_000_000_000:
            raise ValueError('Amount cannot exceed 1,000,000,000')
        return round(v, 7)

    @model_validator(mode='after')
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError('End time must be greater than start time')
        return self


class PolicyFilterRequest(BaseModel):
    status: Optional[PolicyStatus] = Field(None, description="Filter by policy status")
    policy_type: Optional[PolicyType] = Field(None, description="Filter by policy type")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: Optional[PolicyStatus]) -> Optional[PolicyStatus]:
        if v is not None:
            valid_statuses = [
                PolicyStatus.active, PolicyStatus.expired, PolicyStatus.cancelled,
                PolicyStatus.claim_pending, PolicyStatus.claim_approved, PolicyStatus.claim_rejected
            ]
            if v not in valid_statuses:
                raise ValueError(f'Invalid status. Must be one of: {", ".join([s.value for s in valid_statuses])}')
        return v

    @field_validator('policy_type')
    @classmethod
    def validate_type(cls, v: Optional[PolicyType]) -> Optional[PolicyType]:
        if v is not None:
            valid_types = [PolicyType.weather, PolicyType.smart_contract,
                           PolicyType.flight, PolicyType.health, PolicyType.asset]
            if v not in valid_types:
                raise ValueError(f'Invalid policy type. Must be one of: {", ".join([t.value for t in valid_types])}')
        return v


class PolicyListResponse(BaseModel):
    policies: list
    total: int
    page: int
    per_page: int
    has_next: bool


class PolicyResponse(BaseModel):
    id: int
    policyholder_id: int
    policy_type: PolicyType
    coverage_amount: float
    premium: float
    start_time: int
    end_time: int
    trigger_condition: str
    status: PolicyStatus
    claim_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClaimCreateRequest(BaseModel):
    policy_id: int = Field(..., gt=0, description="ID of the policy to claim against")
    claim_amount: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Claim amount in Stellar lumens (must be positive, max 1 billion)"
    )
    proof: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Evidence or proof supporting the claim"
    )

    @field_validator('claim_amount')
    @classmethod
    def validate_claim_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Claim amount must be positive')
        if v > 1_000_000_000:
            raise ValueError('Claim amount cannot exceed 1,000,000,000')
        return round(v, 7)

    @field_validator('proof')
    @classmethod
    def validate_proof(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Proof cannot be empty or whitespace only')
        return v.strip()


class ClaimResponse(BaseModel):
    id: int
    policy_id: int
    claimant_id: int
    claim_amount: float
    proof: str
    timestamp: int
    approved: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    policy_id: Optional[int]
    claim_id: Optional[int]
    transaction_hash: str
    amount: float
    transaction_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
