// src/lib/firebase.ts
// Unified helper: uses Firebase (Auth + Firestore) when VITE_FIREBASE_API_KEY
// is present. Otherwise falls back to a localStorage-based demo implementation.

import type { User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  fullname?: string;
  major?: string;
  university?: string;
  year?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  followers?: number;
  following?: number;
  password?: string; // only for local demo
}

const LS_PREFIX = 'kampusconnect_v2';
function lsKey(k: string) { return `${LS_PREFIX}:${k}`; }

const hasFirebase = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;

if (hasFirebase) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  const app = initializeApp(firebaseConfig as any);
  _auth = getAuth(app);
  _db = getFirestore(app);
}

export { hasFirebase, _db as db, _auth as auth };

// ---------- AUTH ----------
export async function registerUser(userData: any) {
  if (hasFirebase && _auth && _db) {
    const cred = await createUserWithEmailAndPassword(_auth, userData.email, userData.password);
    await addDoc(collection(_db, 'users'), {
      uid: cred.user.uid,
      email: userData.email,
      username: userData.username || userData.email.split('@')[0],
      fullname: userData.fullname || '',
      major: userData.major || '',
      university: userData.university || '',
      year: userData.year || '',
      phone: userData.phone || '',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || userData.email}`,
      createdAt: serverTimestamp(),
      followers: 0,
      following: 0
    });
    return cred.user;
  }

  // localStorage fallback
  const users: any[] = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  if (users.find(u => u.email === userData.email)) throw new Error('Email sudah terdaftar');
  const user: UserProfile = {
    uid: Date.now().toString(),
    email: userData.email,
    password: userData.password,
    username: userData.username || userData.email.split('@')[0],
    fullname: userData.fullname || '',
    major: userData.major || '',
    university: userData.university || '',
    year: userData.year || '',
    phone: userData.phone || '',
    bio: '',
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || Date.now()}`,
    createdAt: new Date().toISOString(),
    followers: 0,
    following: 0
  };
  users.push(user);
  localStorage.setItem(lsKey('users'), JSON.stringify(users));
  localStorage.setItem(lsKey('session'), JSON.stringify(user));
  return user;
}

export async function loginUser(email: string, password: string) {
  if (hasFirebase && _auth) {
    const cred = await signInWithEmailAndPassword(_auth, email, password);
    return cred.user;
  }
  const users: any[] = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Email atau password salah');
  localStorage.setItem(lsKey('session'), JSON.stringify(user));
  return user;
}

export async function logoutUser() {
  if (hasFirebase && _auth) {
    await signOut(_auth);
    return;
  }
  localStorage.removeItem(lsKey('session'));
}

export function getCurrentUser(): any {
  if (hasFirebase && _auth) {
    return _auth.currentUser;
  }
  const session = localStorage.getItem(lsKey('session'));
  return session ? JSON.parse(session) : null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (hasFirebase && _auth) {
    return onAuthStateChanged(_auth, callback as any);
  }
  // fallback: call once and return noop
  callback(getCurrentUser());
  return () => { };
}

// ---------- POSTS ----------
export type PostType = 'ask' | 'discussion' | 'project';

export async function addPost(post: any) {
  if (hasFirebase && _db) {
    const ref = await addDoc(collection(_db, 'posts'), { ...post, createdAt: serverTimestamp(), upvotes: 0, downvotes: 0, replies: 0, views: 0 });
    return { id: ref.id, ...post };
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const newPost = { ...post, id: Date.now().toString(), createdAt: new Date().toISOString(), upvotes: 0, downvotes: 0, replies: 0, views: 0 };
  posts.unshift(newPost);
  localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  return newPost;
}

export function subscribePosts(callback: (posts: any[]) => void) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => {
      const data = d.data() as any;
      if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') {
        data.createdAt = (data.createdAt as any).toDate().toISOString();
      }
      return { id: d.id, ...data };
    })));
  }
  // local fallback: immediate read and no realtime updates
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  callback(posts);
  return () => { };
}

export async function fetchPosts(type?: PostType) {
  if (hasFirebase && _db) {
    const q = type ? query(collection(_db, 'posts'), where('type', '==', type), orderBy('createdAt', 'desc')) : query(collection(_db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data() as any;
      if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') data.createdAt = (data.createdAt as any).toDate().toISOString();
      return { id: d.id, ...data };
    });
  }
  let posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  if (type) posts = posts.filter((p: any) => p.type === type);
  return posts;
}

export async function fetchPostById(postId: string) {
  if (hasFirebase && _db) {
    const d = await getDoc(doc(_db, 'posts', postId));
    if (!d.exists()) return null;
    const data = d.data() as any;
    if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') data.createdAt = (data.createdAt as any).toDate().toISOString();
    return { id: d.id, ...data };
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  return posts.find((p: any) => p.id === postId) ?? null;
}

export async function upvotePost(postId: string) {
  if (hasFirebase && _db) {
    await updateDoc(doc(_db, 'posts', postId), { upvotes: increment(1) } as any);
    return;
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const p = posts.find((x: any) => x.id === postId);
  if (p) { p.upvotes = (p.upvotes || 0) + 1; localStorage.setItem(lsKey('posts'), JSON.stringify(posts)); }
}

// ---------- COMMENTS ----------
export async function addComment(postId: string, comment: any) {
  if (hasFirebase && _db) {
    const ref = await addDoc(collection(_db, 'comments'), { ...comment, postId, createdAt: serverTimestamp(), upvotes: 0 });
    return { id: ref.id, ...comment, postId };
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const newComment = { ...comment, id: Date.now().toString(), postId, createdAt: new Date().toISOString(), upvotes: 0 };
  comments.unshift(newComment);
  localStorage.setItem(lsKey('comments'), JSON.stringify(comments));
  return newComment;
}

export function subscribeComments(postId: string, callback: (comments: any[]) => void) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => {
      const data = d.data() as any;
      if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') data.createdAt = (data.createdAt as any).toDate().toISOString();
      return { id: d.id, ...data };
    })));
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  callback(comments.filter((c: any) => c.postId === postId));
  return () => { };
}

export async function fetchComments(postId: string) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data() as any;
      if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') data.createdAt = (data.createdAt as any).toDate().toISOString();
      return { id: d.id, ...data };
    });
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  return comments.filter((c: any) => c.postId === postId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchUserById(uid: string) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'users'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as any) };
  }
  const users = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  return users.find((u: any) => u.uid === uid || u.email === uid || u.username === uid) ?? null;
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  if (hasFirebase && _db) {
    // find user doc
    const q = query(collection(_db, 'users'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('User not found');
    const d = snap.docs[0];
    await updateDoc(d.ref, patch as any);
    const updated = await getDoc(d.ref);
    return { id: updated.id, ...(updated.data() as any) };
  }

  const users: any[] = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  const idx = users.findIndex(u => u.uid === uid || u.email === uid || u.username === uid);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...patch };
  localStorage.setItem(lsKey('users'), JSON.stringify(users));
  // update session if matches
  const session = JSON.parse(localStorage.getItem(lsKey('session')) || 'null');
  if (session && (session.uid === uid || session.email === uid)) {
    const newSession = { ...session, ...patch };
    localStorage.setItem(lsKey('session'), JSON.stringify(newSession));
  }
  return users[idx];
}

export default null;
// Lightweight local-only backend stub
