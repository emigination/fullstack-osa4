const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)
const User = require('../../models/user')

beforeEach(async () => {
  await User.deleteMany({})
})

describe('create new', () => {
  test('a new user is added', async () => {
    const userObject = { username: 'user', name: 'new user', password: 'passw' }

    await api.post('/api/users').send(userObject)

    expect(await (User.findOne({username: 'user', name: 'new user'}))).toBeDefined()
  })

  test('status code is 400 if no username', async () => {
    const userObject = { name: 'new user', password: 'passw' }

    await api.post('/api/users').send(userObject).expect(400)
    expect(await (User.find({}))).toHaveLength(0)
  })

  test('status code is 400 if no password', async () => {
    const userObject = { username: 'user', name: 'new user' }

    await api.post('/api/users').send(userObject).expect(400)
    expect(await (User.find({}))).toHaveLength(0)
  })

  test('status code is 400 if username too short', async () => {
    const userObject = { username: 'us', name: 'new user', password: 'passw' }

    await api.post('/api/users').send(userObject).expect(400)
    expect(await (User.find({}))).toHaveLength(0)
  })

  test('status code is 400 if password too short', async () => {
    const userObject = { username: 'user', name: 'new user', password: 'pa' }

    await api.post('/api/users').send(userObject).expect(400)
    expect(await (User.find({}))).toHaveLength(0)
  })

  test('returns error messages', async () => {
    const userObject = { username: 'us', name: 'new user' }

    const response = await api.post('/api/users').send(userObject)

    expect(response.body.error).toContain('Password is required')
    expect(response.body.error).toContain('Username must be at least 3 characters long')
    expect(await (User.find({}))).toHaveLength(0)
  })

  test('returns error message if username not unique', async () => {
    let userObject = new User({username: 'user', name: 'new user', password: 'passw'})
    await userObject.save()

    const response = await api.post('/api/users').send({ username: 'user', name: 'another user', password: 'pass' }).expect(400)

    expect(response.body.error).toContain('Username already taken')
  })
})

describe('fetch all', () => {
  beforeEach(async () => {
    let userObject = new User({username: 'test user', name: 'test name', password: 'testpassw'})
    await userObject.save()
    userObject = new User({username: 'user1111', name: 'User User', password: 'agoodpassword'})
    await userObject.save()
  })

  test('all users are returned as json', async () => {
    const response = await api.get('/api/users').expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
  })

  test('name of identifier field is id', async () => {
    const response = await api.get('/api/users')

    expect(response.body[0].id).toBeDefined()
  })
})

afterAll(async () => {
  await User.deleteMany()
  await mongoose.connection.close()
})
