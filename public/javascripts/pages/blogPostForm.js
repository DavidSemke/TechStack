import { formFetch } from '../utils/fetch.js'
import { initializeTinyMCE } from '../utils/tinyMCEConfig.js'
import { updateErrorContainer, removeErrorContainer } from '../utils/formError.js'

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
    metadataTab.classList.add('-bold')

    const contentTab = document.querySelector(
        '.blog-post-form-page__content-tab'
    )

    metadataTab.addEventListener('click', () => {
        metadataTab.classList.add('-bold')
        contentTab.classList.remove('-bold')

        content.classList.add('-gone')
        metadata.classList.remove('-gone')
        
    })

    contentTab.addEventListener('click', () => {
        contentTab.classList.add('-bold')
        metadataTab.classList.remove('-bold')
        
        metadata.classList.add('-gone')
        content.classList.remove('-gone')
        
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
        const preMethodInputs = blogPostForm.querySelectorAll(
            '.blog-post-form__pre-method'
        )

        for (const preMethod of preMethodInputs) {
            blogPostForm.removeChild(preMethod)
        }

        const input = document.createElement('input')
        input.classList.add('blog-post-form__pre-method')
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
    
    blogPostForm.addEventListener('submit', async (event) => {
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

        let errorsOccurred = false
        const inputData = {
            'title': {
                errors: [],
                formCompType: 'form-input'
            },
            'thumbnail': {
                errors: [],
                formCompType: 'form-input'
            },
            'keywords': {
                errors: [],
                formCompType: 'form-textarea'
            },
            'content': {
                errors: [],
                formCompType: 'form-textarea'
            },
            'word-count': {
                errors: [],
                formCompType: null
            }
        }
        
        await formFetch(
            href, 
            method, 
            blogPostForm,
            (data) => {
                errorsOccurred = true

                for (const error of data.errors) {
                    inputData[error.path].errors.push(error)
                }

                inputData.content.errors.push(
                    ...inputData['word-count'].errors
                )
                delete inputData['word-count']

                for (const [k, v] of Object.entries(inputData)) {
                    updateErrorContainer(v.formCompType, k, v.errors)
                }
            }
        )

        if (!errorsOccurred) {
            for (const [k, v] of Object.entries(inputData)) {
                removeErrorContainer(v.formCompType, k)
            }
        }
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

    // TinyMCE init must occur before the form submit listener is set 
    // This allows the editor's submit listener to trigger first
    initializeTinyMCE('.tinymce-app')
    blogPostFormSizing()
    blogPostFormTabListeners()
    blogPostFormMetadataListeners()
    blogPostFormSubmitListeners()
    
}

export {
    blogPostFormSetup
}