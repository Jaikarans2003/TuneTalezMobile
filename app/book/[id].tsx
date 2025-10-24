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
  FlatList,
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
  
  // Force hide any global headers
  React.useEffect(() => {
    // This ensures we're using the screen in fullscreen mode without any global headers
    return () => {
      // Cleanup if needed when component unmounts
    };
  }, []);
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('Book ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching book with ID:', id.toString());
        const bookData = await getBookById(id.toString());
        console.log('Book data received:', JSON.stringify(bookData, null, 2));
        
        if (bookData) {
          // Sort chapters by order if they exist
          if (bookData.chapters?.length > 0) {
            console.log('Book has chapters:', bookData.chapters.length);
            bookData.chapters = [...bookData.chapters].sort((a, b) => a.order - b.order);
          } else {
            console.log('Book has no chapters');
            // If no chapters exist, create a default chapter with the book content
            if (bookData.content) {
              console.log('Creating default chapter from book content');
              bookData.chapters = [{
                id: 'default-chapter',
                title: 'Chapter 1',
                content: bookData.content,
                order: 0,
                bookId: bookData.id
              }];
            }
          }
          
          if (bookData.content) {
            console.log('Book has content of length:', bookData.content.length);
          } else {
            console.log('Book has no content');
          }
          
          setBook(bookData);
        } else {
          console.log('Book not found in Firestore');
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
  
  // Function to format HTML content for display
  const formatHtmlContent = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // Replace paragraph tags with line breaks
    let formattedContent = htmlContent.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
    
    // Handle strong tags (make text appear normal but preserve content)
    formattedContent = formattedContent.replace(/<strong>/g, '').replace(/<\/strong>/g, '');
    
    // Remove any other HTML tags that might be present
    formattedContent = formattedContent.replace(/<[^>]*>/g, '');
    
    // Replace special characters
    formattedContent = formattedContent.replace(/&nbsp;/g, ' ');
    formattedContent = formattedContent.replace(/&amp;/g, '&');
    formattedContent = formattedContent.replace(/&lt;/g, '<');
    formattedContent = formattedContent.replace(/&gt;/g, '>');
    
    // Trim extra whitespace
    return formattedContent.trim();
  };
  
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
      
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => null}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
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
                  source={{ uri: processThumbnailUrl(book.thumbnailUrl) }}
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
                
                {/* Episodes list */}
                {book.chapters?.length > 0 && (
                  <View style={styles.episodesContainer}>
                    <Text style={styles.episodesTitle}>Episodes</Text>
                    <FlatList
                      data={book.chapters || []}
                      nestedScrollEnabled
                      style={styles.episodesList}
                      renderItem={({item, index}) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.episodeItem,
                            selectedChapterIndex === index && styles.episodeItemSelected
                          ]}
                          onPress={() => setSelectedChapterIndex(index)}
                        >
                          <Text 
                            style={[
                              styles.episodeTitle,
                              selectedChapterIndex === index && styles.episodeTitleSelected
                            ]}
                            numberOfLines={1}
                          >
                            {item.title || `Episode ${index + 1}`}
                          </Text>
                          
                          {item.audioUrl && (
                            <TouchableOpacity
                              style={styles.episodeAudioButtonSmall}
                              onPress={() => {
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
                      )}
                      keyExtractor={(item) => item.id}
                    />
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
                      audioUrl={processAudioUrl(selectedChapter?.audioUrl || book.audioUrl || '')}
                      title={selectedChapter ? selectedChapter.title : book.title}
                      onClose={() => setIsAudioPlaying(false)}
                    />
                  </View>
                )}
                
                {/* Content */}
                <View style={styles.textContent}>
                  {book.chapters?.length > 0 ? (
                    <>
                      {/* Episode Tabs */}
                      <View style={styles.episodeTabs}>
                        <Text style={styles.episodesTitle}>Episodes:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {book.chapters.map((chapter, index) => (
                            <TouchableOpacity
                              key={chapter.id}
                              style={[
                                styles.episodeTab,
                                selectedChapterIndex === index && styles.episodeTabSelected
                              ]}
                              onPress={() => setSelectedChapterIndex(index)}
                            >
                              <Text 
                                style={[
                                  styles.episodeTabText,
                                  selectedChapterIndex === index && styles.episodeTabTextSelected
                                ]}
                              >
                                {chapter.title || `Episode ${index + 1}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                      
                      {/* Selected Episode Content */}
                      <ScrollView style={styles.episodeContentScroll}>
                        <View style={styles.episodeContentContainer}>
                          <Text style={styles.episodeTitleText}>
                            {selectedChapter?.title || `Episode ${selectedChapterIndex + 1}`}
                          </Text>
                          <Text style={styles.contentText}>
                            {selectedChapter?.content
                              ? formatHtmlContent(selectedChapter.content)
                              : 'Loading episode content...'}
                          </Text>
                          {selectedChapter?.audioUrl ? (
                            <TouchableOpacity
                              style={styles.episodeAudioButton}
                              onPress={() => setIsAudioPlaying(true)}
                            >
                              <Ionicons
                                name="play-circle"
                                size={20}
                                color={Colors.primary}
                              />
                              <Text style={styles.audioButtonText}>Play Audio</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </ScrollView>
                    </>
                  ) : (
                    <ScrollView>
                      {book.content ? (
                        <Text style={styles.contentText}>
                          {formatHtmlContent(book.content)}
                        </Text>
                      ) : (
                        <View style={styles.loadingContentContainer}>
                          <ActivityIndicator size="large" color={Colors.primary} />
                          <Text style={styles.loadingContentText}>
                            Loading book content...
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  loadingContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingContentText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
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
  episodesContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  episodesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  episodesList: {
    maxHeight: 300,
  },
  episodeItem: {
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
  episodeItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  episodeTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  episodeTitleSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  episodeAudioButtonSmall: {
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
  },
  episodeTabs: {
    marginBottom: 16,
  },
  episodesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,  
  },
  episodeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  episodeTabSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  episodeTabText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  episodeTabTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  episodeContentScroll: {
    flex: 1,
  },
  episodeContentContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noContentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  noContentSubText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  episodeTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
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