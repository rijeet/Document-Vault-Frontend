export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFile {
  id: string;
  secureUrl: string;
  mimeType: string;
  resourceType: string;
  fileSize: number;
  originalName: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  categoryId?: string | null;
  documentDate?: string;
  files: DocumentFile[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}