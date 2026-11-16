// Ponto de entrada da ingestão de dados (Fase 1).
//
// Plano de adaptadores, em ordem de prioridade no merge:
//   1. Repositórios da comunidade (StarRailRes, Yatta)  → stats, skills, traços, imagens
//   2. HoYoWiki                                          → textos e descrições que faltarem
//   3. Adaptadores pontuais (nanoka.cc, starrailstation) → ex.: eidolons e kits
//
// Cada adaptador vai viver em scripts/adapters/<fonte>.ts e expor a mesma interface,
// para que uma fonte quebrada não derrube as outras.

console.log('Ingestão ainda não implementada — será a Fase 1.')
