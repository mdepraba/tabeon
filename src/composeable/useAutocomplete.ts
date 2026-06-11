import { ref } from 'vue'

export interface Suggestion {
  id: string
  type: 'search' | 'history' | 'bookmark'
  title: string
  url?: string
}

export const useAutocomplete = () => {
  const suggestion = ref<Suggestion[]>([])
  const isLoading = ref<boolean>(false)

  const fetchSuggestion = async (query: string) => {
    if (!query.trim()) {
      suggestion.value = []
      return
    }

    isLoading.value = true

    try {
      const tasks = [getHistory(query), getBookmark(query), getGoogleSuggestions(query)]

      const [historyRes, bookmarksRes, googleRes] = await Promise.all(tasks)
      const combined = [...historyRes, ...bookmarksRes, ...googleRes]
      suggestion.value = combined.slice(0, 10)
    } catch (error) {
      console.error('Autocomplete error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ✅ Fetch via background script — bypass CORS
  const getGoogleSuggestions = (q: string): Promise<Suggestion[]> => {
    return new Promise(resolve => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        resolve([])
        return
      }

      chrome.runtime.sendMessage(
        { type: 'FETCH_SUGGESTIONS', query: q },
        (response: { success: boolean; data: Suggestion[] }) => {
          if (chrome.runtime.lastError) {
            console.warn('Runtime error:', chrome.runtime.lastError.message)
            resolve([])
            return
          }
          resolve(response?.success ? response.data : [])
        }
      )
    })
  }

  const getHistory = async (q: string): Promise<Suggestion[]> => {
    if (typeof chrome !== 'undefined' && chrome.history) {
      const results = await chrome.history.search({ text: q, maxResults: 4 })
      return results.map(item => ({
        id: `history-${item.id}`,
        type: 'history' as const,
        title: item.title || item.url || q,
        url: item.url,
      }))
    }
    return []
  }

  const getBookmark = async (q: string): Promise<Suggestion[]> => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      const results = await chrome.bookmarks.search(q)
      return results.slice(0, 3).map(item => ({
        id: `bookmark-${item.id}`,
        type: 'bookmark' as const,
        title: item.title || item.url || q,
        url: item.url,
      }))
    }
    return []
  }

  return { suggestion, isLoading, fetchSuggestion }
}
