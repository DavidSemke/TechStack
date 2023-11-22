import { 
    addSidebarEventListeners
} from './toolbars.js'

addSidebarEventListeners(
    'account-sidebar', 
    'navbar-account-button', 
    'account-sidebar-close-button'
)
addSidebarEventListeners(
    'content-sidebar', 
    'navbar-burger-button', 
    'content-sidebar-close-button'
)