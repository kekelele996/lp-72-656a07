import axios from './axios';
import { User, Folder, Document, Version, Comment, SearchResult, AuthResponse } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    axios.post<AuthResponse>('/auth/login', { username, password }),
  
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    axios.post<AuthResponse>('/auth/register', data),
  
  getProfile: () => axios.get<User>('/users/me'),
};

export const foldersApi = {
  getTree: () => axios.get<Folder[]>('/folders/tree'),
  
  getAll: () => axios.get<Folder[]>('/folders'),
  
  create: (data: { name: string; parentId?: string }) =>
    axios.post<Folder>('/folders', data),
  
  update: (id: string, name: string) =>
    axios.patch<Folder>(`/folders/${id}`, { name }),
  
  delete: (id: string) => axios.delete(`/folders/${id}`),
};

export const documentsApi = {
  getAll: (folderId?: string | null) =>
    axios.get<Document[]>('/documents', { params: { folderId: folderId ?? 'null' } }),
  
  getById: (id: string) => axios.get<Document>(`/documents/${id}`),
  
  create: (data: { title: string; content?: string; folderId?: string; visibility?: 'private' | 'public'; tags?: string[] }) =>
    axios.post<Document>('/documents', data),
  
  update: (id: string, data: Partial<Document>) =>
    axios.patch<Document>(`/documents/${id}`, data),
  
  delete: (id: string) => axios.delete(`/documents/${id}`),
  
  move: (id: string, folderId: string | null) =>
    axios.post<Document>(`/documents/${id}/move`, { folderId: folderId ?? 'null' }),
  
  restore: (id: string) => axios.post<Document>(`/documents/${id}/restore`),
  
  getTrash: () => axios.get<Document[]>('/documents/trash'),
  
  rollback: (documentId: string, versionId: string) =>
    axios.post<Document>(`/documents/${documentId}/rollback/${versionId}`),
};

export const versionsApi = {
  getByDocumentId: (documentId: string) =>
    axios.get<Version[]>(`/versions/document/${documentId}`),
  
  compare: (version1: string, version2: string) =>
    axios.get(`/versions/compare`, { params: { version1, version2 } }),
};

export const searchApi = {
  search: (query: string) =>
    axios.get<{ results: SearchResult[] }>('/search', { params: { q: query } }),
};

export const tagsApi = {
  getAll: () => axios.get<{ tags: string[] }>('/tags'),
  
  getDocumentsByTag: (tag: string) =>
    axios.get<{ documents: Document[] }>('/tags/documents', { params: { tag } }),
};

export const commentsApi = {
  getByDocumentId: (documentId: string) =>
    axios.get<Comment[]>(`/comments/document/${documentId}`),
  
  create: (documentId: string, data: { content: string; parentId?: string }) =>
    axios.post<Comment>(`/comments/document/${documentId}`, data),
  
  delete: (id: string) => axios.delete(`/comments/${id}`),
};
