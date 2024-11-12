import { navbarListeners, sidebarListeners } from "./layouts/toolbars.js"
import { loggingFormSetup } from "./pages/loggingForm.js"
import { blogPostSetup } from "./pages/blogPost.js"
import { blogPostFormSetup } from "./pages/blogPostForm.js"
import { profileFormSetup } from "./pages/userProfile.js"
import { userBlogPostsSetup } from "./pages/userBlogPosts.js"
import "./codeHighlighting/prismConfig.js"

// layout setup
navbarListeners()
sidebarListeners()

// page setup
loggingFormSetup()
blogPostSetup()
blogPostFormSetup()
profileFormSetup()
userBlogPostsSetup()
