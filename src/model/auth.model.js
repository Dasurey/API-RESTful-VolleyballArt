const { EXTERNAL_PACKAGES, RELATIVE_PATHS, HTTP_STATUS } = require('../config/paths.js');
const { AUTH_MESSAGES, FIREBASE_CONSTANTS } = require('../utils/messages.utils.js');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require(EXTERNAL_PACKAGES.FIREBASE_AUTH);
const { db } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_DATABASE);
const { doc, setDoc, getDoc } = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);
const { generateToken } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_JWT);

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
    
    return res.status(HTTP_STATUS.OK).json({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      payload: {
        user: {
          id: user.uid,
          email: user.email,
          ...user.toJSON() // Incluye otros datos del usuario si es necesario
        },
        token: jwtToken
      }
    });
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: AUTH_MESSAGES.INCORRECT_CREDENTIALS,
      error: error.message
    });
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
    let errorMessage = AUTH_MESSAGES.REGISTER_ERROR;
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    
    if (error.code === FIREBASE_CONSTANTS.ERROR_EMAIL_ALREADY_IN_USE) {
      errorMessage = AUTH_MESSAGES.EMAIL_ALREADY_IN_USE;
      statusCode = HTTP_STATUS.BAD_REQUEST;
    } else if (error.code === FIREBASE_CONSTANTS.ERROR_WEAK_PASSWORD) {
      errorMessage = AUTH_MESSAGES.WEAK_PASSWORD;
      statusCode = HTTP_STATUS.BAD_REQUEST;
    } else if (error.code === FIREBASE_CONSTANTS.ERROR_INVALID_EMAIL) {
      errorMessage = AUTH_MESSAGES.INVALID_EMAIL;
      statusCode = HTTP_STATUS.BAD_REQUEST;
    }
    
    return res.status(statusCode).json({
      message: errorMessage,
      error: error.message
    });
  }
};


module.exports = {
  loginUser,
  registerUser
};