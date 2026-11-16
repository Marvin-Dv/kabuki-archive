# Dados do Kabuki Archive

Três camadas, da menos para a mais importante:

| Pasta | O que é | Pode editar? |
|---|---|---|
| `raw/` | Cache bruto das fontes (ignorado pelo git) | Não |
| `generated/` | Saída dos scripts de ingestão, já no schema do projeto | Não (é sobrescrita) |
| `overrides/` | Correções manuais, aplicadas por cima de `generated/` | **Sim** |

O build faz `merge(generated, overrides)`. Um override só precisa conter os campos
que você quer corrigir, com o mesmo nome do arquivo gerado:

```
data/generated/characters/1001.json
data/overrides/characters/1001.json   ← só os campos corrigidos
```

## Regra de spoiler

Toda entidade tem `announcedAt` (data do anúncio oficial) e `patchReleaseDate`.

- Sem `announcedAt` (ou com data futura): **não é publicada**.
- Enquanto `hoje < patchReleaseDate + 14 dias`: a página exibe o aviso de spoiler.

A lógica fica em `utils/spoiler.ts` e é coberta por testes.

## Ingestão (Fase 1)

```
pnpm data:fetch                         # baixa o StarRailRes e regenera data/generated
pnpm data:fetch --offline               # usa só o cache de data/raw
pnpm data:fetch --baseline 2026-11-16   # 1ª vez: marca o conteúdo atual como anunciado
pnpm validate                           # valida generated + overrides contra os schemas
```

Coleções geradas: `characters/<id>.json` e `lightcones/<id>.json`.

- **Fonte atual:** StarRailRes (`index_new/<idioma>/`), nos 5 idiomas do site. Inglês é
  obrigatório; um idioma fora do ar só gera aviso. Se o inglês falhar, nada é gravado.
- **Embargo:** as fontes não dizem quando algo foi anunciado (e o StarRailRes pode ter
  conteúdo extraído do cliente antes do anúncio). Por isso `announcedAt` vem **só** de
  `data/announcements.json` (`{ "characters": { "1001": { "announcedAt": "2023-04-26",
  "patchReleaseDate": "2023-04-26", "version": "1.0" } } }`). Fora do manifesto → `null` → não publica.
- **Slugs** nunca mudam depois de gerados (as URLs não quebram se o nome mudar).
- **Descrições** guardam o template do jogo (`#1[i]%`) e a tabela `params`; use
  `renderTemplate` (`utils/template.ts`) para exibir. **Imagens** guardam só o caminho
  relativo; `assetUrl` (`utils/assets.ts`) monta a URL do CDN.
- Entidades com caminho/elemento/raridade desconhecidos são ignoradas com aviso
  (provavelmente um caminho novo do jogo: adicione-o em `schema/common.ts` e em `PATH_MAP`).
