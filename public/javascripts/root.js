import { navbarSetup } from "./layouts/toolbars/navbar.js"
import { sidebarSetup } from "./layouts/toolbars/sidebar.js"
import { loggingFormSetup } from "./pages/loggingForm.js"
import { blogPostSetup } from "./pages/blogPost.js"
import { blogPostFormSetup } from "./pages/blogPostForm.js"
import { profileFormSetup } from "./pages/userProfile.js"
import { userBlogPostsSetup } from "./pages/userBlogPosts.js"
import "./codeHighlighting/prismConfig.js"

// layout setup
navbarSetup()
sidebarSetup()

// page setup
loggingFormSetup()
blogPostSetup()
blogPostFormSetup()
profileFormSetup()
userBlogPostsSetup()
