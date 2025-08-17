# Sistema de Gestión de Parqueadero - Proyecto de Reingeniería

Este proyecto es una reingeniería de un sistema de gestión de parqueadero originalmente desarrollado en Java, transformándolo en una aplicación web moderna utilizando tecnologías actuales.

## Estructura del Proyecto

El proyecto está dividido en tres componentes principales:

### Frontend (`/frontend`)
- Desarrollado con Next.js 15.4.6
- Interfaz de usuario moderna y responsive
- Componentes reutilizables con TypeScript
- Testing con Jest
- Estructura de carpetas organizada por características:
  - `/app`: Páginas y rutas de la aplicación
  - `/components`: Componentes reutilizables de UI
  - `/lib`: Utilidades y funciones auxiliares

### Backend (`/backend`)
- API RESTful desarrollada en Node.js
- Estructura MVC (Modelo-Vista-Controlador)
- Características principales:
  - Autenticación y autorización
  - Gestión de usuarios
  - Gestión de clientes
  - Gestión de espacios de parqueadero
  - Gestión de caja
  - Generación de facturas en PDF
  - Configuración del sistema

### Base de Datos
- Sistema de gestión de base de datos relacional
- Migración desde la estructura original
- Modelos principales:
  - Usuarios
  - Clientes
  - Espacios
  - Facturas
  - Configuraciones
  - Caja

## Mejoras de la Reingeniería

1. **Arquitectura**
   - De aplicación de escritorio a aplicación web
   - Separación clara de responsabilidades (Frontend/Backend)
   - API RESTful para comunicación entre componentes

2. **Tecnológicas**
   - Interfaz de usuario moderna y responsive
   - Mejor manejo de estado y datos
   - Sistema de autenticación robusto
   - Generación de reportes mejorada

3. **Funcionales**
   - Acceso desde cualquier dispositivo
   - Mejor experiencia de usuario
   - Sistema de respaldos integrado
   - Reportes en tiempo real

## Requisitos del Sistema

### Para Desarrollo
- Node.js (versión LTS)
- npm o yarn
- Base de datos SQL
- Docker (opcional)

### Para Producción
- Servidor Node.js
- Servidor web (nginx recomendado)
- Base de datos SQL
- Certificado SSL

## Configuración y Despliegue

### Frontend
```bash
cd frontend
npm install
npm run dev     # Desarrollo
npm run build   # Producción
```

### Backend
```bash
cd backend
npm install
npm run dev     # Desarrollo
npm run start   # Producción
```

### Docker
```bash
cd docker
docker-compose up
```

## Comparación con el Sistema Original

### Sistema Original (Java)
- Aplicación de escritorio
- Base de datos local
- Interfaz swing
- Reportes locales
- Acceso único desde el equipo instalado

### Sistema Nuevo
- Aplicación web
- Base de datos centralizada
- Interfaz web moderna
- Reportes en la nube
- Acceso desde cualquier dispositivo
- Mejor escalabilidad
- Mantenimiento más sencillo

## Características Principales

1. **Gestión de Usuarios**
   - Roles y permisos
   - Cambio de contraseñas
   - Historial de acciones

2. **Gestión de Clientes**
   - Registro de clientes
   - Historial de uso
   - Facturación automática

3. **Gestión de Espacios**
   - Control de disponibilidad
   - Reservas
   - Estados de espacios

4. **Facturación**
   - Generación automática
   - Formato PDF
   - Historial completo

5. **Reportes**
   - Ocupación
   - Ingresos
   - Clientes frecuentes
   - Estados de cuenta

## Contribución

1. Fork el repositorio
2. Cree una rama para su característica (`git checkout -b feature/AmazingFeature`)
3. Commit sus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abra un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
