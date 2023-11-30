import { sidebarEventListeners } from './toolbars.js'
// import {
//     blogLikeButtonEventListeners,
//     blogDislikeButtonEventListeners,
//     blogCommentButtonEventListeners
// } from './blog.js'
import {
    blogFormTabEventListeners
} from './blogForm.js'
import {
    initializeTinyMCE
} from './tinyMCEConfig.js'

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar-account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar-content-button'
)

blogFormTabEventListeners()

initializeTinyMCE('#tinymce-app')

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()