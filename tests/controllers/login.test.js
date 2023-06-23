const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)
const User = require('../../models/user')

beforeAll(async () => {
  await api.post('/api/users').send({username: 'testuser', name: 'test user', password: 'testpassw'})
})

describe('login', () => {
  test('succeeds with correct username and password', async () => {
    const response = await api.post('/api/login').send({username: 'testuser', password: 'testpassw'}).expect(200)
    expect(response.body.token).toBeDefined()
  })

  test("fails if username doesn't exist", async () => {
    const response = await api.post('/api/login').send({username: 'wrong', password: 'passw'}).expect(401)
    expect(response.body.error).toContain('Username not found')
    expect(response.body.token).not.toBeDefined()
  })

  test("fails if password is incorrect", async () => {
    const response = await api.post('/api/login').send({username: 'testuser', password: 'wrong'}).expect(401)
    expect(response.body.error).toContain('Incorrect password')
    expect(response.body.token).not.toBeDefined()
  })
})

afterAll(async () => {
  await User.findOneAndDelete({username: 'testuser'})
  await mongoose.connection.close()
})
