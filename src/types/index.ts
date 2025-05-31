export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'document' | 'link';
  url?: string;
  file?: File;
  images?: File[];
  createdAt: string;
  updatedAt: string;
} 