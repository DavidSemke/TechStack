import { formFetch } from '../utils/fetch.js'
import { updateErrorContainer } from '../utils/formError.js'

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

    if (!profileEditButton) {
        return
    }
    
    const secondary = document.querySelector(
        '.profile__secondary-content'
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
            usernameInput.value = username

            if (bio) {
                const bioInput = document.getElementById('bio')
                bioInput.value = bio
            }

            if (keywords.length) {
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
            profileForm,
            (data) => {
                const inputData = {
                    'profile-pic': {
                        errors: [],
                        formCompType: 'form-input'
                    },
                    'username': {
                        errors: [],
                        formCompType: 'form-input'
                    },
                    'bio': {
                        errors: [],
                        formCompType: 'form-textarea'
                    },
                    'keywords': {
                        errors: [],
                        formCompType: 'form-textarea'
                    }
                }

                for (const error of data.errors) {
                    inputData[error.path].errors.push(error)
                }

                for (const [k, v] of Object.entries(inputData)) {
                    updateErrorContainer(v.formCompType, k, v.errors)
                }
            }    
        )
    })
}

export {
    profileFormSetup
}