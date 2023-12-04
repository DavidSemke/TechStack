import { sidebarEventListeners } from './toolbars.js'
// import {
//     blogLikeButtonEventListeners,
//     blogDislikeButtonEventListeners,
//     blogCommentButtonEventListeners
// } from './blog.js'
import {
    blogFormTabEventListeners,
    blogFormMetadataEventListeners
} from './blogForm.js'
import {
    initializeTinyMCE
} from './tinyMCEConfig.js'

console.log(backendData)

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar-account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar-content-button'
)

blogFormTabEventListeners()
blogFormMetadataEventListeners()

initializeTinyMCE('#tinymce-app')

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()