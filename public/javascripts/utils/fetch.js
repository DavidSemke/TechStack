function formFetch(
    href, method, form, followResponse=false, onResponseJson=null
) {
    fetch(href, {
        method,
        body: new FormData(form)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }
            
            if (followResponse) {
                window.location.href = res.url
            }

            return res.json()
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