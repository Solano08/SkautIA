import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Caché .next eliminada.");
} catch {
  console.log("No había caché .next.");
}
