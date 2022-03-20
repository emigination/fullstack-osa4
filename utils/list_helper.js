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

module.exports = {
  totalLikes, favoriteBlog
}