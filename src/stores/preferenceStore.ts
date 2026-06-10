import { defineStore } from 'pinia'
import { ref, computed, watchEffect, watch } from 'vue'
import { saveImageToDB, getImageFromDB, deleteImageFromDB } from '../components/utils/db'

interface TabeonPrefs {
  startupView?: 'minimal' | 'zones'
  themeMode?: 'light' | 'dark'
  isTransparent?: boolean
  isSidebarOpen?: boolean
  activeImageIndex?: number | null
}

export const usePreferenceStore = defineStore('preference', () => {
  const startupView = ref<'minimal' | 'zones'>('minimal')
  const themeMode = ref<'light' | 'dark'>('dark')
  const isTransparent = ref<boolean>(true)
  
  const savedImages = ref<(string | null)[]>([null, null, null])
  const activeImageIndex = ref<number | null>(0)

  const activeImage = computed(() => 
    activeImageIndex.value !== null ? savedImages.value[activeImageIndex.value] : null
  )

  const clockWithSeconds = ref<boolean>(false) 

  const isSidebarOpen = ref(true)
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const isSettingOpen = ref(false)
  const toggleSetting = () => isSettingOpen.value = !isSettingOpen.value

  const uploadImageToSlot = async (index: number, file: File) => {
    if (index >= 0 && index < 3) {
      // 1. Simpan Blob asli ke IndexedDB
      await saveImageToDB(`bg-slot-${index}`, file)
      
      // 2. Bersihkan URL lama dari memori (mencegah memory leak)
      if (savedImages.value[index]) {
        URL.revokeObjectURL(savedImages.value[index]!)
      }
      
      // 3. Buat URL baru dan jadikan aktif
      savedImages.value[index] = URL.createObjectURL(file)
      activeImageIndex.value = index
    }
  }

  const removeImageFromSlot = async (index: number) => {
    // 1. Hapus dari IndexedDB
    await deleteImageFromDB(`bg-slot-${index}`)
    
    // 2. Bersihkan URL dari memori
    if (savedImages.value[index]) {
      URL.revokeObjectURL(savedImages.value[index]!)
    }
    
    savedImages.value[index] = null
    if (activeImageIndex.value === index) activeImageIndex.value = null
  }

  // LOAD DATA SAAT STARTUP (PERHATIKAN BAGIAN GAMBAR)
  const loadPreferences = async () => {
    // A. Muat Pengaturan Teks dari Chrome Storage / Local Storage
    let prefs: TabeonPrefs = {}
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const data = await chrome.storage.local.get(['tabeon_prefs'])
      if (data.tabeon_prefs) prefs = data.tabeon_prefs as TabeonPrefs
    } else {
      const localData = localStorage.getItem('tabeon_prefs')
      if (localData) prefs = JSON.parse(localData) as TabeonPrefs
    }

    if (prefs.startupView) startupView.value = prefs.startupView
    if (prefs.themeMode) themeMode.value = prefs.themeMode
    if (prefs.isTransparent !== undefined) isTransparent.value = prefs.isTransparent
    if (prefs.isSidebarOpen !== undefined) isSidebarOpen.value = prefs.isSidebarOpen
    if (prefs.activeImageIndex !== undefined) activeImageIndex.value = prefs.activeImageIndex

    // B. Muat Gambar dari IndexedDB
    for (let i = 0; i < 3; i++) {
      const blob = await getImageFromDB(`bg-slot-${i}`)
      if (blob) {
        // Buat Object URL untuk blob yang ditemukan
        savedImages.value[i] = URL.createObjectURL(blob)
      }
    }
  }

  // ==========================================================================
  // BARU: OTOMATIS SIMPAN SETIAP ADA PERUBAHAN STATE
  // ==========================================================================
  watch([startupView, themeMode, isTransparent, isSidebarOpen, activeImageIndex], async () => {
    const payload = {
      startupView: startupView.value,
      themeMode: themeMode.value,
      isTransparent: isTransparent.value,
      isSidebarOpen: isSidebarOpen.value,
      activeImageIndex: activeImageIndex.value
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ tabeon_prefs: payload })
    } else {
      localStorage.setItem('tabeon_prefs', JSON.stringify(payload))
    }
  }, { deep: true })

  watchEffect(() => {
    const htmlEl = document.documentElement
    
    // Toggle Dark Mode
    if (themeMode.value === 'dark') {
      htmlEl.classList.add('dark')
    } else {
      htmlEl.classList.remove('dark')
    }

    // Toggle Transparent
    if (isTransparent.value) {
      htmlEl.classList.add('transparent')
    } else {
      htmlEl.classList.remove('transparent')
    }

    // if (clockWithSeconds.value) {

    // }
  })

  return {
    startupView,
    themeMode,
    isTransparent,
    savedImages,
    activeImageIndex,
    activeImage,
    isSettingOpen,
    clockWithSeconds,
    isSidebarOpen,
    toggleSidebar,
    toggleSetting,
    uploadImageToSlot,
    removeImageFromSlot,
    loadPreferences
  }
})