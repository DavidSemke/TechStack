function userBlogPostsSearchbarListeners() {
    const searchbar = document.querySelector(
        '.user-blog-posts-page__searchbar .searchbar__input'
    )

    searchbar.addEventListener('input', (event) => {
        const blogPostItems = document.querySelectorAll('.blog-post-item')
        const searchValue = event
            .currentTarget
            .value
            .trim()
            .toLowerCase()

        if (searchValue === '') {
            for (const item of blogPostItems) {
                item.classList.remove('-gone')
            }
        }
        else {
            for (const item of blogPostItems) {
                const title = item.querySelector('.blog-post-item__title')
                    .textContent
                    .toLowerCase()
                const regex = new RegExp(searchValue)
                
                if (regex.test(title))
                    item.classList.remove('-gone')
                else {
                    item.classList.add('-gone')
                }
            }
        }
    })
}

function userBlogPostsSortSelectorListeners() {
    const sortSelector = document.querySelector(
        '.user-blog-posts-page__sort-selector'
    )
    const publishedList = document.querySelector(
        '.user-blog-posts__published.blog-post-list'
    )
    const unpublishedList = document.querySelector(
        '.user-blog-posts__unpublished.blog-post-list'
    )

    sortSelector.addEventListener('change', (event) => {
        const sortValue = event
            .target
            .value
            .trim()
            .toLowerCase()
        
        sortBlogPostList(
            sortValue, 
            publishedList,
            true
        )
        sortBlogPostList(
            sortValue, 
            unpublishedList
        )
        
    })
}

function sortBlogPostList(sortBy, blogPostList, published=false) {
    const blogPostItems = Array.from(
        blogPostList.querySelectorAll('.blog-post-item')
    )

    if (sortBy === 'title') {
        blogPostItems.sort((a, b) => {
            const titleA = a.querySelector(
                '.blog-post-item__title'
            ).textContent
            const titleB = b.querySelector(
                '.blog-post-item__title'
            ).textContent

            return titleB.localeCompare(titleA)
        })
    }
    else if (sortBy === 'last-mod-date') {
        blogPostItems.sort((a, b) => {
            const dateA = a.querySelector(
                '.blog-post-item__last-modified'
            ).textContent
            const dateB = b.querySelector(
                '.blog-post-item__last-modified'
            ).textContent

            return compareDateStrings(dateB, dateA)
        })
    }
    else if (published) {
        switch (sortBy) {
            case 'publish-date':
                blogPostItems.sort((a, b) => {
                    const dateA = a.querySelector(
                        '.blog-post-item__published'
                    ).textContent
                    const dateB = b.querySelector(
                        '.blog-post-item__published'
                    ).textContent

                    return compareDateStrings(dateB, dateA)
                })
                break 
            case 'likes':
                blogPostItems.sort((a, b) => {
                    const likesA = a.querySelector(
                        '.blog-post-item__likes .icon-element__label'
                    ).textContent
                    const likesB = b.querySelector(
                        '.blog-post-item__likes .icon-element__label'
                    ).textContent

                    return parseInt(likesB) - parseInt(likesA)
                })
                break
            case 'dislikes':
                blogPostItems.sort((a, b) => {
                    const dislikesA = a.querySelector(
                        '.blog-post-item__dislikes .icon-element__label'
                    ).textContent
                    const dislikesB = b.querySelector(
                        '.blog-post-item__dislikes .icon-element__label'
                    ).textContent

                    return parseInt(dislikesB) - parseInt(dislikesA)
                })
                break
            case 'total-comments':
                blogPostItems.sort((a, b) => {
                    const commentsA = a.querySelector(
                        '.blog-post-item__total-comments .icon-element__label'
                    ).textContent
                    const commentsB = b.querySelector(
                        '.blog-post-item__total-comments .icon-element__label'
                    ).textContent

                    return parseInt(commentsB) - parseInt(commentsA)
                })
                break
        }
    }

    blogPostList.innerHTML = ''
    blogPostList.append(...blogPostItems)
}

