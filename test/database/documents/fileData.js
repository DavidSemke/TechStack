const fs = require("fs")
const fsPromises = require("fs").promises
const readline = require("readline")
const path = require("path")

const filenames = [
  "puppyShelter.txt",
  "thugsWithCars.txt",
  "antsInPants.txt",
  "waspsExtinct.txt",
  "pBAndJ.txt",
  "squidward.txt",
  "shippedPants.txt",
  "shortTall.txt",
  "smokeyBear.txt",
  "spiderInfestation.txt",
]
const textPath = path.join(process.cwd(), "test", "database", "text")
const imagePath = path.join(
  process.cwd(),
  "test",
  "database",
  "images",
  "lightning.webp",
)

async function getData(fileCount = filenames.length) {
  if (fileCount > filenames.length) {
    throw new Error("fileCount is greater than the number of files available.")
  }

  const textPromises = filenames.slice(0, fileCount).map(async (filename) => {
    const filePath = textPath + "/" + filename

    return new Promise((resolve) => {
      const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath),
      })
      let content = ""

      lineReader.on("line", (line) => {
        if (line) {
          content += `<p>${line}</p>`
        }
      })
      lineReader.on("close", () => {
        resolve(content)
      })
    })
  })

  const results = await Promise.all([
    ...textPromises,
    fsPromises.readFile(imagePath),
  ])
  const image = results.pop()
  const contents = results

  const imageData = {
    data: image,
    contentType: "image/webp",
  }

  return { contents, imageData }
}

module.exports = {
  getData,
}
