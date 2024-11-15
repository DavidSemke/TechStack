function sidebarSetup() {
    const sidebar = document.querySelector(".sidebar-container")
  
    if (!sidebar) {
      return
    }
  
    const sidebarButton = document.querySelector(".navbar__sidebar-button")
    sidebarButton.addEventListener("click", () => {
      if (sidebar.classList.contains("-gone")) {
        sidebar.classList.remove("-gone")
      } else {
        sidebar.classList.add("-gone")
      }
    })
  
    const accountSection = sidebar.querySelector(".sidebar__account-section")
  
    if (!accountSection) {
      return
    }
  
    const accountButton = accountSection.querySelector(".sidebar__expandable")
    accountButton.addEventListener("click", () => {
      const collapsable = accountSection.querySelector(".sidebar__collapsable")
      const buttonIcon = accountButton.querySelector(".icon-element__icon")
  
      if (collapsable.classList.contains("-gone")) {
        collapsable.classList.remove("-gone")
        buttonIcon.style.transform = "rotate(180deg)"
      } else {
        collapsable.classList.add("-gone")
        buttonIcon.style.transform = "none"
      }
    })
  
    const contentSection = sidebar.querySelector(".sidebar__content-section")
    const contentButton = contentSection.querySelector(".sidebar__expandable")
    contentButton.addEventListener("click", () => {
      const collapsable = contentSection.querySelector(".sidebar__collapsable")
      const buttonIcon = contentButton.querySelector(".icon-element__icon")
  
      if (collapsable.classList.contains("-gone")) {
        collapsable.classList.remove("-gone")
        buttonIcon.style.transform = "rotate(180deg)"
      } else {
        collapsable.classList.add("-gone")
        buttonIcon.style.transform = "none"
      }
    })
}

export { sidebarSetup }