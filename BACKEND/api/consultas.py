from fastapi import APIRouter, Depends
from services.consultas_service import (
    salas_mas_reservadas,
    turnos_mas_demandados,
    promedio_participantes_por_sala,
    reservas_por_carrera_facultad,
    ocupacion_salas_por_edificio,
    reservas_asistencias_por_rol,
    sanciones_por_rol,
    porcentaje_reservas_utilizadas,
    reservas_por_dia_semana,
    salas_menos_utilizadas,
    participantes_mas_activos
)

from services.consultas_service import dia_con_mas_creaciones_reservas
from api.auth import get_current_active_admin
from datetime import date
from typing import Optional

router = APIRouter(prefix="/reportes", tags=["reportes"])

@router.get("/salas-mas-reservadas")
def get_salas_mas_reservadas(
    limit: int = 10,
    current_user = Depends(get_current_active_admin)
):
    """Top N salas más reservadas"""
    return salas_mas_reservadas(limit)

@router.get("/turnos-mas-demandados")
def get_turnos_mas_demandados(current_user = Depends(get_current_active_admin)):
    """Turnos más demandados"""
    return turnos_mas_demandados()

@router.get("/promedio-participantes-sala")
def get_promedio_participantes(current_user = Depends(get_current_active_admin)):
    """Promedio de participantes por sala"""
    return promedio_participantes_por_sala()

@router.get("/reservas-por-carrera-facultad")
def get_reservas_carrera_facultad(current_user = Depends(get_current_active_admin)):
    """Cantidad de reservas por carrera y facultad"""
    return reservas_por_carrera_facultad()

@router.get("/ocupacion-salas-edificio")
def get_ocupacion_edificio(current_user = Depends(get_current_active_admin)):
    """Porcentaje de ocupación de salas por edificio"""
    return ocupacion_salas_por_edificio()

@router.get("/reservas-asistencias-por-rol")
def get_reservas_asistencias(current_user = Depends(get_current_active_admin)):
    """Cantidad de reservas y asistencias por rol"""
    return reservas_asistencias_por_rol()

@router.get("/sanciones-por-rol")
def get_sanciones(current_user = Depends(get_current_active_admin)):
    """Cantidad de sanciones por rol"""
    return sanciones_por_rol()

@router.get("/porcentaje-reservas-utilizadas")
def get_porcentaje_utilizadas(current_user = Depends(get_current_active_admin)):
    """Porcentaje de reservas utilizadas vs canceladas/no asistidas"""
    return porcentaje_reservas_utilizadas()

# CONSULTAS ADICIONALES PROVISORIAS
@router.get("/reservas-por-dia-semana")
def get_reservas_dia_semana(current_user = Depends(get_current_active_admin)):
    """Distribución de reservas por día de la semana"""
    return reservas_por_dia_semana()

@router.get("/salas-menos-utilizadas")
def get_salas_menos_utilizadas(
    limit: int = 10,
    current_user = Depends(get_current_active_admin)
):
    """Salas menos utilizadas"""
    return salas_menos_utilizadas(limit)

@router.get("/participantes-mas-activos")
def get_participantes_activos(
    limit: int = 10,
    current_user = Depends(get_current_active_admin)
):
    """Participantes con más reservas"""
    return participantes_mas_activos(limit)


@router.get("/dia-mas-creacion")
def get_dia_mas_creacion(current_user = Depends(get_current_active_admin)):
    """Día de la semana con más reservas creadas"""
    return dia_con_mas_creaciones_reservas()

