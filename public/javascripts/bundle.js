/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./public/javascripts/layouts/toolbars.js":
/*!************************************************!*\
  !*** ./public/javascripts/layouts/toolbars.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   navbarListeners: () => (/* binding */ navbarListeners),
/* harmony export */   sidebarListeners: () => (/* binding */ sidebarListeners)
/* harmony export */ });
function sidebarListeners(sidebarSelector, sidebarButtonSelector) {
    const sidebar = document.querySelector(sidebarSelector)

    if (!sidebar) {
        return
    }

    const sidebarButton = document.querySelector(sidebarButtonSelector)

    sidebarButton.addEventListener('click', () => {
        
        if (sidebar.classList.contains('-open')) {
            sidebar.classList.remove('-open')
            sidebar.classList.add('-closed')
        }
        else if (sidebar.classList.contains('-closed')) {
            sidebar.classList.remove('-closed')
            sidebar.classList.add('-open')
        }
    })
}

function navbarListeners() {
    const navbar = document.querySelector('.navbar')

    if (!navbar) {
        return
    }

    const searchbarInput = navbar.querySelector('.searchbar__input')

    if (!searchbarInput) {
        return
    }

    const navbarDropdownContainer = document.querySelector(
        '.navbar-dropdown-container'
    )
    searchbarInput.addEventListener('input', () => {
        const encodedWords = searchbarInput
            .value
            .split(' ')
            .filter(word => word)
            .map(word => encodeURIComponent(word))

        if (!encodedWords.length) {
            navbarDropdownContainer.innerHTML = ''
            return
        }
        
        const href = '/blog-posts?keywords=' + encodedWords.join(',')

        fetch(
            href, 
            { method: 'GET' }
        )
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error - Status: ${res.status}`)
                }
    
                return res.json()
            })
            .then(data => {
                navbarDropdownContainer.innerHTML = data.renderedHTML
            })
            .catch(error => {
                throw error
            })
    })
    searchbarInput.addEventListener('blur', (event) => {
        const newFocus = event.relatedTarget
        
        // check to see if link has been clicked
        if (!newFocus || !navbarDropdownContainer.contains(newFocus)) {
            navbarDropdownContainer.classList.add('-gone')
        }
    })
    searchbarInput.addEventListener('focus', () => {
        navbarDropdownContainer.classList.remove('-gone')
    })
}



/***/ }),

/***/ "./public/javascripts/pages/blogPost.js":
/*!**********************************************!*\
  !*** ./public/javascripts/pages/blogPost.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blogPostSetup: () => (/* binding */ blogPostSetup)
/* harmony export */ });
/* harmony import */ var _utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/fetch.js */ "./public/javascripts/utils/fetch.js");
/* harmony import */ var _utils_formError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/formError.js */ "./public/javascripts/utils/formError.js");
/* harmony import */ var _utils_queue_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/queue.js */ "./public/javascripts/utils/queue.js");




// used to queue reactions
const reactionQueue = (0,_utils_queue_js__WEBPACK_IMPORTED_MODULE_2__.PromiseQueue)()

function blogPostReactionFormListeners() {
    const reaction = backendData.blogPost.reaction
    let reactionId = reaction ? reaction._id : null
    const reactionType = reaction ? reaction.reaction_type : null
    
    const likeButtons = document.querySelectorAll(
        '.blog-post__like-button'
    )
    let liked = false

    if (reactionType === 'Like') {
        liked = true

        for (const button of likeButtons) {
            button.classList.add('-colorful')
        }
    }

    const dislikeButtons = document.querySelectorAll(
        '.blog-post__dislike-button'
    )
    let disliked = false

    if (reactionType === 'Dislike') {
        disliked = true

        for (const button of dislikeButtons) {
            button.classList.add('-colorful')
        }
    }

    let responsiveLike = liked
    let responsiveDislike = disliked
    const likeReactionForms = document.querySelectorAll(
        '.blog-post__like-reaction-form'
    )
    
    for (const form of likeReactionForms) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault()

            updateReactionButtons(
                responsiveDislike, 
                responsiveLike, 
                likeButtons, 
                dislikeButtons
            )
            responsiveDislike = false
            responsiveLike = !responsiveLike

            reactionQueue.enqueue(async () => {
                await fetchReaction(
                    form, 
                    disliked, 
                    liked, 
                    reactionId,
                    (data) => {
                        reactionId = data.reactionId
                    }
                )
                disliked = false
                liked = !liked
            })
            

            
        })
    }
    const dislikeReactionForms = document.querySelectorAll(
        '.blog-post__dislike-reaction-form'
    )
    
    for (const form of dislikeReactionForms) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault()

            updateReactionButtons(
                responsiveLike, 
                responsiveDislike, 
                dislikeButtons, 
                likeButtons
            )
            responsiveLike = false
            responsiveDislike = !responsiveDislike

            reactionQueue.enqueue(async () => {
                await fetchReaction(
                    form, 
                    liked, 
                    disliked, 
                    reactionId,
                    (data) => {
                        reactionId = data.reactionId
                    }
                )
                liked = false
                disliked = !disliked
            })                
        })
    }
}

function allCommentsReactionFormListeners() {
    const commentCards = document.querySelectorAll(
        '.comment-card'
    )
    // note that blogPost comments are non-replies only
    // replies are available from the comment replied to
    const comments = backendData.blogPost.comments

    for (let i=0, j=0, k=0; i<commentCards.length; i++) {
        const commentCard = commentCards[i]
        let commentData = comments[j]
        const replies = commentData.replies

        if (!replies.length) {
            j++
        }
        else if (k > 0) {
            commentData = replies[k-1]
            k++
            
            if (k === replies.length + 1) {
                k = 0
                j++
            }
        }
        else {
            k++
        }

        commentReactionFormListeners(commentCard, commentData)
    }
}

function commentReactionFormListeners(commentCard, commentData) {
    if (commentData.replies && commentData.replies.length) {
        const viewRepliesButton = commentCard.querySelector(
            '.comment-card__view-replies-button'
        )
        viewRepliesButton.addEventListener('click', () => {
            const sibling = commentCard.nextSibling
            let replyContainer = sibling

            if (sibling.classList.contains(
                'blog-post-page__reply-create-form'
            )) {
                replyContainer = sibling.nextSibling
            }

            if (replyContainer.classList.contains('-gone')) {
                replyContainer.classList.remove('-gone')
            }
            else {
                replyContainer.classList.add('-gone')
            }
        })
    }

    const replyButton = commentCard.querySelector(
        '.comment-card__reply-button'
    )

    if (replyButton) {
        replyButton.addEventListener('click', () => {
            // Remove reply-create-form, if it exists
            // The reply-create-form is created when clicking 
            // any comment reply button
            const replyCreateForm = document.querySelector(
                '.blog-post-page__reply-create-form'
            )

            if (replyCreateForm) {
                if (replyCreateForm.previousSibling !== commentCard) {
                    createCommentCreateForm(commentCard, commentData)
                }

                replyCreateForm.parentElement.removeChild(replyCreateForm)
            }
            else {
                createCommentCreateForm(commentCard, commentData)
            }
        })
    }

    const likeButton = commentCard.querySelector(
        '.comment-card__like-button'
    )
    const dislikeButton = commentCard.querySelector(
        '.comment-card__dislike-button'
    )

    const reaction = commentData.reaction
    let reactionId = reaction ? reaction._id : null
    const reactionType = reaction ? reaction.reaction_type : null
    let liked = false
    let disliked = false

    if (reactionType === 'Like') {
        liked = true
        likeButton.classList.add('-colorful')
    }
    else if (reactionType === 'Dislike') {
        disliked = true
        dislikeButton.classList.add('-colorful')
    }

    let responsiveLike = liked
    let responsiveDislike = disliked
    const likeReactionForm = commentCard.querySelector(
        '.comment-card__like-reaction-form'
    )
    likeReactionForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        updateReactionButtons(
            responsiveDislike, 
            responsiveLike, 
            [likeButton], 
            [dislikeButton]
        )
        responsiveDislike = false
        responsiveLike = !responsiveLike
        
        reactionQueue.enqueue(async () => {
            await fetchReaction(
                likeReactionForm, 
                disliked, 
                liked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            disliked = false
            liked = !liked
        })

            
    })

    const dislikeReactionForm = commentCard.querySelector(
        '.comment-card__dislike-reaction-form'
    )
    dislikeReactionForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        updateReactionButtons(
            responsiveLike, 
            responsiveDislike, 
            [dislikeButton], 
            [likeButton]
        )
        responsiveLike = false
        responsiveDislike = !responsiveDislike

        reactionQueue.enqueue(async () => {
            await fetchReaction(
                dislikeReactionForm, 
                liked, 
                disliked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            liked = false
            disliked = !disliked
        })
    })
}

function updateReactionButtons(
    toggleReaction, removeReaction, primaryButtons, secondaryButtons
) {
    if (removeReaction) {
        for (const button of primaryButtons) {
            button.classList.remove('-colorful')

            const label = button.querySelector('.icon-element__label')
            label.textContent = parseInt(label.textContent) - 1
        }
    }
    else if (toggleReaction) {
        for (const button of primaryButtons) {
            button.classList.add('-colorful')

            const label = button.querySelector('.icon-element__label')
            label.textContent = parseInt(label.textContent) + 1
        }

        for (const button of secondaryButtons) {
            button.classList.remove('-colorful')

            const label = button.querySelector('.icon-element__label')
            label.textContent = parseInt(label.textContent) - 1
        }
    }
    else {
        for (const button of primaryButtons) {
            button.classList.add('-colorful')

            const label = button.querySelector('.icon-element__label')
            label.textContent = parseInt(label.textContent) + 1
        }
    }
}

// Whenever (toggleReaction && removeReaction) = false, reactionId = null
async function fetchReaction(
    form, toggleReaction, removeReaction, reactionId, onResponseJson
) {
    const reactionsPath = `/users/${backendData.loginUser.username}/reactions`

    if (removeReaction) {
        await (0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
            `${reactionsPath}/${reactionId}`,
            'delete',
            form,
            onResponseJson
        )
    }
    else if (toggleReaction) {
        await (0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
            `${reactionsPath}/${reactionId}`,
            'put',
            form,
            onResponseJson
        )
    }
    else {
        await (0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
            reactionsPath,
            'post',
            form,
            onResponseJson
        )
    }  
}

function createCommentCreateForm(replyToCard, replyToData) {
    const form = document.querySelector(
        '.blog-post-page__comment-create-form'
    )
    const formClone = form.cloneNode(true)
    
    const hidden = document.createElement('input')
    hidden.name = 'reply-to'
    hidden.type = 'hidden'
    hidden.value = replyToData._id
    
    formClone.append(hidden)
    formClone.classList.remove(
        'blog-post-page__comment-create-form'
    )
    formClone.classList.add(
        'blog-post-page__reply-create-form'
    )
    commentCreateFormListeners(formClone)

    const commentString = replyToCard.parentElement

    commentString.insertBefore(
        formClone, replyToCard.nextSibling
    )
}

function defaultCommentCreateFormListeners() {
    const form = document.querySelector(
        '.blog-post-page__comment-create-form'
    )
    commentCreateFormListeners(form)
}

function commentCreateFormListeners(commentCreateForm) {
    commentCreateForm.addEventListener('submit', (event) => {
        event.preventDefault()

        ;(0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
            `/blog-posts/${backendData.blogPost._id}/comments`,
            'post',
            commentCreateForm,
            (data) => {
                ;(0,_utils_formError_js__WEBPACK_IMPORTED_MODULE_1__.updateErrorContainer)('form-textarea', 'content', data.errors)

                if (data.errors) {
                    return
                }
                
                if (commentCreateForm.classList.contains(
                    'blog-post-page__reply-create-form'
                )) {
                    let replyContainer = commentCreateForm.nextSibling

                    if (!replyContainer) {
                        replyContainer = document.createElement('div')
                        replyContainer.classList.add(
                            'blog-post-page__reply-container'
                        )
                        commentCreateForm.parentElement.append(replyContainer)
                    }

                    const replyCards = replyContainer.querySelectorAll(
                        '.comment-card'
                    )
                    replyContainer.innerHTML = data.renderedHTML
                    const newCommentCard = replyContainer.querySelector(
                        '.comment-card'
                    )
                    commentReactionFormListeners(
                        newCommentCard, 
                        data.commentData
                    )
                    
                    for (const replyCard of replyCards) {
                        replyContainer.append(replyCard)
                    }

                    if (replyContainer.classList.contains('-gone')) {
                        replyContainer.classList.remove('-gone')
                    }

                    commentCreateForm.parentElement.removeChild(commentCreateForm)
                }
                else {
                    const commentString = document.createElement('div')
                    commentString.classList.add('blog-post-page__comment-string')
                    commentString.innerHTML = data.renderedHTML
                    const newCommentCard = commentString.querySelector(
                        '.comment-card'
                    )
                    commentReactionFormListeners(
                        newCommentCard, 
                        data.commentData
                    )
                    commentCreateForm.parentElement.insertBefore(
                        commentString, commentCreateForm.nextSibling
                    )
                }
                
            }
        )
    })
}

function blogPostSetup() {
    const blogPostPage = document.querySelector(
        '.blog-post-page'
    )

    if (!blogPostPage) {
        return
    }

    blogPostReactionFormListeners()
    defaultCommentCreateFormListeners()
    allCommentsReactionFormListeners()
}




/***/ }),

/***/ "./public/javascripts/pages/blogPostForm.js":
/*!**************************************************!*\
  !*** ./public/javascripts/pages/blogPostForm.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blogPostFormSetup: () => (/* binding */ blogPostFormSetup)
/* harmony export */ });
/* harmony import */ var _utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/fetch.js */ "./public/javascripts/utils/fetch.js");
/* harmony import */ var _utils_tinyMCEConfig_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/tinyMCEConfig.js */ "./public/javascripts/utils/tinyMCEConfig.js");
/* harmony import */ var _utils_formError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/formError.js */ "./public/javascripts/utils/formError.js");




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
        
        await (0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
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
                    ;(0,_utils_formError_js__WEBPACK_IMPORTED_MODULE_2__.updateErrorContainer)(v.formCompType, k, v.errors)
                }
            }
        )

        if (!errorsOccurred) {
            for (const [k, v] of Object.entries(inputData)) {
                (0,_utils_formError_js__WEBPACK_IMPORTED_MODULE_2__.removeErrorContainer)(v.formCompType, k)
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
    (0,_utils_tinyMCEConfig_js__WEBPACK_IMPORTED_MODULE_1__.initializeTinyMCE)('.tinymce-app')
    blogPostFormSizing()
    blogPostFormTabListeners()
    blogPostFormMetadataListeners()
    blogPostFormSubmitListeners()
    
}



/***/ }),

/***/ "./public/javascripts/pages/loggingForm.js":
/*!*************************************************!*\
  !*** ./public/javascripts/pages/loggingForm.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loggingFormSetup: () => (/* binding */ loggingFormSetup)
/* harmony export */ });
/* harmony import */ var _utils_formError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/formError.js */ "./public/javascripts/utils/formError.js");


function loggingFormSetup() {
    const loggingPage = document.querySelector(
        '.logging-page'
    )

    if (!loggingPage) {
        return
    }

    const errors = backendData.errors
    const inputData = {
        'username': {
            errors: [],
            formCompType: 'form-input'
        },
        'password': {
            errors: [],
            formCompType: 'form-input'
        },
    }
    const loggingForm = loggingPage.querySelector(
        '.logging-form'
    )
    const pathSegments = loggingForm.action.split('/')
    const suffix = pathSegments[pathSegments.length - 1]

    if (suffix === 'login') {
        // Flash errors are just strings
        // Compatibility demands object with 'msg' prop
        inputData.password.errors = errors.map(error => { 
            return {msg: error} 
        })
    }
    else {
        for (const error of errors) {
            inputData[error.path].errors.push(error)
        }
    }

    for (const [k, v] of Object.entries(inputData)) {
        (0,_utils_formError_js__WEBPACK_IMPORTED_MODULE_0__.updateErrorContainer)(v.formCompType, k, v.errors)
    }
}





/***/ }),

/***/ "./public/javascripts/pages/userBlogPosts.js":
/*!***************************************************!*\
  !*** ./public/javascripts/pages/userBlogPosts.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   userBlogPostsSetup: () => (/* binding */ userBlogPostsSetup)
/* harmony export */ });
function userBlogPostsSearchbarListeners() {
    const searchbar = document.querySelector(
        '.user-blog-posts-page__searchbar .searchbar__input'
    )

    searchbar.addEventListener('input', (event) => {
        const blogPostItems = document.querySelectorAll('.blog-post-item')
        const searchValue = event
            .currentTarget
            .value
            .trim()
            .toLowerCase()

        if (searchValue === '') {
            for (const item of blogPostItems) {
                item.classList.remove('-gone')
            }
        }
        else {
            for (const item of blogPostItems) {
                const title = item.querySelector('.blog-post-item__title')
                    .textContent
                    .toLowerCase()
                const regex = new RegExp(searchValue)
                
                if (regex.test(title))
                    item.classList.remove('-gone')
                else {
                    item.classList.add('-gone')
                }
            }
        }
    })
}

function userBlogPostsSortSelectorListeners() {
    const sortSelector = document.querySelector(
        '.user-blog-posts-page__sort-selector'
    )
    const publishedList = document.querySelector(
        '.user-blog-posts__published.blog-post-list'
    )
    const unpublishedList = document.querySelector(
        '.user-blog-posts__unpublished.blog-post-list'
    )

    sortSelector.addEventListener('change', (event) => {
        const sortValue = event
            .target
            .value
            .trim()
            .toLowerCase()
        
        sortBlogPostList(
            sortValue, 
            publishedList,
            true
        )
        sortBlogPostList(
            sortValue, 
            unpublishedList
        )
        
    })
}

function sortBlogPostList(sortBy, blogPostList, published=false) {
    const blogPostItems = Array.from(
        blogPostList.querySelectorAll('.blog-post-item')
    )

    if (sortBy === 'title') {
        blogPostItems.sort((a, b) => {
            const titleA = a.querySelector(
                '.blog-post-item__title'
            ).textContent
            const titleB = b.querySelector(
                '.blog-post-item__title'
            ).textContent

            return titleB.localeCompare(titleA)
        })
    }
    else if (sortBy === 'last-mod-date') {
        blogPostItems.sort((a, b) => {
            const dateA = a.querySelector(
                '.blog-post-item__last-modified'
            ).textContent
            const dateB = b.querySelector(
                '.blog-post-item__last-modified'
            ).textContent

            return compareDateStrings(dateB, dateA)
        })
    }
    else if (published) {
        switch (sortBy) {
            case 'publish-date':
                blogPostItems.sort((a, b) => {
                    const dateA = a.querySelector(
                        '.blog-post-item__published'
                    ).textContent
                    const dateB = b.querySelector(
                        '.blog-post-item__published'
                    ).textContent

                    return compareDateStrings(dateB, dateA)
                })
                break 
            case 'likes':
                blogPostItems.sort((a, b) => {
                    const likesA = a.querySelector(
                        '.blog-post-item__likes .icon-element__label'
                    ).textContent
                    const likesB = b.querySelector(
                        '.blog-post-item__likes .icon-element__label'
                    ).textContent

                    return parseInt(likesB) - parseInt(likesA)
                })
                break
            case 'dislikes':
                blogPostItems.sort((a, b) => {
                    const dislikesA = a.querySelector(
                        '.blog-post-item__dislikes .icon-element__label'
                    ).textContent
                    const dislikesB = b.querySelector(
                        '.blog-post-item__dislikes .icon-element__label'
                    ).textContent

                    return parseInt(dislikesB) - parseInt(dislikesA)
                })
                break
            case 'total-comments':
                blogPostItems.sort((a, b) => {
                    const commentsA = a.querySelector(
                        '.blog-post-item__total-comments .icon-element__label'
                    ).textContent
                    const commentsB = b.querySelector(
                        '.blog-post-item__total-comments .icon-element__label'
                    ).textContent

                    return parseInt(commentsB) - parseInt(commentsA)
                })
                break
        }
    }

    blogPostList.innerHTML = ''
    blogPostList.append(...blogPostItems)
}

function compareDateStrings(a, b) {
    const dateA = a
        .split('-')
        .map((str) => parseInt(str))
    const dateB = b
        .split('-')
        .map((str) => parseInt(str))

    let result = 0

    for (let i=0; i<dateA.length; i++) {
        if (dateA[i] < dateB[i]) {
            result = -1
            break
        }
        else if (dateA[i] > dateB[i]) {
            result = 1
            break
        }
    }

    return result
}

function userBlogPostsTabListeners() {
    const published = document.querySelector(
        '.user-blog-posts__published'
    )
    const unpublished = document.querySelector(
        '.user-blog-posts__unpublished'
    )
    
    const publishedTab = document.querySelector(
        '.user-blog-posts__published-tab'
    )

    publishedTab.addEventListener('click', () => {
        if (published.classList.contains('-gone')) {
            unpublished.classList.add('-gone')
            published.classList.remove('-gone')
        }
    })

    const unpublishedTab = document.querySelector(
        '.user-blog-posts__unpublished-tab'
    )

    unpublishedTab.addEventListener('click', () => {
        if (unpublished.classList.contains('-gone')) {
            published.classList.add('-gone')
            unpublished.classList.remove('-gone')
        }
    }) 
}

function userBlogPostsListListeners(blogPostList) {
    const items = blogPostList.querySelectorAll(
        '.blog-post-item'
    )
    const rightPanel = document.querySelector(
        '.user-blog-posts__right'
    )

    for (const item of items) {

        item.addEventListener('click', (event) => {
            onItemClick(event, rightPanel)
        })

        const deleteButton = item.querySelector(
            '.blog-post-item__delete-button'
        )
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation()
            onDeleteButtonClick(item, blogPostList)
        })
    }
}

function onItemClick(event, rightPanel) {
    const itemId = event.currentTarget.id
    const blogPosts = [
        ...backendData.publishedBlogPosts,
        ...backendData.unpublishedBlogPosts
    ]
    const blogPost = blogPosts.find(
        (blogPost) => blogPost._id.toString() === itemId
    )

    const fragmentTitle = document.querySelector(
        '.blog-post-fragment__title'
    )
    fragmentTitle.innerHTML = blogPost.title

    const fragmentThumbnail = document.querySelector(
        '.blog-post-fragment__thumbnail'
    )
    fragmentThumbnail.innerHTML = ''

    if (blogPost.thumbnail) {
        const pic = blogPost.thumbnail
        const dataUri = `data:${pic.contentType};base64,${pic.data}`
        const img = document.createElement('img')
        img.src = dataUri
        
        fragmentThumbnail.classList.remove('-empty')
        fragmentThumbnail.append(img)
    }
    else {
        fragmentThumbnail.classList.add('-empty')
        fragmentThumbnail.textContent = 'Your thumbnail appears here'
    }

    const fragmentContent = document.querySelector(
        '.blog-post-fragment__content'
    )
    fragmentContent.innerHTML = blogPost.content

    rightPanel.classList.remove('-hidden')
}

function onDeleteButtonClick(item, blogPostList) {
    fetch(window.location.href + '/' + item.id, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }
            
            // remove deleted blog post from view
            blogPostList.removeChild(item)
            
        })
        .catch(error => {
            throw error
        })   
}

function userBlogPostsSetup() {
    const userBlogPostsPage = document.querySelector(
        '.user-blog-posts-page'
    )

    if (!userBlogPostsPage) {
        return
    }

    userBlogPostsSearchbarListeners()
    userBlogPostsSortSelectorListeners()
    userBlogPostsTabListeners()

    const publishedList = document.querySelector(
        '.user-blog-posts__published'
    )
    const unpublishedList = document.querySelector(
        '.user-blog-posts__unpublished'
    )
    userBlogPostsListListeners(publishedList)
    userBlogPostsListListeners(unpublishedList)
}



/***/ }),

/***/ "./public/javascripts/pages/userProfile.js":
/*!*************************************************!*\
  !*** ./public/javascripts/pages/userProfile.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   profileFormSetup: () => (/* binding */ profileFormSetup)
/* harmony export */ });
/* harmony import */ var _utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/fetch.js */ "./public/javascripts/utils/fetch.js");
/* harmony import */ var _utils_formError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/formError.js */ "./public/javascripts/utils/formError.js");



function profileFormSetup() {
    const profilePage = document.querySelector(
        '.profile-page'
    )

    if (!profilePage) {
        return
    }

    const profileEditButton = document.querySelector(
        '.profile__edit-button'
    )
    const secondary = document.querySelector(
        '.profile__secondary'
    )
    const profileForm = document.querySelector(
        '.profile-form'
    )

    profileEditButton.addEventListener('click', () => {
        if (profileForm.classList.contains('-gone')) {
            secondary.classList.add('-gone')
            profileForm.classList.remove('-gone')
        }
    })

    const profileFormCancelButton = document.querySelector(
        '.profile-form__cancel'
    )

    profileFormCancelButton.addEventListener('click', () => {
        if (secondary.classList.contains('-gone')) {
            profileForm.classList.add('-gone')
            secondary.classList.remove('-gone')

            const { username, bio, keywords } = backendData.user 

            const usernameInput = document.getElementById('username')
            usernameInput.value = username

            if (bio) {
                const bioInput = document.getElementById('bio')
                bioInput.value = bio
            }

            if (keywords.length) {
                const keywordsInput = document.getElementById('keywords')
                keywordsInput.value = keywords.join(' ')
            } 
        }
    })

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault()

        ;(0,_utils_fetch_js__WEBPACK_IMPORTED_MODULE_0__.formFetch)(
            `/users/${backendData.user.username}`, 
            'PUT', 
            profileForm,
            (data) => {
                const inputData = {
                    'profile-pic': {
                        errors: [],
                        formCompType: 'form-input'
                    },
                    'username': {
                        errors: [],
                        formCompType: 'form-input'
                    },
                    'bio': {
                        errors: [],
                        formCompType: 'form-textarea'
                    },
                    'keywords': {
                        errors: [],
                        formCompType: 'form-textarea'
                    }
                }

                for (const error of data.errors) {
                    inputData[error.path].errors.push(error)
                }

                for (const [k, v] of Object.entries(inputData)) {
                    (0,_utils_formError_js__WEBPACK_IMPORTED_MODULE_1__.updateErrorContainer)(v.formCompType, k, v.errors)
                }
            }    
        )
    })
}



/***/ }),

/***/ "./public/javascripts/utils/fetch.js":
/*!*******************************************!*\
  !*** ./public/javascripts/utils/fetch.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formFetch: () => (/* binding */ formFetch)
/* harmony export */ });
async function formFetch(
    href, method, form, onResponseJson=null
) {
    const res = await fetch(
        href, 
        {
            method,
            body: new FormData(form)
        }
    )
    
    // Input error statuses should be handled here
    // Only input error status currently is 400
    if (!res.ok && res.status !== 400) {
        throw new Error(`HTTP error - Status 500`)
    }

    if (res.redirected) {
        if (window.location.href === res.url) {
            window.location.reload()
        }
        else {
            window.location.href = res.url
        }
    }

    const contentType = res.headers.get('content-type');

    if (
        !contentType 
        || !contentType.includes('application/json')
        || !onResponseJson
    ) {
        return
    }

    const data = await res.json()
    onResponseJson(data)
}



/***/ }),

/***/ "./public/javascripts/utils/formError.js":
/*!***********************************************!*\
  !*** ./public/javascripts/utils/formError.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   removeErrorContainer: () => (/* binding */ removeErrorContainer),
/* harmony export */   updateErrorContainer: () => (/* binding */ updateErrorContainer)
/* harmony export */ });
function updateErrorContainer(formCompType, inputId, errors) {
    // remove previous errors if present
    removeErrorContainer(formCompType, inputId)

    const errorContainerClassId = `${formCompType}__error-container`
    const inputField = document.getElementById(inputId)
    const inputContainer = inputField.parentElement

    if (errors) {
        const errorContainer = document.createElement('div')
        errorContainer.classList.add(errorContainerClassId)

        for (const error of errors) {
            const errorDiv = document.createElement('div')
            errorDiv.classList.add(`${formCompType}__error`)
            errorDiv.textContent = error.msg
            errorContainer.append(errorDiv)
        }

        inputContainer.append(errorContainer)
    }
}

function removeErrorContainer(formCompType, inputId) {
    const errorContainerClassId = `${formCompType}__error-container`
    const inputField = document.getElementById(inputId)
    const inputContainer = inputField.parentElement
    const errorContainer = inputContainer.querySelector(
        '.' + errorContainerClassId
    )

    if (errorContainer) {
        inputContainer.removeChild(errorContainer)
    }
}




/***/ }),

/***/ "./public/javascripts/utils/queue.js":
/*!*******************************************!*\
  !*** ./public/javascripts/utils/queue.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PromiseQueue: () => (/* binding */ PromiseQueue)
/* harmony export */ });
function Queue() {
    let front = null
    let end = null

    function Node(value, next=null) {
        return { value, next }
    }

    function enqueue(value) {
        const node = Node(value)

        if (!front) {
            front = node
            end = node
        }
        else {
            end.next = node
            end = node
        }
    }

    function dequeue() {
        if (!front) {
            return undefined
        }
        
        const removedNode = front
        front = front.next
        
        if (!front) {
            end = null
        }

        return removedNode.value
    }

    function isEmpty() {
        return front === null
    }

    return {enqueue, dequeue, isEmpty}
}

function PromiseQueue() {
    const queue = Queue()
    let isProcessing = false

    async function enqueue(value) {
        queue.enqueue(value)

        if (isProcessing) {
            return
        }

        isProcessing = true

        while (!queue.isEmpty()) {
            const operation = queue.dequeue()
            await operation()
        }

        isProcessing = false
    }

    return {enqueue}
}




/***/ }),

/***/ "./public/javascripts/utils/tinyMCEConfig.js":
/*!***************************************************!*\
  !*** ./public/javascripts/utils/tinyMCEConfig.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initializeTinyMCE: () => (/* binding */ initializeTinyMCE)
/* harmony export */ });
function initializeTinyMCE(selector) {
    const tinyMCEElement = document.querySelector(selector)

    if (!tinyMCEElement) {
        return
    }

    // Variable backendData is data provided by backend for rendering
    // See root.pug for the script that defines it
    let initialContent = backendData.blogPost.content || ''
    
    tinymce.init({
        selector: selector,
        plugins: 'lists link image table code help wordcount',
        menubar: 'file edit view insert table tools help',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist',
        promotion: false,
        image_file_types: 'jpeg,jpg,png,webp,gif',
        setup: (editor) => {
            editor.on('init', () => {
                editor.setContent(initialContent)
                const preview = document.querySelector('.blog-post-fragment__content')
                preview.innerHTML = editor.getContent()
            })
    
            editor.on('change', () => {
                editor.save()
                const preview = document.querySelector('.blog-post-fragment__content')
                preview.innerHTML = editor.getContent()
            })

            editor.on('submit', () => {
                const wordCountInput = document.getElementById('word-count')
                wordCountInput.value = editor.plugins.wordcount.getCount()
            })
        }
    });
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./public/javascripts/root.js ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _layouts_toolbars_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layouts/toolbars.js */ "./public/javascripts/layouts/toolbars.js");
/* harmony import */ var _pages_loggingForm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/loggingForm.js */ "./public/javascripts/pages/loggingForm.js");
/* harmony import */ var _pages_blogPost_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/blogPost.js */ "./public/javascripts/pages/blogPost.js");
/* harmony import */ var _pages_blogPostForm_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/blogPostForm.js */ "./public/javascripts/pages/blogPostForm.js");
/* harmony import */ var _pages_userProfile_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/userProfile.js */ "./public/javascripts/pages/userProfile.js");
/* harmony import */ var _pages_userBlogPosts_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/userBlogPosts.js */ "./public/javascripts/pages/userBlogPosts.js");







// layout setup
(0,_layouts_toolbars_js__WEBPACK_IMPORTED_MODULE_0__.navbarListeners)()
;(0,_layouts_toolbars_js__WEBPACK_IMPORTED_MODULE_0__.sidebarListeners)(
    '.account-sidebar', 
    '.navbar__account-button'
)
;(0,_layouts_toolbars_js__WEBPACK_IMPORTED_MODULE_0__.sidebarListeners)(
    '.content-sidebar', 
    '.navbar__content-button'
)

// page setup
;(0,_pages_loggingForm_js__WEBPACK_IMPORTED_MODULE_1__.loggingFormSetup)()
;(0,_pages_blogPost_js__WEBPACK_IMPORTED_MODULE_2__.blogPostSetup)()
;(0,_pages_blogPostForm_js__WEBPACK_IMPORTED_MODULE_3__.blogPostFormSetup)()
;(0,_pages_userProfile_js__WEBPACK_IMPORTED_MODULE_4__.profileFormSetup)()
;(0,_pages_userBlogPosts_js__WEBPACK_IMPORTED_MODULE_5__.userBlogPostsSetup)()

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map