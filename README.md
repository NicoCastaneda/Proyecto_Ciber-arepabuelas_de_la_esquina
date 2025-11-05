# Arepabuelas de la Esquina - E-Commerce Seguro

Una aplicación completa de comercio electrónico construida con Next.js, TypeScript, Supabase y enfoque en seguridad.

## Características Principales

### Funcionalidades

- **Autenticación Segura**
  - Registro con validación de contraseñas fuertes
  - Inicio de sesión con JWT
  - Aprobación manual de cuentas por administrador
  - Bloqueo automático tras múltiples intentos fallidos
  - Gestión de sesiones segura con cookies httpOnly

- **Gestión de Usuarios**
  - Roles: Admin y Cliente
  - Perfiles de usuario con foto
  - Estados de cuenta: pendiente, activo, bloqueado

- **Productos**
  - Catálogo con mínimo 6 productos pre-cargados
  - CRUD completo (solo admin)
  - Sistema de comentarios y calificaciones
  - Control de stock

- **Carrito de Compras**
  - Persistente en localStorage
  - Actualización en tiempo real
  - Validación de stock

- **Sistema de Pagos Simulado**
  - Validación de tarjetas (formato, CVV, fecha)
  - Enmascaramiento de números de tarjeta
  - NO almacena información de tarjetas reales
  - Confirmación visual de transacción

- **Cupones**
  - Cupón de bienvenida automático (15% descuento)
  - Válido por 30 días
  - Uso único por usuario

- **Historial de Pedidos**
  - Vista detallada de compras anteriores
  - Información de productos y precios

- **Panel de Administración**
  - Gestión de usuarios (aprobar/bloquear)
  - Gestión de productos (crear/editar/eliminar)
  - Vista de órdenes
  - Logs de seguridad

### Seguridad Implementada

- **Autenticación**
  - Contraseñas hasheadas con bcrypt (10 rounds)
  - JWT con expiración de 24 horas
  - Cookies seguras (httpOnly, sameSite=strict)

- **Validación y Sanitización**
  - Sanitización de todos los inputs con DOMPurify
  - Validación de email, contraseñas, tarjetas
  - Protección contra XSS e inyección SQL

- **Control de Acceso**
  - Row Level Security (RLS) en Supabase
  - Middleware de autenticación en API routes
  - Verificación de roles (admin/customer)

- **Protecciones Adicionales**
  - Rate limiting en login (5 intentos, bloqueo 15 min)
  - Validación de archivos (tipo y tamaño)
  - Logs de eventos de seguridad
  - Mensajes de error genéricos al usuario

- **Base de Datos**
  - Políticas RLS restrictivas
  - Índices para optimización
  - Integridad referencial con foreign keys
  - Transacciones atómicas

## Instalación

### Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase (ya configurada)

### Pasos de Instalación

1. **Instalar dependencias**
```bash
npm install
```

O visita `http://localhost:3000/api/seed` en tu navegador después de iniciar el servidor.

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## Credenciales de Prueba

### Administrador
- **Email:** admin@arepabuelas.com
- **Contraseña:** admin123

### Cliente Demo
- **Email:** cliente@arepabuelas.com
- **Contraseña:** prueba123

## Estructura del Proyecto

```
/app
  /api
    /auth          # Endpoints de autenticación
    /products      # Gestión de productos
    /orders        # Procesamiento de órdenes
    /admin         # Endpoints administrativos
    /seed          # Inicialización de datos
  /login           # Página de inicio de sesión
  /registro        # Página de registro
  /productos       # Catálogo de productos
  /carrito         # Carrito de compras
  /admin           # Panel administrativo

/components
  /ui              # Componentes de shadcn/ui
  navigation.tsx   # Barra de navegación

/lib
  auth-context.tsx   # Contexto de autenticación
  cart-context.tsx   # Contexto del carrito
  supabase.ts        # Cliente de Supabase
  security.ts        # Utilidades de seguridad
  middleware.ts      # Middleware de autenticación
```

## Uso de la Aplicación

### Para Clientes

1. **Registrarse**
   - Ir a `/registro`
   - Completar formulario con contraseña segura
   - Esperar aprobación del administrador

2. **Comprar Productos**
   - Iniciar sesión
   - Navegar por el catálogo
   - Agregar productos al carrito
   - Aplicar cupón de bienvenida
   - Completar pago simulado

3. **Ver Historial**
   - Acceder a "Mis Pedidos" desde el menú de usuario
   - Ver detalles de compras anteriores

### Para Administradores

1. **Aprobar Usuarios**
   - Ir al panel de admin
   - Ver lista de usuarios pendientes
   - Aprobar o bloquear cuentas

2. **Gestionar Productos**
   - Crear nuevos productos
   - Editar productos existentes
   - Actualizar stock y precios
   - Eliminar productos

3. **Monitorear Seguridad**
   - Ver logs de eventos críticos
   - Revisar intentos de login fallidos
   - Gestionar cuentas bloqueadas

## Datos de Tarjeta para Pruebas

El sistema valida el formato pero NO procesa pagos reales.

**Formato válido de ejemplo:**
- **Número:** 4532123456789012
- **CVV:** 123
- **Fecha:** 12/25

## Seguridad en Producción

Antes de desplegar a producción:

1. **Cambiar JWT_SECRET** en variables de entorno
2. **Configurar CORS** restrictivo
3. **Habilitar HTTPS** en todas las conexiones
4. **Configurar rate limiting** más estricto
5. **Implementar logging** robusto
6. **Backup automático** de base de datos
7. **Monitoreo de seguridad** continuo

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia servidor de producción
- `npm run lint` - Ejecuta linter
- `npm run typecheck` - Verifica tipos TypeScript

## Tecnologías Utilizadas

- **Framework:** Next.js 13 (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** JWT + bcryptjs
- **UI:** Tailwind CSS + shadcn/ui
- **Validación:** DOMPurify + Zod (en forms)
- **Estado:** React Context API

## Características de Seguridad Destacadas

### Protección de Contraseñas
- Mínimo 8 caracteres
- Requiere mayúsculas, minúsculas y números
- Hash con bcrypt (salt rounds: 10)

### Gestión de Sesiones
- JWT almacenado en cookies httpOnly
- Expiración automática (24h)
- Renovación manual requerida

### Validación de Pagos
- Validación de formato Luhn (tarjetas)
- Verificación de fecha de expiración
- CVV de 3-4 dígitos
- Enmascaramiento en logs

### Row Level Security (RLS)
- Políticas restrictivas por defecto
- Usuarios solo acceden a sus datos
- Admins con permisos elevados
- Auditoría automática

## Limitaciones Conocidas

- El sistema de pagos es completamente simulado
- No se envían correos reales (simulado)
- Las imágenes son de Pexels (stock photos)
- Rate limiting básico (mejorable para producción)

## Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.

## Licencia

Este proyecto es un demo educativo y no debe usarse en producción sin revisión de seguridad completa.
