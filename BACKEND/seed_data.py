import csv
import os
import sys
from pathlib import Path

# Agregar el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent))

from db import execute_query, execute_many_queries, fetch_all
from context import userRol
from services.auth_services import hash_password

# Colores para consola
class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Color.GREEN}✓ {msg}{Color.END}")

def print_error(msg):
    print(f"{Color.RED}✗ {msg}{Color.END}")

def print_info(msg):
    print(f"{Color.BLUE}ℹ {msg}{Color.END}")

def print_warning(msg):
    print(f"{Color.YELLOW}⚠ {msg}{Color.END}")


# ==================== CARGAR FACULTADES ====================
def cargar_facultades(archivo_csv):
    """
    CSV esperado: nombre
    """
    print_info(f"Cargando facultades desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((row['nombre'],))
            
            if datos:
                query = "INSERT INTO facultad (nombre) VALUES (%s)"
                count = execute_many_queries(query, datos)
                print_success(f"{count} facultades insertadas")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar facultades: {str(e)}")


# ==================== CARGAR PROGRAMAS ====================
def cargar_programas(archivo_csv):
    """
    CSV esperado: id_facultad|nombre|tipo
    """
    print_info(f"Cargando programas desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    int(row['id_facultad']),
                    row['nombre'],
                    row['tipo']
                ))
            
            if datos:
                query = "INSERT INTO programa_academico (id_facultad, nombre, tipo) VALUES (%s, %s, %s)"
                count = execute_many_queries(query, datos)
                print_success(f"{count} programas insertados")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar programas: {str(e)}")


# ==================== CARGAR EDIFICIOS ====================
def cargar_edificios(archivo_csv):
    """
    CSV esperado: nombre|direccion|departamento
    """
    print_info(f"Cargando edificios desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    row['nombre'],
                    row.get('direccion', None),
                    row.get('departamento', None)
                ))
            
            if datos:
                query = "INSERT INTO edificio (nombre, direccion, departamento) VALUES (%s, %s, %s)"
                count = execute_many_queries(query, datos)
                print_success(f"{count} edificios insertados")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar edificios: {str(e)}")


# ==================== CARGAR SALAS ====================
def cargar_salas(archivo_csv):
    """
    CSV esperado: id_edificio|nombre|tipo|capacidad
    """
    print_info(f"Cargando salas desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    int(row['id_edificio']),
                    row['nombre'],
                    row['tipo'],
                    int(row['capacidad'])
                ))
            
            if datos:
                query = "INSERT INTO sala (id_edificio, nombre, tipo, capacidad) VALUES (%s, %s, %s, %s)"
                count = execute_many_queries(query, datos)
                print_success(f"{count} salas insertadas")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar salas: {str(e)}")


# ==================== CARGAR PARTICIPANTES ====================
def cargar_participantes(archivo_csv, password_default="Password123"):
    """
    CSV esperado: ci|nombre|apellido|email|rol
    
    IMPORTANTE: 
    - Primero crea el registro en 'login' con password hasheada
    - Luego crea el participante
    """
    print_info(f"Cargando participantes desde {archivo_csv}...")
    print_warning(f"Password por defecto para todos: {password_default}")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            
            insertados = 0
            omitidos = 0
            
            for row in reader:
                email = row['email']
                ci = row['ci']
                nombre = row['nombre']
                apellido = row['apellido']
                rol = row['rol']
                
                # Verificar si el email ya existe en login
                existe_login = fetch_all("SELECT email FROM login WHERE email = %s", (email,))
                if existe_login:
                    print_warning(f"Email {email} ya existe en login, omitiendo...")
                    omitidos += 1
                    continue
                
                # Verificar si el CI ya existe
                existe_ci = fetch_all("SELECT ci FROM participante WHERE ci = %s", (ci,))
                if existe_ci:
                    print_warning(f"CI {ci} ya existe, omitiendo...")
                    omitidos += 1
                    continue
                
                try:
                    # 1. Insertar en login
                    hashed = hash_password(password_default)
                    execute_query(
                        "INSERT INTO login (email, password_hash) VALUES (%s, %s)",
                        (email, hashed)
                    )
                    
                    # 2. Insertar participante
                    execute_query(
                        "INSERT INTO participante (ci, nombre, apellido, email, rol) VALUES (%s, %s, %s, %s, %s)",
                        (ci, nombre, apellido, email, rol)
                    )
                    
                    insertados += 1
                    print_success(f"Participante {nombre} {apellido} ({email}) insertado")
                
                except Exception as e:
                    print_error(f"Error al insertar {email}: {str(e)}")
                    omitidos += 1
            
            print_success(f"\nTotal insertados: {insertados}")
            if omitidos > 0:
                print_warning(f"Total omitidos: {omitidos}")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar participantes: {str(e)}")


