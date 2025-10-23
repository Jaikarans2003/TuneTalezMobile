import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const BookCard = ({ book, index }: { book: any, index: number }) => {
  // Using a placeholder image for the book
  const placeholderImage = 'https://via.placeholder.com/150x200/333333/FFFFFF?text=Saved+Book';
  
  return (
    <TouchableOpacity style={styles.bookCard}>
      <Image 
        source={{ uri: placeholderImage }} 
        style={styles.bookCover} 
        resizeMode="cover"
      />
      <Text style={styles.bookTitle}>Saved Book Title</Text>
      <Text style={styles.bookAuthor}>Author Name</Text>
      <TouchableOpacity style={styles.saveButton}>
        <Ionicons name="bookmark" size={18} color={Colors.success} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  
  // Calculate number of columns based on platform and screen width
  const numColumns = isWeb ? 5 : 2;
  
  // Empty placeholder data for grid layout
  const placeholderData = Array(8).fill({}).map((_, index) => ({ id: index.toString() }));
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Books</Text>
      </View>
      
      {placeholderData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={80} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No saved books yet</Text>
          <Text style={styles.emptySubtext}>Books you save will appear here</Text>
        </View>
      ) : (
        isWeb ? (
          <View style={styles.webBooksGrid}>
            {placeholderData.map((item, index) => (
              <View key={index} style={[styles.webBookCard, { width: (width - 40) / numColumns - 10 }]}>
                <BookCard book={item} index={index} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={placeholderData}
            renderItem={({ item, index }) => <BookCard book={item} index={index} />}
            keyExtractor={(item, index) => index.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.booksList}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 10,
  },
  booksList: {
    padding: 10,
  },
  bookCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 5,
    flex: 1,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 4,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.overlay,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webBooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  webBookCard: {
    margin: 5,
  },
});