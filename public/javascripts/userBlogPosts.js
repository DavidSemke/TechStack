function userBlogPostsSearchbarListeners() {
    const searchbar = document.querySelector(
        '.user-blog-posts-page__searchbar'
    )

    searchbar.addEventListener('change', (event) => {
        const blogPostItems = Array.from(
            document.querySelectorAll('.blog-post-item')
        )
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
                const regex = new RegExp(title)
                
                if (regex.test(searchValue))
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
        'user-blog-posts-page__sort-selector'
    ) 

    sortSelector.addEventListener('change', (event) => {
        const sortValue = event
            .currentTarget
            .value
            .trim()
            .toLowerCase()
        sortBlogPostList(
            sortValue, 
            '.user-blog-posts__published .blog-post-list'
        )
        sortBlogPostList(
            sortValue, 
            '.user-blog-posts__unpublished .blog-post-list'
        )
    })
}

function sortBlogPostList(sortBy, blogPostList) {
    const blogPostItems = Array.from(
        blogPostList.querySelectorAll('.blog-post-item')
    )
    
    switch (sortBy) {
        case 'title':
            blogPostItems.sort((a, b) => {
                const titleA = a.querySelector(
                    '.blog-post-item__title'
                ).textContent
                const titleB = b.querySelector(
                    '.blog-post-item__title'
                ).textContent

                return titleA.localeCompare(titleB)
            })
            break
        case 'last-mod-date':
            blogPostItems.sort((a, b) => {
                const dateA = a.querySelector(
                    '.blog-post-item__last-modified'
                ).textContent
                const dateB = b.querySelector(
                    '.blog-post-item__last-modified'
                ).textContent

                return compareDateStrings(dateA, dateB)
            })
            break
        case 'publish-date':
            blogPostItems.sort((a, b) => {
                const dateA = a.querySelector(
                    '.blog-post-item__published'
                ).textContent
                const dateB = b.querySelector(
                    '.blog-post-item__published'
                ).textContent

                return compareDateStrings(dateA, dateB)
            })
            break 
        case 'likes':
            blogPostItems.sort((a, b) => {
                const likesA = a.querySelector(
                    '.blog-post-item__likes .icon-list__label'
                ).textContent
                const likesB = b.querySelector(
                    '.blog-post-item__likes .icon-list__label'
                ).textContent

                return parseInt(likesA) - parseInt(likesB)
            })
            break
        case 'dislikes':
            blogPostItems.sort((a, b) => {
                const dislikesA = a.querySelector(
                    '.blog-post-item__dislikes .icon-list__label'
                ).textContent
                const dislikesB = b.querySelector(
                    '.blog-post-item__dislikes .icon-list__label'
                ).textContent

                return parseInt(dislikesA) - parseInt(dislikesB)
            })
            break
        case 'total-comments':
            blogPostItems.sort((a, b) => {
                const commentsA = a.querySelector(
                    '.blog-post-item__total-comments .icon-list__label'
                ).textContent
                const commentsB = b.querySelector(
                    '.blog-post-item__total-comments .icon-list__label'
                ).textContent

                return parseInt(commentsA) - parseInt(commentsB)
            })
            break
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
        '.user-blog-posts__published'
    )
    const unpublished = document.querySelector(
        '.user-blog-posts__unpublished'
    )
    
    const publishedTab = document.querySelector(
        '.user-blog-posts__published-tab'
    )

    publishedTab.addEventListener('click', () => {
        if (published.classList.contains('-gone')) {
            unpublished.classList.add('-gone')
            published.classList.remove('-gone')
        }
    })

    const unpublishedTab = document.querySelector(
        '.user-blog-posts__unpublished-tab'
    )

    unpublishedTab.addEventListener('click', () => {
        if (unpublished.classList.contains('-gone')) {
            published.classList.add('-gone')
            unpublished.classList.remove('-gone')
        }
    }) 
}

function userBlogPostsListListeners(blogPostList) {
    const items = blogPostList.querySelector(
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
        (blogPost) => blogPost._id === itemId
    )

    const fragmentTitle = document.querySelector(
        '.blog-post-fragment__title'
    )
    fragmentTitle.textContent = blogPost.title


    const fragmentThumbnail = document.querySelector(
        '.blog-post-fragment__thumbnail > img'
    )
    const pic = blogPost.thumbnail
    const base64 = Buffer.from(pic.data).toString('base64')
    const dataUri = `data:${pic.contentType};base64,${base64}`
    fragmentThumbnail.src = dataUri

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
        'user-blog-posts__published'
    )
    const unpublishedList = document.querySelector(
        'user-blog-posts__unpublished'
    )
    userBlogPostsListListeners(publishedList)
    userBlogPostsListListeners(unpublishedList)
}

export {
    userBlogPostsSetup
}