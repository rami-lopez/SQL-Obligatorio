# SQL-Obligatorio
Proyecto entregable del curso de Bases de Datos I. Realizado por Lucía Iriarte, Nicolás Lenzuen y Ramiro López.

# **README**
**Sistema de Gestión de Reservas de Salas (FastAPI + React)**

## **Descripción general**

Este proyecto implementa un sistema para gestionar reservas de salas de estudio de la Universidad.
Incluye tres perfiles de usuario:

* **Estudiantes**
* **Docentes**
* **Administradores**

Cada usuario puede iniciar sesión, visualizar sus reservas y realizar acciones según su rol.
Los administradores cuentan con un panel especial para gestionar participantes, salas y reservas.

## **Funcionalidades principales**

### **Autenticación**

* Login con email + contraseña.
* JWT tokens con expiración.
* Distinción de roles (estudiante, docente, admin).

### **Gestión de reservas**

* Visualizar salas disponibles.
* Crear reservas (estudiantes y docentes).
* Modificar o cancelar reservas existentes.
* Ver historial personal de reservas.

### **Panel de administrador**

Los administradores pueden:

* Gestionar **participantes** (crear, actualizar, eliminar).
* Gestionar **salas**.
* Ver todas las reservas del sistema.
* Crear o cancelar reservas de cualquier usuario.

## **Servicios (Capa de Lógica)**

Cada recurso tiene su propio archivo en `/services`:

* `auth_service.py`
* `consultas_service.py`
* `edificio_service.py`
* `participantes_service.py`
* `programa_service.py`
* `participante_service.py`
* `sancion_service.py`
* `turno_service.py`
* `validaciones.py`
* `sala_service.py`
* `reserva_service.py`

Esta capa se encarga de:

* Validar datos
* Interactuar con la base
* Manejar errores
* Implementar reglas de negocio

## **Base de datos**

La base existente **no se modifica**.
Se usan las tablas ya provistas:

* `participantes`
* `salas`
* `reservas`

El back se adapta a la estructura tal como está.

## **Flujo de uso**

1. El usuario inicia sesión.
2. Según su rol, se redirige a:

   * Estudiante/Docente
   * Admin
    
3. El usuario puede crear reservas, modificarlas o cancelarlas.
4. El admin puede gestionar todos los datos del sistema.

## **Tecnologías utilizadas**

* **FastAPI** + **Pydantic** (backend)
* **React** + **TailwindCSS** (frontend)
* **MySQL**

## **Cómo correr el proyecto?**

### **Backend**
```bash
# Clonar el repositorio
git clone https://github.com/rami-lopez/SQL-Obligatorio
# Moverse al directiorio
cd SQL-Obligatorio
# Correr docker
docker-compose up --build
```
* Front corre en http://localhost:3000
* Back corre en http://localhost:8000
* Documentación de la api http://localhost:3000/docs

