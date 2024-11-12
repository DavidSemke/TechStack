import { debounce } from "../utils/debounce.js"

function sidebarListeners() {
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

function navbarListeners() {
  const navbar = document.querySelector(".navbar")

  if (!navbar) {
    return
  }

  const searchbarInput = navbar.querySelector(".searchbar__input")

  if (!searchbarInput) {
    return
  }

  const navbarDropdownContainer = document.querySelector(
    ".navbar-dropdown-container",
  )
  const onInput = () => {
    const encodedWords = searchbarInput.value
      .split(" ")
      .filter((word) => word)
      .map((word) => encodeURIComponent(word))

    if (!encodedWords.length) {
      navbarDropdownContainer.innerHTML = ""
      return
    }

    const href = "/blog-posts?keywords=" + encodedWords.join(",")

    fetch(href, { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error - Status: ${res.status}`)
        }

        return res.json()
      })
      .then((data) => {
        navbarDropdownContainer.innerHTML = data.renderedHTML
      })
      .catch((error) => {
        throw error
      })
  }

  searchbarInput.addEventListener("input", debounce(onInput, 500))
  searchbarInput.addEventListener("blur", (event) => {
    const newFocus = event.relatedTarget

    // check to see if link has been clicked
    if (!newFocus || !navbarDropdownContainer.contains(newFocus)) {
      navbarDropdownContainer.classList.add("-gone")
      navbar.classList.remove("-expanded-searchbar")
    }
  })
  searchbarInput.addEventListener("focus", () => {
    navbarDropdownContainer.classList.remove("-gone")
  })

  // Add listener to search button
  // Search button is only available on smaller screens
  const searchButton = navbar.querySelector(".navbar__search-button")
  searchButton.addEventListener("click", () => {
    navbar.classList.add("-expanded-searchbar")
    searchbarInput.focus()
  })

  // Undo changes caused by using search button when the screen
  // size surpasses the max-width in which it is available
  let mobileBreakPt = getComputedStyle(
    document.documentElement,
  ).getPropertyValue("--bp0")
  mobileBreakPt = parseInt(mobileBreakPt, 10) + 1 + "px"

  const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakPt})`)
  mediaQuery.addEventListener("change", () => {
    navbar.classList.remove("-expanded-searchbar")
  })
}

export { sidebarListeners, navbarListeners }
