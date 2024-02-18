const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  entry: {
    blogPost: './views/pages/blogPost.pug',
    blogPostForm: './views/pages/blogPostForm.pug',
    error: './views/pages/error.pug',
    index: './views/pages/index.pug',
    loginForm: './views/pages/loginForm.pug',
    signupForm: './views/pages/signupForm.pug',
    userBlogPosts: './views/pages/userBlogPosts.pug',
    userProfile: './views/pages/userProfile.pug',
  },
  output: {
    path: path.join(__dirname, 'public/dist'),
    publicPath: '/',
    filename: 'javascripts/[name].[contenthash:8].js'
  },
  plugins: [
    new PugPlugin({
      pretty: true,
      extractCss: {
        filename: 'stylesheets/[name].[contenthash:8].css'
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        issuer: /\.js$/,
        loader: PugPlugin.loader,
        options: {
            method: 'compile'
        }
      },
      {
        test: /\.css$/,
        use: ['css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  },
  mode: 'development'
};