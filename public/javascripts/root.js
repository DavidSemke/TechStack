import { sidebarEventListeners } from './toolbars.js'
// import {
//     blogLikeButtonEventListeners,
//     blogDislikeButtonEventListeners,
//     blogCommentButtonEventListeners
// } from './blog.js'
import { blogFormSetup } from './blogForm.js'
import { initializeTinyMCE } from './tinyMCEConfig.js'

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar-account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar-content-button'
)

blogFormSetup()

initializeTinyMCE('#tinymce-app')

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()