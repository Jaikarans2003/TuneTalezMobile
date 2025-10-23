import { getR2PublicUrl, getThumbnailUrl, getAudioUrl, getImageUrl, getPdfUrl } from './config';

// Interface for R2 file metadata
interface R2FileMetadata {
  name: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
}

/**
 * Processes a thumbnail URL to ensure it's a valid R2 URL
 * @param url The URL to process, could be a full URL or just a filename
 * @returns A valid R2 thumbnail URL
 */
export const processThumbnailUrl = (url: string | undefined): string => {
  if (!url) {
    // Return a default thumbnail if none provided
    return 'https://via.placeholder.com/150x200/333333/FFFFFF?text=No+Cover';
  }
  
  // If it's already a full URL (http or https), return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path or just a filename, convert it to a full R2 URL
  return getThumbnailUrl(url);
};

/**
 * Processes an audio URL to ensure it's a valid R2 URL
 * @param url The URL to process, could be a full URL or just a filename
 * @returns A valid R2 audio URL
 */
export const processAudioUrl = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  
  // If it's already a full URL (http or https), return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path or just a filename, convert it to a full R2 URL
  return getAudioUrl(url);
};

/**
 * Processes an image URL to ensure it's a valid R2 URL
 * @param url The URL to process, could be a full URL or just a filename
 * @returns A valid R2 image URL
 */
export const processImageUrl = (url: string | undefined): string => {
  if (!url) {
    // Return a default image if none provided
    return 'https://via.placeholder.com/400x300/333333/FFFFFF?text=No+Image';
  }
  
  // If it's already a full URL (http or https), return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path or just a filename, convert it to a full R2 URL
  return getImageUrl(url);
};

/**
 * Processes a PDF URL to ensure it's a valid R2 URL
 * @param url The URL to process, could be a full URL or just a filename
 * @returns A valid R2 PDF URL
 */
export const processPdfUrl = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  
  // If it's already a full URL (http or https), return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path or just a filename, convert it to a full R2 URL
  return getPdfUrl(url);
};

/**
 * Processes a book to ensure all its URLs are valid R2 URLs
 * @param book The book to process
 * @returns The processed book with valid R2 URLs
 */
export const processBookUrls = <T extends { thumbnailUrl?: string, audioUrl?: string }>(book: T): T => {
  return {
    ...book,
    thumbnailUrl: processThumbnailUrl(book.thumbnailUrl),
    audioUrl: book.audioUrl ? processAudioUrl(book.audioUrl) : undefined,
  };
};

/**
 * For testing purposes, adds sample audio URLs to books that don't have them
 * @param books Array of books to process
 * @returns Books with sample audio URLs added
 */
export const addSampleAudioUrls = <T extends { id: string, audioUrl?: string }>(books: T[]): T[] => {
  // Sample audio files from public sources
  const sampleAudios = [
    'https://ia800304.us.archive.org/16/items/aliceinwonderland_1102_librivox/aliceinwonderland_01_carroll.mp3',
    'https://ia800304.us.archive.org/16/items/aliceinwonderland_1102_librivox/aliceinwonderland_02_carroll.mp3',
    'https://ia802707.us.archive.org/29/items/the_adventures_of_sherlock_holmes_1307_librivox/adventuresofsherlockholmes_01_doyle.mp3',
    'https://ia802707.us.archive.org/29/items/the_adventures_of_sherlock_holmes_1307_librivox/adventuresofsherlockholmes_02_doyle.mp3',
    'https://ia801403.us.archive.org/11/items/pride_and_prejudice_librivox/prideandprejudice_01_austen.mp3',
  ];
  
  return books.map((book, index) => {
    if (!book.audioUrl) {
      // Assign a sample audio URL based on the book's index
      const audioIndex = parseInt(book.id, 10) % sampleAudios.length || index % sampleAudios.length;
      return {
        ...book,
        audioUrl: sampleAudios[audioIndex],
      };
    }
    return book;
  });
};

/**
 * Checks if the URL is for an audio file
 * @param url URL to check
 * @returns boolean indicating if the URL is for an audio file
 */
export const isAudioUrl = (url: string): boolean => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];
  return audioExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Checks if the URL is for an image file
 * @param url URL to check
 * @returns boolean indicating if the URL is for an image file
 */
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * Checks if the URL is for a PDF file
 * @param url URL to check
 * @returns boolean indicating if the URL is for a PDF file
 */
export const isPdfUrl = (url: string): boolean => {
  return url.toLowerCase().endsWith('.pdf');
};