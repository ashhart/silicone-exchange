/**
 * Theme bootstrap shared by the server layout (inline <head> script) and the
 * client provider. Deliberately NOT a "use client" module — it must be
 * callable from server components.
 */

export const THEME_KEY = "silicon-exchange.theme";

/**
 * Runs before first paint so the persisted palette applies without a flash
 * on reload. Reads the same key the client toggle writes.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var c=t==="light"?"light":"dark";var e=document.documentElement.classList;if(c==="light"){e.add("light");e.remove("dark")}else{e.add("dark");e.remove("light")};document.documentElement.style.colorScheme=c}catch(_e){document.documentElement.classList.add("dark")}})();`;
