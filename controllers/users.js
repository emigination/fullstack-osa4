const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async(request, response) => {
  const user_params = request.body
  user_params.password = await bcrypt.hash(user_params.password, 10)

  const user = new User({user_params})
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async(request, response) => {
  const users = await User.find({})
  response.json(users)
})

module.exports = usersRouter

