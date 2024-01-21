import { navbarListeners, sidebarListeners } from './layouts/toolbars.js'
import { blogPostSetup } from './pages/blogPost.js'
import { blogPostFormSetup } from './pages/blogPostForm.js'
import { profileFormSetup } from './pages/userProfile.js'
import { userBlogPostsSetup } from './pages/userBlogPosts.js'


navbarListeners()
sidebarListeners(
    '.account-sidebar', 
    '.navbar__account-button'
)
sidebarListeners(
    '.content-sidebar', 
    '.navbar__content-button'
)

blogPostSetup()
blogPostFormSetup()
profileFormSetup()
userBlogPostsSetup()