import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit, 
  DocumentData,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Book, BookWithAudio, Chapter, Paragraph } from '../types/book';
import { processBookUrls } from '../r2/services';

// Convert Firestore document to Book type
export const convertBookDoc = (doc: DocumentData): Book => {
  const data = doc.data();
  
  // Handle Firestore Timestamps
  let createdAt = data.createdAt;
  if (createdAt && typeof createdAt.toDate === 'function') {
    createdAt = createdAt.toDate();
  }
  
  let updatedAt = data.updatedAt;
  if (updatedAt && typeof updatedAt.toDate === 'function') {
    updatedAt = updatedAt.toDate();
  }
  
  return {
    id: doc.id,
    title: data.title || '',
    author: data.author || 'Unknown Author',
    description: data.description || '',
    content: data.content || '',
    thumbnailUrl: data.thumbnailUrl || '',
    audioUrl: data.audioUrl || '',
    createdAt: createdAt || new Date(),
    updatedAt: updatedAt || new Date(),
    tags: data.tags || [],
    category: data.category || '',
    likes: data.likes || 0,
    saves: data.saves || 0,
    isPublished: data.isPublished !== false, // Default to true
    isDeleted: data.isDeleted === true, // Default to false
    userId: data.userId || '',
    readCount: data.readCount || 0,
    status: data.status || 'published'
  };
};

// Get all books
export const getBooks = async (
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 10
): Promise<{ books: Book[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let booksQuery;

    if (lastDoc) {
      booksQuery = query(
        collection(db, 'books'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      booksQuery = query(
        collection(db, 'books'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(booksQuery);
    const books = querySnapshot.docs.map(convertBookDoc).map(processBookUrls);
    const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    
    return {
      books,
      lastDoc: lastVisible
    };
  } catch (error) {
    console.error('Error getting books:', error);
    return { books: [], lastDoc: null };
  }
};

// Get books by category - using client-side filtering to avoid composite index requirements
export const getBooksByCategory = async (
  category: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 10
): Promise<{ books: Book[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    // Get all books and filter by category client-side to avoid composite index requirements
    const booksQuery = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more books so we can filter
    );
    
    const querySnapshot = await getDocs(booksQuery);
    const allBooks = querySnapshot.docs.map(convertBookDoc);
    
    // Filter by category
    const filteredBooks = allBooks.filter(book => 
      book.category && book.category.toLowerCase() === category.toLowerCase()
    );
    
    // Apply pagination
    const paginatedBooks = filteredBooks.slice(0, pageSize);
    const processedBooks = paginatedBooks.map(processBookUrls);
    
    return {
      books: processedBooks,
      lastDoc: null // We're handling pagination client-side
    };
  } catch (error) {
    console.error(`Error getting books for category ${category}:`, error);
    return { books: [], lastDoc: null };
  }
};

// Get books by tag - using client-side filtering
export const getBooksByTag = async (
  tag: string,
  pageSize: number = 10
): Promise<Book[]> => {
  try {
    // Get all books and filter by tag client-side
    const booksQuery = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more books so we can filter
    );
    
    const querySnapshot = await getDocs(booksQuery);
    const allBooks = querySnapshot.docs.map(convertBookDoc);
    
    // Filter by tag (case-insensitive)
    const filteredBooks = allBooks.filter(book => 
      book.tags && book.tags.some(bookTag => 
        bookTag.toLowerCase() === tag.toLowerCase()
      )
    );
    
    // Apply pagination and process URLs
    const paginatedBooks = filteredBooks.slice(0, pageSize);
    return paginatedBooks.map(processBookUrls);
    
  } catch (error) {
    console.error(`Error getting books for tag ${tag}:`, error);
    return [];
  }
};

// Get featured books (most liked or most recent)
export const getFeaturedBooks = async (count: number = 5): Promise<Book[]> => {
  try {
    // Use a simple query without composite index requirements
    const booksQuery = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(booksQuery);
    const books = querySnapshot.docs.map(convertBookDoc).map(processBookUrls);
    
    return books;
  } catch (error) {
    console.error('Error getting featured books:', error);
    return [];
  }
};

// Get a single book by ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    
    if (!bookDoc.exists()) {
      return null;
    }
    
    return processBookUrls(convertBookDoc(bookDoc));
  } catch (error) {
    console.error(`Error getting book with ID ${bookId}:`, error);
    return null;
  }
};

// Get books with audio - using client-side filtering
export const getBooksWithAudio = async (count: number = 10): Promise<BookWithAudio[]> => {
  try {
    const booksQuery = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc'),
      limit(count * 2) // Get more to filter
    );
    
    const querySnapshot = await getDocs(booksQuery);
    const books = querySnapshot.docs
      .map(convertBookDoc)
      .filter(book => book.audioUrl)
      .slice(0, count)
      .map(book => ({ ...book, audioUrl: book.audioUrl || '' }))
      .map(processBookUrls) as BookWithAudio[];
      
    return books;
  } catch (error) {
    console.error('Error getting books with audio:', error);
    return [];
  }
};

// Get chapters for a book - using client-side filtering
export const getChapters = async (bookId: string): Promise<Chapter[]> => {
  try {
    const chaptersQuery = query(
      collection(db, 'chapters'),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(chaptersQuery);
    const allChapters = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        order: data.order || 0,
        bookId: data.bookId,
        audioUrl: data.audioUrl || '',
      };
    });
    
    // Filter by bookId
    const bookChapters = allChapters.filter(chapter => chapter.bookId === bookId);
    return bookChapters;
  } catch (error) {
    console.error(`Error getting chapters for book ${bookId}:`, error);
    return [];
  }
};

// Get paragraphs for a chapter - using client-side filtering
export const getParagraphs = async (bookId: string, chapterId: string): Promise<Paragraph[]> => {
  try {
    const paragraphsQuery = query(
      collection(db, 'paragraphs'),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(paragraphsQuery);
    const allParagraphs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content || '',
        bookId: data.bookId,
        chapterId: data.chapterId,
        audioUrl: data.audioUrl || '',
        order: data.order || 0,
      };
    });
    
    // Filter by bookId and chapterId
    const filteredParagraphs = allParagraphs.filter(
      paragraph => paragraph.bookId === bookId && paragraph.chapterId === chapterId
    );
    
    return filteredParagraphs;
  } catch (error) {
    console.error(`Error getting paragraphs for chapter ${chapterId}:`, error);
    return [];
  }
};

// Search books - using client-side filtering
export const searchBooks = async (searchTerm: string, limit: number = 10): Promise<Book[]> => {
  try {
    // In Firestore, we can't do full-text search directly
    // This is a simple implementation that searches by title
    // For a real app, consider using Algolia or a similar service
    const booksQuery = query(
      collection(db, 'books'),
      orderBy('title'),
      limit(50) // Get more to filter
    );
    
    const querySnapshot = await getDocs(booksQuery);
    const allBooks = querySnapshot.docs.map(convertBookDoc);
    
    // Filter books by search term (case-insensitive)
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredBooks = allBooks.filter(book => 
      book.title.toLowerCase().includes(lowerSearchTerm) ||
      book.author.toLowerCase().includes(lowerSearchTerm) ||
      (book.description && book.description.toLowerCase().includes(lowerSearchTerm)) ||
      (book.tags && book.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
    ).slice(0, limit);
    
    return filteredBooks.map(processBookUrls);
  } catch (error) {
    console.error(`Error searching books with term ${searchTerm}:`, error);
    return [];
  }
};