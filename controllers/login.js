const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  if (!user) {
    return response.status(401).json({ error: 'Username not found' })
  }

  const passwordCorrect = await bcrypt.compare(password, user.password)
  if (!passwordCorrect) {
    return response.status(401).json({ error: 'Incorrect password' })
  }

  const userParams = {username: user.username, id: user._id,}
  const token = jwt.sign(userParams, process.env.SECRET)

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
