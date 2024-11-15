import { formFetch } from "../../utils/fetch.js"

function updateReactionButtons(
  toggleReaction,
  removeReaction,
  primaryButtons,
  secondaryButtons,
) {
  if (removeReaction) {
    for (const button of primaryButtons) {
      button.classList.remove("-colorful")

      const label = button.querySelector(".icon-element__label")
      label.textContent = parseInt(label.textContent) - 1
    }
  } else if (toggleReaction) {
    for (const button of primaryButtons) {
      button.classList.add("-colorful")

      const label = button.querySelector(".icon-element__label")
      label.textContent = parseInt(label.textContent) + 1
    }

    for (const button of secondaryButtons) {
      button.classList.remove("-colorful")

      const label = button.querySelector(".icon-element__label")
      label.textContent = parseInt(label.textContent) - 1
    }
  } else {
    for (const button of primaryButtons) {
      button.classList.add("-colorful")

      const label = button.querySelector(".icon-element__label")
      label.textContent = parseInt(label.textContent) + 1
    }
  }
}

// If (toggleReaction && removeReaction) === false, then reactionId === null
async function fetchReaction(
  form,
  toggleReaction,
  removeReaction,
  reactionId,
  user,
  onResponseJson,
) {
  const reactionsPath = `/users/${user.username}/reactions`

  if (removeReaction) {
    await formFetch(
      `${reactionsPath}/${reactionId}`,
      "delete",
      form,
      onResponseJson,
    )
  } else if (toggleReaction) {
    await formFetch(
      `${reactionsPath}/${reactionId}`,
      "put",
      form,
      onResponseJson,
    )
  } else {
    await formFetch(reactionsPath, "post", form, onResponseJson)
  }
}

export {
  updateReactionButtons,
  fetchReaction
}