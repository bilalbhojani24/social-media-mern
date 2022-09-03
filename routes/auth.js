const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { statusCode } = require('../utils/statusCodeConstants');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const resp = await user.save();
    res.status(statusCode.created).json(resp);
  } catch (error) {
    res.status(statusCode.serverError).json(error);
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(statusCode.badRequest).json('User not found!!');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(statusCode.badRequest).json('Incorrect password!!');
    }

    res.status(statusCode.OK).json(user);
  } catch (error) {
    res.status(statusCode.serverError).json(error);
  }
});

module.exports = router;
