function formFetch(href, method, form, onResponseJson=null) {
    fetch(href, {
        method,
        body: new FormData(form)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }
            
            if (res.url && res.url !== window.location.href) {
                window.location.href = res.url
            }
        })
        .then(data => {
            if (onResponseJson) {
                onResponseJson(data)
            }
        })
        .catch(error => {
            throw error
        })
}

export {
    formFetch
}