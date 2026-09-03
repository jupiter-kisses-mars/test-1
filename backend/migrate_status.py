import sys
sys.path.insert(0, ".")
from database import engine
from sqlalchemy import text, inspect as sa_inspect

with engine.connect() as conn:
    inspector = sa_inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("trip_members")]
    if "status" not in columns:
        conn.execute(text("ALTER TABLE trip_members ADD COLUMN status VARCHAR(50) DEFAULT 'accepted'"))
        conn.commit()
        print("SUCCESS: Added status column to trip_members")
    else:
        print("OK: status column already exists")
