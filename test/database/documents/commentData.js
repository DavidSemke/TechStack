const inputs = [
  { content: "I do not like green eggs and ham." },
  { content: "One fish, two fish, read fish, blue fish." },
  { content: "All the Whos down in Whoville..." },
  { content: "The only thing they fear is you." },
  { content: "Hello there! Kermit the Frog here." },
  { content: "*Whispers* It's free real estate." },
]

function getData(users, commentCount = inputs.length) {
  if (commentCount > inputs.length) {
    throw new Error("Not enough comment data for given comment count")
  }

  return inputs.slice(0, commentCount).map((input, index) => {
    const { content } = input

    return {
      author: users[index % users.length],
      publish_date: Date.now(),
      content,
    }
  })
}

module.exports = {
  getData,
}
