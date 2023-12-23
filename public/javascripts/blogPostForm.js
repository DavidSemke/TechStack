function blogPostFormTabListeners() {
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
        if (metadata.classList.contains('-gone')) {
            content.classList.add('-gone')
            metadata.classList.remove('-gone')
        }
    })

    const contentTab = document.querySelector(
        '.blog-post-form-page__content-tab'
    )

    contentTab.addEventListener('click', () => {
        if (content.classList.contains('-gone')) {
            metadata.classList.add('-gone')
            content.classList.remove('-gone')
        }
    })
}

function blogPostFormMetadataListeners() {
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

    if (!blogPostFormPage) {
        return
    }

    blogPostFormSizing()
    blogPostFormTabListeners()
    blogPostFormMetadataListeners()
}

export {
    blogPostFormSetup
}