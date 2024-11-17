const inputs = [
  {
    title:
      "Local Puppies Adopted from the Local Shelter Next to the Local Bean Store",
    keywords: ["dog", "adopt"],
  },
  {
    title: "Thugs Should Not Be Driving Cars! Their Cars Make Too Much Noise!",
    keywords: ["bully", "vehicle"],
  },
  {
    title:
      "Boy Gets Ants in His Pants: Neighbors Concerned That They Could be Next",
    keywords: ["ants", "pants"],
  },
  {
    title: "Wasps Suck, so Why Should Humanity Not Make Wasps Go Extinct?",
    keywords: ["wasps", "bully"],
  },
  {
    title:
      "How to Make a Proper Peanut Butter and Jelly Sandwich: A Lengthy Tutorial",
    keywords: ["food", "taste"],
  },
  {
    title: "Bikini Bottom News: A Day in the Life of Squidward Tentacles",
    keywords: ["squidward", "spongebob"],
  },
  {
    title:
      "I Shipped My Pants! Does Anyone Know of a Better Way of Shipping Pants?",
    keywords: ["amazon", "bezos"],
  },
  {
    title:
      "Why Short is the New Tall - A Perspective from a Member of the 6ft Gang",
    keywords: ["tall", "short"],
  },
  {
    title:
      "Only You Can Prevent Forest Fires! My Name is Smokey Bear, and I Approve This Message",
    keywords: ["burn", "wood"],
  },
  {
    title:
      "Does Anyone Know Any Good Exterminators? I Think My House is Infested With Spiders",
    keywords: ["arachnid", "scary"],
  },
]

// blogPostCount param not necessary; fileData's getData() implements this
function getData(users, contents, imageData) {
  const completeDatas = inputs.slice(0, contents.length).map((data, index) => {
    return {
      title: data.title,
      thumbnail: imageData,
      author: users[index % users.length],
      last_modified_date: Date.now(),
      keywords: data.keywords,
      content: contents[index],
    }
  })

  return completeDatas
}

module.exports = {
  getData,
}
