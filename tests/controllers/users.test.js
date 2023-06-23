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

    expect(await (User.find({}))).toHaveLength(1)
    expect(User.findOne({username: 'user', name: 'new user'})).toBeDefined()
  })
})

describe('fetch all', () => {
  beforeEach(async () => {
    let userObject = new User({username: 'test user', name: 'test name', password: 'testpassw'})
    await userObject.save()
    userObject = new User({username: 'user1111', name: 'User User', password: 'agoodpassword'})
    await userObject.save()
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')

    expect(response.body).toHaveLength(2)
  })

  test('users are returned as json', async () => {
    await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/)
  })

  test('name of identifier field is id', async () => {
    const response = await api.get('/api/users')

    expect(response.body[0].id).toBeDefined()
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
