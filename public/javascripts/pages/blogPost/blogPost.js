import prism from "prismjs"
import { updateReactionButtons, fetchReaction } from "./reaction.js"
import { 
  allCommentsReactionFormListeners, 
  defaultCommentCreateFormListeners 
} from './comment.js'
import { PromiseQueue } from "../../utils/queue.js"

function blogPostReactionFormListeners(reactionQueue) {
  const user = backendData.loginUser
  const reaction = backendData.blogPost.reaction
  let reactionId = reaction ? reaction._id : null
  const reactionType = reaction ? reaction.reaction_type : null

  const likeButtons = document.querySelectorAll(".blog-post__like-button")
  let liked = false

  if (reactionType === "Like") {
    liked = true

    for (const button of likeButtons) {
      button.classList.add("-colorful")
    }
  }

  const dislikeButtons = document.querySelectorAll(".blog-post__dislike-button")
  let disliked = false

  if (reactionType === "Dislike") {
    disliked = true

    for (const button of dislikeButtons) {
      button.classList.add("-colorful")
    }
  }

  let responsiveLike = liked
  let responsiveDislike = disliked
  const likeReactionForms = document.querySelectorAll(
    ".blog-post__like-reaction-form",
  )

  for (const form of likeReactionForms) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault()

      updateReactionButtons(
        responsiveDislike,
        responsiveLike,
        likeButtons,
        dislikeButtons,
      )
      responsiveDislike = false
      responsiveLike = !responsiveLike

      if (user === undefined) {
        // No need to update variables disliked and liked
        // They only matter if the user is logged in
        return
      }

      reactionQueue.enqueue(async () => {
        await fetchReaction(form, disliked, liked, reactionId, user, (data) => {
          reactionId = data.reactionId
        })
        disliked = false
        liked = !liked
      })
    })
  }
  const dislikeReactionForms = document.querySelectorAll(
    ".blog-post__dislike-reaction-form",
  )

  for (const form of dislikeReactionForms) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault()

      updateReactionButtons(
        responsiveLike,
        responsiveDislike,
        dislikeButtons,
        likeButtons,
      )
      responsiveLike = false
      responsiveDislike = !responsiveDislike

      if (user === undefined) {
        // No need to update variables disliked and liked
        // They only matter if the user is logged in
        return
      }

      reactionQueue.enqueue(async () => {
        await fetchReaction(form, liked, disliked, reactionId, user, (data) => {
          reactionId = data.reactionId
        })
        liked = false
        disliked = !disliked
      })
    })
  }
}

function highlightCodeBlocks() {
  const codeBlocks = document.querySelectorAll(
    ".blog-post__content pre:has(> code)",
  )

  for (const block of codeBlocks) {
    prism.highlightElement(block)
  }
}

function blogPostSetup() {
  const blogPostPage = document.querySelector(".blog-post-page")

  if (!blogPostPage) {
    return
  }

  // Used to queue reactions
  const reactionQueue = PromiseQueue()

  blogPostReactionFormListeners(reactionQueue)
  defaultCommentCreateFormListeners()
  allCommentsReactionFormListeners(reactionQueue)
  highlightCodeBlocks()
}

export { blogPostSetup }
