from fastapi import APIRouter, HTTPException, status,FastAPI
from ..models.participante_model import ParticipanteCreate, ParticipanteResponse
from ..services.participante_service import crear_participante, listar_participantes

router = APIRouter(prefix="/participantes", tags=["participante"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(p: ParticipanteCreate):
    return crear_participante(p)

@router.get("/")
def list_all():
    return listar_participantes()
