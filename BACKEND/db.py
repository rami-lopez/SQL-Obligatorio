import mysql.connector
import os

def connection():
    cnx = mysql.connector.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME")

        # o similar
    )
    return cnx