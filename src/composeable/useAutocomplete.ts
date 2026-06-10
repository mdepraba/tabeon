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
      const tasks = [getHistory(query), getBookmark(query), getSearchSuggestions(query)]
      const [historyRes, bookmarksRes, searchRes] = await Promise.all(tasks)
      const combined = [...historyRes, ...bookmarksRes, ...searchRes]
      suggestion.value = combined.slice(0, 10)
    } catch (error) {
      console.error('Autocomplete error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const getGoogleSuggestions = async (q: string): Promise<Suggestion[]> => {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`
    )

    if (!res.ok) {
      throw new Error('Google Suggest failed')
    }

    const data = await res.json()

    return (data[1] ?? []).slice(0, 5).map(
      (item: string, index: number): Suggestion => ({
        id: `google-${index}`,
        type: 'search',
        title: item,
      })
    )
  }

  const getDuckDuckGoSuggestions = async (q: string): Promise<Suggestion[]> => {
    const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}`)

    if (!res.ok) {
      throw new Error('DuckDuckGo Suggest failed')
    }

    const data = await res.json()

    return data.slice(0, 5).map(
      (item: { phrase: string }, index: number): Suggestion => ({
        id: `ddg-${index}`,
        type: 'search',
        title: item.phrase,
      })
    )
  }

  const getSearchSuggestions = async (q: string): Promise<Suggestion[]> => {
    try {
      return await getGoogleSuggestions(q)
    } catch (err) {
      console.warn('Google Suggest failed, fallback to DuckDuckGo', err)

      try {
        return await getDuckDuckGoSuggestions(q)
      } catch (err2) {
        console.error('DuckDuckGo Suggest failed', err2)
        return []
      }
    }
  }

  const getHistory = async (q: string): Promise<Suggestion[]> => {
    if (typeof chrome !== 'undefined' && chrome.history) {
      const results = await chrome.history.search({ text: q, maxResults: 4 })
      return results.map(item => ({
        id: `history-${item.id}`,
        type: 'history',
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
        type: 'bookmark',
        title: item.title || item.url || q,
        url: item.url,
      }))
    }
    return []
  }

  return {
    suggestion,
    isLoading,
    fetchSuggestion,
  }
}
