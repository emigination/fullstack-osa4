const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async(request, response) => {
  const user_params = request.body
  errors = []
  if (!user_params.username) {
    errors.push('Username is required')
  } else if (user_params.username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  if (!user_params.password) {
    errors.push('Password is required')
  } else if (user_params.password.length < 3) {
    errors.push('Password must be at least 3 characters long')
  }

  if (errors.length > 0) {
    return response.status(400).json({error: errors.join(', ')})
  }

  user_params.password = await bcrypt.hash(user_params.password, 10)
  const user = new User(user_params)
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async(request, response) => {
  const users = await User.find({})
  response.json(users)
})

module.exports = usersRouter

