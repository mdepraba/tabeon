chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_SUGGESTIONS') {
    const query = message.query as string

    fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        const suggestions = (data[1] as string[]).slice(0, 5).map((item, i) => ({
          id: `search-${i}`,
          type: 'search' as const,
          title: item,
        }))
        sendResponse({ success: true, data: suggestions })
      })
      .catch(err => {
        console.error('Background fetch error:', err)
        sendResponse({ success: false, data: [] })
      })

    return true // PENTING: keep message channel open untuk async
  }
})
