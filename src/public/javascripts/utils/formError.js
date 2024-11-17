function updateErrorContainer(formCompType, inputId, errors) {
  // remove previous errors if present
  removeErrorContainer(formCompType, inputId)

  const errorContainerClassId = `${formCompType}__error-container`
  const inputField = document.getElementById(inputId)
  const inputContainer = inputField.parentElement

  if (errors) {
    const errorContainer = document.createElement("div")
    errorContainer.classList.add(errorContainerClassId)

    for (const error of errors) {
      const errorDiv = document.createElement("div")
      errorDiv.classList.add(`${formCompType}__error`)
      errorDiv.textContent = error.msg
      errorContainer.append(errorDiv)
    }

    inputContainer.append(errorContainer)
  }
}

function removeErrorContainer(formCompType, inputId) {
  const errorContainerClassId = `${formCompType}__error-container`
  const inputField = document.getElementById(inputId)
  const inputContainer = inputField.parentElement
  const errorContainer = inputContainer.querySelector(
    "." + errorContainerClassId,
  )

  if (errorContainer) {
    inputContainer.removeChild(errorContainer)
  }
}

export { updateErrorContainer, removeErrorContainer }
