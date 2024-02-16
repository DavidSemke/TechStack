# Tech Stack
This is the codebase for the Tech Stack website. It includes both the backend and the frontend, which are not kept separate (the architecture is monolithic).
Tech Stack is a place to read and write blog posts, and includes authentication, authorization, user profiles, blog post management, commenting, and a search system.

Technologies used for the frontend include:
- Raw JavaScript
- Sass (coupled with the BEM methodology)
- Pug (template engine)
- TinyMCE (embeddable text editor)
- Webpack (bundler)

Technologies used for the backend include:
- Express.js
- MongoDB
- Passport.js and sessions
- Jest (testing routes)
- REST API

The design is obviously not compliant with all REST API guidelines, since the architecture is monolithic, but it does adhere to other guidelines, such as 
resource-based uris and use of HTTP verbs GET, POST, PUT, and DELETE.
