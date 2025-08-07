const authModel = require('../model/auth.model');
const { generateToken } = require('../config/jwt');

const loginUser = async (email, password) => {
  const user = await authModel.loginUser(email, password);
  const jwtToken = generateToken({
    id: user.uid,
    email: user.email
  });
  return {
    token: jwtToken,
    user: {
      uid: user.uid,
      email: user.email,
      ...user.toJSON()
    }
  };
};

// Registro temporalmente deshabilitado
/*
const registerUser = async (email, password) => {
  const user = await authModel.registerUser(email, password);
  const jwtToken = generateToken({
    id: user.uid,
    email: user.email
  });
  return {
    user: {
      id: user.uid,
      email: user.email
    },
    token: jwtToken
  };
};
*/

module.exports = { 
  loginUser
  // registerUser // Temporalmente deshabilitado
};