---
description: Verifica los criterios de aceptación de un spec con el agente spec-verifier
agent: spec-verifier
---

Verifica los criterios de aceptación del spec indicado en `$ARGUMENTS`.

- `$ARGUMENTS` es el número, slug o ruta del spec (ejemplo: `01`, `01-feed-home`, `specs/01-feed-home.md`).
- Si `$ARGUMENTS` viene vacío, pregunta cuál spec verificar; no adivines.
- Sigue tu proceso completo: evidencia real para cada criterio, Context7 para lo que dependa de Next.js, Playwright MCP para pantallas (screenshots en `.playwright-mcp/`), y termina con el reporte por criterio (✅ / ❌ / ⚠️) con conteo total.
