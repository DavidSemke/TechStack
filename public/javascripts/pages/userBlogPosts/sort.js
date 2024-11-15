function sortBlogPostList(sortBy, blogPostList, published = false) {
    if (blogPostList === null) {
      return
    }
  
    const blogPostItems = Array.from(
      blogPostList.querySelectorAll(".blog-post-item"),
    )
  
    if (sortBy === "title") {
      blogPostItems.sort((a, b) => {
        const titleA = a.querySelector(".blog-post-item__title").textContent
        const titleB = b.querySelector(".blog-post-item__title").textContent
  
        return titleB.localeCompare(titleA)
      })
    } else if (sortBy === "last-mod-date") {
      blogPostItems.sort((a, b) => {
        const dateA = a.querySelector(
          ".blog-post-item__last-modified",
        ).textContent
        const dateB = b.querySelector(
          ".blog-post-item__last-modified",
        ).textContent
  
        return compareDateStrings(dateB, dateA)
      })
    } else if (published) {
      switch (sortBy) {
        case "publish-date":
          blogPostItems.sort((a, b) => {
            const dateA = a.querySelector(
              ".blog-post-item__published",
            ).textContent
            const dateB = b.querySelector(
              ".blog-post-item__published",
            ).textContent
  
            return compareDateStrings(dateB, dateA)
          })
          break
        case "likes":
          blogPostItems.sort((a, b) => {
            const likesA = a.querySelector(
              ".blog-post-item__likes .icon-element__label",
            ).textContent
            const likesB = b.querySelector(
              ".blog-post-item__likes .icon-element__label",
            ).textContent
  
            return parseInt(likesB) - parseInt(likesA)
          })
          break
        case "dislikes":
          blogPostItems.sort((a, b) => {
            const dislikesA = a.querySelector(
              ".blog-post-item__dislikes .icon-element__label",
            ).textContent
            const dislikesB = b.querySelector(
              ".blog-post-item__dislikes .icon-element__label",
            ).textContent
  
            return parseInt(dislikesB) - parseInt(dislikesA)
          })
          break
        case "total-comments":
          blogPostItems.sort((a, b) => {
            const commentsA = a.querySelector(
              ".blog-post-item__total-comments .icon-element__label",
            ).textContent
            const commentsB = b.querySelector(
              ".blog-post-item__total-comments .icon-element__label",
            ).textContent
  
            return parseInt(commentsB) - parseInt(commentsA)
          })
          break
      }
    }
  
    blogPostList.innerHTML = ""
    blogPostList.append(...blogPostItems)
  }
  
  function compareDateStrings(a, b) {
    const dateA = a.split("-").map((str) => parseInt(str))
    const dateB = b.split("-").map((str) => parseInt(str))
  
    let result = 0
  
    for (let i = 0; i < dateA.length; i++) {
      if (dateA[i] < dateB[i]) {
        result = -1
        break
      } else if (dateA[i] > dateB[i]) {
        result = 1
        break
      }
    }
  
    return result
  }

export {
    sortBlogPostList
}