const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async(request, response) => {
  const userParams = request.body
  errors = []
  if (!userParams.username) {
    errors.push('Username is required')
  } else if (userParams.username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  if (!userParams.password) {
    errors.push('Password is required')
  } else if (userParams.password.length < 3) {
    errors.push('Password must be at least 3 characters long')
  }

  if (errors.length > 0) {
    return response.status(400).json({error: errors.join(', ')})
  }
  userParams.password = await bcrypt.hash(userParams.password, 10)
  const user = new User(userParams)
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async(request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})

module.exports = usersRouter

