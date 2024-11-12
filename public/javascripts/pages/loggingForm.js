import { updateErrorContainer } from "../utils/formError.js"

function loggingFormSetup() {
  const loggingPage = document.querySelector(".logging-page")

  if (!loggingPage) {
    return
  }

  const errors = backendData.errors
  const inputData = {
    username: {
      errors: [],
      formCompType: "form-input",
    },
    password: {
      errors: [],
      formCompType: "form-input",
    },
  }
  const loggingForm = loggingPage.querySelector(".logging-form")
  const pathSegments = loggingForm.action.split("/")
  const suffix = pathSegments[pathSegments.length - 1]

  if (suffix === "login") {
    // Flash errors are just strings
    // Compatibility demands object with 'msg' prop
    inputData.password.errors = errors.map((error) => {
      return { msg: error }
    })
  } else {
    for (const error of errors) {
      inputData[error.path].errors.push(error)
    }
  }

  for (const [k, v] of Object.entries(inputData)) {
    updateErrorContainer(v.formCompType, k, v.errors)
  }
}

export { loggingFormSetup }
