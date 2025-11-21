# wait-for-db.py
"""
Robusto script de espera para MySQL usado en docker-compose.
- Lee DB_HOST, DB_NAME, y credenciales.
- Soporta DB_USER/DB_PASSWORD o pares por rol:
  DB_USER_ADMIN/DB_PASSWORD_ADMIN, DB_USER_LOGIN/DB_PASSWORD_LOGIN, DB_USER_USER/DB_PASSWORD_USER
- Intenta varias credenciales si se proporcionan.
- Reintentos con backoff exponencial.
- Salida 0 si la conexión funciona, 1 si falla después de los reintentos.
"""
import os
import time
import mysql.connector
import sys

def mask(s):
    if s is None:
        return None
    if len(s) <= 2:
        return "*" * len(s)
    return s[0] + "*" * (len(s)-2) + s[-1]

def gather_candidates():
    """Devuelve lista de (user, password) candidatos a probar, en orden de preferencia."""
    candidates = []

    # Pareja simple (útil si usás DB_USER / DB_PASSWORD)
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    if db_user:
        candidates.append((db_user, db_password))

    # Pares por rol (si existen)
    for role in ("ADMIN", "LOGIN", "USER"):
        u = os.getenv(f"DB_USER_{role}")
        p = os.getenv(f"DB_PASSWORD_{role}")
        if u:
            candidates.append((u, p))

    # Si no hay candidatos, devolver vacío
    return candidates

def try_connect(host, user, password, database, timeout=10):
    """Intenta conectar y retorna (True, None) o (False, exception)."""
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password or "",
            database=database or "",
            connection_timeout=timeout
        )
        conn.close()
        return True, None
    except Exception as e:
        return False, e

def main():
    print("--- wait-for-db: starting ---")
    db_host = os.getenv("DB_HOST", "db")
    db_name = os.getenv("DB_NAME", "reserva_salas")

    # Retries/backoff config (puedes ajustar mediante env)
    try:
        max_retries = int(os.getenv("DB_WAIT_RETRIES", "15"))
        base_delay = float(os.getenv("DB_WAIT_DELAY", "2"))
    except Exception:
        max_retries = 15
        base_delay = 2.0

    candidates = gather_candidates()
    if not candidates:
        print("WARNING: No DB credentials found in env. Expected DB_USER/DB_PASSWORD or DB_USER_ADMIN/DB_PASSWORD_ADMIN etc.")
        # still try with empty credentials (in case server was initialized insecure)
        candidates = [(os.getenv("DB_USER"), os.getenv("DB_PASSWORD"))]

    print(f"DB_HOST={db_host}, DB_NAME={db_name}")
    print("Credential candidates (masked):")
    for u, p in candidates:
        print(f" - user={u}, password={mask(p)}")

    attempt = 0
    while attempt < max_retries:
        attempt += 1
        print(f"[{attempt}/{max_retries}] Trying to connect...")

        for (user, pwd) in candidates:
            # show which credential we're trying (masked)
            print(f"  -> testing user='{user}' pwd={mask(pwd)}")
            ok, err = try_connect(db_host, user, pwd, db_name, timeout=5)
            if ok:
                print(f"✅ Connected to DB using user='{user}'.")
                print("--- wait-for-db: finished ---")
                return 0
            else:
                # detect empty password case more explicitly
                if "using password: NO" in str(err) or "Access denied" in str(err) and (pwd is None or pwd == ""):
                    print(f"    -> Connection failed for user='{user}': {err} (hint: password empty or not provided)")
                else:
                    print(f"    -> Connection failed for user='{user}': {err}")

        # no candidate worked this round
        # exponential backoff with jitter
        sleep_time = base_delay * (2 ** (attempt - 1))
        if sleep_time > 30:
            sleep_time = 30
        jitter = min(1.5, sleep_time * 0.1)
        sleep_time = sleep_time + (jitter * (0.5 - os.urandom(1)[0] / 255.0))
        print(f"Retrying in ~{sleep_time:.1f}s...")
        time.sleep(max(1.0, sleep_time))

    print("🚨 Could not connect to the database after retries. Exiting with code 1.")
    return 1

if __name__ == "__main__":
    code = main()
    sys.exit(code)
