export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export interface Folder {
  _id: string;
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
  children?: Folder[];
}

export interface Document {
  _id: string;
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdBy: User;
  updatedBy: User;
  visibility: 'private' | 'public';
  tags: string[];
  sharedWith: User[];
  version: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Version {
  _id: string;
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  content: string;
  createdBy: User;
  changeLog: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  id: string;
  documentId: string;
  createdBy: User;
  content: string;
  parentId: string | null;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdBy: User;
  visibility: 'private' | 'public';
  tags: string[];
  updatedAt: string;
  version: number;
  score: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
