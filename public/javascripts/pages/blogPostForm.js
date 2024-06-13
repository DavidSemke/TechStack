import { formFetch } from '../utils/fetch.js'
import { initializeTinyMCE } from '../tinymce/tinyMCEConfig.js'
import { updateErrorContainer, removeErrorContainer } from '../utils/formError.js'

// On smaller screen sizes, draft and preview windows do not fit
// Buttons are used to navigate from left (draft) to right (preview)
function blogPostFormLeftRightListeners() {
    const page = document.querySelector('.blog-post-form-page')

    const previewButton = document.querySelector(
        '.blog-post-form-page__preview-button'
    )
    previewButton.addEventListener('click', () => {
        page.classList.add('-preview-view')
        page.classList.remove('-draft-view')
    })

    const draftButton = document.querySelector(
        '.blog-post-form-page__draft-button'
    )
    draftButton.addEventListener('click', () => {
        page.classList.add('-draft-view')
        page.classList.remove('-preview-view')
    })

    // Undo changes caused by using the draft/preview button when the screen
    // size surpasses the max-width in which it is available
    let mobileBreakPt = getComputedStyle(
        document.documentElement
    ).getPropertyValue('--bp1')
    mobileBreakPt = parseInt(mobileBreakPt, 10) + 1 + 'px'
    
    const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakPt})`)
    mediaQuery.addEventListener('change', () => {
        page.classList.remove('-draft-view')
        page.classList.remove('-preview-view')
    })
}

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
        '.blog-post-form__discard-button'
    )
    discardButton.addEventListener('click', () => {
        addPreMethod('discard')
    })

    const saveButton = document.querySelector(
        '.blog-post-form__save-button'
    )
    saveButton.addEventListener('click', () => {
        addPreMethod('save')
    })

    const publishButton = document.querySelector(
        '.blog-post-form__publish-button'
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

    // In this case, enter key submission is harmful - prevent it
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
        const metadataTab = document.querySelector(
            '.blog-post-form-page__metadata-tab'
        )
        const contentTab = document.querySelector(
            '.blog-post-form-page__content-tab'
        )
        
        await formFetch(
            href, 
            method, 
            blogPostForm,
            (data) => {
                errorsOccurred = true
                let metadataErrors = false
                let contentErrors = false
                const metadataPaths = ['title', 'thumbnail', 'keywords']
                const contentPaths = ['content', 'word-count']

                for (const error of data.errors) {
                    inputData[error.path].errors.push(error)

                    if (
                        !metadataErrors 
                        && metadataPaths.includes(error.path)
                    ) {
                        metadataErrors = true
                    }
                    else if (
                        !contentErrors 
                        && contentPaths.includes(error.path)
                    ) {
                        contentErrors = true
                    }
                }

                if (metadataErrors) {
                    metadataTab.classList.add('-error')
                }
                else {
                    metadataTab.classList.remove('-error')
                }

                if (contentErrors) {
                    contentTab.classList.add('-error')
                }
                else {
                    contentTab.classList.remove('-error')
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

            metadataTab.classList.remove('-error')
            contentTab.classList.remove('-error')
        }
    })
}

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
    blogPostFormLeftRightListeners()
    blogPostFormTabListeners()
    blogPostFormMetadataListeners()
    blogPostFormSubmitListeners()
    
}

export {
    blogPostFormSetup
}