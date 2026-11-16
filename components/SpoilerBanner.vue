<script setup lang="ts">
// Mostra o aviso de spoiler enquanto a janela de 14 dias do patch estiver ativa.
// A decisão é tomada em build-time (SSG); o rebuild semanal garante que o aviso expire.
const props = defineProps<{
  /** Data de lançamento do patch (YYYY-MM-DD). Sem data, o aviso fica ativo. */
  patchReleaseDate?: string | null
}>()

const { t } = useI18n()
const active = computed(() => isSpoilerActive(props.patchReleaseDate))
</script>

<template>
  <aside
    v-if="active"
    role="note"
    class="flex gap-3 rounded-xl border border-accent-2/50 bg-surface-2 p-4 text-sm"
  >
    <span aria-hidden="true" class="text-lg leading-none">⚠</span>
    <div>
      <p class="font-bold text-accent-2">{{ t('spoiler.title') }}</p>
      <p class="mt-1 text-muted">{{ t('spoiler.body') }}</p>
    </div>
  </aside>
</template>
