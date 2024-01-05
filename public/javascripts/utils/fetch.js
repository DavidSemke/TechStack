function formFetch(href, method, form) {
    fetch(href, {
        method,
        body: new FormData(form)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }

            console.log(res.url)

            if (res.url) {
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