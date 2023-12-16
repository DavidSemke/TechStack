import { sidebarEventListeners } from './toolbars.js'
import { blogPostFormSetup } from './blogPostForm.js'
import { profileFormSetup } from './userProfile.js'
import { initializeTinyMCE } from './tinyMCEConfig.js'

sidebarEventListeners(
    '.account-sidebar', 
    '.navbar__account-button'
)
sidebarEventListeners(
    '.content-sidebar', 
    '.navbar__content-button'
)

blogPostFormSetup()
initializeTinyMCE('#tinymce-app')

profileFormSetup()