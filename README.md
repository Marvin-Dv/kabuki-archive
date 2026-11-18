# Kabuki Archive

Banco de dados e wiki **não oficial** de *Honkai: Star Rail*, feito com Nuxt 3 (Vue 3) e publicado no GitHub Pages.

## Stack

Nuxt 3 (SSG) · Vue 3 · TypeScript · Pinia · Tailwind CSS · `@nuxtjs/i18n` (pt-BR, en, zh-CN, ja, ko) · Zod · Vitest · pnpm

## Começando

Requisitos: Node 20+ e pnpm.

```bash
pnpm install
pnpm dev          # servidor de desenvolvimento
pnpm test         # testes (spoiler, merge, schema)
pnpm validate     # valida os dados em data/
pnpm generate     # gera o site estático em .output/public
```

## Publicando no GitHub Pages

1. Crie o repositório (público). Com o nome **`<seu-usuario>.github.io`** o site fica na raiz;
   com qualquer outro nome (ex.: `kabuki-archive`) fica em `<seu-usuario>.github.io/kabuki-archive/`.
   O workflow detecta isso sozinho.
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Faça push na branch `main`. O workflow `deploy.yml` roda testes, valida os dados, gera o site e publica.
4. Depois do primeiro `pnpm install` local, commite o `pnpm-lock.yaml` e troque, nos workflows,
   `pnpm install --no-frozen-lockfile` por `pnpm install --frozen-lockfile`.

## Estrutura

```
app.vue, pages/, components/   interface (Vue)
assets/css/main.css            tokens de tema claro/escuro e estilos base
locales/                       traduções da interface (5 idiomas)
schema/                        schemas Zod das entidades
utils/                         spoiler.ts (embargo) e merge.ts (overrides)
scripts/                       ingestão (fetch-data.ts) e validação (validate-data.ts)
data/                          raw/ (cache) · generated/ (scripts) · overrides/ (manual)
tests/                         Vitest
.github/workflows/             deploy e atualização automática de dados
```

## Dados e spoilers

- Só publicamos conteúdo depois do **anúncio oficial** (`announcedAt`).
- Conteúdo de patches recentes mostra um aviso de spoiler, removido automaticamente
  **14 dias** após o lançamento (`patchReleaseDate`). Um rebuild semanal garante a expiração.
- Correções manuais ficam em `data/overrides/` e nunca são sobrescritas pela ingestão.

Detalhes em [`data/README.md`](data/README.md).

## Roadmap

- [x] **Fase 0** — base do projeto, tema, i18n, schema, regra de spoiler, deploy
- [ ] **Fase 1** — ingestão (StarRailRes, Yatta, HoYoWiki) + PR automático
- [ ] **Fase 2** — listas, detalhes, filtros com URL compartilhável, busca (Pagefind)
- [ ] **Fase 3** — relíquias, materiais, inimigos
- [ ] **Fase 4** — planejador de farm, montador de times, comparação
- [ ] **Fase 5** — calculadoras, linha do tempo de patches/banners, PWA

## Aviso legal

Projeto de fã, sem afiliação com a HoYoverse. *Honkai: Star Rail* e todo o conteúdo relacionado
(nomes, imagens, textos) pertencem à HoYoverse (Cognosphere PTE. LTD.).
O código deste repositório é distribuído sob a licença [MIT](LICENSE), que **não** cobre o conteúdo do jogo.
