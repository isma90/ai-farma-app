<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
<!-- INSTRUCTION:START -->
Los commits no deben incluir información de que fueron co-autored by AI o ninguna referencia a ello.

# Flujo Feature Completa con Conventional Commits
1. Implementa la tarea siguiendo estándares del proyecto.
2. Ejecuta pruebas: `npm test` (o equivalente).
3. Corrige errores si existen y re-prueba.
4. Commit usando Conventional Commits:
   - `git add .`
   - `git commit -m "feat: descripción clara y concisa de la nueva funcionalidad"`
   - Para fixes: `git commit -m "fix: corrige [problema específico]"`
5. Al finalizar múltiples commits de la feature: 
   - `git push origin feature-branch`
   - Opcional: `npm run changelog` para generar notas automáticas.

# Documentación de cambios en modo changelog

## Objetivo
Cada vez que se realice un commit, Claude debe:
- Resumir los cambios de ese commit en formato de changelog humano.
- Guardar un archivo Markdown dentro de la carpeta `docs/` con los cambios.
- Agrupar de forma ordenada todas las features y fixes incluidas en ese commit.

## Convenciones de commits
Seguimos Conventional Commits:
- feat: nueva funcionalidad
- fix: corrección de bug
- docs: cambios de documentación
- refactor: cambios internos sin alterar comportamiento externo
- test: adición o actualización de pruebas
- chore: tareas de mantenimiento

Formato: `tipo(scope?): descripción breve en imperativo y minúscula`.
Ejemplo: `feat(auth): agrega login con OAuth`.

## Reglas para la documentación por commit

Cuando completes un commit:

1. Identifica el tipo de cambio según el mensaje de commit (feat, fix, docs, etc.).
2. Redacta un resumen breve y claro, orientado a humanos, no solo desarrolladores internos.
3. Si el commit abarca varias features o fixes, lista cada una como ítem separado.

4. Crea o actualiza un archivo Markdown en `docs/` con este formato:

   - Un archivo por commit, con nombre:
     - `docs/changelog-YYYY-MM-DD-HHMM-<short-sha>.md`
   - Contenido base:
     ```markdown
     # Changelog de commit

     - Commit: `<hash-corto>`
     - Fecha: `YYYY-MM-DD HH:MM`
     - Autor: `<autor si está disponible>` (nombre del humano que está trabajando contigo, puedes preguntarlo)

     ## Resumen
     Descripción breve del propósito del commit.

     ## Detalles

     ### Added
     - Lista de nuevas funcionalidades (`feat`).

     ### Fixed
     - Lista de correcciones de errores (`fix`).

     ### Changed
     - Cambios relevantes en comportamiento existente (`refactor`, algunos `feat` o `chore` que impacten al usuario).

     ### Docs
     - Actualizaciones de documentación (`docs`).

     ### Tests
     - Cambios relacionados con pruebas (`test`).

     > Omite secciones vacías.
     ```

5. Mantén un índice general en `docs/CHANGELOG.md`:
   - Estructura en orden cronológico inverso (lo más reciente primero).
   - Para cada commit relevante, agrega una entrada con enlace al archivo por commit, por ejemplo:
     ```markdown
     ## YYYY-MM-DD

     - feat: nueva pantalla de reportes (`abcd1234`) – ver [detalle](./changelog-YYYY-MM-DD-HHMM-abcd1234.md)
     ```

6. No documentes commits triviales (espacios, cambios puramente internos sin impacto); céntrate en cambios notables.


<!-- INSTRUCTION:END -->
