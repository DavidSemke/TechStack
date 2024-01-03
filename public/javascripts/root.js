import { sidebarListeners } from './layouts/toolbars.js'
import { blogPostFormSetup } from './pages/blogPostForm.js'
import { profileFormSetup } from './pages/userProfile.js'
import { userBlogPostsSetup } from './pages/userBlogPosts.js'


sidebarListeners(
    '.account-sidebar', 
    '.navbar__account-button'
)
sidebarListeners(
    '.content-sidebar', 
    '.navbar__content-button'
)

blogPostFormSetup()
profileFormSetup()
userBlogPostsSetup()