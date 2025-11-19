from fastapi import HTTPException, status
from services.auth_services import authenticate_user, create_access_token


def login_and_get_token(email: str, password: str) -> str:
    user = authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user['email']})
    return access_token


def ensure_active_user(user: dict):
    if not user or not user.get('activo'):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo o no encontrado")
    return True
