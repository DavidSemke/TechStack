import { formFetch } from '../utils/fetch.js'
import { initializeTinyMCE } from '../utils/tinyMCEConfig.js'

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
        '.blog-post-fragment__title'
    )
    const titleInput = document.getElementById('title')
    titlePreview.textContent = titleInput.value

    titleInput.addEventListener('change', () => {
        titlePreview.textContent = titleInput.value
    })
}

function blogPostFormSubmitListeners() {
    const blogPostForm = document.querySelector(
        '.blog-post-form'
    )

    const discardButton = document.querySelector(
        '.navbar__discard-button'
    )
    discardButton.addEventListener('click', () => {
        addPreMethod('discard')
    })

    const saveButton = document.querySelector(
        '.navbar__save-button'
    )
    saveButton.addEventListener('click', () => {
        addPreMethod('save')
    })

    const publishButton = document.querySelector(
        '.navbar__publish-button'
    )
    publishButton.addEventListener('click', () => {
        addPreMethod('publish')
    })

    function addPreMethod(preMethod) {
        const preMethodInput = blogPostForm.querySelector(
            '.blog-post-form__pre-method'
        )

        if (preMethodInput) {
            blogPostForm.removeChild(preMethodInput)
        }

        const input = document.createElement('input')
        input.class = 'blog-post-form__pre-method'
        input.name = 'pre-method'
        input.type = 'hidden'
        input.value = preMethod
        blogPostForm.append(input)
    }

    // in this case, enter key submission is harmful - prevent it
    blogPostForm.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
        }
    })
    
    blogPostForm.addEventListener('submit', (event) => {
        event.preventDefault()
        
        let method = 'PUT'
        let href = window.location.href

        // blogPost param is empty object if posting, else putting
        if (!Object.keys(backendData.blogPost).length) {
            method = 'POST'
            const hrefWords = href.split('/')
            hrefWords.pop() // remove the ending /new-blog-post
            href = hrefWords.join('/')
        }

        formFetch(href, method, blogPostForm, true)
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
    blogPostFormSubmitListeners()
    initializeTinyMCE('#tinymce-app')
}

export {
    blogPostFormSetup
}