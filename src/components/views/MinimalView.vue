<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick} from 'vue'
import SearchInput from '../Search.vue'
import { useAutocomplete, type Suggestion } from '../../composeable/useAutocomplete'

const time = ref('')
const date = ref('')
const searchQuery = ref('')
let timerInterval: ReturnType<typeof setInterval>
let debounceTimer: ReturnType<typeof setTimeout>

const { suggestion, fetchSuggestion } = useAutocomplete()

const searchComponentRef = ref<InstanceType<typeof SearchInput> | null>(null)

// BARU: Logika untuk mendengarkan Ctrl + K / Cmd + K
const handleGlobalShortcut = (e: KeyboardEvent) => {
  // Mengecek apakah tombol Ctrl atau Cmd (metaKey) ditekan bersamaan dengan 'k'
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault() // Mencegah browser membuka omnibox bawaannya
    searchComponentRef.value?.focus() // Panggil fungsi fokus
  }
}

watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchSuggestion(searchQuery.value)
  }, 300)
})

const handleSearchSubmit = () => {
  executeNavigation(searchQuery.value, undefined)
}

const handleSuggestionSelect = (item: Suggestion) => {
  searchQuery.value = item.title // Update teks di bar
  executeNavigation(item.title, item.url)
}

const executeNavigation = (query: string, url?: string) => {
  if (!query.trim() && !url) return

  if (isLikelyUrl(query)) {
    const url = query.startsWith('http') ? query : `https://${query}`

    window.location.href = url
    return
  }

  if (typeof chrome !== 'undefined' && chrome.tabs) {
    if (url) {
      chrome.tabs.update({ url })
    } else {
      if (chrome.search) {
        chrome.search.query({ text: query, disposition: 'CURRENT_TAB' })
      } else {
        chrome.tabs.update({ url: `https://www.google.com/search?q=${encodeURIComponent(query)}` })
      }
    }
  } else {
    window.location.href = url || `https://www.google.com/search?q=${encodeURIComponent(query)}`
  }
}

const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString('en-EN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  date.value = now.toLocaleDateString('en-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isLikelyUrl(text: string) {
  try {
    new URL(text)
    return true
  } catch {
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(text)
  }
}

onMounted(() => {
  updateClock()
  timerInterval = setInterval(updateClock, 1000)

  window.addEventListener('keydown', handleGlobalShortcut)
  nextTick(() => {
    searchComponentRef.value?.focus()
  })
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearTimeout(debounceTimer)

  window.removeEventListener('keydown', handleGlobalShortcut)
})
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <!-- Waktu & Tanggal -->
    <div class="mb-8 text-center">
      <h1 class="text-7xl font-light tracking-tighter drop-shadow-sm">
        {{ time }}
      </h1>
      <p class="mt-2 text-lg font-medium drop-shadow-sm">
        {{ date }}
      </p>
    </div>

    <!-- Search Bar Besar -->
    <div class="w-full max-w-2xl px-4">
      <SearchInput
        v-model="searchQuery"
        :suggestions="suggestion"
        @select="handleSuggestionSelect"
        placeholder="Search the web or type a URL..."
        class="text-base shadow-md"
        @submit="handleSearchSubmit" />
    </div>
  </div>
</template>
