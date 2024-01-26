function updateErrorContainer(formCompType, inputId, errors) {
    // remove previous errors if present
    const errorContainerClassId = `${formCompType}__error-container`
    const inputField = document.getElementById(inputId)
    const nextSibling = inputField.nextSibling

    // if error container present, remove it
    if (nextSibling && nextSibling.classList.contains(errorContainerClassId)) {
        nextSibling.parentElement.removeChild(nextSibling)
    }

    if (errors) {
        const errorContainer = document.createElement('div')
        errorContainer.classList.add(errorContainerClassId)

        for (const error of errors) {
            const errorDiv = document.createElement('div')
            errorDiv.classList.add(`${formCompType}__error`)
            errorDiv.textContent = error.msg
            errorContainer.append(errorDiv)
        }

        inputField.parentElement.append(errorContainer)
    }
}

export {
    updateErrorContainer
}