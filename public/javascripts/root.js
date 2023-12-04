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

const textarea = document.getElementById('tinymce-app')
console.log(textarea)
console.log(textarea.innerText)
console.log(textarea.innerHTML)
console.log(textarea.value)

initializeTinyMCE('#tinymce-app')

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()

