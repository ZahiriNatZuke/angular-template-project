# Backend Authentication Requirements

## 🔒 Nueva Arquitectura de Autenticación

El frontend ha migrado a una arquitectura de autenticación ultra-segura basada en **HttpOnly Cookies + CSRF Protection**. Los tokens JWT ya NO se almacenan en localStorage/sessionStorage para proteger contra ataques XSS.

---

## 📋 Endpoints Requeridos

### 1. Get CSRF Token

**Endpoint**: `GET /api/auth/csrf`

**Descripción**: Retorna un token CSRF que el frontend debe incluir en todos los requests mutantes (POST/PUT/DELETE/PATCH).

**Request**: No requiere autenticación

**Response**:
```json
{
  "csrfToken": "<RANDOM_SECURE_TOKEN>"
}
```

**Response Headers**:
```
Set-Cookie: XSRF-TOKEN=<RANDOM_SECURE_TOKEN>; Secure; SameSite=Strict; Path=/
```

**Implementación**:
- Generar un token aleatorio seguro (ej: 32 bytes aleatorios en base64)
- Almacenar en sesión del servidor
- Retornar tanto en body como en cookie

---

### 2. Login

**Endpoint**: `POST /api/auth/login`

**Request Headers**:
```
Content-Type: application/json
X-CSRF-Token: <TOKEN_FROM_CSRF_ENDPOINT>
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response Body**:
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Response Headers** (CRÍTICO):
```
Set-Cookie: accessToken=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=<REFRESH_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

**Notas Importantes**:
- ✅ **SÍ retornar** el objeto `user` en el body
- ❌ **NO retornar** `accessToken` ni `refreshToken` en el body
- ✅ Los tokens SOLO deben ir en cookies HttpOnly
- `Max-Age` para accessToken: 15 minutos (900 segundos)
- `Max-Age` para refreshToken: 7 días (604800 segundos) si `rememberMe: true`, caso contrario session cookie
- Validar CSRF token antes de procesar el login

---

### 3. Check Authentication Status

**Endpoint**: `GET /api/auth/me`

**Description**: Valida el token de acceso y retorna información del usuario actual.

**Request Headers**:
```
Cookie: accessToken=<JWT>
```

**Response** (Success - 200):
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Response** (Unauthorized - 401):
```json
{
  "error": "Unauthorized",
  "code": "TOKEN_EXPIRED"
}
```

**Implementación**:
- Leer `accessToken` de las cookies
- Validar JWT (firma, expiración, etc.)
- Si es válido, retornar datos del usuario
- Si expiró o es inválido, retornar 401

---

### 4. Refresh Access Token

**Endpoint**: `POST /api/auth/refresh`

**Description**: Genera un nuevo access token usando el refresh token. Implementa **refresh token rotation** para mayor seguridad.

**Request Headers**:
```
Cookie: refreshToken=<REFRESH_JWT>
X-CSRF-Token: <TOKEN>
```

**Response Headers**:
```
Set-Cookie: accessToken=<NEW_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=<NEW_REFRESH_JWT>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

**Response Body**:
```json
{
  "success": true
}
```

**Implementación**:
- Leer `refreshToken` de las cookies
- Validar el refresh token
- **IMPORTANTE**: Invalidar el refresh token anterior (rotation)
- Generar NUEVO access token
- Generar NUEVO refresh token
- Retornar ambos en cookies HttpOnly
- Si el refresh token es inválido/expirado, retornar 401

**Refresh Token Rotation**:
```
[Cliente] --refreshToken1--> [Servidor]
                             [Invalida refreshToken1]
                             [Genera accessToken2 y refreshToken2]
[Cliente] <--nuevos tokens-- [Servidor]
```

Esto previene ataques de replay si un refresh token es comprometido.

---

### 5. Logout

**Endpoint**: `POST /api/auth/logout`

**Request Headers**:
```
Cookie: accessToken=<JWT>
Cookie: refreshToken=<REFRESH_JWT>
X-CSRF-Token: <TOKEN>
```

**Response Headers**:
```
Set-Cookie: accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0
```

**Response Body**:
```json
{
  "success": true
}
```

**Implementación**:
- Invalidar ambos tokens en el servidor (agregar a blacklist o remover de base de datos)
- Limpiar cookies enviando `Max-Age=0`
- Retornar éxito

---

## 🔐 CSRF Protection

### Validación en el Backend

Todos los endpoints que mutan estado (POST, PUT, DELETE, PATCH) DEBEN validar el token CSRF:

**Algoritmo de validación**:
1. Leer header `X-CSRF-Token` del request
2. Leer cookie `XSRF-TOKEN` del request
3. Comparar ambos valores
4. Si coinciden → permitir request
5. Si NO coinciden → retornar 403

**Response de error CSRF**:
```json
{
  "error": "CSRF token invalid",
  "code": "CSRF_INVALID"
}
```

**Nota**: El código `"CSRF_INVALID"` es importante porque el frontend lo detecta y automáticamente solicita un nuevo token.

---

## 🌐 CORS Configuration

Si el frontend y backend están en dominios diferentes (ej: frontend en `localhost:4200`, backend en `localhost:3000`), configurar CORS correctamente:

### Express.js Example:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200', // Frontend URL
  credentials: true, // CRÍTICO: permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie']
}));
```

