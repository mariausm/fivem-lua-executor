const rawHost = window.location.host ?? ''
export const RESOURCE = rawHost.startsWith('cfx-nui-')
  ? rawHost.slice(8)
  : rawHost.replace(/ /g, '%20') || 'lua_executor'

export function nuiFetch(endpoint: string, data: unknown = {}) {
  return fetch(`https://${RESOURCE}/${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
}

export function sendClose() {
  let attempts = 0
  const token = Date.now()

  function tryFetch() {
    attempts++
    nuiFetch('close').catch(() => {
      if (attempts < 4) setTimeout(tryFetch, 200)
    })
  }

  tryFetch()
  return token
}
