const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)
const Blog = require('../../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog({title: 'test title', author: 'test author', url: 'www.test.fi', likes: 1})
  await blogObject.save()
  blogObject = new Blog({title: 'atitle', author: 'anauthor', url: 'www.test.net', likes: 0})
  await blogObject.save()
})

describe('fetch all', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(2)
  })

  test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200).expect('Content-Type', /application\/json/)
  })

  test('name of identifier field is id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('create new', () => {
  test('a new blog is added', async () => {
    const blogObject = { title: 'new', author: 'new new', url: 'www.new.fi', likes: 2 }

    await api.post('/api/blogs').send(blogObject)

    expect(await Blog.find({})).toHaveLength(3)
  })

  test('number of likes is set to 0 if not given', async () => {
    const blogObject = { title: 'new', author: 'new new', url: 'www.new.fi' }

    await api.post('/api/blogs').send(blogObject)

    const blog = await Blog.findOne({title: 'new'})
    expect(blog.likes).toBe(0)
  })

  test('status code is 400 if no title given', async () => {
    const blogObject = { author: 'new author', url: 'www.new.fi', likes: 1 }

    await api.post('/api/blogs').send(blogObject).expect(400)
  })

  test('status code is 400 if no url given', async () => {
    const blogObject = { author: 'new author', title: 'title', likes: 1 }

    await api.post('/api/blogs').send(blogObject).expect(400)
  })
})

describe('delete one', () => {
  test('a blog is deleted', async () => {
    const blog = await Blog.findOne()

    await api.delete(`/api/blogs/${blog.id}`)

    expect(await Blog.find({})).toHaveLength(1)
  })

  test('status code is 204 if deleted', async () => {
    const blog = await Blog.findOne()

    await api.delete(`/api/blogs/${blog.id}`).expect(204)
  })

  test('status code is 404 if id not found', async () => {
    const blog = new Blog({ title: 'delete', url: 'delete' })
    await blog.save()
    await blog.remove()

    await api.delete(`/api/blogs/${blog._id.toString()}`).expect(404)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
