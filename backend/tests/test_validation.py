"""Test input validation with Pydantic for StellarInsure API"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient


class TestStellarAddressValidation:
    """Test suite for Stellar address validation"""

    def test_valid_stellar_address(self):
        """Test valid Stellar address format"""
        from src.schemas import WalletSignatureRequest

        valid_address = "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        request = WalletSignatureRequest(
            stellar_address=valid_address,
            signature="test_signature",
            message="test_message"
        )
        assert request.stellar_address == valid_address

    def test_stellar_address_wrong_length(self):
        """Test Stellar address with wrong length"""
        from src.schemas import WalletSignatureRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError) as exc_info:
            WalletSignatureRequest(
                stellar_address="GABC",
                signature="test_signature",
                message="test_message"
            )
        assert "at least 56 characters" in str(exc_info.value).lower() or "56" in str(exc_info.value)

    def test_stellar_address_wrong_prefix(self):
        """Test Stellar address not starting with G"""
        from src.schemas import WalletSignatureRequest
        from pydantic import ValidationError

        invalid_address = "SABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        with pytest.raises(ValidationError) as exc_info:
            WalletSignatureRequest(
                stellar_address=invalid_address,
                signature="test_signature",
                message="test_message"
            )
        assert "G" in str(exc_info.value)

    def test_stellar_address_special_chars(self):
        """Test Stellar address with special characters"""
        from src.schemas import WalletSignatureRequest
        from pydantic import ValidationError

        invalid_address = "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQR!"
        with pytest.raises(ValidationError):
            WalletSignatureRequest(
                stellar_address=invalid_address,
                signature="test_signature",
                message="test_message"
            )


class TestEmailValidation:
    """Test suite for email validation"""

    def test_valid_email(self):
        """Test valid email format"""
        from src.schemas import UserUpdateRequest

        request = UserUpdateRequest(email="test@example.com")
        assert request.email == "test@example.com"

    def test_invalid_email_format(self):
        """Test invalid email format"""
        from src.schemas import UserUpdateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            UserUpdateRequest(email="invalid-email")

    def test_email_too_long(self):
        """Test email exceeding max length"""
        from src.schemas import UserUpdateRequest
        from pydantic import ValidationError

        long_email = "a" * 250 + "@example.com"
        with pytest.raises(ValidationError):
            UserUpdateRequest(email=long_email)

    def test_email_empty_allowed(self):
        """Test that None email is allowed"""
        from src.schemas import UserUpdateRequest

        request = UserUpdateRequest(email=None)
        assert request.email is None


class TestPolicyValidation:
    """Test suite for policy validation"""

    def test_valid_policy_creation(self):
        """Test valid policy creation request"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType

        current_time = int(datetime.utcnow().timestamp())
        request = PolicyCreateRequest(
            policy_type=PolicyType.weather,
            coverage_amount=1000.0,
            premium=50.0,
            start_time=current_time,
            end_time=current_time + 86400,
            trigger_condition="Temperature below -10C"
        )
        assert request.coverage_amount == 1000.0

    def test_negative_coverage_amount(self):
        """Test negative coverage amount is rejected"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError):
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=-100.0,
                premium=50.0,
                start_time=current_time,
                end_time=current_time + 86400,
                trigger_condition="Temperature below -10C"
            )

    def test_coverage_amount_exceeds_max(self):
        """Test coverage amount exceeding max limit"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError):
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=2_000_000_000,
                premium=50.0,
                start_time=current_time,
                end_time=current_time + 86400,
                trigger_condition="Temperature below -10C"
            )

    def test_negative_premium(self):
        """Test negative premium is rejected"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError):
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=1000.0,
                premium=-50.0,
                start_time=current_time,
                end_time=current_time + 86400,
                trigger_condition="Temperature below -10C"
            )

    def test_end_time_before_start_time(self):
        """Test end time before start time is rejected"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError) as exc_info:
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=1000.0,
                premium=50.0,
                start_time=current_time + 86400,
                end_time=current_time,
                trigger_condition="Temperature below -10C"
            )
        assert "end time" in str(exc_info.value).lower()

    def test_trigger_condition_empty(self):
        """Test empty trigger condition is rejected"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError):
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=1000.0,
                premium=50.0,
                start_time=current_time,
                end_time=current_time + 86400,
                trigger_condition=""
            )

    def test_trigger_condition_too_long(self):
        """Test trigger condition exceeding max length"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType
        from pydantic import ValidationError

        current_time = int(datetime.utcnow().timestamp())
        with pytest.raises(ValidationError):
            PolicyCreateRequest(
                policy_type=PolicyType.weather,
                coverage_amount=1000.0,
                premium=50.0,
                start_time=current_time,
                end_time=current_time + 86400,
                trigger_condition="A" * 501
            )

    def test_amount_precision_rounding(self):
        """Test amount precision is rounded to 7 decimal places"""
        from src.schemas import PolicyCreateRequest
        from src.models import PolicyType

        current_time = int(datetime.utcnow().timestamp())
        request = PolicyCreateRequest(
            policy_type=PolicyType.weather,
            coverage_amount=100.123456789,
            premium=50.0,
            start_time=current_time,
            end_time=current_time + 86400,
            trigger_condition="Temperature below -10C"
        )
        assert request.coverage_amount == 100.1234568


