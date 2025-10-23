import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Book } from '@/src/types/book';
import AudioPlayer from './AudioPlayer';

interface BookCardProps {
  book: Book;
  index?: number;
  onPress?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, index, onPress }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  
  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    setShowAudioPlayer(!showAudioPlayer);
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress(book);
    }
  };
  
  const handleImageError = () => {
    console.log('Image failed to load:', book.thumbnailUrl);
  };

  return (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        {book.thumbnailUrl ? (
          <Image
            source={{ uri: book.thumbnailUrl }}
            style={styles.bookCover}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.bookCover, styles.placeholderCover]}>
            <Ionicons name="book" size={50} color={Colors.textMuted} />
          </View>
        )}
        
        {/* Audio button overlay */}
        {book.audioUrl && (
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleAudio();
            }}
          >
            <Ionicons 
              name={isAudioPlaying ? "pause-circle" : "play-circle"} 
              size={30} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        )}
        
        {/* Actions overlay */}
        <View style={styles.actionsOverlay}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle like action
            }}
          >
            <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle save action
            }}
          >
            <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle share action
            }}
          >
            <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        
        {book.tags && book.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {book.tags.slice(0, 2).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
              </View>
            ))}
            {book.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{book.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
      
      {/* Audio player (expanded) */}
      {showAudioPlayer && book.audioUrl && (
        <View style={styles.audioPlayerContainer}>
          <AudioPlayer
            audioUrl={book.audioUrl}
            title={`${book.title} - ${book.author}`}
            onClose={() => {
              setShowAudioPlayer(false);
              setIsAudioPlaying(false);
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? 200 : (width - 40) / 2 - 10; // Larger size for books

const styles = StyleSheet.create({
  bookCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    width: cardWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 2/3,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  audioButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  moreTagsText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginLeft: 2,
  },
  audioPlayerContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 8,
  },
});

export default BookCard;