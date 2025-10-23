// Cloudflare R2 Configuration

// R2 Public URLs - Update with your actual Cloudflare R2 public URL
export const R2_PUBLIC_URL = 'https://pub-c6afb0e9c6e14b0f9d9f4aec83b93b1b.r2.dev';

// R2 Bucket names
export const R2_BUCKET = {
  AUDIO: 'tunetalez-audio',
  IMAGES: 'tunetalez-images',
  THUMBNAILS: 'tunetalez-thumbnails',
  PDFS: 'tunetalez-pdfs',
};

// Helper function to get full public URL for a file
export const getR2PublicUrl = (path: string): string => {
  // Check if the path already contains the public URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct the URL
  return `${R2_PUBLIC_URL}/${path}`;
};

// Helper to get thumbnail URL
export const getThumbnailUrl = (filename: string): string => {
  return getR2PublicUrl(`${R2_BUCKET.THUMBNAILS}/${filename}`);
};

// Helper to get audio URL
export const getAudioUrl = (filename: string): string => {
  return getR2PublicUrl(`${R2_BUCKET.AUDIO}/${filename}`);
};

// Helper to get image URL
export const getImageUrl = (filename: string): string => {
  return getR2PublicUrl(`${R2_BUCKET.IMAGES}/${filename}`);
};

// Helper to get PDF URL
export const getPdfUrl = (filename: string): string => {
  return getR2PublicUrl(`${R2_BUCKET.PDFS}/${filename}`);
};