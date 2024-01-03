import { decodeHTML } from '/entities/index.js'
import { formFetch } from '../utils/fetch.js'

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
    const secondary = document.querySelector(
        '.profile__secondary'
    )
    const profileForm = document.querySelector(
        '.profile-form'
    )

    profileEditButton.addEventListener('click', () => {
        if (profileForm.classList.contains('-gone')) {
            secondary.classList.add('-gone')
            profileForm.classList.remove('-gone')
        }
    })

    const profileFormCancelButton = document.querySelector(
        '.profile-form__cancel'
    )

    profileFormCancelButton.addEventListener('click', () => {
        if (secondary.classList.contains('-gone')) {
            profileForm.classList.add('-gone')
            secondary.classList.remove('-gone')

            const { username, bio, keywords } = backendData.user 

            const usernameInput = document.getElementById('username')
            usernameInput.value = decodeHTML(username)

            if (bio) {
                const bioInput = document.getElementById('bio')
                bioInput.value = decodeHTML(bio)
            }

            if (keywords.length) {

                for (let i=0; i<keywords.length; i++) {
                    keywords[i] = decodeHTML(keywords[i])
                }

                const keywordsInput = document.getElementById('keywords')
                keywordsInput.value = keywords.join(' ')
            } 
        }
    })

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault()

        formFetch(
            `/users/${backendData.user.username}`, 
            'PUT', 
            profileForm
        )
    })
}

export {
    profileFormSetup
}