function compareDateStrings(a, b) {
    const dateA = a
        .split('-')
        .map((str) => parseInt(str))
    const dateB = b
        .split('-')
        .map((str) => parseInt(str))

    let result = 0

    for (let i=0; i<dateA.length; i++) {
        if (dateA[i] < dateB[i]) {
            result = -1
            break
        }
        else if (dateA[i] > dateB[i]) {
            result = 1
            break
        }
    }

    return result
}

function userBlogPostsTabListeners() {
    const published = document.querySelector(
        '.user-blog-posts__published-container'
    )
    const unpublished = document.querySelector(
        '.user-blog-posts__unpublished-container'
    )
    
    const publishedTab = document.querySelector(
        '.user-blog-posts__published-tab'
    )
    publishedTab.classList.add('-bold')

    const unpublishedTab = document.querySelector(
        '.user-blog-posts__unpublished-tab'
    )

    publishedTab.addEventListener('click', () => {
        publishedTab.classList.add('-bold')
        unpublishedTab.classList.remove('-bold')

        unpublished.classList.add('-gone')
        published.classList.remove('-gone')
        
    })

    unpublishedTab.addEventListener('click', () => {
        unpublishedTab.classList.add('-bold')
        publishedTab.classList.remove('-bold')

        published.classList.add('-gone')
        unpublished.classList.remove('-gone') 
    }) 
}

function userBlogPostsListListeners(blogPostList) {
    if (blogPostList === null) {
        return
    }

    const items = blogPostList.querySelectorAll(
        '.blog-post-item'
    )
    const rightPanel = document.querySelector(
        '.user-blog-posts__right'
    )

    for (const item of items) {

        item.addEventListener('click', (event) => {
            onItemClick(event, rightPanel)
        })

        const deleteButton = item.querySelector(
            '.blog-post-item__delete-button'
        )
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation()
            onDeleteButtonClick(item, blogPostList)
        })
    }
}

function onItemClick(event, rightPanel) {
    const itemId = event.currentTarget.id
    const blogPosts = [
        ...backendData.publishedBlogPosts,
        ...backendData.unpublishedBlogPosts
    ]
    const blogPost = blogPosts.find(
        (blogPost) => blogPost._id.toString() === itemId
    )

    const fragmentTitle = document.querySelector(
        '.blog-post-fragment__title'
    )
    fragmentTitle.innerHTML = blogPost.title

    const fragmentThumbnail = document.querySelector(
        '.blog-post-fragment__thumbnail'
    )
    fragmentThumbnail.innerHTML = ''

    if (blogPost.thumbnail) {
        const pic = blogPost.thumbnail
        const dataUri = `data:${pic.contentType};base64,${pic.data}`
        const img = document.createElement('img')
        img.src = dataUri
        
        fragmentThumbnail.classList.remove('-empty')
        fragmentThumbnail.append(img)
    }
    else {
        fragmentThumbnail.classList.add('-empty')
        fragmentThumbnail.textContent = 'Your thumbnail appears here'
    }

    const fragmentContent = document.querySelector(
        '.blog-post-fragment__content'
    )
    fragmentContent.innerHTML = blogPost.content

    rightPanel.classList.remove('-hidden')
}

function onDeleteButtonClick(item, blogPostList) {
    fetch(window.location.href + '/' + item.id, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error - Status: ${res.status}`)
            }
            
            // remove deleted blog post from view
            blogPostList.removeChild(item)

            // add 'no blog posts' note
            if (blogPostList.childElementCount === 0) {
                const parent = blogPostList.parentElement
                parent.removeChild(blogPostList)

                const p = document.createElement('p')
                p.textContent = 'You have no blog posts here.'
                parent.append(p)
            }
        })
        .catch(error => {
            throw error
        })   
}

function userBlogPostsSetup() {
    const userBlogPostsPage = document.querySelector(
        '.user-blog-posts-page'
    )

    if (!userBlogPostsPage) {
        return
    }

    userBlogPostsSearchbarListeners()
    userBlogPostsSortSelectorListeners()
    userBlogPostsTabListeners()

    const publishedList = document.querySelector(
        '.user-blog-posts__published'
    )
    const unpublishedList = document.querySelector(
        '.user-blog-posts__unpublished'
    )
    userBlogPostsListListeners(publishedList)
    userBlogPostsListListeners(unpublishedList)
}

export {
    userBlogPostsSetup
}