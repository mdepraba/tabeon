<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Clock, Star } from 'lucide-vue-next'
import type { Suggestion } from '../composeable/useAutocomplete'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  suggestions?: Suggestion[]
}>()

const emit = defineEmits(['update:modelValue', 'submit', 'select'])
const isFocused = ref(false)
const selectedIndex = ref(-1)

watch(
  () => props.modelValue,
  () => {
    selectedIndex.value = -1
  }
)

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.suggestions?.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % props.suggestions.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = selectedIndex.value <= 0 ? props.suggestions.length - 1 : selectedIndex.value - 1
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (selectedIndex.value >= 0 && props.suggestions[selectedIndex.value]) {
      emit('select', props.suggestions[selectedIndex.value])
    } else {
      emit('submit')
    }
    isFocused.value = false
  }
}

const handleSelect = (item: Suggestion) => {
  emit('select', item)
  isFocused.value = false
}
const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 150)
}
</script>

<template>
  <form @submit.prevent="emit('submit')" class="relative w-full items-center">
    <span
      class="absolute inset-s-4 top-1/2 -translate-y-1/2 text-theme-text-muted transition-colors group-focus-within:text-theme-highlight">
      <Search class="h-5 w-5" />
    </span>

    <input
      type="text"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      :placeholder="placeholder || 'Search...'"
      class="flex h-14 w-full rounded-full border border-theme-border bg-theme-bg/60px-4 py-2 pl-12 text-base text-theme-text shadow-sm backdrop-blur-md transition-all placeholder:text-theme-text-muted hover:bg-theme-bg/80 focus:border-theme-highlight focus:bg-theme-bg focus:outline-none focus:ring-4 focus:ring-theme-highlight/10" />
    <button type="submit" class="hidden" aria-hidden="true"></button>
  </form>

  <Transition name="fade-slide">
    <div
      v-if="isFocused && suggestions && suggestions.length > 0"
      class="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-theme-border bg-theme-fg/90 shadow-2xl backdrop-blur-xl">
      <ul class="py-2">
        <li
          v-for="(item, index) in suggestions"
          :key="item.id"
          @mousedown.prevent="handleSelect(item)"
          @mouseenter="selectedIndex = index"
          :class="[
            'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
            selectedIndex === index
              ? 'bg-theme-highlight/10 text-theme-highlight'
              : 'text-theme-text hover:bg-theme-text/5',
          ]">
          <Search v-if="item.type === 'search'" class="h-4 w-4 opacity-60" />
          <Clock v-else-if="item.type === 'history'" class="h-4 w-4 opacity-60" />
          <Star v-else-if="item.type === 'bookmark'" class="h-4 w-4 opacity-60 text-yellow-500" />

          <div class="flex flex-col truncate">
            <span class="truncate text-sm font-medium">{{ item.title }}</span>
            <span v-if="item.url" class="truncate text-xs opacity-50">{{ item.url }}</span>
          </div>
        </li>
      </ul>
    </div>
  </Transition>
</template>
