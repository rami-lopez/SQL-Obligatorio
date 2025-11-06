from fastapi import FastAPI
from BACKEND.db import connection
from BACKEND.api.participante import router

app = FastAPI()
app.include_router(router=router)
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