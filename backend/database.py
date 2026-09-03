import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import Engine

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tripmate.db")

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# Enable foreign key constraints in SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from sqlalchemy import text

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auto_migrate_database(bind_engine, bind_base):
    bind_base.metadata.create_all(bind=bind_engine)
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        with bind_engine.connect() as conn:
            try:
                res = conn.execute(text("PRAGMA table_info(expenses)"))
                cols = [row[1] for row in res.fetchall()]
                if cols and "trip_id" not in cols:
                    conn.execute(text("ALTER TABLE expenses ADD COLUMN trip_id INTEGER"))
                    conn.commit()
            except Exception as e:
                print(f"Migration notice: {e}")


