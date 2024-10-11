# Guía de Instalación de DenkiFit

Esta guía proporciona instrucciones para la instalación y configuración de Denkifit. Incluye frontend, backend y base de datos. Utilizaremos Docker para un despliegue sencillo.

### Requisitos Previos

- Docker y Docker Compose instalados.
- Acceso al repositorio del proyecto.

### Paso 1: Clonar el Repositorio

1. Abre una terminal y clona el repositorio del proyecto:
   ```sh
   git clone -b develop https://github.com/Naax27/capstone.git 
   ```
2. Cambia al directorio del proyecto:
   ```sh
   cd capstone
   ```

### Paso 2: Configuración de Variables de Entorno

1. Copia los archivos `.env.example` y `.env.backend.example` y renómbralos como `.env` y `.env.backend` respectivamente.
2. Configura las credenciales y detalles necesarios. A continuación se explica cada una de las variables importantes:

   - **PORT**: Puerto en el que se ejecutará el backend. Valor por defecto: `5000`.
   - **SALT_ROUNDS**: Número de rondas para algoritmo de hash de contraseñas. Valor por defecto: `10`.
   - **SECRET_JWT_KEY**: Clave secreta para la generación de tokens JWT.
   - **DB_HOST**: Dirección del host de base de datos. En este caso, debe ser `mariadb` para referirse al contenedor de base de datos.
   - **DB_ROOT_PASSWORD**: Contraseña del usuario root de MariaDB. Utilizada para la configuración inicial de la base de datos.
   - **DB_NAME**: Nombre de la base de datos utilizada por la aplicación. Valor por defecto: `denki`.
   - **DB_USER**: Usuario de la base de datos que usará la aplicación. Valor por defecto: `dnk_admin`.
   - **DB_PASSWORD**: Contraseña del usuario de la base de datos. Asegúrate de mantenerla segura.
   - **FRONTEND_PORT**: Puerto en el que se ejecutará el frontend. Valor por defecto: `5173`.
   - **BASE_API_URL**: URL base para acceder a la API del backend desde el frontend. Por defecto: `http://localhost:5000`.

3. Asegúrate de que los archivos `.env` estén en la raíz del proyecto.

### Paso 3: Configuración de Docker

Para desplegar el sistema:

1. Ubícate en el directorio del proyecto donde está `docker-compose.yml`.
2. En consola ejecuta:
   ```sh
   docker-compose up -d
   ```
   - Construirá las imágenes Docker.
   - Levantará los servicios `frontend`, `backend` y `mariadb`.

> **Nota**: Gracias a los volúmenes montados, los cambios en el código en el host se reflejan sin necesidad de reconstruir las imágenes.

### Paso 4: Verificación de los Servicios

Para verificar los contenedores:

```sh
docker ps
```

- Frontend disponible en `http://localhost:5173`.
- Backend en el puerto `5000`.
- MariaDB en el puerto `3306`.

### Paso 5: Inicialización de la Base de Datos

El archivo init-db.sql inicializa la base de datos al arrancar el contenedor mariadb por primera vez. Como parte de esta inicialización, se crea un usuario administrador por defecto con las siguientes credenciales:

Usuario: `admin`

Password: `admin123`

### Paso 6: Conexión entre Backend y Base de Datos

El backend usa las credenciales definidas en `.env.backend`. Asegúrate de que coincidan con las configuraciones de `mariadb` en `.env`.

Verifica la conexión accediendo al endpoint `/api/health`.

### Solución de Problemas Comunes

- **Contenedor no arranca**: Verifica los registros con `docker-compose logs <nombre-del-servicio>`.
- **Problemas con la base de datos**: Si el volumen `db_data` está corrupto, elimínalo y deja que Docker lo recree:
  ```sh
  docker volume rm <nombre_del_volumen>
  ```

> **Nota**: En Windows, el hot-reload podría no funcionar correctamente por diferencias en el sistema de archivos. Podrías necesitar reiniciar el servidor manualmente.

### Paso 7: Detener el Sistema

Para detener los servicios:

```sh
docker-compose down
```

Esto detendrá todos los contenedores y liberará los puertos.

### Consideraciones Adicionales

- **Volúmenes**: Los volúmenes se usan para persistir los datos de MariaDB. No se eliminan al detener los contenedores.
- **Actualizaciones**: Con volúmenes montados, los cambios en el código en el host se reflejan sin reconstruir las imágenes. Solo reinicia los servicios si cambian las dependencias.

### Resumen Rápido de Comandos

1. **Clonar el repositorio**: `git clone https://github.com/Naax27/capstone.git`
2. **Cambiar al directorio**: `cd <nombre_directorio>`
3. **Levantar el sistema**: `docker-compose up`
4. **Verificar estado**: `docker ps`
5. **Detener el sistema**: `docker-compose down`
6. **Ver logs**: `docker-compose logs <nombre-del-servicio>`
