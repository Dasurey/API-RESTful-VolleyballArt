import { db } from '../data/data.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

const productsCollection = collection(db, 'products');

export const getAllProducts = async () => {
  const querySnapshot = await getDocs(productsCollection);
  const products = [];
  querySnapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
  return products;
};

export const getProductById = async (id) => {
  const productDoc = await getDoc(doc(productsCollection, id));
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() };
  } else {
    return null;
  }
};

export const createProduct = async (product) => {
  return addDoc(productsCollection, product);
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(productsCollection, id), data);
  return getProductById(id);
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(productsCollection, id));
};
