from sqlalchemy.orm import Session


def test_settings_expose_pool_configuration():
    from src.config import Settings

    settings = Settings()

    assert settings.db_pool_size > 0
    assert settings.db_max_overflow >= 0
    assert settings.db_pool_timeout > 0
    assert settings.db_pool_recycle > 0


def test_engine_is_configured():
    from src.database import engine

    assert engine is not None
    assert engine.pool is not None


def test_get_db_yields_a_session():
    from src.database import get_db

    generator = get_db()
    session = next(generator)

    assert isinstance(session, Session)

    try:
        next(generator)
    except StopIteration:
        pass


def test_get_pool_status_returns_expected_shape():
    from src.database import get_pool_status

    status = get_pool_status()

    assert set(status) == {
        "pool_size",
        "checked_out_connections",
        "overflow_connections",
        "checked_in_connections",
        "total_connections",
    }


def test_health_check_returns_status_dict():
    from src.database import health_check

    result = health_check()

    assert "status" in result
    assert "database" in result
