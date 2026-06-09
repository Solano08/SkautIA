import { execSync } from "node:child_process";

for (const port of [3000, 3001]) {
  try {
    execSync(
      `powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($c) { $c | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }"`,
      { stdio: "ignore" }
    );
  } catch {
    /* puerto libre */
  }
}

console.log("Puertos 3000 y 3001 liberados.");
