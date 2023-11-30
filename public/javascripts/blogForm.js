function blogFormTabEventListeners() {
    const metadataTab = document.querySelector(
        '.blog-form-metadata-tab'
    )

    // check one tab to make sure page is correct
    if (!metadataTab) {
        return
    }

    const metadata = document.querySelector(
        '.blog-form__metadata'
    )
    const content = document.querySelector(
        '.blog-form__content'
    )

    metadataTab.addEventListener('click', () => {
        if (metadata.classList.contains('-hidden')) {
            content.classList.add('-hidden')
            metadata.classList.remove('-hidden')
        }
    })

    const contentTab = document.querySelector(
        '.blog-form-content-tab'
    )

    contentTab.addEventListener('click', () => {
        if (content.classList.contains('-hidden')) {
            metadata.classList.add('-hidden')
            content.classList.remove('-hidden')
        }
    })
}

export {
    blogFormTabEventListeners
}