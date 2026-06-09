import { existsSync, rmSync } from "node:fs";

/**
 * Borra .next si está incompleta o mezclada con un `next build`
 * (evita 500, MODULE_NOT_FOUND tipo ./331.js y errores de RSC en dev).
 */
function shouldResetCache() {
  if (process.env.SKAUT_KEEP_CACHE === "1") return false;
  if (!existsSync(".next")) return false;
  if (!existsSync(".next/routes-manifest.json")) {
    return { reason: "Caché .next incompleta" };
  }
  if (existsSync(".next/BUILD_ID")) {
    return {
      reason:
        "Caché de producción detectada (npm run build). Reiniciando caché de desarrollo",
    };
  }
  return false;
}

const reset = shouldResetCache();
if (reset) {
  try {
    rmSync(".next", { recursive: true, force: true });
    console.log(`${reset.reason}.`);
  } catch {
    console.log("No se pudo limpiar .next; ejecuta npm run dev:clean.");
  }
}