class TestClaimValidation:
    """Test suite for claim validation"""

    def test_valid_claim_creation(self):
        """Test valid claim creation request"""
        from src.schemas import ClaimCreateRequest

        request = ClaimCreateRequest(
            policy_id=1,
            claim_amount=500.0,
            proof="Weather report evidence"
        )
        assert request.claim_amount == 500.0

    def test_negative_claim_amount(self):
        """Test negative claim amount is rejected"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=-500.0,
                proof="Weather report evidence"
            )

    def test_claim_amount_exceeds_max(self):
        """Test claim amount exceeding max limit"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=2_000_000_000,
                proof="Weather report evidence"
            )

    def test_claim_amount_zero(self):
        """Test zero claim amount is rejected"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=0,
                proof="Weather report evidence"
            )

    def test_proof_empty(self):
        """Test empty proof is rejected"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=500.0,
                proof=""
            )

    def test_proof_whitespace_only(self):
        """Test whitespace-only proof is rejected"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=500.0,
                proof="   "
            )

    def test_proof_too_long(self):
        """Test proof exceeding max length"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=1,
                claim_amount=500.0,
                proof="A" * 1001
            )

    def test_invalid_policy_id(self):
        """Test negative policy ID is rejected"""
        from src.schemas import ClaimCreateRequest
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            ClaimCreateRequest(
                policy_id=-1,
                claim_amount=500.0,
                proof="Weather report evidence"
            )


class TestPolicyFilterValidation:
    """Test suite for policy filter validation"""

    def test_valid_filter(self):
        """Test valid policy filter"""
        from src.schemas import PolicyFilterRequest
        from src.models import PolicyStatus, PolicyType

        request = PolicyFilterRequest(
            status=PolicyStatus.active,
            policy_type=PolicyType.weather
        )
        assert request.status == PolicyStatus.active
        assert request.policy_type == PolicyType.weather

    def test_filter_none_values(self):
        """Test filter with None values"""
        from src.schemas import PolicyFilterRequest

        request = PolicyFilterRequest(status=None, policy_type=None)
        assert request.status is None
        assert request.policy_type is None


class TestValidationErrorResponse:
    """Test suite for validation error responses"""

    def test_validation_error_returns_422(self):
        """Test that validation errors return 422 status"""
        from src.main import app
        from src.auth import create_access_token

        client = TestClient(app)

        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )

        response = client.post(
            "/policies/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_type": "weather",
                "coverage_amount": -100.0,
                "premium": 50.0,
                "start_time": 1000000,
                "end_time": 2000000,
                "trigger_condition": "Temperature below -10C"
            }
        )

        assert response.status_code == 422

    def test_validation_error_message_is_clear(self):
        """Test that validation error messages are helpful"""
        from src.main import app
        from src.auth import create_access_token

        client = TestClient(app)

        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )

        response = client.post(
            "/policies/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_type": "weather",
                "coverage_amount": -100.0,
                "premium": 50.0,
                "start_time": 1000000,
                "end_time": 2000000,
                "trigger_condition": "Temperature below -10C"
            }
        )

        assert response.status_code == 422
        error_detail = response.json().get("detail", [])
        assert len(error_detail) > 0

    def test_claim_validation_error_returns_422(self):
        """Test that claim validation errors return 422 status"""
        from src.main import app
        from src.auth import create_access_token

        client = TestClient(app)

        access_token = create_access_token(
            {"sub": "1", "stellar_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"}
        )

        response = client.post(
            "/claims/",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "policy_id": 1,
                "claim_amount": -500.0,
                "proof": "Evidence"
            }
        )

        assert response.status_code == 422
