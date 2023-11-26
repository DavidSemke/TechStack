import { sidebarEventListeners } from './toolbars.js'
import {
    blogLikeButtonEventListeners,
    blogDislikeButtonEventListeners,
    blogCommentButtonEventListeners
} from './blog.js'

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar-account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar-content-button'
)

// blogLikeButtonEventListeners()
// blogDislikeButtonEventListeners()
// blogCommentButtonEventListeners()