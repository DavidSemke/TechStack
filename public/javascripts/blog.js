function blogLikeButtonEventListeners() {
    const button = document.querySelector(
        '.blog-like-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {

    })

}

function blogDislikeButtonEventListeners() {
    const button = document.querySelector(
        '.blog-dislike-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })

}

function blogCommentButtonEventListeners() {
    const button = document.querySelector(
        '.blog-comment-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })
}


export {
    blogLikeButtonEventListeners,
    blogDislikeButtonEventListeners,
    blogCommentButtonEventListeners
}