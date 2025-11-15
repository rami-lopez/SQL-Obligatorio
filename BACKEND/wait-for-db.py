import os
import time
import mysql.connector

print("--- Wait for DB script started ---")

# Get DB connection details from environment variables
db_host = os.environ.get("DB_HOST")
db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")
db_name = os.environ.get("DB_NAME")

retries = 15
delay = 5

for i in range(retries):
    try:
        print(f"Attempting to connect to the database... (Attempt {i+1}/{retries})")
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name,
            connection_timeout=10
        )
        conn.close()
        print("✅ Database connection successful.")
        print("--- Wait for DB script finished ---")
        exit(0)
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        if i < retries - 1:
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)

print("🚨 Could not connect to the database after several retries. Exiting.")
exit(1)
