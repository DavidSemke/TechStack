import { navbarListeners, sidebarListeners } from './layouts/toolbars.js'
import { loggingFormSetup } from './pages/loggingForm.js'
import { blogPostSetup } from './pages/blogPost.js'
import { blogPostFormSetup } from './pages/blogPostForm.js'
import { profileFormSetup } from './pages/userProfile.js'
import { userBlogPostsSetup } from './pages/userBlogPosts.js'
import { filterEllipses } from './utils/textCutoff.js'

// layout setup
navbarListeners()
sidebarListeners(
    '.account-sidebar', 
    '.navbar__account-button'
)
sidebarListeners(
    '.content-sidebar', 
    '.navbar__content-button'
)

// page setup
loggingFormSetup()
blogPostSetup()
blogPostFormSetup()
profileFormSetup()
userBlogPostsSetup()

// other setup
filterEllipses()
