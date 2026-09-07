from database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Successfully connected to Supabase PostgreSQL!")
        print(result.fetchone())

except Exception as e:
    print("❌ Database connection failed:")
    print(e)