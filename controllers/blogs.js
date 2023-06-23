const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async(request, response) => {
  const blog_params = request.body
  if (!blog_params.title || !blog_params.url) {
    return response.status(400).end();
  }
  if (!blog_params.likes) {
    blog_params.likes = 0
  }
  const blog = new Blog(blog_params)
  await blog.save()
  response.status(201).json(blog)
})

blogsRouter.delete('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    blog.deleteOne()
    response.status(204).end()
  } else {
    return response.status(404).end()
  }
})

blogsRouter.put('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    blog.likes = request.body.likes
    await blog.save()
    response.status(200).json(blog)
  } else {
    return response.status(404).end()
  }
})


module.exports = blogsRouter
