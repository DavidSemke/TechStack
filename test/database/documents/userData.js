const inputs = [
  {
    username: "aaaaaa",
    password: "aaaaaa1!",
  },
  {
    username: "bbbbbb",
    password: "bbbbbb1!",
  },
  {
    username: "cccccc",
    password: "cccccc1!",
  },
  {
    username: "dddddd",
    password: "dddddd1!",
  },
]

function getData(imageData, userCount = inputs.length) {
  if (userCount > inputs.length) {
    throw new Error("Not enough user data for given user count")
  }

  return inputs.slice(0, userCount).map((input) => {
    const { username, password } = input

    return {
      username,
      password,
      profile_pic: imageData,
    }
  })
}

module.exports = {
  getData,
}
