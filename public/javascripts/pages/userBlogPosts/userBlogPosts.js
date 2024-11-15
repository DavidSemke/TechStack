import prism from "prismjs"
import { sortBlogPostList } from "./sort.js"
import { debounce } from "../../utils/debounce.js"

function userBlogPostsSearchbarListeners(page) {
  const searchbar = page.querySelector(
    ".user-blog-posts-page__searchbar .searchbar__input",
  )
  const onInput = (event) => {
    const blogPostItems = page.querySelectorAll(".blog-post-item")
    const searchValue = event.target.value.trim().toLowerCase()

    if (searchValue === "") {
      for (const item of blogPostItems) {
        item.classList.remove("-gone")
      }
    } else {
      for (const item of blogPostItems) {
        const title = item
          .querySelector(".blog-post-item__title")
          .textContent.toLowerCase()
        const regex = new RegExp(searchValue)

        if (regex.test(title)) item.classList.remove("-gone")
        else {
          item.classList.add("-gone")
        }
      }
    }
  }

  searchbar.addEventListener("input", debounce(onInput, 500))
  searchbar.addEventListener("blur", () => {
    page.classList.remove("-expanded-searchbar")
  })

  // Add listener to search button
  // Search button is only available on smaller screens
  const searchButton = page.querySelector(
    ".user-blog-posts-page__search-button",
  )
  searchButton.addEventListener("click", () => {
    page.classList.add("-expanded-searchbar")
    searchbar.focus()
  })

  // Undo changes caused by using search button when the screen
  // size surpasses the max-width in which it is available
  let mobileBreakPt = getComputedStyle(
    document.documentElement,
  ).getPropertyValue("--bp0")
  mobileBreakPt = parseInt(mobileBreakPt, 10) + 1 + "px"

  const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakPt})`)
  mediaQuery.addEventListener("change", () => {
    page.classList.remove("-expanded-searchbar")
  })
}

function userBlogPostsSortSelectorListeners(page) {
  const sortSelector = page.querySelector(
    ".user-blog-posts-page__sort-selector",
  )
  const publishedList = page.querySelector(
    ".user-blog-posts__published.blog-post-list",
  )
  const unpublishedList = page.querySelector(
    ".user-blog-posts__unpublished.blog-post-list",
  )

  sortSelector.addEventListener("change", (event) => {
    const sortValue = event.target.value.trim().toLowerCase()

    sortBlogPostList(sortValue, publishedList, true)
    sortBlogPostList(sortValue, unpublishedList)
  })
}

function userBlogPostsTabListeners(page) {
  const published = page.querySelector(".user-blog-posts__published-container")
  const unpublished = page.querySelector(
    ".user-blog-posts__unpublished-container",
  )

  const publishedTab = page.querySelector(".user-blog-posts__published-tab")
  publishedTab.classList.add("-bold")

  const unpublishedTab = page.querySelector(".user-blog-posts__unpublished-tab")

  publishedTab.addEventListener("click", () => {
    publishedTab.classList.add("-bold")
    unpublishedTab.classList.remove("-bold")

    unpublished.classList.add("-gone")
    published.classList.remove("-gone")
  })

  unpublishedTab.addEventListener("click", () => {
    unpublishedTab.classList.add("-bold")
    publishedTab.classList.remove("-bold")

    published.classList.add("-gone")
    unpublished.classList.remove("-gone")
  })
}

function userBlogPostsListListeners(page, blogPostList) {
  if (blogPostList === null) {
    return
  }

  const items = blogPostList.querySelectorAll(".blog-post-item")
  const rightPanel = document.querySelector(".user-blog-posts__right")

  for (const item of items) {
    item.addEventListener("click", (event) => {
      onItemClick(event, page, rightPanel)
    })

    const editButton = item.querySelector(".blog-post-item__edit-button")
    editButton.addEventListener("click", (event) => {
      event.stopPropagation()
    })

    const deleteButton = item.querySelector(".blog-post-item__delete-button")
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation()
      onDeleteButtonClick(item, blogPostList)
    })
  }
}

function userBlogPostsLeftViewButtonListeners(page) {
  // Add listener to left view button
  // Left view button is only available on smaller screens
  const leftViewButton = page.querySelector(
    ".user-blog-posts-page__left-view-button",
  )
  leftViewButton.addEventListener("click", () => {
    page.classList.remove("-right-view")
  })

  // Undo changes caused by using button when the screen
  // size surpasses the max-width in which it is available
  let mobileBreakPt = getComputedStyle(
    document.documentElement,
  ).getPropertyValue("--bp1")
  mobileBreakPt = parseInt(mobileBreakPt, 10) + 1 + "px"
  const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakPt})`)
  mediaQuery.addEventListener("change", () => {
    page.classList.remove("-right-view")
  })
}

