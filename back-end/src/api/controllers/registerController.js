const { registerRequest } = require('../services/register.service');

const createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const user = await registerRequest({ email, password, name });
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
};
