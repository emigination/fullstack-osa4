const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)
const Blog = require('../../models/blog')
const User = require('../../models/user')

const nonexistentId = async () => {
  const deletedBlog = new Blog({ title: 'delete', url: 'delete' })
  await deletedBlog.save()
  await deletedBlog.deleteOne()

  return deletedBlog._id
}

let token = null
let user = null
beforeAll(async () => {
  if (!(await User.findOne())) {
    user = new User({ username: 'testuser', name: 'testname', password: 'testpassw' })
    await user.save()
  }
  user = await User.findOne()
  token = await jwt.sign({username: user.username, id: user._id,}, process.env.SECRET)
})

describe('fetch all', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog({title: 'test title', author: 'test author', url: 'www.test.fi', likes: 1})
    await blogObject.save()
    blogObject = new Blog({title: 'atitle', author: 'anauthor', url: 'www.test.net', likes: 0})
    await blogObject.save()
  })

  test('all blogs are returned as json', async () => {
    const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
  })

  test('name of identifier field is id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('create new', () => {
  test('a new blog is added', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    const blogObject = { title: 'new', author: 'new new', url: 'www.new.fi', likes: 2 }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(blogObject).expect(201)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs + 1)
    expect((await Blog.findOne({title: 'new'})).user.toString()).toBe(user.id)
    expect((await User.findOne({username: 'testuser'})).blogs.length).toBe(1)
  })

  test('number of likes is set to 0 if not given', async () => {
    const blogObject = { title: 'anotherblog', author: 'new new', url: 'www.new.fi' }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(blogObject)

    const blog = await Blog.findOne({title: 'anotherblog'})
    expect(blog.likes).toBe(0)
  })

  test('status code is 400 if no title given', async () => {
    const blogObject = { author: 'new author', url: 'www.new.fi', likes: 1 }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(blogObject).expect(400)
  })

  test('status code is 400 if no url given', async () => {
    const blogObject = { author: 'new author', title: 'title', likes: 1 }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(blogObject).expect(400)
  })

  test('blog is not created if token invalid', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    const blogObject = { title: 'new', author: 'new new', url: 'www.new.fi', likes: 1 }

    await api.post('/api/blogs').set('Authorization', `Bearer 1234`).send(blogObject)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs)
  })

  test('blog is not created if token not given', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    const blogObject = { title: 'new', author: 'new new', url: 'www.new.fi', likes: 1 }

    await api.post('/api/blogs').send(blogObject).expect(401)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs)
  })
})

describe('delete one', () => {
  let blog = null
  beforeEach(async () => {
    await Blog.deleteMany()
    blog = new Blog({ title: 'delete', url: 'delete', user: user.id })
    await blog.save()
  })

  test('blog is deleted', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${token}`).expect(204)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs - 1)
  })

  test('status code is 404 if id not found', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    await api.delete(`/api/blogs/${await nonexistentId()}`).set('Authorization', `Bearer ${token}`).expect(404)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs)
  })

  test('blog is not deleted if user not creator', async () => {
    let blogs = await Blog.find({})
    const initialNumberOfBlogs = blogs.length
    const newUser = new User({ username: 'newuser', name: 'newname', password: 'newpassw' })
    await newUser.save()
    const newToken = await jwt.sign({username: newUser.username, id: newUser._id,}, process.env.SECRET)

    await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${newToken}`).expect(404)

    blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialNumberOfBlogs)
  })
})

describe('update one', () => {
  test('number of likes is updated', async () => {
    const blog = await Blog.findOne() || await Blog.create({title: 'test title', author: 'test author', url: 'www.test.fi'})

    const response = await api.put(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${token}`).send({likes: 3})

    expect(response.body.likes).toBe(3)
  })

  test('status code is 404 if id not found', async () => {
    await api.put(`/api/blogs/${await nonexistentId()}`).set('Authorization', `Bearer ${token}`).send({likes: 1}).expect(404)
  })
})

afterAll(async () => {
  await Blog.deleteMany()
  await User.deleteMany({username: ['testuser', 'newuser']})
  await mongoose.connection.close()
})
