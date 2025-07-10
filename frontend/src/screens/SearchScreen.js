import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import {Searchbar, Surface, Chip, Card, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ApiContext} from '../context/ApiContext';
import {colors} from '../theme/colors';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const SearchScreen = ({navigation}) => {
  const {apiService} = React.useContext(ApiContext);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'physics motion',
    'mathematics algebra', 
    'chemistry atoms',
    'biology cells',
  ]);

  const popularSearches = [
    'Newton\'s laws',
    'Quadratic equations',
    'Periodic table',
    'Photosynthesis',
    'Indian history',
    'Geography climate',
  ];

  const handleSearch = useCallback(async (query = searchQuery) => {
    if (!query.trim()) return;

    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
      return updated;
    });

    try {
      setLoading(true);
      setError(null);
      // For now, search using random videos - in production this would be actual search
      const response = await apiService.getRandomVideos(10);
      setSearchResults(response.videos || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, apiService]);

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', {video});
  };

  const renderVideo = ({item: video}) => (
    <TouchableOpacity
      onPress={() => handleVideoPress(video)}
      style={styles.videoItem}>
      <Card style={styles.videoCard}>
        <View style={styles.videoContent}>
          <Image
            source={{
              uri: video.thumbnailUrl || video.thumbnails?.medium?.url || 
                   video.thumbnails?.default?.url ||
                   'https://via.placeholder.com/160x90?text=Video'
            }}
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title || 'Untitled Video'}
            </Text>
            
            <Text style={styles.channelName} numberOfLines={1}>
              {video.channelTitle || 'Unknown Channel'}
            </Text>
            
            <View style={styles.videoStats}>
              <Icon name="visibility" size={14} color={colors.textSecondary} />
              <Text style={styles.statsText}>
                {video.statistics?.viewCount || '0'} views
              </Text>
              <Icon name="access-time" size={14} color={colors.textSecondary} style={styles.statIcon} />
              <Text style={styles.statsText}>
                {video.duration || '0:00'}
              </Text>
            </View>

            {video.description && (
              <Text style={styles.videoDescription} numberOfLines={2}>
                {video.description}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderSearchSuggestion = (item, isRecent = false) => (
    <TouchableOpacity
      key={item}
      onPress={() => {
        setSearchQuery(item);
        handleSearch(item);
      }}
      style={styles.suggestionItem}>
      <Icon 
        name={isRecent ? "history" : "trending-up"} 
        size={20} 
        color={colors.textSecondary} 
      />
      <Text style={styles.suggestionText}>{item}</Text>
      <Icon name="north-west" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const EmptySearchState = () => (
    <View style={styles.emptyContainer}>
      <Surface style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Recent Searches</Text>
        {recentSearches.map(item => renderSearchSuggestion(item, true))}
      </Surface>

      <Surface style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Popular Searches</Text>
        {popularSearches.map(item => renderSearchSuggestion(item, false))}
      </Surface>

      <Surface style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Search Tips</Text>
        <View style={styles.tipItem}>
          <Icon name="lightbulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Use specific keywords like "Newton's laws motion"</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="lightbulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Search by subject: "Physics", "Chemistry", etc.</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="lightbulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Find NCERT topics by grade: "Class 10 mathematics"</Text>
        </View>
      </Surface>
    </View>
  );

  const EmptyResultsState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No videos found</Text>
      <Text style={styles.emptySubtext}>
        Try different keywords or check your spelling
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          setSearchQuery('');
          clearError();
        }}
        style={styles.clearButton}>
        Clear Search
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for educational videos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => handleSearch()}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.primary}
          right={() => searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        />
      </Surface>

      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {loading ? (
        <LoadingScreen message="Searching..." />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id || item.videoId}
          renderItem={renderVideo}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.trim() ? (
        <EmptyResultsState />
      ) : (
        <EmptySearchState />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  searchBar: {
    backgroundColor: 'transparent',
  },
  searchInput: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 12,
  },
  suggestionsContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: colors.primaryLight + '20',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  resultsList: {
    padding: 12,
  },
  videoItem: {
    marginBottom: 12,
  },
  videoCard: {
    borderRadius: 12,
    elevation: 2,
  },
  videoContent: {
    flexDirection: 'row',
    padding: 12,
  },
  videoThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 6,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  statIcon: {
    marginLeft: 12,
  },
  videoDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearButton: {
    borderColor: colors.primary,
  },
});

export default SearchScreen;
