const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)
const Blog = require('../../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog({title: "test title", author: "test author", url: "www.test.fi", likes: 1})
  await blogObject.save()
  blogObject = new Blog({title: "atitle", author: "anauthor", url: "www.test.net", likes: 0})
  await blogObject.save()
})

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

afterAll(async () => {
  await mongoose.connection.close()
})
