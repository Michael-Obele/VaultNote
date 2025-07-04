
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const BUN_INSTALL: string;
	export const COLORTERM: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const DBUS_STARTER_ADDRESS: string;
	export const DBUS_STARTER_BUS_TYPE: string;
	export const DESKTOP_SESSION: string;
	export const DESKTOP_STARTUP_ID: string;
	export const DISPLAY: string;
	export const DRI_PRIME: string;
	export const GDMSESSION: string;
	export const GEMINI_API_KEY: string;
	export const GIO_LAUNCHED_DESKTOP_FILE: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const GJS_DEBUG_OUTPUT: string;
	export const GJS_DEBUG_TOPICS: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const GOPATH: string;
	export const GTK_MODULES: string;
	export const HISTFILESIZE: string;
	export const HOME: string;
	export const IM_CONFIG_CHECK_ENV: string;
	export const IM_CONFIG_PHASE: string;
	export const INSIDE_NAUTILUS_PYTHON: string;
	export const INVOCATION_ID: string;
	export const JOURNAL_STREAM: string;
	export const LANG: string;
	export const LD_LIBRARY_PATH: string;
	export const LESSCLOSE: string;
	export const LESSOPEN: string;
	export const LOGNAME: string;
	export const LS_COLORS: string;
	export const MANAGERPID: string;
	export const NVM_BIN: string;
	export const NVM_CD_FLAGS: string;
	export const NVM_DIR: string;
	export const NVM_INC: string;
	export const OLDPWD: string;
	export const PATH: string;
	export const PWD: string;
	export const QT_ACCESSIBILITY: string;
	export const QT_IM_MODULE: string;
	export const SESSION_MANAGER: string;
	export const SHELL: string;
	export const SHLVL: string;
	export const SSH_AGENT_LAUNCHER: string;
	export const SSH_AUTH_SOCK: string;
	export const SSH_SOCKET_DIR: string;
	export const SYSTEMD_EXEC_PID: string;
	export const TERM: string;
	export const TERM_PROGRAM: string;
	export const TERM_PROGRAM_VERSION: string;
	export const USER: string;
	export const USERNAME: string;
	export const WARP_HONOR_PS1: string;
	export const WARP_IS_LOCAL_SHELL_SESSION: string;
	export const WARP_USE_SSH_WRAPPER: string;
	export const WAYLAND_DISPLAY: string;
	export const XAUTHORITY: string;
	export const XDG_CONFIG_DIRS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const XDG_DATA_DIRS: string;
	export const XDG_MENU_PREFIX: string;
	export const XDG_RUNTIME_DIR: string;
	export const XDG_SESSION_CLASS: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const XMODIFIERS: string;
	export const ZED_ALLOW_EMULATED_GPU: string;
	export const ZED_ENVIRONMENT: string;
	export const ZED_FORCE_CLI_MODE: string;
	export const _: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		BUN_INSTALL: string;
		COLORTERM: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		DBUS_STARTER_ADDRESS: string;
		DBUS_STARTER_BUS_TYPE: string;
		DESKTOP_SESSION: string;
		DESKTOP_STARTUP_ID: string;
		DISPLAY: string;
		DRI_PRIME: string;
		GDMSESSION: string;
		GEMINI_API_KEY: string;
		GIO_LAUNCHED_DESKTOP_FILE: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		GJS_DEBUG_OUTPUT: string;
		GJS_DEBUG_TOPICS: string;
		GNOME_DESKTOP_SESSION_ID: string;
		GNOME_SETUP_DISPLAY: string;
		GNOME_SHELL_SESSION_MODE: string;
		GOPATH: string;
		GTK_MODULES: string;
		HISTFILESIZE: string;
		HOME: string;
		IM_CONFIG_CHECK_ENV: string;
		IM_CONFIG_PHASE: string;
		INSIDE_NAUTILUS_PYTHON: string;
		INVOCATION_ID: string;
		JOURNAL_STREAM: string;
		LANG: string;
		LD_LIBRARY_PATH: string;
		LESSCLOSE: string;
		LESSOPEN: string;
		LOGNAME: string;
		LS_COLORS: string;
		MANAGERPID: string;
		NVM_BIN: string;
		NVM_CD_FLAGS: string;
		NVM_DIR: string;
		NVM_INC: string;
		OLDPWD: string;
		PATH: string;
		PWD: string;
		QT_ACCESSIBILITY: string;
		QT_IM_MODULE: string;
		SESSION_MANAGER: string;
		SHELL: string;
		SHLVL: string;
		SSH_AGENT_LAUNCHER: string;
		SSH_AUTH_SOCK: string;
		SSH_SOCKET_DIR: string;
		SYSTEMD_EXEC_PID: string;
		TERM: string;
		TERM_PROGRAM: string;
		TERM_PROGRAM_VERSION: string;
		USER: string;
		USERNAME: string;
		WARP_HONOR_PS1: string;
		WARP_IS_LOCAL_SHELL_SESSION: string;
		WARP_USE_SSH_WRAPPER: string;
		WAYLAND_DISPLAY: string;
		XAUTHORITY: string;
		XDG_CONFIG_DIRS: string;
		XDG_CURRENT_DESKTOP: string;
		XDG_DATA_DIRS: string;
		XDG_MENU_PREFIX: string;
		XDG_RUNTIME_DIR: string;
		XDG_SESSION_CLASS: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		XMODIFIERS: string;
		ZED_ALLOW_EMULATED_GPU: string;
		ZED_ENVIRONMENT: string;
		ZED_FORCE_CLI_MODE: string;
		_: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
