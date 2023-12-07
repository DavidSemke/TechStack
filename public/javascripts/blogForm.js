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
}

function blogFormSizing() {
    const leftBody = document.querySelector('.blog-form-page__left .blog-form-page__body')
    const rightBody = document.querySelector('.blog-form-page__right .blog-form-page__body')
    rightBody.style.maxHeight = leftBody.offsetHeight + 'px'
    rightBody.style.maxWidth = leftBody.offsetWidth + 'px'
}

// Function blogFormSizing must be called before function 
// blogFormMetadataEventListeners
// Therefore, this function providing the correct ordering is exported 
function blogFormSetup() {
    blogFormSizing()
    blogFormTabEventListeners()
    blogFormMetadataEventListeners()
}

export {
    blogFormSetup
}