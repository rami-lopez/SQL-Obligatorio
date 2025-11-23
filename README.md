# SQL-Obligatorio
Proyecto entregable del curso de Bases de Datos I. Realizado por Lucía Iriarte, Nicolás Lenzuen y Ramiro López.

# README
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

### **Panel de administrador**

Los administradores pueden:

* Gestionar **participantes** (crear, actualizar, eliminar).
* Gestionar **salas**.
* Ver resportes con las consultas propuestas por la consigna. 
* ABM todas las reservas del sistema.

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

## **Flujo de uso**

1. El usuario inicia sesión.
2. Según su rol, se redirige a:

   * Estudiante/Docente
   * Admin
    
3. El usuario puede crear reservas, modificarlas o cancelarlas.
4. El admin puede gestionar todos los datos del sistema.

## **Tecnologías utilizadas**

* **FastAPI** (backend)
* **React**  (frontend)
* **MySQL** (BD)

## **¿Cómo correr el proyecto?**

1- Hacer un fork y clonar el repositorio desde el link del repositorio:
https://github.com/rami-lopez/SQL-Obligatorio

2- Luego de pararse sobre la carpeta, ejecutar el siguiente comando, que se encarga de correr todo lo necesario: 
docker-compose up --build. En caso de que no corra, mover el archivo .env fuera de la carpeta de BACKEND

2- Una vez realizados los pasos anteriores, se puede ingresar al sistema como admin, estudiante de grado, estudiante de posgrado o como docente. Perfiles existentes para ingresar y visualizar y probar las distintas pantallas y funcionalidades/posibilidades:

   a) **Admin:** mateo.silva39@ucu.edu.uy  
   b) **Docente:** juan.ruiz60@ucu.edu.uy  
   c) **Estudiante de grado:** ana.vega61@correo.ucu.edu.uy  
   d) **Estudiante de posgrado:** marta.torres74@correo.ucu.edu.uy  

**Todas las contraseñas son “Password1234”**


