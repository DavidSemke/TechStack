const blog = {
    'title': 'Latest Blog: We Went Fishing And Yes Fishing is a Sport.',
    'author': {
        'name': 'James Games'
    },
    'keywords': [
        'Tech', 
        'BigTech',
        'ShinyTech',
        'CoolTech',
        'NewTech',
        'FreshTech', 
        'SpicyTech', 
        'HeckTech',
        'SteakTech', 
        'BreakTech'
    ],
    'content': "Let me tell you a story about an itty bitty spider that fell down the stairs. It was a Wednesday. I think I had spaghetti on Wednesday, meatballs and everything. I should have spaghetti more often, but then it wouldn't be as special, you know? Also Mom only makes her special sauce once and a while, and the spaghetti simply is not the same without it.",
    'likes': 0,
    'dislikes': 0,
    'publish_date': '2020/12/12',
    'last_modified_date': '2020/12/12',
    'url': '#'
}

const comments = [
    {
        '_id': 0,
        'author': {
            'name': 'JJ Man'
        },
        'publish_date': '2020/12/12',
        'content': 'I like this',
        'likes': 0,
        'dislikes': 0,
        'reply_to': null
    },
    {   
        '_id': 1,
        'author': {
            'name': 'Puny Goon'
        },
        'publish_date': '2020/12/13',
        'content': 'I don\'t like this',
        'likes': 0,
        'dislikes': 0,
        'reply_to': null
    },
    {
        '_id': 2,
        'author': {
            'name': 'Trollmasterxd'
        },
        'publish_date': '2020/12/14',
        'content': 'Captain America: Civil War',
        'likes': 0,
        'dislikes': 0,
        'reply_to': null
    }
]

blog.comments = comments

module.exports = blog