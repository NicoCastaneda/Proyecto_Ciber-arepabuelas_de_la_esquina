# Guía de Configuración Rápida

## Pasos para Iniciar

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Inicializar Base de Datos

Primero, inicia el servidor de desarrollo:
```bash
npm run dev
```

Luego, en otra terminal o navegador, ejecuta:
```bash
curl -X POST http://localhost:3000/api/seed
```

O visita directamente: http://localhost:3000/api/seed

Esto creará:
- Usuario Administrador
- Usuario Cliente Demo
- 6 Productos de muestra
- Cupón de bienvenida para el cliente demo

### 3. Acceder a la Aplicación

Abre tu navegador en: http://localhost:3000

## Credenciales de Acceso

### Administrador
- Email: `admin@arepabuelas.com`
- Contraseña: `admin123`

### Cliente Demo
- Email: `cliente@arepabuelas.com`
- Contraseña: `prueba123`

## Funcionalidades Disponibles

### Como Cliente:
1. Registrarse (requiere aprobación del admin)
2. Ver catálogo de productos
3. Agregar productos al carrito
4. Aplicar cupón de descuento
5. Realizar compra (simulada)
6. Ver historial de pedidos

### Como Admin:
1. Aprobar/bloquear usuarios
2. Crear/editar/eliminar productos
3. Ver todos los usuarios
4. Acceso completo al sistema

## Tarjeta de Prueba

Para simular pagos, usa:
- Número: `4532123456789012`
- Fecha: `12/25`
- CVV: `123`

**Nota:** Es solo simulación, no se procesan pagos reales.

## Solución de Problemas

### Error de conexión a base de datos
Verifica que las variables en `.env` estén correctas.

### Productos no aparecen
Ejecuta el endpoint `/api/seed` nuevamente.

### Usuario no puede iniciar sesión
Si es un nuevo registro, el admin debe aprobar la cuenta primero.

## Seguridad

Este es un proyecto demo. Para producción:
1. Cambia JWT_SECRET
2. Implementa HTTPS
3. Configura CORS restrictivo
4. Agrega rate limiting más estricto
5. Implementa logs de auditoría completos
