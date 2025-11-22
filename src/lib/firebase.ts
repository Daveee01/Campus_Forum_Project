// src/lib/firebase.ts
// Unified helper: uses Firebase (Auth + Firestore) when VITE_FIREBASE_API_KEY
// is present. Otherwise falls back to a localStorage-based demo implementation.

import type { User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
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

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'reply' | 'upvote';
  postId: string;
  postTitle: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
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
    const authUser = _auth.currentUser;
    if (!authUser) return null;
    
    // Return auth user with basic info
    // For full profile data, use fetchUserById()
    return {
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      photoURL: authUser.photoURL
    };
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
    const ref = await addDoc(collection(_db, 'posts'), { 
      ...post, 
      createdAt: serverTimestamp(), 
      likes: 0,
      dislikes: 0,
      likesUserIds: [],
      dislikesUserIds: [],
      replies: 0, 
      views: 0 
    });
    return { id: ref.id, ...post, likes: 0, dislikes: 0 };
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const newPost = { 
    ...post, 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString(), 
    likes: 0,
    dislikes: 0,
    likesUserIds: [],
    dislikesUserIds: [],
    replies: 0, 
    views: 0 
  };
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

export async function fetchPostsByAuthor(authorId: string) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'posts'), where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data() as any;
      if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') data.createdAt = (data.createdAt as any).toDate().toISOString();
      return { id: d.id, ...data };
    });
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  return posts.filter((p: any) => p.authorId === authorId);
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

// Legacy upvote function (deprecated). Kept only for backward compatibility; new logic uses like/dislike.
export async function upvotePost(_postId: string) {
  console.warn('upvotePost is deprecated. Use likePost instead.');
}

// ----- LIKE / DISLIKE FEATURE (replaces legacy upvote/downvote) -----
// We store per-user actions in arrays to prevent multiple likes/dislikes.
// Firestore implementation uses a transaction for consistency.
export async function likePost(postId: string, userId: string): Promise<boolean> {
  if (hasFirebase && _db) {
    const { runTransaction } = await import('firebase/firestore');
    try {
      await runTransaction(_db, async (tx) => {
      const ref = doc(_db!, 'posts', postId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data: any = snap.data();
      const likesArr: string[] = Array.isArray(data.likesUserIds) ? data.likesUserIds : [];
      const dislikesArr: string[] = Array.isArray(data.dislikesUserIds) ? data.dislikesUserIds : [];
      const hasLiked = likesArr.includes(userId);
      const hasDisliked = dislikesArr.includes(userId);
      let newLikes = likesArr;
      let newDislikes = dislikesArr;
      if (hasLiked) {
        newLikes = likesArr.filter(id => id !== userId); // toggle off
      } else {
        newLikes = [...likesArr, userId];
        if (hasDisliked) newDislikes = dislikesArr.filter(id => id !== userId); // remove opposite
      }
      tx.update(ref, {
        likesUserIds: newLikes,
        dislikesUserIds: newDislikes,
        likes: newLikes.length,
        dislikes: newDislikes.length
      });
      });
      return true;
    } catch (e) {
      console.error('likePost failed:', e);
      return false;
    }
  }
  // localStorage fallback
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const idx = posts.findIndex((p: any) => p.id === postId);
  if (idx === -1) return false;
  const post = posts[idx];
  post.likesUserIds = Array.isArray(post.likesUserIds) ? post.likesUserIds : [];
  post.dislikesUserIds = Array.isArray(post.dislikesUserIds) ? post.dislikesUserIds : [];
  const hasLiked = post.likesUserIds.includes(userId);
  const hasDisliked = post.dislikesUserIds.includes(userId);
  if (hasLiked) {
    post.likesUserIds = post.likesUserIds.filter((id: string) => id !== userId);
  } else {
    post.likesUserIds.push(userId);
    if (hasDisliked) post.dislikesUserIds = post.dislikesUserIds.filter((id: string) => id !== userId);
  }
  post.likes = post.likesUserIds.length;
  post.dislikes = post.dislikesUserIds.length;
  localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  return true;
}

export async function dislikePost(postId: string, userId: string): Promise<boolean> {
  if (hasFirebase && _db) {
    const { runTransaction } = await import('firebase/firestore');
    try {
      await runTransaction(_db, async (tx) => {
      const ref = doc(_db!, 'posts', postId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data: any = snap.data();
      const likesArr: string[] = Array.isArray(data.likesUserIds) ? data.likesUserIds : [];
      const dislikesArr: string[] = Array.isArray(data.dislikesUserIds) ? data.dislikesUserIds : [];
      const hasLiked = likesArr.includes(userId);
      const hasDisliked = dislikesArr.includes(userId);
      let newLikes = likesArr;
      let newDislikes = dislikesArr;
      if (hasDisliked) {
        newDislikes = dislikesArr.filter(id => id !== userId); // toggle off
      } else {
        newDislikes = [...dislikesArr, userId];
        if (hasLiked) newLikes = likesArr.filter(id => id !== userId); // remove opposite
      }
      tx.update(ref, {
        likesUserIds: newLikes,
        dislikesUserIds: newDislikes,
        likes: newLikes.length,
        dislikes: newDislikes.length
      });
      });
      return true;
    } catch (e) {
      console.error('dislikePost failed:', e);
      return false;
    }
  }
  // localStorage fallback
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const idx = posts.findIndex((p: any) => p.id === postId);
  if (idx === -1) return false;
  const post = posts[idx];
  post.likesUserIds = Array.isArray(post.likesUserIds) ? post.likesUserIds : [];
  post.dislikesUserIds = Array.isArray(post.dislikesUserIds) ? post.dislikesUserIds : [];
  const hasLiked = post.likesUserIds.includes(userId);
  const hasDisliked = post.dislikesUserIds.includes(userId);
  if (hasDisliked) {
    post.dislikesUserIds = post.dislikesUserIds.filter((id: string) => id !== userId);
  } else {
    post.dislikesUserIds.push(userId);
    if (hasLiked) post.likesUserIds = post.likesUserIds.filter((id: string) => id !== userId);
  }
  post.likes = post.likesUserIds.length;
  post.dislikes = post.dislikesUserIds.length;
  localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  return true;
}

export async function updatePost(postId: string, updates: { title?: string; content?: string; topic?: string; type?: PostType }) {
  if (hasFirebase && _db) {
    await updateDoc(doc(_db, 'posts', postId), updates as any);
    return;
  }
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const idx = posts.findIndex((p: any) => p.id === postId);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates };
    localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  }
}

