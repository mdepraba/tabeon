<script setup lang="ts">
import { ref, computed } from 'vue'
import { Settings, User, LayoutGrid, Plus } from 'lucide-vue-next'
import SearchInput from '../Search.vue'
import { useZoneStore } from '../../stores/zoneStore'
import { usePreferenceStore } from '../../stores/preferenceStore'

const prefStore = usePreferenceStore()

const zoneStore = useZoneStore()
const searchQuery = ref('')

// Filter zones berdasarkan input pencarian
const filteredZones = computed(() => {
  return zoneStore.zones.filter(zone => zone.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Fungsi sederhana untuk memanggil prompt pembuatan Zone baru
// Nanti ini bisa kamu ganti menggunakan Modal/Dialog komponen Shadcn
const handleAddZone = () => {
  const zoneName = prompt('Masukkan nama Zone baru:')
  if (zoneName) {
    zoneStore.addZone(zoneName)
  }
}
</script>

<template>
  <aside class="flex h-screen flex-col border-theme-border bg-theme-bg">
    <!-- 1. Header: Nama Akun & Toggle Sidebar -->
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
          <User class="h-4 w-4" />
        </div>
        <span class="text-sm font-semibold text-theme-text">User</span>
      </div>
    </div>

    <!-- 2. Search -->
    <div class="px-3 pb-2">
      <SearchInput v-model="searchQuery" placeholder="Search zones..." />
    </div>

    <!-- 3. Zones List (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div class="mb-1 flex items-center justify-between px-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500"> Zones </span>
        <!-- Tombol Tambah Zone -->
        <button
          @click="handleAddZone"
          class="rounded-sm p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          title="Create New Zone">
          <Plus class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Tampilan jika Zones masih kosong -->
      <div v-if="zoneStore.zones.length === 0" class="px-2 py-4 text-center text-sm text-slate-500">
        Belum ada zone.<br />Klik '+' untuk membuat baru.
      </div>

      <!-- Tampilan jika tidak ada hasil pencarian -->
      <div v-else-if="filteredZones.length === 0" class="px-2 py-4 text-center text-sm text-slate-500">
        Zone tidak ditemukan.
      </div>

      <!-- Daftar Zones -->
      <nav v-else class="space-y-0.5">
        <button
          v-for="zone in filteredZones"
          :key="zone.id"
          class="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900">
          <LayoutGrid class="h-4 w-4 text-slate-400 group-hover:text-slate-500" />
          <span class="truncate">{{ zone.name }}</span>
        </button>
      </nav>
    </div>

    <!-- 4. Preference / Setting -->
    <div class="border-t border-theme-border p-3">
      <button
        @click="prefStore.toggleSetting"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-theme-text transition-colors hover:bg-theme-highlight hover:text-theme-text-hover">
        <Settings class="h-4 w-4 text-theme-text" />
        <span>Preferences</span>
      </button>
    </div>
  </aside>
</template>