# ==================== CARGAR PARTICIPANTE_PROGRAMA ====================
def cargar_participante_programa(archivo_csv):
    """
    CSV esperado: id_participante|id_programa
    """
    print_info(f"Cargando relaciones participante-programa desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    int(row['id_participante']),
                    int(row['id_programa'])
                ))
            
            if datos:
                query = "INSERT INTO participante_programa (id_participante, id_programa) VALUES (%s, %s)"
                count = execute_many_queries(query, datos)
                print_success(f"{count} relaciones participante-programa insertadas")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar participante_programa: {str(e)}")


# ==================== CARGAR RESERVAS ====================
def cargar_reservas(archivo_csv):
    """
    CSV esperado: id_sala|fecha|start_turn_id|end_turn_id|estado|creado_por
    Formato fecha: YYYY-MM-DD
    """
    print_info(f"Cargando reservas desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            
            insertados = 0
            omitidos = 0
            
            for row in reader:
                try:
                    id_reserva = execute_query(
                        """INSERT INTO reserva 
                           (id_sala, fecha, start_turn_id, end_turn_id, estado, creado_por) 
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        (
                            int(row['id_sala']),
                            row['fecha'],
                            int(row['start_turn_id']),
                            int(row['end_turn_id']),
                            row['estado'],
                            int(row['creado_por']) if row.get('creado_por') else None
                        )
                    )
                    insertados += 1
                    print_success(f"Reserva {id_reserva} insertada")
                
                except Exception as e:
                    print_error(f"Error al insertar reserva: {str(e)}")
                    omitidos += 1
            
            print_success(f"\nTotal insertados: {insertados}")
            if omitidos > 0:
                print_warning(f"Total omitidos: {omitidos}")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar reservas: {str(e)}")


# ==================== CARGAR RESERVA_PARTICIPANTE ====================
def cargar_reserva_participante(archivo_csv):
    """
    CSV esperado: id_reserva|id_participante|estado_participacion|asistencia
    """
    print_info(f"Cargando participantes de reservas desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    int(row['id_reserva']),
                    int(row['id_participante']),
                    row.get('estado_participacion', 'pendiente'),
                    row.get('asistencia', 'no_registrado')
                ))
            
            if datos:
                query = """
                    INSERT INTO reserva_participante 
                    (id_reserva, id_participante, estado_participacion, asistencia) 
                    VALUES (%s, %s, %s, %s)
                """
                count = execute_many_queries(query, datos)
                print_success(f"{count} participantes de reserva insertados")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar reserva_participante: {str(e)}")


# ==================== CARGAR SANCIONES ====================
def cargar_sanciones(archivo_csv):
    """
    CSV esperado: id_participante|fecha_inicio|fecha_fin|motivo
    Formato fecha: YYYY-MM-DD
    """
    print_info(f"Cargando sanciones desde {archivo_csv}...")
    
    try:
        with open(archivo_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter='|')
            datos = []
            for row in reader:
                datos.append((
                    int(row['id_participante']),
                    row['fecha_inicio'],
                    row['fecha_fin'],
                    row.get('motivo', None)
                ))
            
            if datos:
                query = """
                    INSERT INTO sancion_participante 
                    (id_participante, fecha_inicio, fecha_fin, motivo) 
                    VALUES (%s, %s, %s, %s)
                """
                count = execute_many_queries(query, datos)
                print_success(f"{count} sanciones insertadas")
            else:
                print_warning("No hay datos para insertar")
    
    except FileNotFoundError:
        print_error(f"Archivo {archivo_csv} no encontrado")
    except Exception as e:
        print_error(f"Error al cargar sanciones: {str(e)}")


# ==================== MAIN ====================
def main():
    """
    Carga todos los datos en el orden correcto respetando las FK
    """
    print("\n" + "="*60)
    print("CARGA DE DATOS DE PRUEBA - Sistema Reserva Salas UCU")
    print("="*60 + "\n")
    
    # Directorio donde están los CSVs
    csv_dir = Path(__file__).parent / "datos_maestros"      
    
    token_ctx = userRol.set('admin')

    # --- VERIFICAR SI LA BASE DE DATOS YA ESTÁ POBLADA ---
    try:
        result = fetch_all("SELECT COUNT(*) as count FROM facultad")
        if result and result[0]['count'] > 0:
            print_info("La base de datos ya contiene datos. Omitiendo carga inicial.")
            userRol.reset(token_ctx)
            return
    except Exception as e:
        print_warning(f"No se pudo verificar si la base de datos está poblada, se procederá con la carga. Error: {e}")

    print_info("Purgando tablas existentes y reseteando AUTO_INCREMENT...")
    execute_query("SET FOREIGN_KEY_CHECKS = 0;")
    
    # Eliminar datos de tablas dependientes primero
    execute_query("DELETE FROM reserva_participante;")
    execute_query("DELETE FROM sancion_participante;")
    execute_query("DELETE FROM reserva;")
    execute_query("DELETE FROM participante_programa;")
    execute_query("DELETE FROM participante;")
    execute_query("DELETE FROM login;")
    execute_query("DELETE FROM sala;")
    execute_query("DELETE FROM edificio;")
    execute_query("DELETE FROM programa_academico;")
    execute_query("DELETE FROM facultad;")

    # Resetear AUTO_INCREMENT para todas las tablas con PK auto_incrementable
    execute_query("ALTER TABLE reserva_participante AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE sancion_participante AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE reserva AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE participante_programa AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE participante AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE sala AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE edificio AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE programa_academico AUTO_INCREMENT = 1;")
    execute_query("ALTER TABLE facultad AUTO_INCREMENT = 1;")
    
    execute_query("SET FOREIGN_KEY_CHECKS = 1;")
    print_success("Tablas purgadas y AUTO_INCREMENT reseteado exitosamente.")
    
    # Orden de carga (respetando FK):
    # 1. Tablas sin dependencias
    cargar_facultades(csv_dir / "facultades.csv")
    cargar_programas(csv_dir / "programas.csv")
    cargar_edificios(csv_dir / "edificios.csv")
    
    # 2. Salas (depende de edificios)
    cargar_salas(csv_dir / "salas.csv")
    
    # 3. Participantes (depende de login)
    cargar_participantes(csv_dir / "participantes.csv", password_default="Password123")
    
    # 4. Relaciones participante-programa
    cargar_participante_programa(csv_dir / "participante_programa_final.csv")
    
    # 5. Reservas (depende de salas y participantes)
    cargar_reservas(csv_dir / "reservas.csv")
    
    # 6. Participantes de reservas
    cargar_reserva_participante(csv_dir / "reservas_participante.csv")
    
    # 7. Sanciones
    cargar_sanciones(csv_dir / "sanciones.csv")
    
    print("\n" + "="*60)
    print("CARGA COMPLETADA")
    print("="*60 + "\n")

    try:
        userRol.reset(token_ctx)
    except Exception:
        pass


if __name__ == "__main__":
    main()