function onItemClick(event, page, rightPanel) {
  const itemId = event.currentTarget.id
  const blogPosts = [
    ...backendData.publishedBlogPosts,
    ...backendData.unpublishedBlogPosts,
  ]
  const blogPost = blogPosts.find(
    (blogPost) => blogPost._id.toString() === itemId,
  )

  const fragmentTitle = document.querySelector(".blog-post-fragment__title")
  fragmentTitle.innerHTML = blogPost.title

  const fragmentThumbnail = document.querySelector(
    ".blog-post-fragment__thumbnail",
  )
  fragmentThumbnail.innerHTML = ""

  if (blogPost.thumbnail) {
    const pic = blogPost.thumbnail
    const dataUri = `data:${pic.contentType};base64,${pic.data}`
    const img = document.createElement("img")
    img.src = dataUri

    fragmentThumbnail.classList.remove("-empty")
    fragmentThumbnail.append(img)
  } else {
    fragmentThumbnail.classList.add("-empty")
    fragmentThumbnail.textContent = "Your thumbnail appears here"
  }

  const fragmentContent = document.querySelector(".blog-post-fragment__content")
  fragmentContent.innerHTML = blogPost.content

  // Apply code highlights
  const codeBlocks = fragmentContent.querySelectorAll("pre:has(> code)")

  for (const block of codeBlocks) {
    prism.highlightElement(block)
  }

  // Reveal fragment
  rightPanel.classList.remove("-hidden")

  // Make sure screen width less than or equal to bp1
  // If so, left-view-button is visible in toolbar
  let bp1 = getComputedStyle(document.documentElement).getPropertyValue("--bp1")
  bp1 = parseInt(bp1, 10)

  if (screen.width <= bp1) {
    page.classList.add("-right-view")
  }
}

function onDeleteButtonClick(item, blogPostList) {
  fetch(window.location.href + "/" + item.id, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error - Status: ${res.status}`)
      }

      // remove deleted blog post from view
      blogPostList.removeChild(item)

      // add 'no blog posts' note
      if (blogPostList.childElementCount === 0) {
        const parent = blogPostList.parentElement
        parent.removeChild(blogPostList)

        const p = document.createElement("p")
        p.textContent = "You have no blog posts here."
        parent.append(p)
      }
    })
    .catch((error) => {
      throw error
    })
}

function userBlogPostsSetup() {
  const page = document.querySelector(".user-blog-posts-page")

  if (!page) {
    return
  }

  userBlogPostsSearchbarListeners(page)
  userBlogPostsSortSelectorListeners(page)
  userBlogPostsLeftViewButtonListeners(page)
  userBlogPostsTabListeners(page)

  const publishedList = document.querySelector(".user-blog-posts__published")
  const unpublishedList = document.querySelector(
    ".user-blog-posts__unpublished",
  )
  userBlogPostsListListeners(page, publishedList)
  userBlogPostsListListeners(page, unpublishedList)
}

export { userBlogPostsSetup }