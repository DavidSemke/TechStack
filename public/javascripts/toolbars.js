function addSidebarEventListeners(sidebarId, sidebarButtonId) {
    const sidebar = document.getElementById(sidebarId)

    if (!sidebar) {
        return
    }

    const sidebarButton = document.getElementById(sidebarButtonId)

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