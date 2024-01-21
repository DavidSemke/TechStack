import { formFetch } from '../utils/fetch.js'


function sidebarListeners(sidebarSelector, sidebarButtonSelector) {
    const sidebar = document.querySelector(sidebarSelector)

    if (!sidebar) {
        return
    }

    const sidebarButton = document.querySelector(sidebarButtonSelector)

    sidebarButton.addEventListener('click', () => {
        
        if (sidebar.classList.contains('-open')) {
            sidebar.classList.remove('-open')
            sidebar.classList.add('-closed')
        }
        else if (sidebar.classList.contains('-closed')) {
            sidebar.classList.remove('-closed')
            sidebar.classList.add('-open')
        }
    })
}

function navbarListeners() {
    const navbar = document.querySelector('.navbar')

    if (!navbar) {
        return
    }

    const navbarDropdownContainer = document.querySelector(
        '.navbar-dropdown-container'
    )
    const searchbarInput = navbar.querySelector('.searchbar__input')
    searchbarInput.addEventListener('input', () => {
        const encodedWords = searchbarInput
            .value
            .split(' ')
            .filter(word => word)
            .map(word => encodeURIComponent(word))

        if (!encodedWords.length) {
            navbarDropdownContainer.innerHTML = ''
            return
        }
        
        const href = '/blog-posts?keywords=' + encodedWords.join(',')

        fetch(
            href, 
            { method: 'GET' }
        )
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error - Status: ${res.status}`)
                }
    
                return res.json()
            })
            .then(data => {
                navbarDropdownContainer.innerHTML = data.renderedHTML
            })
            .catch(error => {
                throw error
            })
    })
    searchbarInput.addEventListener('blur', (event) => {
        const newFocus = event.relatedTarget
        
        // check to see if link has been clicked
        if (!newFocus || newFocus.tagName !== 'A') {
            navbarDropdownContainer.classList.add('-gone')
        }
    })
    searchbarInput.addEventListener('focus', () => {
        navbarDropdownContainer.classList.remove('-gone')
    })
}

export {
    sidebarListeners,
    navbarListeners
}