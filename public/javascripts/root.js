import { sidebarEventListeners } from './toolbars.js'
import { blogFormSetup } from './blogForm.js'
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

blogFormSetup()
initializeTinyMCE('#tinymce-app')

profileFormSetup()