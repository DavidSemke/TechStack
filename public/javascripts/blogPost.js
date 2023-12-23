function blogPostLikeButtonListeners() {
    const button = document.querySelector(
        '.blog-post-like-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {

    })

}

function blogPostDislikeButtonListeners() {
    const button = document.querySelector(
        '.blog-post-dislike-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })

}

function blogPostCommentButtonListeners() {
    const button = document.querySelector(
        '.blog-post-comment-button'
    )

    if (!button) {
        return
    }

    button.addEventListener('click', () => {
        
    })
}

function blogPostSetup() {
    const blogPostPage = document.querySelector(
        '.blog-post-page'
    )

    if (!blogPostPage) {
        return
    }

    blogPostLikeButtonListeners()
    blogPostDislikeButtonListeners()
    blogPostCommentButtonListeners()
}


export {
    blogPostSetup
}