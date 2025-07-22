import { db } from '../data/data.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const loginUser = async ({ email, password }) => {
  const usuariosRef = collection(db, 'users');
  const q = query(
    usuariosRef,
    where('email', '==', email),
    where('password', '==', password)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];

    return { id: doc.id, email: doc.data().email };
  } else {
    const error = new Error('Login invalido: email o password incorrectos');
    error.statusCode = 401;
    throw error;
  }
};
