# Configurador i'Witown

Recorrido guiado para colegios que ya conocen i'Witown: el rector o coordinador
arma su plataforma, la ve funcionando con su logo y sale con su precio.

Se abre solo con un enlace privado que crea la asesora desde founders. Se
publica en el sitio de Hosting `directivos-iwitown` (proyecto `witcoins-network`).

```bash
npm ci
npm run dev        # http://localhost:8090
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
npm run build
```

Sin secretos en este repo: las llaves viven como secretos de las Cloud Functions.
