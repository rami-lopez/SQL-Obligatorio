from fastapi import FastAPI
from db import connection

app = FastAPI()

@app.get("/")
def home():
    return {"mensaje": "API funcionando 🚀"}

@app.get("/usuarios")
def listar_usuarios():
    cnx = connection()
    cursor = cnx.cursor()

    cursor.execute("SELECT * FROM usuarios")
    usuarios = cursor.fetchall()

    cnx.close()
    return usuarios