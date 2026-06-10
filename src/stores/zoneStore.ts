import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useZoneStore = defineStore('zone', () => {
  // Inisialisasi state murni kosong, tidak ada data bawaan
  const zones = ref<{ id: string; name: string }[]>([])

  // Fungsi untuk menambahkan zone baru
  const addZone = (name: string) => {
    if (!name.trim()) return
    zones.value.push({
      id: crypto.randomUUID(),
      name: name.trim()
    })
  }

  // Fungsi untuk menghapus zone
  const removeZone = (id: string) => {
    zones.value = zones.value.filter(z => z.id !== id)
  }

  return {
    zones,
    addZone,
    removeZone
  }
})