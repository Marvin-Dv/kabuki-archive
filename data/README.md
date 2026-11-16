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
