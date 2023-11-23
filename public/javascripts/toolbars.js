function addSidebarEventListeners(sidebarId, openElementId, closeElementId) {
    const sidebar = document.getElementById(sidebarId)

    if (!sidebar) {
        return
    }

    const closeButton = document.getElementById(closeElementId)
    const openButton = document.getElementById(openElementId)

    closeButton.addEventListener('click', () => {
        console.log(sidebar.classList)
        
        if (sidebar.classList.contains('-open')) {
            sidebar.classList.remove('-open')
            sidebar.classList.add('-closed')
        }
    })

    openButton.addEventListener('click', () => {
        
        if (sidebar.classList.contains('-closed')) {
            sidebar.classList.remove('-closed')
            sidebar.classList.add('-open')
        }
    })
}

export {
    addSidebarEventListeners
}