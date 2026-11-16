<script setup lang="ts" generic="T extends string | number">
// Grupo de filtros em "chips" com seleção múltipla (aria-pressed para leitores de tela).
import { toggle } from '../utils/filters'

// `color` é a cor de destaque do chip (ex.: cor do elemento).
const props = defineProps<{
  label: string
  options: { value: T; label: string; color?: string }[]
  modelValue: T[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>()

const flip = (value: T) => emit('update:modelValue', toggle(props.modelValue, value))
</script>

<template>
  <fieldset class="m-0 min-w-0 border-0 p-0">
    <legend class="mb-2 p-0 text-xs font-bold uppercase tracking-wide text-muted">{{ label }}</legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="k-chip"
        :aria-pressed="modelValue.includes(option.value)"
        :style="option.color ? { '--chip': option.color } : undefined"
        @click="flip(option.value)"
      >
        <span v-if="option.color" aria-hidden="true" class="k-chip-dot" />
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>
