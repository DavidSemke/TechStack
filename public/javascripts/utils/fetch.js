async function formFetch(
    href, method, form, followResponse=false, onResponseJson=null
) {
    const res = await fetch(
        href, 
        {
            method,
            body: new FormData(form)
        }
    )
    
    if (!res.ok) {
        throw new Error(`HTTP error - Status: ${res.status}`)
    }

    if (followResponse) {
        if (window.location.href === res.url) {
            window.location.reload()
        }
        else {
            window.location.href = res.url
        }
    }

    if (!onResponseJson) {
        return
    }

    const data = await res.json()
    onResponseJson(data)
}

export {
    formFetch
}