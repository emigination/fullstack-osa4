var countBy = require('lodash/countBy')
var transform = require('lodash/transform')


const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((sum, current) => sum + current)
}

const favoriteBlog = (blogs) => {
  let max = 0
  let fav = blogs[0]
  for (const blog of blogs) {
    if (blog.likes > max) {
      max = blog.likes
      fav = blog
    }
  }
  return {
    title: fav.title,
    author: fav.author,
    likes: max
  }
}

const mostBlogs = (blogs) => {
  const authors = countBy(blogs, (blog) => blog.author)
  const authorName = transform(
    authors,
    (mostBloggingAuthor, value, key) => {
      mostBloggingAuthor.name = value > authors[mostBloggingAuthor.name] ? key : mostBloggingAuthor.name
    },
    { name: Object.keys(authors)[0] })
    .name
  return {
    author: authorName,
    blogs: authors[authorName]
  }
}

const mostLikes = (blogs) => {
  let authors = {}
  for (const blog of blogs) {
    if (!(blog.author in authors)) {
      authors[blog.author] = 0
    }
    authors[blog.author] += blog.likes
  }
  const authorName = transform(
    authors,
    (mostLikedAuthor, value, key) => {
      mostLikedAuthor.name = value > authors[mostLikedAuthor.name] ? key : mostLikedAuthor.name
    },
    { name: Object.keys(authors)[0] })
    .name
  return {
    author: authorName,
    likes: authors[authorName]
  }
}

module.exports = {
  totalLikes, favoriteBlog, mostBlogs, mostLikes
}