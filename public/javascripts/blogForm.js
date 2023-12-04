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

function blogFormMetadataEventListeners() {
    const metadata = document.querySelector(
        '.blog-form__metadata'
    )

    if (!metadata) {
        return
    }

    const titlePreview = document.querySelector(
        '.blog-preview__title'
    )
    const titleInput = document.getElementById('title')
    titlePreview.textContent = titleInput.value

    titleInput.addEventListener('change', () => {
        titlePreview.textContent = titleInput.value
    })

    const thumbnailPreview = document.querySelector(
        '.blog-preview__thumbnail > img'
    )
    const thumbnailInput = document.getElementById('thumbnail')
    thumbnailPreview.src = thumbnailInput.value

    thumbnailInput.addEventListener('change', () => {
        thumbnailPreview.src = thumbnailInput.value
    })

}

export {
    blogFormTabEventListeners,
    blogFormMetadataEventListeners
}