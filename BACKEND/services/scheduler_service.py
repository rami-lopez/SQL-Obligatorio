from datetime import datetime, date, timedelta
from db import execute_query, fetch_all
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def procesar_reservas_finalizadas():
    """
    Procesa reservas que han finalizado:
    1. Marca como 'finalizada' si hubo al menos 1 asistencia
    2. Marca como 'no_asistencia' si NADIE asistió
    3. Aplica sanciones cuando corresponda
    
    Se ejecuta cada hora en punto.
    """
    try:
        logger.info("=== Iniciando procesamiento de reservas finalizadas ===")
        
        # Obtener fecha y hora actual
        ahora = datetime.now()
        fecha_actual = ahora.date()
        hora_actual = ahora.hour
        
        logger.info(f"Fecha: {fecha_actual}, Hora: {hora_actual}:00")
        
        # 1. Buscar reservas activas o confirmadas que ya finalizaron
        query = """
            SELECT 
                r.id_reserva,
                r.id_sala,
                r.fecha,
                r.start_turn_id,
                r.end_turn_id,
                t_end.hora_fin,
                COUNT(rp.id_participante) as total_participantes,
                SUM(CASE WHEN rp.asistencia = 'presente' THEN 1 ELSE 0 END) as asistieron
            FROM reserva r
            JOIN turno t_end ON r.end_turn_id = t_end.id_turno
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.estado IN ('activa', 'confirmada')
            AND (
                (r.fecha < %s) OR 
                (r.fecha = %s AND TIME(t_end.hora_fin) <= TIME(%s))
            )
            GROUP BY r.id_reserva, r.fecha, t_end.hora_fin
        """
        
        hora_actual_str = f"{hora_actual:02d}:00:00"
        reservas = fetch_all(query, (fecha_actual, fecha_actual, hora_actual_str))
        
        logger.info(f"Encontradas {len(reservas)} reservas para procesar")
        
        finalizadas = 0
        no_asistencias = 0
        sanciones_aplicadas = 0
        
        for reserva in reservas:
            id_reserva = reserva['id_reserva']
            total_participantes = reserva['total_participantes']
            asistieron = reserva['asistieron'] or 0
            
            if asistieron > 0:
                # Al menos 1 persona asistió → FINALIZADA
                execute_query(
                    "UPDATE reserva SET estado = 'finalizada' WHERE id_reserva = %s",
                    (id_reserva,)
                )
                finalizadas += 1
                logger.info(f"Reserva {id_reserva}: FINALIZADA ({asistieron}/{total_participantes} asistieron)")
                
                # Marcar ausentes a quienes no asistieron
                execute_query(
                    """UPDATE reserva_participante 
                       SET asistencia = 'ausente' 
                       WHERE id_reserva = %s 
                       AND asistencia = 'no_registrado'""",
                    (id_reserva,)
                )
            
            else:
                # NADIE asistió → NO_ASISTENCIA + SANCIÓN
                execute_query(
                    "UPDATE reserva SET estado = 'no_asistencia' WHERE id_reserva = %s",
                    (id_reserva,)
                )
                no_asistencias += 1
                logger.warning(f"Reserva {id_reserva}: NO_ASISTENCIA (0/{total_participantes} asistieron)")
                
                # Marcar todos como ausentes
                execute_query(
                    """UPDATE reserva_participante 
                       SET asistencia = 'ausente' 
                       WHERE id_reserva = %s""",
                    (id_reserva,)
                )
                
                # Aplicar sanción de 2 meses a TODOS los participantes
                participantes = fetch_all(
                    """SELECT DISTINCT id_participante 
                       FROM reserva_participante 
                       WHERE id_reserva = %s""",
                    (id_reserva,)
                )
                
                fecha_inicio_sancion = fecha_actual
                fecha_fin_sancion = fecha_actual + timedelta(days=60)  # 2 meses
                
                for participante in participantes:
                    id_participante = participante['id_participante']
                    
                    # Verificar si ya tiene sanción vigente para no duplicar
                    sancion_existente = fetch_all(
                        """SELECT id_sancion FROM sancion_participante
                           WHERE id_participante = %s
                           AND %s BETWEEN fecha_inicio AND fecha_fin""",
                        (id_participante, fecha_actual)
                    )
                    
                    if not sancion_existente:
                        execute_query(
                            """INSERT INTO sancion_participante 
                               (id_participante, fecha_inicio, fecha_fin, motivo)
                               VALUES (%s, %s, %s, %s)""",
                            (
                                id_participante,
                                fecha_inicio_sancion,
                                fecha_fin_sancion,
                                f"No asistencia a reserva #{id_reserva}"
                            )
                        )
                        sanciones_aplicadas += 1
                        logger.info(f"  → Sanción aplicada al participante {id_participante}")
        
        # Resumen
        logger.info("=== RESUMEN ===")
        logger.info(f"Reservas finalizadas: {finalizadas}")
        logger.info(f"Reservas con no asistencia: {no_asistencias}")
        logger.info(f"Sanciones aplicadas: {sanciones_aplicadas}")
        logger.info("=== Procesamiento completado ===\n")
        
        return {
            "success": True,
            "finalizadas": finalizadas,
            "no_asistencias": no_asistencias,
            "sanciones": sanciones_aplicadas
        }
    
    except Exception as e:
        logger.error(f"Error en procesamiento de reservas: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
        
