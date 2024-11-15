import { updateReactionButtons, fetchReaction } from "./reaction.js"
import { formFetch } from "../../utils/fetch.js"
import { updateErrorContainer } from "../../utils/formError.js"

function allCommentsReactionFormListeners(reactionQueue) {
  const commentCards = document.querySelectorAll(".comment-card")
  // note that blogPost comments are non-replies only
  // replies are available from the comment replied to
  const comments = backendData.blogPost.comments

  for (let i = 0, j = 0, k = 0; i < commentCards.length; i++) {
    const commentCard = commentCards[i]
    let commentData = comments[j]
    const replies = commentData.replies

    if (!replies.length) {
      j++
    } else if (k > 0) {
      commentData = replies[k - 1]
      k++

      if (k === replies.length + 1) {
        k = 0
        j++
      }
    } else {
      k++
    }

    commentReactionFormListeners(commentCard, commentData, reactionQueue)
  }
}

function commentReactionFormListeners(commentCard, commentData, reactionQueue) {
  if (commentData.replies && commentData.replies.length) {
    const viewRepliesButton = commentCard.querySelector(
      ".comment-card__view-replies-button",
    )
    viewRepliesButton.addEventListener("click", () => {
      const sibling = commentCard.nextSibling
      let replyContainer = sibling

      if (sibling.classList.contains("blog-post-page__reply-create-form")) {
        replyContainer = sibling.nextSibling
      }

      if (replyContainer.classList.contains("-gone")) {
        replyContainer.classList.remove("-gone")
      } else {
        replyContainer.classList.add("-gone")
      }
    })
  }

  const replyButton = commentCard.querySelector(".comment-card__reply-button")

  if (replyButton) {
    replyButton.addEventListener("click", () => {
      // Remove reply-create-form, if it exists
      // The reply-create-form is created when clicking
      // any comment reply button
      const replyCreateForm = document.querySelector(
        ".blog-post-page__reply-create-form",
      )

      if (replyCreateForm) {
        if (replyCreateForm.previousSibling !== commentCard) {
          createCommentCreateForm(commentCard, commentData)
        }

        replyCreateForm.parentElement.removeChild(replyCreateForm)
      } else {
        createCommentCreateForm(commentCard, commentData)
      }
    })
  }

  const likeButton = commentCard.querySelector(".comment-card__like-button")
  const dislikeButton = commentCard.querySelector(
    ".comment-card__dislike-button",
  )

  const user = backendData.loginUser
  const reaction = commentData.reaction
  let reactionId = reaction ? reaction._id : null
  const reactionType = reaction ? reaction.reaction_type : null
  let liked = false
  let disliked = false

  if (reactionType === "Like") {
    liked = true
    likeButton.classList.add("-colorful")
  } else if (reactionType === "Dislike") {
    disliked = true
    dislikeButton.classList.add("-colorful")
  }

  let responsiveLike = liked
  let responsiveDislike = disliked
  const likeReactionForm = commentCard.querySelector(
    ".comment-card__like-reaction-form",
  )
  likeReactionForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    updateReactionButtons(
      responsiveDislike,
      responsiveLike,
      [likeButton],
      [dislikeButton],
    )
    responsiveDislike = false
    responsiveLike = !responsiveLike

    if (user === undefined) {
      // No need to update variables disliked and liked
      // They only matter if the user is logged in
      return
    }

    reactionQueue.enqueue(async () => {
      await fetchReaction(
        likeReactionForm,
        disliked,
        liked,
        reactionId,
        user,
        (data) => {
          reactionId = data.reactionId
        },
      )
      disliked = false
      liked = !liked
    })
  })

  const dislikeReactionForm = commentCard.querySelector(
    ".comment-card__dislike-reaction-form",
  )
  dislikeReactionForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    updateReactionButtons(
      responsiveLike,
      responsiveDislike,
      [dislikeButton],
      [likeButton],
    )
    responsiveLike = false
    responsiveDislike = !responsiveDislike

    if (user === undefined) {
      // No need to update variables disliked and liked
      // They only matter if the user is logged in
      return
    }

    reactionQueue.enqueue(async () => {
      await fetchReaction(
        dislikeReactionForm,
        liked,
        disliked,
        reactionId,
        user,
        (data) => {
          reactionId = data.reactionId
        },
      )
      liked = false
      disliked = !disliked
    })
  })
}

function createCommentCreateForm(replyToCard, replyToData) {
  const form = document.querySelector(".blog-post-page__comment-create-form")
  const formClone = form.cloneNode(true)

  const hidden = document.createElement("input")
  hidden.name = "reply-to"
  hidden.type = "hidden"
  hidden.value = replyToData._id

  formClone.append(hidden)
  formClone.classList.remove("blog-post-page__comment-create-form")
  formClone.classList.add("blog-post-page__reply-create-form")
  commentCreateFormListeners(formClone)

  const commentString = replyToCard.parentElement

  commentString.insertBefore(formClone, replyToCard.nextSibling)
}

function defaultCommentCreateFormListeners() {
  const form = document.querySelector(".blog-post-page__comment-create-form")
  commentCreateFormListeners(form)
}

function commentCreateFormListeners(commentCreateForm) {
  commentCreateForm.addEventListener("submit", (event) => {
    event.preventDefault()

    formFetch(
      `/blog-posts/${backendData.blogPost._id}/comments`,
      "post",
      commentCreateForm,
      (data) => {
        updateErrorContainer("form-textarea", "content", data.errors)

        if (data.errors) {
          return
        }

        if (
          commentCreateForm.classList.contains(
            "blog-post-page__reply-create-form",
          )
        ) {
          let replyContainer = commentCreateForm.nextSibling

          if (!replyContainer) {
            replyContainer = document.createElement("div")
            replyContainer.classList.add("blog-post-page__reply-container")
            commentCreateForm.parentElement.append(replyContainer)
          }

          const replyCards = replyContainer.querySelectorAll(".comment-card")
          replyContainer.innerHTML = data.renderedHTML
          const newCommentCard = replyContainer.querySelector(".comment-card")
          commentReactionFormListeners(newCommentCard, data.commentData)

          for (const replyCard of replyCards) {
            replyContainer.append(replyCard)
          }

          if (replyContainer.classList.contains("-gone")) {
            replyContainer.classList.remove("-gone")
          }

          commentCreateForm.parentElement.removeChild(commentCreateForm)
        } else {
          const commentString = document.createElement("div")
          commentString.classList.add("blog-post-page__comment-string")
          commentString.innerHTML = data.renderedHTML
          const newCommentCard = commentString.querySelector(".comment-card")
          commentReactionFormListeners(newCommentCard, data.commentData)
          commentCreateForm.parentElement.insertBefore(
            commentString,
            commentCreateForm.nextSibling,
          )
        }
      },
    )
  })
}

export { allCommentsReactionFormListeners, defaultCommentCreateFormListeners }
