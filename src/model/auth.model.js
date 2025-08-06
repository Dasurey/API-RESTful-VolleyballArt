const { EXTERNAL_PACKAGES, RELATIVE_PATHS, HTTP_STATUS } = require('../config/paths.config');
const { AUTH_MESSAGES, FIREBASE_CONSTANTS } = require('../utils/messages.utils');
const { db } = require('../config/db.config');
const { generateToken } = require('../config/jwt.config');
const { AuthenticationError, ValidationError, ConflictError, InternalServerError } = require('../utils/error.utils');

const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const auth = getAuth();

const loginUser = async (req, res, email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generar token JWT personalizado
    const jwtToken = generateToken({
      id: user.uid,
      email: user.email
    });
    
    return res.status(200).json({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      payload: {
        token: jwtToken,
        user: {
          uid: user.uid,
          email: user.email,
          ...user.toJSON() // Incluye otros datos del usuario si es necesario
        }
      }
    });
  } catch (error) {
    throw new AuthenticationError(AUTH_MESSAGES.INCORRECT_CREDENTIALS);
  }
};

const registerUser = async (req, res, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Opcionalmente guardar información adicional del usuario en Firestore
    await setDoc(doc(db, FIREBASE_CONSTANTS.COLLECTION_USERS, user.uid), {
      email: user.email,
      createdAt: new Date(),
      uid: user.uid
    });
    
    // Generar token JWT personalizado
    const jwtToken = generateToken({
      id: user.uid,
      email: user.email
    });
    
    return res.status(HTTP_STATUS.CREATED).json({
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      payload: {
        user: {
          id: user.uid,
          email: user.email
        },
        token: jwtToken
      }
    });
  } catch (error) {
    if (error.code === FIREBASE_CONSTANTS.ERROR_EMAIL_ALREADY_IN_USE) {
      throw new ConflictError(AUTH_MESSAGES.EMAIL_ALREADY_IN_USE);
    } else if (error.code === FIREBASE_CONSTANTS.ERROR_WEAK_PASSWORD) {
      throw new ValidationError(AUTH_MESSAGES.WEAK_PASSWORD);
    } else if (error.code === FIREBASE_CONSTANTS.ERROR_INVALID_EMAIL) {
      throw new ValidationError(AUTH_MESSAGES.INVALID_EMAIL);
    }
    
    throw new InternalServerError();
  }
};


module.exports = {
  loginUser,
  registerUser
};