### NestJS Example:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
});
```

**Producción**: Cambiar `origin` al dominio real del frontend.

---

## 🔑 JWT Token Structure

### Access Token (Short-lived)
```json
{
  "sub": "123",
  "email": "user@example.com",
  "role": "admin",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```
- Expiración: 15 minutos
- Usado en cada request autenticado
- Se renueva con refresh token

### Refresh Token (Long-lived)
```json
{
  "sub": "123",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1235172690
}
```
- Expiración: 7 días (o session si `rememberMe: false`)
- Solo usado para generar nuevos access tokens
- Rotado en cada uso (one-time use)

---

## 🛡️ Security Checklist

- [ ] Tokens JWT SOLO en cookies HttpOnly
- [ ] Flag `Secure` habilitado en cookies (HTTPS only en producción)
- [ ] `SameSite=Strict` para prevenir CSRF de terceros
- [ ] CSRF token validation en todos los endpoints POST/PUT/DELETE/PATCH
- [ ] Refresh token rotation implementado
- [ ] Tokens invalidados en logout almacenados en blacklist
- [ ] Access token expira en 15 minutos máximo
- [ ] Refresh token expira en 7 días máximo
- [ ] CORS configurado correctamente con `credentials: true`
- [ ] HTTPS habilitado en producción (cookies `Secure` lo requieren)

---

## 🚀 BFF (Backend For Frontend) - Opcional pero Recomendado

Para máxima seguridad, considera implementar un BFF:

```
[Angular App] ←→ [BFF (Node.js/Express)] ←→ [Backend API]
```

**Ventajas del BFF**:
- Los tokens nunca llegan al navegador
- BFF maneja refresh automático
- Simplifica el frontend
- Permite SSR en el futuro
- Capa adicional de seguridad

**Ejemplo de arquitectura BFF**:
```typescript
// BFF routes
app.post('/api/auth/login', async (req, res) => {
  const response = await backendAPI.post('/auth/login', req.body);

  // BFF almacena tokens en memoria o Redis
  session.accessToken = response.data.accessToken;
  session.refreshToken = response.data.refreshToken;

  // Frontend solo recibe session cookie
  res.cookie('sessionId', session.id, { httpOnly: true, secure: true });
  res.json({ user: response.data.user });
});
```

---

## 📝 Migration Notes

### Cambios desde la arquitectura anterior:

**Antes (localStorage)**:
```javascript
// ❌ Tokens en localStorage (vulnerable a XSS)
localStorage.setItem('authToken', token);
fetch('/api/data', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Ahora (HttpOnly Cookies)**:
```javascript
// ✅ Cookies HttpOnly (immune a XSS)
fetch('/api/data', {
  credentials: 'include' // Incluye cookies automáticamente
});
```

**Puntos clave**:
- Ya no hay `Authorization: Bearer` header
- Cookies se envían automáticamente con `credentials: 'include'`
- Frontend nunca ve ni almacena los tokens
- CSRF protection obligatorio

---

## 🧪 Testing

### Verificar implementación correcta:

1. **Login exitoso debe**:
   - Retornar usuario en body
   - Establecer 2 cookies HttpOnly
   - NO retornar tokens en body

2. **Request autenticado debe**:
   - Incluir cookies automáticamente
   - Funcionar sin header `Authorization`

3. **CSRF debe**:
   - Rechazar requests sin `X-CSRF-Token`
   - Retornar 403 con `code: "CSRF_INVALID"`

4. **Refresh debe**:
   - Invalidar token anterior
   - Generar nuevos tokens
   - Actualizar cookies

5. **Logout debe**:
   - Limpiar todas las cookies
   - Invalidar tokens en servidor

---

## 📞 Soporte

Para cualquier duda sobre la implementación, consultar:
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
