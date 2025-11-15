from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from models.auth_model import LoginRequest, TokenResponse, UserInToken, RegisterRequest
from services.auth_services import (
    authenticate_user, 
    create_access_token, 
    hash_password,
    SECRET_KEY,
    ALGORITHM
)
from db import execute_query, fetch_all

router = APIRouter(prefix="/auth", tags=["autenticacion"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInToken:
    """Dependency para obtener el usuario actual del token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Obtener datos actuales del usuario
    query = """
        SELECT id_participante, email, rol, activo
        FROM participante
        WHERE email = %s
    """
    result = fetch_all(query, (email,))
    
    if not result or not result[0]['activo']:
        raise credentials_exception
    
    return UserInToken(
        id_participante=result[0]['id_participante'],
        email=result[0]['email'],
        rol=result[0]['rol']
    )

async def get_current_active_admin(current_user: UserInToken = Depends(get_current_user)) -> UserInToken:
    """Dependency para rutas que requieren rol admin"""
    if current_user.rol != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user

async def get_current_docente_or_admin(current_user: UserInToken = Depends(get_current_user)) -> UserInToken:
    """Dependency para rutas que requieren rol docente o admin"""
    if current_user.rol not in ['docente', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requiere rol de docente o administrador"
        )
    return current_user

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest):
    """Registra un nuevo usuario"""
    try:
        # Verificar si el email ya existe
        exist = fetch_all("SELECT email FROM login WHERE email = %s", (user.email,))
        if exist:
            raise HTTPException(status_code=409, detail="Email ya registrado")
        
        # Verificar si el CI ya existe
        exist_ci = fetch_all("SELECT ci FROM participante WHERE ci = %s", (user.ci,))
        if exist_ci:
            raise HTTPException(status_code=409, detail="CI ya registrado")
        
        # Hashear contraseña e insertar en login
        hashed = hash_password(user.password)
        execute_query(
            "INSERT INTO login (email, password_hash) VALUES (%s, %s)",
            (user.email, hashed)
        )
        
        # Insertar participante
        query = """
            INSERT INTO participante (ci, nombre, apellido, email, rol)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(query, (user.ci, user.nombre, user.apellido, user.email, user.rol))
        
        return {"message": "Usuario registrado exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login y generación de token JWT"""
    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token con el email como subject
    access_token = create_access_token(data={"sub": user['email']})
    
    return TokenResponse(access_token=access_token)

@router.get("/me", response_model=UserInToken)
async def get_me(current_user: UserInToken = Depends(get_current_user)):
    """Obtiene los datos del usuario autenticado"""
    return current_user