# Panel de procesos (ejemplo)

> **Todos los datos de este repositorio son DATOS DE EJEMPLO ficticios** (`data/sample-processes.json`). No se describen bots, personas ni sistemas reales.
>
> Traducción automática.

Un panel de una sola página en React + TypeScript (Vite) para procesos automatizados: bot responsable, horario, estado, última ejecución, problema, categoría y detalles, además de un panel de notas de Obsidian. Todos los datos son estáticos en el código fuente; la página no hace llamadas de red.

## Inicio rápido
```bash
npm ci && npm start      # compila y sirve en http://localhost:4173
```
Requiere Node 18+. Servidor de desarrollo: `npm run dev`.

## Instalación paso a paso

_◐ machine translation, pending review._
**Requisitos:** Node.js 18 o posterior (con npm) y Git.

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # instalar las dependencias en versiones exactas
npm run dev   # servidor de desarrollo con recarga (normalmente http://localhost:5173)
npm test      # ejecutar las pruebas de Vitest
npm run build # comprobación de tipos y build en dist/
npm start     # build y servir dist/ en http://localhost:4173
```

Editar los datos de ejemplo: procesos en `data/sample-processes.json`, proyectos en `data/sample-projects.json` (los campos `what`, `why`, `status`, `next` aparecen con **Más**), extractos de Obsidian en `src/obsidian-adapter.ts`. Nunca hagas commit de nombres, correos, IP, registros o claves reales.

## Controles
- Cabecera: selector de idioma (9 idiomas; ◐ = traducción automática parcial), tema (Auto / Claro / Oscuro), README.
- Los avisos rojos y ámbar saltan a la tarjeta afectada.
- Vistas: reloj de 24 h, red bots–procesos, líneas de metro. Zoom, Ajustar, Pantalla completa (Esc).
- Tarjetas: «Descripción / Comando» con más / menos.
- Detener / Reiniciar copian un mensaje como `Stop: <proceso> (Bot A/<id>)` para pegarlo en el chat del QR bot. No se envía nada.

## Por qué Obsidian / Por qué el lector del vault
El vault de Obsidian es la base de conocimiento compartida del equipo: decisiones, procedimientos y contexto se guardan allí como simples notas Markdown. El lector del vault accede a él solo en modo lectura, para que los bots puedan buscar y usar lo que ya está escrito en lugar de volver a preguntar. Así se ahorra tiempo y energía, y el propietario no tiene que volver a explicar las cosas.

**Principio: primero la base de conocimiento, después el propietario.** Antes de preguntar al propietario, un bot busca en la base de conocimiento compartida solo en modo lectura y pregunta únicamente si la respuesta no está allí.

## Configurar Obsidian
1. Instala Obsidian (obsidian.md) en el equipo donde quieras leer.
2. Abre el vault «example vault» (Open folder as vault). El host del vault viene de la configuración (`vaultHost`).
3. En otro equipo: sincroniza la carpeta (Syncthing, recurso SMB u Obsidian Sync) y ábrela con el mismo nombre de vault.
4. Pulsa Actualizar en el panel de Obsidian.

Conectar tu propio vault (solo marcadores de posición):
- Nombre del vault: `<your-vault-name>`
- Máquina: `<host where the vault lives>`
- Modo de sincronización: Obsidian Sync / iCloud / git / local only
- Conexión: define `VAULT_PATH` en un `.env` ignorado por git y ejecuta `tools/vault-read`
  `VAULT_PATH=/path/to/<your-vault-name>`

Los enlaces tienen la forma `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(ruta sin .md)>` y se abren en una pestaña nueva, porque los iframes en sandbox bloquean los protocolos personalizados en el mismo marco.

## Modo de escritura del vault (v1.6.0)

**Interruptor (v1.6.1):** las escrituras (`create`, `append`, `--pending`, `approve`) solo funcionan con `VAULT_WRITE_ENABLED=1` (env o `.env`); desactivadas por defecto, `pending list` sigue siendo solo lectura.

`create` crea una nota nueva y falla si ya existe; `append` solo añade a notas existentes. Sin borrar, sobrescribir ni renombrar. `--bot <nombre>` es obligatorio; el texto viene de `--text` o stdin. Cada escritura se registra en `_bot-writes/log.md` (solo añadir: hora, bot, comando, ruta, primeros 200 caracteres, sha256) y se resume a diario en `_bot-writes/daily/YYYY-MM-DD.md`. `--pending` guarda la escritura en `_bot-writes/pending/` sin tocar el destino; solo el propietario la aplica con `approve <id>`. Exclusiones, bloqueo de traversal/symlinks y ocultación de secretos también aplican; `.obsidian` y las rutas excluidas nunca se escriben.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Adaptador de configuración
`src/obsidian-adapter.ts` contiene `OBS_CFG` (`vaultHost`, `vaultName`, `source`) y extractos de ejemplo de solo lectura. `source` es `local`, `syncthing`, `smb` o `rest` (URL de la Local REST API, solo marcador). Se puede sobrescribir con `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` en un `.env` ignorado por git. `src/webhook.ts` es un módulo desactivado para el control directo de procesos.

## Guía para principiantes: un proceso paso a paso
1. Ejecuta `npm ci && npm start` y abre http://localhost:4173.
2. En **Vista**, elige **Red bots–procesos**. En el filtro de bots, elige **QR bot**.
3. Haz clic en el recuadro **Weekly trend scan** (en español los nombres de procesos siguen en inglés). La tarjeta de detalle muestra: horario Monday 10:00, estado activo · OK, última ejecución 10-26 10:04.
4. Abre **Descripción / Comando** con **más** para leer la instrucción de ejemplo.
5. Pulsa **Detener**. Se copia el texto `Stop: Weekly trend scan (QR bot/p02)`. Pégalo en el chat del QR bot; la página no envía nada.
6. Cambia el idioma en la cabecera y pulsa **README** para leer esta guía en ese idioma.

## Datos
Sustituye `data/sample-processes.json` por tu propia exportación (misma estructura). Nunca hagas commit de datos reales ni de claves.

Lector de bóveda Obsidian (solo lectura): `tools/vault-read` — ver README principal.
