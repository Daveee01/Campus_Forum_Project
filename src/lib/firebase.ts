import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

const env = import.meta.env as any;

/*
  src/lib/firebase.ts
  --------------------
  Centralized lightweight Firebase wrapper used by the app.
  - Exposes auth helpers (registerUser, loginUser, logoutUser, getCurrentUser, onAuthChange)
  - Exposes post/comment helpers (addPost, fetchPosts, addComment, fetchComments, etc.)
  - Supports a Firestore-backed implementation when Firebase is configured (via Vite env),
    and a localStorage fallback for offline demo / development.

  NOTE: keeping this wrapper minimal makes it easy to explain and to replace later with
  direct Firestore calls if you prefer.
*/
const hasFirebase = !!env.VITE_FIREBASE_PROJECT_ID;

let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (hasFirebase) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  db = getFirestore();
  auth = getAuth();
}

// Fallback: localStorage
const LS_PREFIX = 'kampusconnect_v2';
function lsKey(k: string) {
  return `${LS_PREFIX}:${k}`;
}

// ===== AUTH =====
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  fullname: string;
  major: string;
  university: string;
  year: string;
  phone: string;
  bio: string;
  avatar: string;
  createdAt: string;
  followers: number;
  following: number;
}

export async function registerUser(userData: {
  email: string;
  password: string;
  username: string;
  fullname: string;
  major: string;
  university: string;
  year: string;
  phone: string;
}) {
  // Catatan: fungsi ini menerima satu objek `userData` dengan semua field mahasiswa.
  // Jika Firebase tersedia, kita buat akun lewat `createUserWithEmailAndPassword`
  // lalu simpan profil tambahan di koleksi `users` pada Firestore.
  // Jika tidak ada Firebase (fallback), simpan data user di `localStorage`.
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    if (db) {
      await addDoc(collection(db, 'users'), {
        uid: cred.user.uid,
        ...userData,
        bio: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        createdAt: serverTimestamp(),
        followers: 0,
        following: 0
      });
    }
    return cred.user;
  }
  // Fallback to localStorage
  const users = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  const exists = users.find((u: any) => u.email === userData.email);
  if (exists) throw new Error('Email sudah terdaftar');
  const user: UserProfile = {
    uid: Date.now().toString(),
    ...userData,
    bio: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
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
  // Login lewat Firebase jika tersedia
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }
  // Fallback: cek users di localStorage (hanya untuk demo/dev)
  // NOTE: menyimpan password plaintext di localStorage itu TIDAK aman — hanya untuk demo.
  const users = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (!user) throw new Error('Email atau password salah');
  // Simpan session di localStorage agar getCurrentUser bisa membaca
  localStorage.setItem(lsKey('session'), JSON.stringify(user));
  return user;
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
  // Hapus session dari localStorage (fallback)
  localStorage.removeItem(lsKey('session'));
}

export function getCurrentUser(): any {
  if (auth && auth.currentUser) {
    return auth.currentUser;
  }
  // Jika tidak ada Firebase, baca session dari localStorage
  const session = localStorage.getItem(lsKey('session'));
  return session ? JSON.parse(session) : null;
}

export function onAuthChange(callback: (user: any) => void) {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  // Fallback sederhana: panggil callback sekali dengan user dari localStorage
  // Jika ingin event-driven, bisa gunakan BroadcastChannel atau custom event.
  const user = getCurrentUser();
  callback(user);
  return () => {};
}

// ===== POSTS =====
export type PostType = 'ask' | 'discussion' | 'project';

export async function addPost(post: { title: string; content: string; type: PostType; topic: string; authorId: string; authorName: string }) {
  if (db) {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...post,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
      views: 0
    });
    return { id: docRef.id, ...post, createdAt: new Date().toISOString() };
  }
  // Fallback
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const newPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    replies: 0,
    views: 0
  };
  posts.unshift(newPost);
  localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  return newPost;
}

export async function fetchPosts(type?: PostType, topic?: string) {
  if (db) {
    const col = collection(db, 'posts');
    let q = query(col, orderBy('createdAt', 'desc'));
    if (type) {
      q = query(col, where('type', '==', type), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }
  let posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  if (type) posts = posts.filter((p: any) => p.type === type);
  return posts;
}

export async function fetchPostById(postId: string) {
  if (db) {
    const ref = doc(db, 'posts', postId);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as any) };
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  return posts.find((p: any) => p.id === postId) ?? null;
}

export async function upvotePost(postId: string) {
  if (db) {
    await updateDoc(doc(db, 'posts', postId), { upvotes: increment(1) });
  } else {
    const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
    const post = posts.find((p: any) => p.id === postId);
    if (post) {
      post.upvotes = (post.upvotes || 0) + 1;
      localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
    }
  }
}

// ===== COMMENTS =====
export async function addComment(postId: string, comment: { content: string; authorId: string; authorName: string; authorAvatar: string }) {
  if (db) {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...comment,
      postId,
      createdAt: serverTimestamp(),
      upvotes: 0
    });
    return { id: docRef.id, ...comment, postId, createdAt: new Date().toISOString(), upvotes: 0 };
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const newComment = {
    ...comment,
    id: Date.now().toString(),
    postId,
    createdAt: new Date().toISOString(),
    upvotes: 0
  };
  comments.unshift(newComment);
  localStorage.setItem(lsKey('comments'), JSON.stringify(comments));
  return newComment;
}

export async function fetchComments(postId: string) {
  if (db) {
    const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  return comments.filter((c: any) => c.postId === postId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Ambil data user berdasarkan `uid`, `email`, atau `username`.
// Jika Firestore tersedia, lakukan query pada koleksi `users` berdasarkan field `uid`.
// Jika tidak, cari pada localStorage fallback.
async function fetchUserById(uid: string) {
  if (db) {
    // Di Firestore file user disimpan di koleksi 'users' dengan field `uid`.
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as any) };
  }

  const users = JSON.parse(localStorage.getItem(lsKey('users')) || '[]');
  return users.find((u: any) => u.uid === uid || u.email === uid || u.username === uid) ?? null;
}

export { db, auth, hasFirebase, fetchUserById };