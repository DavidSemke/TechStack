import { formFetch } from '../utils/fetch.js'

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

    const likeReactionForms = document.querySelectorAll(
        '.blog-post__like-reaction-form'
    )
    
    for (const form of likeReactionForms) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()

            fetchReaction(
                form, 
                disliked, 
                liked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            updateReactionButtons(
                disliked, 
                liked, 
                likeButtons, 
                dislikeButtons
            )

            disliked = false
            liked = !liked
        })
    }
    const dislikeReactionForms = document.querySelectorAll(
        '.blog-post__dislike-reaction-form'
    )
    
    for (const form of dislikeReactionForms) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()

            fetchReaction(
                form, 
                liked, 
                disliked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            updateReactionButtons(
                liked, 
                disliked, 
                dislikeButtons, 
                likeButtons
            )

            liked = false
            disliked = !disliked
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

    for (let i=0, j=0, k=0; i<commentCards.length; i++) {
        const commentCard = commentCards[i]
        let commentData = comments[j]
        const replies = commentData.replies

        if (!replies) {
            j++
        }
        else if (k > 0) {
            commentData = commentData.replies[k-1]
            k++
            
            if (k === replies.length + 1) {
                k = 0
                j++
            }
        }
        else {
            k++
        }

        if (commentData.replies && commentData.replies.length) {
            const viewRepliesButton = commentCard.querySelector(
                '.comment-card__view-replies-button'
            )
            viewRepliesButton.addEventListener('click', () => {
                const replyContainer = commentCard.parentElement.nextSibling

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
                    replyCreateForm.parentElement.removeChild(replyCreateForm)
                }

                createCommentCreateForm(commentCard, commentData)
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

        const likeReactionForm = commentCard.querySelector(
            '.comment-card__like-reaction-form'
        )
        likeReactionForm.addEventListener('submit', (event) => {
            event.preventDefault()

            fetchReaction(
                likeReactionForm, 
                disliked, 
                liked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            updateReactionButtons(
                disliked, 
                liked, 
                [likeButton], 
                [dislikeButton]
            )

            disliked = false
            liked = !liked
        })

        const dislikeReactionForm = commentCard.querySelector(
            '.comment-card__dislike-reaction-form'
        )
        dislikeReactionForm.addEventListener('submit', (event) => {
            event.preventDefault()

            fetchReaction(
                dislikeReactionForm, 
                liked, 
                disliked, 
                reactionId,
                (data) => {
                    reactionId = data.reactionId
                }
            )
            updateReactionButtons(
                liked, 
                disliked, 
                [dislikeButton], 
                [likeButton]
            )

            liked = false
            disliked = !disliked
        })
    }
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
function fetchReaction(
    form, toggleReaction, removeReaction, reactionId, onResponseJson
) {
    const reactionsPath = `/users/${backendData.mainUser.username}/reactions`

    if (removeReaction) {
        formFetch(
            `${reactionsPath}/${reactionId}`,
            'delete',
            form,
            false,
            onResponseJson
        )
    }
    else if (toggleReaction) {
        formFetch(
            `${reactionsPath}/${reactionId}`,
            'put',
            form,
            false,
            onResponseJson
        )
    }
    else {
        formFetch(
            reactionsPath,
            'post',
            form,
            false,
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
                false,
                (data) => {
    
                    if (data.errors) {
                        const errorContainer = form.querySelector(
                            '.form-textarea__error-container'
                        )
    
                        for (const error of data.errors) {
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
                            'blog-post-page__reply-create-form'
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
                            '.blog-post-page__reply-create-form'
                        )
    
                        if (replyCreateForm) {
                            replyCreateForm
                                .parentElement
                                .removeChild(replyCreateForm)
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