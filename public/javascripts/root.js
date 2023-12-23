import { sidebarListeners } from './toolbars.js'
import { blogPostFormSetup } from './blogPostForm.js'
import { initializeTinyMCE } from './tinyMCEConfig.js'
import { profileFormSetup } from './userProfile.js'
import { userBlogPostsSetup } from './userBlogPosts.js'


sidebarListeners(
    '.account-sidebar', 
    '.navbar__account-button'
)
sidebarListeners(
    '.content-sidebar', 
    '.navbar__content-button'
)

blogPostFormSetup()
initializeTinyMCE('#tinymce-app')

profileFormSetup()

userBlogPostsSetup()