export async function deletePost(postId: string) {
  if (hasFirebase && _db) {
    // Import deleteDoc from firestore
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(_db, 'posts', postId));
    
    // Delete associated comments
    const q = query(collection(_db, 'comments'), where('postId', '==', postId));
    const snap = await getDocs(q);
    const deletions = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletions);
    return;
  }
  
  // localStorage fallback
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const filtered = posts.filter((p: any) => p.id !== postId);
  localStorage.setItem(lsKey('posts'), JSON.stringify(filtered));
  
  // Delete associated comments
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const filteredComments = comments.filter((c: any) => c.postId !== postId);
  localStorage.setItem(lsKey('comments'), JSON.stringify(filteredComments));
}

// ---------- COMMENTS ----------
export async function addComment(postId: string, comment: any) {
  if (hasFirebase && _db) {
    try {
      console.log('Adding comment to Firestore:', { postId, comment });
      const ref = await addDoc(collection(_db, 'comments'), { 
        ...comment, 
        postId, 
        createdAt: serverTimestamp(), 
        upvotes: 0 
      });
      console.log('Comment added with ID:', ref.id);
      
      // Update post replies counter
      try {
        await updateDoc(doc(_db, 'posts', postId), { replies: increment(1) } as any);
        console.log('Post replies counter updated');
      } catch (updateErr) {
        console.warn('Could not update replies counter:', updateErr);
        // Don't fail the whole operation if counter update fails
      }

      // Create notification for post author (if not commenting on own post)
      try {
        const postDoc = await getDoc(doc(_db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          if (postData.authorId !== comment.authorId) {
            await createNotification({
              userId: postData.authorId,
              type: 'comment',
              postId,
              postTitle: postData.title,
              actorId: comment.authorId,
              actorName: comment.authorName,
              actorAvatar: comment.authorAvatar,
              content: comment.content
            });
            console.log('Notification created for post author');
          }
        }
      } catch (notifErr) {
        console.warn('Could not create notification:', notifErr);
        // Don't fail the whole operation if notification fails
      }
      
      return { id: ref.id, ...comment, postId, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Firestore addComment error:', error);
      throw error;
    }
  }
  
  // localStorage fallback
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const newComment = { ...comment, id: Date.now().toString(), postId, createdAt: new Date().toISOString(), upvotes: 0 };
  comments.unshift(newComment);
  localStorage.setItem(lsKey('comments'), JSON.stringify(comments));
  
  // Update post replies counter
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const post = posts.find((p: any) => p.id === postId);
  if (post) {
    post.replies = (post.replies || 0) + 1;
    localStorage.setItem(lsKey('posts'), JSON.stringify(posts));

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== comment.authorId) {
      const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
      const newNotif = {
        id: (Date.now() + 1).toString(),
        userId: post.authorId,
        type: 'comment',
        postId,
        postTitle: post.title,
        actorId: comment.authorId,
        actorName: comment.authorName,
        actorAvatar: comment.authorAvatar,
        content: comment.content,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      notifications.unshift(newNotif);
      localStorage.setItem(lsKey('notifications'), JSON.stringify(notifications));
    }
  }
  return newComment;
}

export function subscribeComments(postId: string, callback: (comments: any[]) => void) {
  if (hasFirebase && _db) {
    const q = query(collection(_db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => {
        const data = d.data() as any;
        if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        return { id: d.id, ...data };
      }));
    }, (error) => {
      console.error('subscribeComments error:', error);
      callback([]);
    });
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  callback(comments.filter((c: any) => c.postId === postId));
  return () => { };
}

export async function fetchComments(postId: string) {
  if (hasFirebase && _db) {
    try {
      const q = query(collection(_db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data() as any;
        if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        return { id: d.id, ...data };
      });
    } catch (error) {
      console.error('fetchComments error:', error);
      return [];
    }
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  return comments.filter((c: any) => c.postId === postId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateComment(commentId: string, content: string) {
  if (hasFirebase && _db) {
    await updateDoc(doc(_db, 'comments', commentId), { content } as any);
    return;
  }
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const idx = comments.findIndex((c: any) => c.id === commentId);
  if (idx !== -1) {
    comments[idx].content = content;
    localStorage.setItem(lsKey('comments'), JSON.stringify(comments));
  }
}

export async function deleteComment(commentId: string, postId: string) {
  if (hasFirebase && _db) {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(_db, 'comments', commentId));
    
    // Decrement post replies counter
    try {
      await updateDoc(doc(_db, 'posts', postId), { replies: increment(-1) } as any);
    } catch (err) {
      console.warn('Could not update replies counter:', err);
    }
    return;
  }
  
  // localStorage fallback
  const comments = JSON.parse(localStorage.getItem(lsKey('comments')) || '[]');
  const filtered = comments.filter((c: any) => c.id !== commentId);
  localStorage.setItem(lsKey('comments'), JSON.stringify(filtered));
  
  // Decrement post replies counter
  const posts = JSON.parse(localStorage.getItem(lsKey('posts')) || '[]');
  const post = posts.find((p: any) => p.id === postId);
  if (post && post.replies > 0) {
    post.replies -= 1;
    localStorage.setItem(lsKey('posts'), JSON.stringify(posts));
  }
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
  if (hasFirebase && _db && _auth) {
    // find user doc in Firestore
    const q = query(collection(_db, 'users'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('User not found');
    const d = snap.docs[0];
    
    // Update Firestore document
    await updateDoc(d.ref, patch as any);
    
    // Update Firebase Auth profile if fullname or avatar changed
    const currentAuthUser = _auth.currentUser;
    if (currentAuthUser && currentAuthUser.uid === uid) {
      const updates: any = {};
      if (patch.fullname) updates.displayName = patch.fullname;
      if (patch.avatar) updates.photoURL = patch.avatar;
      if (Object.keys(updates).length > 0) {
        await updateProfile(currentAuthUser, updates);
      }
    }
    
    const updated = await getDoc(d.ref);
    return { id: updated.id, ...(updated.data() as any) };
  }

  // localStorage fallback
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

// ---------- NOTIFICATIONS ----------
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
  if (hasFirebase && _db) {
    try {
      const ref = await addDoc(collection(_db, 'notifications'), {
        ...notification,
        isRead: false,
        createdAt: serverTimestamp()
      });
      return { id: ref.id, ...notification, isRead: false, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // localStorage fallback
  const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
  const newNotif = {
    ...notification,
    id: Date.now().toString(),
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  localStorage.setItem(lsKey('notifications'), JSON.stringify(notifications));
  return newNotif;
}

export function subscribeNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  if (hasFirebase && _db) {
    const q = query(
      collection(_db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const notifs = snap.docs.map(d => {
        const data = d.data() as any;
        if (data.createdAt && typeof (data.createdAt as any).toDate === 'function') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        return { id: d.id, ...data } as Notification;
      });
      callback(notifs);
    }, (error) => {
      console.error('subscribeNotifications error:', error);
      callback([]);
    });
  }

  // localStorage fallback
  const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
  const userNotifs = notifications.filter((n: any) => n.userId === userId);
  callback(userNotifs);
  return () => { };
}

export async function markNotificationAsRead(notificationId: string) {
  if (hasFirebase && _db) {
    try {
      await updateDoc(doc(_db, 'notifications', notificationId), { isRead: true } as any);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    return;
  }

  // localStorage fallback
  const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
  const notif = notifications.find((n: any) => n.id === notificationId);
  if (notif) {
    notif.isRead = true;
    localStorage.setItem(lsKey('notifications'), JSON.stringify(notifications));
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  if (hasFirebase && _db) {
    try {
      const q = query(collection(_db, 'notifications'), where('userId', '==', userId), where('isRead', '==', false));
      const snap = await getDocs(q);
      const batch = snap.docs.map(d => updateDoc(d.ref, { isRead: true } as any));
      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
    return;
  }

  // localStorage fallback
  const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
  notifications.forEach((n: any) => {
    if (n.userId === userId) n.isRead = true;
  });
  localStorage.setItem(lsKey('notifications'), JSON.stringify(notifications));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (hasFirebase && _db) {
    try {
      const q = query(
        collection(_db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const snap = await getDocs(q);
      return snap.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // localStorage fallback
  const notifications = JSON.parse(localStorage.getItem(lsKey('notifications')) || '[]');
  return notifications.filter((n: any) => n.userId === userId && !n.isRead).length;
}

export default null;
// Lightweight local-only backend stub
