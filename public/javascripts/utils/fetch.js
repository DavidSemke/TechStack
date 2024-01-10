function formFetch(href, method, form, onResponse=null) {
    fetch(href, {
        method,
        body: new FormData(form)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }
            
            if (onResponse) {
                onResponse(res)
            }
            else if (res.url && res.url !== window.location.href) {
                window.location.href = res.url
            }
        })
        .catch(error => {
            throw error
        })
}

export {
    formFetch
}