const {
  getAllFactory,
  createFactory,
  getElementByIdFactory,
  deleteElementByIdFactory,
  updateElementByIdFactory
} = require("../utils/crudFactory");

const User = require("../models/userModel");

const getUsersHandler = getAllFactory(User);

const createUserHandler = createFactory(User);

const getUserByIdHandler = getElementByIdFactory(User);
const updateUserByIdHandler = updateElementByIdFactory(User);

const deleteUserByIdHandler = deleteElementByIdFactory(User);

module.exports = {
  getUsersHandler,
  getUserByIdHandler,
  updateUserByIdHandler,
  deleteUserByIdHandler
};
