const { db } = require('../config/db');
const { dbServiceWrapper } = require('../middlewares/async');
const { createDocument } = require('../config/firebase');

const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const auth = getAuth();

const loginUser = dbServiceWrapper(async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}, 'loginUser');

const registerUser = dbServiceWrapper(async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Guardar información adicional del usuario en Firestore usando la utilidad centralizada
  await createDocument(db, 'users', {
    email: user.email,
    uid: user.uid
  });

  return user;
}, 'registerUser');


module.exports = {
  loginUser,
  registerUser
};