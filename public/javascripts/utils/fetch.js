async function formFetch(href, method, form, onResponseJson = null) {
  const res = await fetch(href, {
    method,
    body: new FormData(form),
  })

  // Input error statuses should be handled here
  // Only input error status currently is 400
  if (!res.ok && res.status !== 400) {
    throw new Error(`HTTP error - Status 500`)
  }

  if (res.redirected) {
    if (window.location.href === res.url) {
      window.location.reload()
    } else {
      window.location.href = res.url
    }
  }

  const contentType = res.headers.get("content-type")

  if (
    !contentType ||
    !contentType.includes("application/json") ||
    !onResponseJson
  ) {
    return
  }

  const data = await res.json()
  onResponseJson(data)
}

export { formFetch }
