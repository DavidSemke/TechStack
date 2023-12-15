function blogPostLikeButtonEventListeners() {
    const button = document.querySelector(
        '.blog-post-like-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {

    })

}

function blogPostDislikeButtonEventListeners() {
    const button = document.querySelector(
        '.blog-post-dislike-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })

}

function blogPostCommentButtonEventListeners() {
    const button = document.querySelector(
        '.blog-post-comment-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })
}


export {
    blogPostLikeButtonEventListeners,
    blogPostDislikeButtonEventListeners,
    blogPostCommentButtonEventListeners
}