import { sidebarEventListeners } from './toolbars.js'
import { blogPostFormSetup } from './blogPostForm.js'
import { profileFormSetup } from './userProfile.js'
import { initializeTinyMCE } from './tinyMCEConfig.js'

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar-account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar-content-button'
)

blogPostFormSetup()
initializeTinyMCE('#tinymce-app')

profileFormSetup()