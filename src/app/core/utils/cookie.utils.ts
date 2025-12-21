/**
 * Cookie utilities for client-side cookie management
 * These are NOT HttpOnly cookies (those are managed by the server)
 * These cookies are readable by JavaScript for preferences like theme/language
 */

export interface CookieOptions {
	expires?: number; // Days until expiration
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: 'Strict' | 'Lax' | 'None';
}

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern is clearer for grouped cookie operations
export class CookieUtils {
	/**
	 * Set a cookie
	 * @param name Cookie name
	 * @param value Cookie value
	 * @param options Cookie options
	 */
	static set(name: string, value: string, options: CookieOptions = {}): void {
		if (typeof document === 'undefined') return; // SSR safety

		let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

		// Default options
		const {
			expires = 365, // 1 year default
			path = '/',
			secure = false,
			sameSite = 'Lax',
		} = options;

		// Add expiration
		if (expires) {
			const date = new Date();
			date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
			cookieString += `; expires=${date.toUTCString()}`;
		}

		// Add path
		if (path) {
			cookieString += `; path=${path}`;
		}

		// Add domain
		if (options.domain) {
			cookieString += `; domain=${options.domain}`;
		}

		// Add secure flag
		if (secure) {
			cookieString += '; secure';
		}

		// Add SameSite
		if (sameSite) {
			cookieString += `; SameSite=${sameSite}`;
		}

		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not widely supported yet
		document.cookie = cookieString;
	}

	/**
	 * Get a cookie value
	 * @param name Cookie name
	 * @returns Cookie value or null if not found
	 */
	static get(name: string): string | null {
		if (typeof document === 'undefined') return null; // SSR safety

		const nameEQ = `${encodeURIComponent(name)}=`;
		const cookies = document.cookie.split(';');

		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith(nameEQ)) {
				return decodeURIComponent(cookie.substring(nameEQ.length));
			}
		}

		return null;
	}

	/**
	 * Delete a cookie
	 * @param name Cookie name
	 * @param options Cookie options (path and domain should match the original cookie)
	 */
	static delete(name: string, options: Partial<CookieOptions> = {}): void {
		CookieUtils.set(name, '', {
			...options,
			expires: -1, // Set to past date
		});
	}

	/**
	 * Check if a cookie exists
	 * @param name Cookie name
	 * @returns true if cookie exists
	 */
	static exists(name: string): boolean {
		return CookieUtils.get(name) !== null;
	}
}
