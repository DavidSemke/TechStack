import { sidebarEventListeners } from './toolbars.js'
// import {
//     blogLikeButtonEventListeners,
//     blogDislikeButtonEventListeners,
//     blogCommentButtonEventListeners
// } from './blog.js'
import {
    blogFormTabEventListeners,
    blogFormMetadataEventListeners,
    blogFormSizing
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
blogFormMetadataEventListeners()
blogFormSizing()

initializeTinyMCE('#tinymce-app')

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()