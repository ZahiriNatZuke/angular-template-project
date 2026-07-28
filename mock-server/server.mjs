/**
 * Backend de mentira para las rutas de autenticación.
 *
 * Existe porque `apiUrl` apunta a un servidor que este repositorio no trae, y sin
 * él lo que distingue a esta plantilla —sesión en cookies HttpOnly con CSRF— no se
 * puede ejercitar: ni a mano ni en los tests. Los end-to-end lo esquivaban
 * interceptando las respuestas con `page.route`, que prueba la aplicación pero no
 * el trato con un servidor de verdad: ahí no hay cookies, ni CORS, ni un servidor
 * que rechace un token equivocado.
 *
 * Implementa el contrato de `docs/BACKEND_AUTH_REQUIREMENTS.md` y **valida el CSRF
 * de verdad**: una mutación sin cabecera correcta se responde con 403. Un backend
 * así habría cazado en el primer intento el fallo por el que cada login salía sin
 * su cabecera.
 *
 * No es un backend: la sesión vive en memoria, las contraseñas se comparan en
 * claro y no hay base de datos. Sirve para desarrollar y probar contra algo, y
 * para leerlo entero en cinco minutos. No tiene dependencias: `node:http` y nada
 * más.
 *
 *   pnpm mock
 */

import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_PORT ?? 3000);
const ORIGIN = process.env.MOCK_ORIGIN ?? 'http://localhost:4200';

/** El único usuario que existe. Sus credenciales están en el README. */
const USER = {
	id: '1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	role: 'admin',
	password: 'secret123',
};

/**
 * Sesiones y tokens CSRF vivos, por valor de cookie.
 *
 * En memoria a propósito: al reiniciar el servidor se cierran todas las sesiones,
 * que para desarrollar es lo cómodo.
 */
const sessions = new Map();
const csrfTokens = new Set();

const token = () => randomBytes(32).toString('base64url');

const readCookies = request =>
	Object.fromEntries(
		(request.headers.cookie ?? '')
			.split(';')
			.map(part => part.trim().split('='))
			.filter(([name]) => name)
	);

const readBody = async request => {
	const chunks = [];
	for await (const chunk of request) chunks.push(chunk);
	if (!chunks.length) return {};
	try {
		return JSON.parse(Buffer.concat(chunks).toString());
	} catch {
		return {};
	}
};

const send = (response, status, body, headers = {}) => {
	response.writeHead(status, {
		'Content-Type': 'application/json',
		...headers,
	});
	response.end(JSON.stringify(body ?? {}));
};

/**
 * Cabeceras de CORS con credenciales.
 *
 * El origen va explícito, nunca `*`: con `Access-Control-Allow-Credentials` el
 * navegador rechaza el comodín, y es justo lo que hará falta configurar en el
 * backend de verdad.
 */
const cors = {
	'Access-Control-Allow-Origin': ORIGIN,
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	Vary: 'Origin',
};

/**
 * Cookie de sesión.
 *
 * `HttpOnly` es el motivo de todo esto: el token no existe para JavaScript.
 * `SameSite=Lax` basta aunque el front esté en otro puerto, porque para las
 * cookies el puerto no cambia el sitio. Sin `Secure`, que en `http://localhost`
 * impediría guardarla; en producción va siempre.
 */
const sessionCookie = (value, maxAge) =>
	`session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

const server = createServer(async (request, response) => {
	const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
	const path = url.pathname;

	if (request.method === 'OPTIONS') {
		response.writeHead(204, cors);
		response.end();
		return;
	}

	// Las mutaciones exigen un token CSRF que este servidor haya emitido. Es la
	// mitad del contrato que la aplicación no puede comprobar por su cuenta.
	if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method ?? '')) {
		const sent = request.headers['x-csrf-token'];
		if (typeof sent !== 'string' || !csrfTokens.has(sent)) {
			send(response, 403, { code: 'CSRF_INVALID' }, cors);
			return;
		}
	}

	if (path === '/api/auth/csrf' && request.method === 'GET') {
		const csrfToken = token();
		csrfTokens.add(csrfToken);
		send(response, 200, { csrfToken }, cors);
		return;
	}

	if (path === '/api/auth/login' && request.method === 'POST') {
		const { email, password, rememberMe } = await readBody(request);

		if (email !== USER.email || password !== USER.password) {
			send(response, 401, { message: 'Invalid credentials' }, cors);
			return;
		}

		const session = token();
		sessions.set(session, USER);
		const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60;

		const { password: _, ...user } = USER;
		send(
			response,
			200,
			{ user },
			{
				...cors,
				'Set-Cookie': sessionCookie(session, maxAge),
			}
		);
		return;
	}

	if (path === '/api/auth/me' && request.method === 'GET') {
		const user = sessions.get(readCookies(request).session ?? '');

		if (!user) {
			// La respuesta normal de quien todavía no ha entrado. La aplicación tiene
			// que tratarla como tal y no como una sesión que caducó.
			send(response, 401, { message: 'Unauthorized' }, cors);
			return;
		}

		const { password: _, ...safe } = user;
		send(response, 200, { user: safe }, cors);
		return;
	}

	if (path === '/api/auth/logout' && request.method === 'POST') {
		const cookies = readCookies(request);
		sessions.delete(cookies.session ?? '');

		// El token CSRF se invalida al cerrar sesión, que es lo que hace un backend
		// serio; por eso la aplicación pide uno nuevo después.
		const sent = request.headers['x-csrf-token'];
		if (typeof sent === 'string') csrfTokens.delete(sent);

		send(response, 200, {}, { ...cors, 'Set-Cookie': sessionCookie('', 0) });
		return;
	}

	send(
		response,
		404,
		{ message: `No such route: ${request.method} ${path}` },
		cors
	);
});

server.listen(PORT, () => {
	console.log(`[mock] escuchando en http://localhost:${PORT}`);
	console.log(`[mock] origen permitido: ${ORIGIN}`);
	console.log(`[mock] usuario: ${USER.email} / ${USER.password}`);
});
