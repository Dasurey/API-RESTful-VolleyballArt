import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../config/dataBase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { generateToken } from '../utils/tokenGenerator.js';

const auth = getAuth();

export const loginUser = async (req, res, email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generar token JWT personalizado
    const jwtToken = generateToken({
      id: user.uid,
      email: user.email
    });
    
    return res.status(200).json({
      message: 'Login exitoso',
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
    return res.status(401).json({
      message: 'Login invalido: email o password incorrectos',
      error: error.message
    });
  }
};

export const registerUser = async (req, res, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Opcionalmente guardar información adicional del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: new Date(),
      uid: user.uid
    });
    
    // Generar token JWT personalizado
    const jwtToken = generateToken({
      id: user.uid,
      email: user.email
    });
    
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      payload: {
        user: {
          id: user.uid,
          email: user.email
        },
        token: jwtToken
      }
    });
  } catch (error) {
    let errorMessage = 'Error al registrar usuario';
    let statusCode = 500;
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'El email ya está en uso';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es muy débil (mínimo 6 caracteres)';
      statusCode = 400;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
      statusCode = 400;
    }
    
    return res.status(statusCode).json({
      message: errorMessage,
      error: error.message
    });
  }
};
