// Book Types

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  content?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  tags?: string[];
  category?: string;
  likes?: number;
  saves?: number;
  isPublished?: boolean;
  isDeleted?: boolean;
  userId?: string;
  readCount?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface BookCategory {
  id: string;
  title: string;
  books: Book[];
}

export interface BookWithAudio extends Book {
  audioUrl: string;
  duration?: number;
  isProcessing?: boolean;
}

export interface BookWithChapters extends Book {
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  bookId: string;
  audioUrl?: string;
}

export interface Paragraph {
  id: string;
  content: string;
  bookId: string;
  chapterId?: string;
  audioUrl?: string;
  order: number;
}
