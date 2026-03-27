import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, StaticPool
from .models import Base
from .config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


def _build_engine():
    engine_kwargs = {
        "echo": settings.db_echo,
    }

    if settings.database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
        if ":memory:" in settings.database_url:
            engine_kwargs["poolclass"] = StaticPool
    else:
        engine_kwargs.update(
            {
                "poolclass": QueuePool,
                "pool_size": settings.db_pool_size,
                "max_overflow": settings.db_max_overflow,
                "pool_timeout": settings.db_pool_timeout,
                "pool_recycle": settings.db_pool_recycle,
                "pool_pre_ping": settings.db_pool_pre_ping,
            }
        )

    return create_engine(settings.database_url, **engine_kwargs)


engine = _build_engine()


@event.listens_for(engine, "connect")
def receive_connect(dbapi_connection, connection_record):
    """Log new database connections"""
    logger.debug(f"New database connection established: {id(dbapi_connection)}")


@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    """Log connection checkout from pool"""
    logger.debug(f"Connection checked out: {id(dbapi_connection)}")


@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    """Log connection checkin to pool"""
    logger.debug(f"Connection checked in: {id(dbapi_connection)}")


@event.listens_for(engine, "checkin")
def receive_close(dbapi_connection, connection_record):
    """Log connection close"""
    logger.debug(f"Connection closed: {id(dbapi_connection)}")


@event.listens_for(engine, "invalidate")
def receive_invalidate(dbapi_connection, connection_record, exception):
    """Log connection invalidation"""
    logger.warning(f"Connection invalidated due to: {exception}")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database, creating all tables"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")


def get_db():
    """Get database session with automatic cleanup"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def get_pool_status():
    """Get current connection pool status"""
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_out_connections": pool.checkedout(),
        "overflow_connections": pool.overflow(),
        "checked_in_connections": pool.checkedin(),
        "total_connections": pool.size() + pool.overflow()
    }


def health_check():
    """Perform database health check"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
