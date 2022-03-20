const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce(((sum, current) => sum + current))
}

module.exports = {
  dummy, totalLikes
}