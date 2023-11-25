function addSidebarEventListeners(sidebarSelector, sidebarButtonSelector) {
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

export {
    addSidebarEventListeners
}