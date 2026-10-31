import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

const fa = "۰۱۲۳۴۵۶۷۸۹";
const normalize = (s) =>
  s.trim().toLowerCase().replace(/[۰-۹]/g, (d) => fa.indexOf(d));

const toEmail = (username) => `${normalize(username)}@block118.app`;

export const login = (username, password) =>
  signInWithEmailAndPassword(auth, toEmail(username), password);

export const logout = () => signOut(auth);

export const watchAuth = (callback) => onAuthStateChanged(auth, callback);
