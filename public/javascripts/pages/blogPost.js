import { format } from 'morgan'
import { formFetch } from '../utils/fetch.js'

function blogPostButtonListeners() {
    const likeButton = document.querySelector(
        '.blog-post__like-button'
    )
    likeButton.addEventListener('click', () => {
        // make post req to /users/:userId/likes
    })

    const dislikeButton = document.querySelector(
        '.blog-post__dislike-button'
    )

    dislikeButton.addEventListener('click', () => {
        
    })

    const commentsButton = document.querySelector(
        '.blog-post__comment-button'
    )

    commentsButton.addEventListener('click', () => {
        
    })

}

function commentButtonListeners() {
    const comments = document.querySelectorAll(
        '.comment-card'
    )

    for (const comment of comments) {
        const likeButton = comment.querySelector(
            '.blog-post__like-button'
        )
        likeButton.addEventListener('click', () => {
    
        })

        const dislikeButton = comment.querySelector(
            '.blog-post__dislike-button'
        )
        dislikeButton.addEventListener('click', () => {
            
        })
    
        const viewRepliesButton = comment.querySelector(
            '.blog-post__view-replies-button'
        )
        const label = viewRepliesButton.querySelector(
            '.icon-button__label'
        )

        if (parseInt(label)) {
            viewRepliesButton.addEventListener('click', () => {
            
            })
        }

        const replyButton = comment.querySelector(
            '.blog-post__reply-button'
        )

        if (replyButton) {
            replyButton.addEventListener('click', () => {
            
            })
        }
        
    }



    

    
}

function createCommentForm(replyTo) {
    const form = document.querySelector('.comment-form')
    const formClone = form.cloneNode(true)
    const hidden = document.createElement('input')
    hidden.name = 'reply-to'
    hidden.type = 'hidden'
    hidden.value = replyTo.id

    form.parentElement.insertBefore(formClone, replyTo.nextSibling)
}

function commentFormSubmitListeners() {
    const form = document.querySelector('.comment-form')

    form.addEventListener('submit', (event) => {
        onCommentFormSubmit(event)
    })
}

function onCommentFormSubmit(event) {
    event.preventDefault()

    formFetch(
        `/${backendData.blogPost._id}/comments`,
        'post',
        form,
        (res) => {
            // add comment physical
        }
    )
}

function blogPostSetup() {
    const blogPostPage = document.querySelector(
        '.blog-post-page'
    )

    if (!blogPostPage) {
        return
    }

    blogPostButtonListeners()
    commentButtonListeners()
    commentFormSubmitListeners()
}


export {
    blogPostSetup
}