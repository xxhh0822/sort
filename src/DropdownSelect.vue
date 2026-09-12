<script setup lang="ts">
import { Check, ChevronDown } from 'reicon-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

interface DropdownOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: readonly DropdownOption[]
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)
const activeIndex = ref(0)
const listboxId = `dropdown-${useId()}`
const selectedIndex = computed(() => Math.max(0, props.options.findIndex((option) => option.value === props.modelValue)))
const selectedLabel = computed(() => props.options[selectedIndex.value]?.label ?? '')

watch(() => props.modelValue, () => {
  activeIndex.value = selectedIndex.value
})

function toggle() {
  open.value = !open.value
  activeIndex.value = selectedIndex.value
  if (open.value) revealActive()
}

function close(restoreFocus = false) {
  open.value = false
  if (restoreFocus) void nextTick(() => trigger.value?.focus())
}

function select(value: string) {
  emit('update:modelValue', value)
  close(true)
}

function moveActive(offset: number) {
  if (!open.value) open.value = true
  const length = props.options.length
  activeIndex.value = (activeIndex.value + offset + length) % length
  revealActive()
}

function revealActive() {
  void nextTick(() => document.getElementById(`${listboxId}-${activeIndex.value}`)?.scrollIntoView?.({ block: 'nearest' }))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(event.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    open.value = true
    activeIndex.value = event.key === 'Home' ? 0 : props.options.length - 1
    revealActive()
    return
  }
  if ((event.key === 'Enter' || event.key === ' ') && open.value) {
    event.preventDefault()
    const option = props.options[activeIndex.value]
    if (option) select(option.value)
    return
  }
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    close()
  }
}

function handleOutsideClick(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('pointerdown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsideClick))
</script>

<template>
  <div ref="root" class="dropdown-select" :class="{ open }">
    <button
      ref="trigger"
      class="dropdown-trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="open ? `${listboxId}-${activeIndex}` : undefined"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span>{{ selectedLabel }}</span>
      <ChevronDown :size="16" aria-hidden="true" />
    </button>

    <div v-if="open" :id="listboxId" class="dropdown-menu" role="listbox" :aria-label="label">
      <button
        v-for="(option, index) in options"
        :id="`${listboxId}-${index}`"
        :key="option.value"
        class="dropdown-option"
        :class="{ active: activeIndex === index, selected: modelValue === option.value }"
        type="button"
        role="option"
        :aria-selected="modelValue === option.value"
        tabindex="-1"
        @mouseenter="activeIndex = index"
        @click="select(option.value)"
      >
        <span>{{ option.label }}</span>
        <Check v-if="modelValue === option.value" :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-select { position: relative; width: 100%; }
.dropdown-trigger {
  display: flex;
  width: 100%;
  height: 40px;
  padding: 0 12px 0 14px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dfe4f0;
  border-radius: 11px;
  color: #33405a;
  background: #f8f9fd;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
}
.dropdown-trigger:hover { color: var(--primary); border-color: #c5ccff; background: var(--primary-soft); }
.dropdown-trigger:focus-visible { outline: 3px solid rgba(82, 98, 245, 0.2); outline-offset: 2px; }
.dropdown-trigger svg { color: #7d889e; transition: transform 0.16s ease, color 0.16s ease; }
.open .dropdown-trigger { color: var(--primary); border-color: #aeb8ff; background: var(--primary-soft); box-shadow: 0 0 0 3px rgba(82, 98, 245, 0.1); }
.open .dropdown-trigger svg { color: var(--primary); transform: rotate(180deg); }
.dropdown-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 7px);
  right: 0;
  left: 0;
  display: grid;
  gap: 3px;
  max-height: min(370px, 60vh);
  padding: 6px;
  overflow-y: auto;
  scrollbar-color: #c8ceef transparent;
  scrollbar-width: thin;
  border: 1px solid #e0e4ef;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 36px rgba(34, 48, 87, 0.16);
}
.dropdown-menu::-webkit-scrollbar { width: 6px; }
.dropdown-menu::-webkit-scrollbar-thumb { border-radius: 999px; background: #c8ceef; }
.dropdown-option {
  display: flex;
  width: 100%;
  height: 36px;
  padding: 0 9px;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 8px;
  color: #56627a;
  background: transparent;
  font-size: 12px;
  text-align: left;
}
.dropdown-option.active { color: var(--primary); background: #f1f3ff; }
.dropdown-option.selected { color: var(--primary); font-weight: 700; }
</style>
