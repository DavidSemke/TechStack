import { formFetch } from '../utils/fetch.js'

function blogPostReactionFormListeners() {
    const reaction = backendData.blogPost.reaction
    const reactionId = reaction ? reaction._id : null
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

    const likeReactionForms = document.querySelectorAll(
        '.blog-post__like-reaction-form'
    )
    
    for (const form of likeReactionForms) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()

            addHiddenData(form, backendData.blogPost._id, 'BlogPost')
            fetchReaction(form, disliked, liked, reactionId)
            updateButtonColor(disliked, liked, likeButtons, dislikeButtons)
        })
    }
    const dislikeReactionForms = document.querySelectorAll(
        '.blog-post__dislike-reaction-form'
    )
    
    for (const form of dislikeReactionForms) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()

            addHiddenData(form, backendData.blogPost._id, 'BlogPost')
            fetchReaction(form, liked, disliked, reactionId)
            updateButtonColor(liked, disliked, dislikeButtons, likeButtons)
        })
    }
}

function commentReactionFormListeners() {
    const commentCards = document.querySelectorAll(
        '.comment-card'
    )

    // note that blogPost comments are non-replies only
    // replies are available from the comment replied to
    const comments = backendData.blogPost.comments

    for (let i=0, j=0; i<commentCards.length; i++) {
        const commentCard = commentCards[i]
        let commentData = comments[i]

        if (commentData.replies) {
            if (j > 0) {
                commentData = comments[i-j].replies[j-1]
            }

            if (j === comments[i-j].replies.length) {
                j = 0
            }
            else {
                j++
            }
        }

        const likeButton = commentCard.querySelector(
            '.comment-card__like-button'
        )
        const dislikeButton = commentCard.querySelector(
            '.comment-card__dislike-button'
        )

        const reaction = commentData.reaction

        if (reaction) {
            if (reaction.reaction_type === 'Like') {
                likeButton.classList.add('-colorful')
            }
            else if (reaction.reaction_type === 'Dislike') {
                dislikeButton.classList.add('-colorful')
            }
        }

        const likeReactionForm = commentCard.querySelector(
            '.comment-card__like-reaction-form'
        )
        likeReactionForm.addEventListener('submit', (event) => {
            event.preventDefault()

            addHiddenData(form, commentCard.id, 'Comment')
            fetchReaction(form, disliked, liked, reaction._id)
            updateButtonColor(disliked, liked, [likeButton], [dislikeButton])
        })

        const dislikeReactionForm = commentCard.querySelector(
            '.comment-card__like-reaction-form'
        )
        dislikeReactionForm.addEventListener('submit', (event) => {
            event.preventDefault()

            addHiddenData(form, commentCard.id, 'Comment')
            fetchReaction(form, liked, disliked, reaction._id)
            updateButtonColor(liked, disliked, [dislikeButton], [likeButton])
        })

        const viewRepliesButton = commentCard.querySelector(
            '.comment-card__view-replies-button'
        )

        if (commentData.replies.length) {
            viewRepliesButton.addEventListener('click', () => {
                const replyContainer = commentCard.nextElementSibling

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
                    'blog-post-page__reply-create-form'
                )

                if (replyCreateForm) {
                    document.removeChild(replyCreateForm)
                }

                createCommentCreateForm(commentCard, commentData)
            })
        }
        
    }
}

function addHiddenData(form, contentId, contentType) {
    const contentTypeInput = document.createElement('input')
    contentTypeInput.name = 'content-type'
    contentTypeInput.type = 'hidden'
    contentTypeInput.value = contentType

    const contentIdInput = document.createElement('input')
    contentIdInput.name = 'content-id'
    contentIdInput.type = 'hidden'
    contentIdInput.value = contentId

    form.append(contentIdInput, contentTypeInput)
}

function updateButtonColor(
    toggleReaction, removeReaction, primaryButtons, secondaryButtons
) {
    if (removeReaction) {
        for (const button of primaryButtons) {
            button.classList.remove('-colorful')
        }
    }
    else if (toggleReaction) {
        for (const button of primaryButtons) {
            button.classList.add('-colorful')
        }

        for (const button of secondaryButtons) {
            button.classList.remove('-colorful')
        }
    }
    else {
        for (const button of primaryButtons) {
            button.classList.add('-colorful')
        }
    }
}

function fetchReaction(form, toggleReaction, removeReaction, reactionId) {
    if (removeReaction) {
        formFetch(
            `/users/${backendData.mainUser.username}/reactions/${reactionId}`,
            'delete',
            form
        )
    }
    else if (toggleReaction) {
        formFetch(
            `/users/${backendData.mainUser.username}/reactions/${reactionId}`,
            'put',
            form
        )
    }
    else {
        formFetch(
            `/users/${backendData.mainUser.username}/reactions`,
            'post',
            form
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
    formClone.addEventListener('submit', (event) => {
        event.preventDefault()

    })

    replyToCard.parentElement.insertBefore(
        formClone, replyToCard.nextSibling
    )
}

function commentCreateFormSubmitListeners() {
    const commentCreateForm = document.querySelector(
        '.blog-post-page__comment-create-form'
    )
    const replyCreateForm = document.querySelector(
        '.blog-post-page__reply-create-form'
    )

    const forms = [commentCreateForm]

    if (replyCreateForm) {
        forms.push(replyCreateForm)
    }

    for (const form of forms) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()
    
            formFetch(
                `/blog-posts/${backendData.blogPost._id}/comments`,
                'post',
                form,
                (data) => {
    
                    if (data.errors) {
                        const errorContainer = form.querySelector(
                            '.form-textarea__error-container'
                        )
    
                        for (const error of errors) {
                            const errorDiv = document.createElement('div')
                            errorDiv.classList.add('.form-textarea__error')
                            errorDiv.textContent = error.msg
    
                            errorContainer.append(errorDiv)
                        }
                    }
                    else {
                        // remove previous errors if present
                        const errorContainer = form.querySelector(
                            '.form-textarea__error-container'
                        )
                        errorContainer.innerHTML = ''
    
                        const commentContainer = document.createElement('div')
                        commentContainer.classList.add('blog-post-page__comment')
                        commentContainer.append(data.renderedHTML)
    
                        const nextSibling = form.nextSibling
    
                        if (form.classList.contains(
                            '.blog-post-page__reply-create-form'
                        )) {
                            nextSibling.prepend(commentContainer)
                        }
                        else {
                            form.parentElement.insertBefore(
                                commentContainer, nextSibling
                            )
                        }
    
                        // Remove reply-create-form, if it exists
                        const replyCreateForm = document.querySelector(
                            'blog-post-page__reply-create-form'
                        )
    
                        if (replyCreateForm) {
                            document.removeChild(replyCreateForm)
                        }
                    }
                }
            )
        })
    }
 }

function blogPostSetup() {
    const blogPostPage = document.querySelector(
        '.blog-post-page'
    )

    if (!blogPostPage) {
        return
    }

    blogPostReactionFormListeners()
    commentReactionFormListeners()
    commentCreateFormSubmitListeners()
}


export {
    blogPostSetup
}