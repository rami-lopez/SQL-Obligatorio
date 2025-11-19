from fastapi import APIRouter, Depends
from api.auth import get_current_active_admin
from services.scheduler_service import (
    procesar_reservas_finalizadas
)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/procesar-reservas-manual")
def ejecutar_procesamiento_manual(current_user = Depends(get_current_active_admin)):
    """
    Ejecuta manualmente el procesamiento de reservas finalizadas
    Atención: aplica la sanción a partir del momento que se ejecuta.
    
    Disponible solo para administradores.
    
    """
    return procesar_reservas_finalizadas()

@router.get("/estado-scheduler")
def estado_scheduler(current_user = Depends(get_current_active_admin)):
    """Ver estado de las tareas programadas"""
    from main import scheduler
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time),
            "trigger": str(job.trigger)
        })
    
    return {
        "scheduler_activo": scheduler.running,
        "tareas": jobs
    }
