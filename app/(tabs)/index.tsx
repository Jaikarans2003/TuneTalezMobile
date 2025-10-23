import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { getFeaturedBooks, getBooksByTag, searchBooks } from '@/src/firebase/services';
import { Book } from '@/src/types/book';
import BookCard from '@/src/components/BookCard';

const EmptyBookList = ({ message }: { message: string }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const BookCategory = ({ title, books = [], isLoading = false }: { title: string, books: Book[], isLoading?: boolean }) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  
  // Calculate number of columns based on platform
  const numColumns = isWeb ? 5 : 2;
  
  if (isLoading) {
    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <View style={styles.categoryBar} />
            <Text style={styles.categoryTitle}>{title}</Text>
          </View>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  // If there are no books, don't render anything
  if (books.length === 0) {
    return null;
  }

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book/[id]',
      params: { id: book.id }
    });
  };
  
  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleContainer}>
          <View style={styles.categoryBar} />
          <Text style={styles.categoryTitle}>{title}</Text>
        </View>
      </View>
      
      {isWeb ? (
        // Web layout - grid with 5 columns
        <View style={styles.webBooksGrid}>
          {books.map((book, index) => (
            <View key={book.id || index} style={[styles.webBookCard, { width: (width - 60) / numColumns - 10 }]}>
              <BookCard book={book} onPress={handleBookPress} />
            </View>
          ))}
        </View>
      ) : (
        // Mobile layout - grid with 2 columns
        <FlatList
          nestedScrollEnabled
          data={books}
          renderItem={({ item }) => (
            <View style={styles.mobileBookCard}>
              <BookCard book={item} onPress={handleBookPress} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.booksGrid}
        />
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [historyBooks, setHistoryBooks] = useState<Book[]>([]);
  const [academicsBooks, setAcademicsBooks] = useState<Book[]>([]);
  const [romanceBooks, setRomanceBooks] = useState<Book[]>([]);
  const [sciFiBooks, setSciFiBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState({
    featured: true,
    history: true,
    academics: true,
    romance: true,
    sciFi: true,
    search: false,
  });
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const numColumns = isWeb ? 5 : 2;

  useEffect(() => {
    // Fetch featured books (all recent books)
    const loadFeaturedBooks = async () => {
      try {
        const books = await getFeaturedBooks(10);
        setFeaturedBooks(books);
      } catch (error) {
        console.error('Error loading featured books:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, featured: false }));
      }
    };

    // Fetch books by tags for each category
    const loadBooksByTags = async () => {
      try {
        // Load History books
        const historyBooks = await getBooksByTag('history');
        setHistoryBooks(historyBooks);
        setIsLoading(prev => ({ ...prev, history: false }));
        
        // Load Academics books
        const academicsBooks = await getBooksByTag('academics');
        setAcademicsBooks(academicsBooks);
        setIsLoading(prev => ({ ...prev, academics: false }));
        
        // Load Romance books
        const romanceBooks = await getBooksByTag('romance');
        setRomanceBooks(romanceBooks);
        setIsLoading(prev => ({ ...prev, romance: false }));
        
        // Load Sci-Fi books
        const sciFiBooks = await getBooksByTag('sci-fi');
        if (sciFiBooks.length === 0) {
          // Try alternative tag name
          const altSciFiBooks = await getBooksByTag('science fiction');
          setSciFiBooks(altSciFiBooks);
        } else {
          setSciFiBooks(sciFiBooks);
        }
        setIsLoading(prev => ({ ...prev, sciFi: false }));
        
      } catch (error) {
        console.error('Error loading books by tags:', error);
        // Set all loading states to false in case of error
        setIsLoading(prev => ({
          ...prev,
          history: false,
          academics: false,
          romance: false,
          sciFi: false
        }));
      }
    };

    loadFeaturedBooks();
    loadBooksByTags();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(prev => ({ ...prev, search: true }));
    try {
      const results = await searchBooks(searchTerm);
      setSearchResults(results);
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book/[id]',
      params: { id: book.id }
    });
  };
  
  // Hero Banner Component
  const heroBanner = (
    <View style={styles.heroBanner}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTagline}>Because Every Story Deserves a Voice</Text>
        <Text style={styles.heroTitle}>TuneTalez</Text>
        <Text style={styles.heroDescription}>
          Discover and enjoy a world of stories at your fingertips. Read, listen, and immerse yourself in captivating narratives.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Explore Content</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Join for Beta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Search Bar Component
  const searchBar = (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search books by title, author, or genre..."
        placeholderTextColor={Colors.textMuted}
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      {searchTerm ? (
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // Search Results Component
  const searchResultsBlock = isSearching && (
    <View style={styles.searchResultsContainer}>
      <View style={styles.searchResultsHeader}>
        <Text style={styles.searchResultsTitle}>Search Results</Text>
        <TouchableOpacity onPress={clearSearch}>
          <Text style={styles.clearSearchText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading.search ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.searchLoader} />
      ) : searchResults.length > 0 ? (
        isWeb ? (
          // Web layout - grid with 5 columns
          <View style={styles.webBooksGrid}>
            {searchResults.map((book, index) => (
              <View key={book.id || index} style={[styles.webBookCard, { width: (width - 60) / numColumns - 10 }]}>
                <BookCard book={book} onPress={handleBookPress} />
              </View>
            ))}
          </View>
        ) : (
          // Mobile layout - grid with 2 columns
          <FlatList
            nestedScrollEnabled
            data={searchResults}
            renderItem={({ item }) => (
              <View style={styles.mobileBookCard}>
                <BookCard book={item} onPress={handleBookPress} />
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.booksGrid}
          />
        )
      ) : (
        <Text style={styles.noResultsText}>No books found matching "{searchTerm}"</Text>
      )}
    </View>
  );

  // Book Categories Component
  const bookCategories = !isSearching && (
    <>
      {/* Featured Collection - Always shown if there are books */}
      <BookCategory 
        title="Featured Collection" 
        books={featuredBooks} 
        isLoading={isLoading.featured} 
      />
      
      {/* History Collection - Only shown if there are books with history tag */}
      <BookCategory 
        title="History Collection" 
        books={historyBooks} 
        isLoading={isLoading.history} 
      />
      
      {/* Academics Collection - Only shown if there are books with academics tag */}
      <BookCategory 
        title="Academics" 
        books={academicsBooks} 
        isLoading={isLoading.academics} 
      />
      
      {/* Romance Collection - Only shown if there are books with romance tag */}
      <BookCategory 
        title="Romance" 
        books={romanceBooks} 
        isLoading={isLoading.romance} 
      />
      
      {/* Sci-Fi Collection - Only shown if there are books with sci-fi tag */}
      <BookCategory 
        title="Sci-Fi" 
        books={sciFiBooks} 
        isLoading={isLoading.sciFi} 
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {heroBanner}
            {searchBar}
            {searchResultsBlock}
          </>
        }
        data={[]}
        renderItem={null}
        ListFooterComponent={bookCategories}
      />
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
  heroBanner: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  categoryContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBar: {
    width: 10,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  booksGrid: {
    padding: 5,
  },
  mobileBookCard: {
    flex: 1,
    margin: 5,
  },
  webBooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  webBookCard: {
    margin: 5,
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clearSearchText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  searchLoader: {
    marginVertical: 20,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noResultsText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 20,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});