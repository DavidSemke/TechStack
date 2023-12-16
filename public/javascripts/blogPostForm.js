function blogPostFormTabEventListeners() {
    const metadata = document.querySelector(
        '.blog-post-form__metadata'
    )
    const content = document.querySelector(
        '.blog-post-form__content'
    )

    const metadataTab = document.querySelector(
        '.blog-post-form-page__metadata-tab'
    )

    metadataTab.addEventListener('click', () => {
        if (metadata.classList.contains('-hidden')) {
            content.classList.add('-hidden')
            metadata.classList.remove('-hidden')
        }
    })

    const contentTab = document.querySelector(
        '.blog-post-form-page__content-tab'
    )

    contentTab.addEventListener('click', () => {
        if (content.classList.contains('-hidden')) {
            metadata.classList.add('-hidden')
            content.classList.remove('-hidden')
        }
    })
}

function blogPostFormMetadataEventListeners() {
    const titlePreview = document.querySelector(
        '.blog-post-preview__title'
    )
    const titleInput = document.getElementById('title')
    titlePreview.textContent = titleInput.value

    titleInput.addEventListener('change', () => {
        titlePreview.textContent = titleInput.value
    })
}

function blogPostFormSizing() {
    const leftBody = document.querySelector(
        '.blog-post-form-page__left .blog-post-form-page__body'
    )
    const rightBody = document.querySelector(
        '.blog-post-form-page__right .blog-post-form-page__body'
    )
    rightBody.style.maxHeight = leftBody.offsetHeight + 'px'
    rightBody.style.maxWidth = leftBody.offsetWidth + 'px'
}

// Function blogPostFormSizing must be called before function 
// blogPostFormMetadataEventListeners
// Therefore, this function providing the correct ordering is exported 
function blogPostFormSetup() {
    const blogPostFormPage = document.querySelector(
        '.blog-post-form-page'
    )

    // check one tab to make sure page is correct
    if (!blogPostFormPage) {
        return
    }

    blogPostFormSizing()
    blogPostFormTabEventListeners()
    blogPostFormMetadataEventListeners()
}

export {
    blogPostFormSetup
}