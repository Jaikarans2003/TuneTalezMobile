import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getBookById } from '@/src/firebase/services';
import { Book, Chapter } from '@/src/types/book';
import AudioPlayer from '@/src/components/AudioPlayer';
import { processThumbnailUrl, processAudioUrl } from '@/src/r2/services';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('Book ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        const bookData = await getBookById(id.toString());
        if (bookData) {
          // Sort chapters by order if they exist
          if (bookData.chapters) {
            bookData.chapters = bookData.chapters.sort((a, b) => a.order - b.order);
          }
          setBook(bookData);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);
  
  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const selectedChapter = book?.chapters?.[selectedChapterIndex];
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !book) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back arrow and book title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Main content area with sidebar layout on web */}
        <View style={[
          styles.contentContainer,
          isWeb && { flexDirection: 'row' }
        ]}>
          {/* Sidebar with book info and chapters list */}
          <View style={[
            styles.sidebar,
            isWeb ? { width: 300, marginRight: 20 } : { marginBottom: 20 }
          ]}>
            <View style={styles.bookInfoCard}>
              <Image
                source={{ uri: book.thumbnailUrl }}
                style={styles.bookCover}
                resizeMode="cover"
              />
              
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>By {book.author}</Text>
                
                {book.category && (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{book.category}</Text>
                  </View>
                )}
                
                {book.tags && book.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {book.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Quick Audio Play Button */}
                {book.audioUrl && (
                  <TouchableOpacity 
                    style={styles.audioButton}
                    onPress={toggleAudio}
                  >
                    <Ionicons 
                      name={isAudioPlaying ? "pause-circle" : "play-circle"} 
                      size={24} 
                      color={Colors.primary} 
                    />
                    <Text style={styles.audioButtonText}>
                      {isAudioPlaying ? "Pause Audio" : "Play Audio"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Chapters list */}
              {book.chapters && book.chapters.length > 0 && (
                <View style={styles.chaptersContainer}>
                  <Text style={styles.chaptersTitle}>Episodes</Text>
                  <ScrollView style={styles.chaptersList} nestedScrollEnabled={true}>
                    {book.chapters.map((chapter, index) => (
                      <TouchableOpacity
                        key={chapter.id}
                        style={[
                          styles.chapterItem,
                          selectedChapterIndex === index && styles.chapterItemSelected
                        ]}
                        onPress={() => setSelectedChapterIndex(index)}
                      >
                        <Text 
                          style={[
                            styles.chapterTitle,
                            selectedChapterIndex === index && styles.chapterTitleSelected
                          ]}
                          numberOfLines={1}
                        >
                          {chapter.title}
                        </Text>
                        
                        {chapter.audioUrl && (
                          <TouchableOpacity
                            style={styles.chapterAudioButton}
                            onPress={(e) => {
                              setSelectedChapterIndex(index);
                              setIsAudioPlaying(true);
                            }}
                          >
                            <Ionicons 
                              name="play-circle" 
                              size={20} 
                              color={Colors.primary} 
                            />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
          
          {/* Main content */}
          <View style={[
            styles.mainContent,
            isWeb && { flex: 1 }
          ]}>
            <View style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>
                  {selectedChapter ? selectedChapter.title : book.title}
                </Text>
                <View style={styles.contentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bookmark-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Audio Player */}
              {isAudioPlaying && (
                <View style={styles.audioPlayerContainer}>
                  <AudioPlayer
                    audioUrl={selectedChapter?.audioUrl || book.audioUrl || ''}
                    title={selectedChapter ? selectedChapter.title : book.title}
                    onClose={() => setIsAudioPlaying(false)}
                  />
                </View>
              )}
              
              {/* Content */}
              <View style={styles.textContent}>
                {selectedChapter ? (
                  <Text style={styles.contentText}>
                    {selectedChapter.content}
                  </Text>
                ) : (
                  <Text style={styles.contentText}>
                    {book.content || 'No content available for this book.'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  sidebar: {
    marginBottom: 20,
  },
  bookInfoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    marginBottom: 16,
  },
  bookInfo: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  chaptersContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  chaptersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chaptersList: {
    maxHeight: 300,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  chapterItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chapterTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  chapterTitleSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chapterAudioButton: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  contentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  audioPlayerContainer: {
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  textContent: {
    paddingVertical: 8,
  },
  contentText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});