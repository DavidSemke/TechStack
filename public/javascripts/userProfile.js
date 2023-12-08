function profileFormSetup() {
    const profilePage = document.querySelector(
        '.profile-page'
    )

    if (!profilePage) {
        return
    }

    const profileEditButton = document.querySelector(
        '.profile__edit-button'
    )
    const secondaryUserDetails = document.querySelector(
        '.profile__secondary-user-details'
    )
    const profileForm = document.querySelector(
        '.profile-form'
    )

    profileEditButton.addEventListener('click', () => {
        if (profileForm.classList.contains('-hidden')) {
            secondaryUserDetails.classList.add('-hidden')
            profileForm.classList.remove('-hidden')
        }
    })

    const profileFormCancelButton = document.querySelector(
        '.profile-form__cancel'
    )

    profileFormCancelButton.addEventListener('click', () => {
        if (secondaryUserDetails.classList.contains('-hidden')) {
            profileForm.classList.add('-hidden')
            secondaryUserDetails.classList.remove('-hidden')
        }
    })
}

export {
    profileFormSetup
}