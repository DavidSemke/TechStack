const inputs = [
    {
        username: 'aaaaaa', 
        password: 'aaaaaa',
    },
    { 
        username: 'bbbbbb', 
        password: 'bbbbbb', 
    },
    { 
        username: 'cccccc', 
        password: 'cccccc', 
    },
    { 
        username: 'dddddd', 
        password: 'dddddd', 
    }
]


function getData(imageData, userCount=inputs.length) {
    if (userCount > inputs.length) {
        throw new Error('Not enough user data for given user count')
    }

    return inputs.slice(0, userCount)
        .map((input) => {
            const {username, password} = input

            return {
                username,
                password,
                profile_pic: imageData
            }
        })
}

module.exports = {
    getData
}