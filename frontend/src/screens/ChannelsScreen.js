import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {Searchbar, Surface, Chip, Card, Button} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApi} from '../context/ApiContext';
import {colors} from '../theme/colors';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const ChannelsScreen = ({navigation}) => {
  const {
    channels,
    loading,
    error,
    fetchChannels,
    clearError,
  } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredChannels, setFilteredChannels] = useState([]);

  const categories = [
    'All',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'General Science',
    'History',
    'Geography',
  ];

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    filterChannels();
  }, [channels, searchQuery, selectedCategory]);

  const loadChannels = useCallback(async () => {
    await fetchChannels();
  }, [fetchChannels]);

  const onRefresh = useCallback(() => {
    clearError();
    loadChannels();
  }, [loadChannels, clearError]);

  const filterChannels = useCallback(() => {
    let filtered = channels;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(channel =>
        channel.educationalCategories?.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(channel =>
        channel.title?.toLowerCase().includes(query) ||
        channel.description?.toLowerCase().includes(query)
      );
    }

    setFilteredChannels(filtered);
  }, [channels, searchQuery, selectedCategory]);

  const handleChannelPress = (channel) => {
    navigation.navigate('ChannelDetail', {channel});
  };

  const renderChannel = ({item: channel}) => (
    <TouchableOpacity
      onPress={() => handleChannelPress(channel)}
      style={styles.channelItem}>
      <Card style={styles.channelCard}>
        <View style={styles.channelContent}>
          <FastImage
            source={{
              uri: channel.thumbnails?.medium?.url || 
                   channel.thumbnails?.default?.url ||
                   'https://via.placeholder.com/100x100?text=Channel'
            }}
            style={styles.channelThumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          <View style={styles.channelInfo}>
            <Text style={styles.channelTitle} numberOfLines={2}>
              {channel.title || 'Untitled Channel'}
            </Text>
            
            <Text style={styles.channelStats} numberOfLines={1}>
              {channel.statistics?.subscriberCount || '0'} subscribers • {' '}
              {channel.statistics?.videoCount || '0'} videos
            </Text>
            
            <Text style={styles.channelDescription} numberOfLines={2}>
              {channel.description || 'No description available'}
            </Text>
            
            <View style={styles.categoriesContainer}>
              {channel.educationalCategories?.slice(0, 3).map((category, index) => (
                <Chip key={index} style={styles.categoryChip} textStyle={styles.chipText}>
                  {category}
                </Chip>
              ))}
              {channel.targetAudience && (
                <Chip style={styles.audienceChip} textStyle={styles.chipText}>
                  {channel.targetAudience}
                </Chip>
              )}
            </View>
          </View>
          
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category) => (
    <Chip
      key={category}
      style={[
        styles.filterChip,
        selectedCategory === category && styles.selectedFilterChip,
      ]}
      textStyle={[
        styles.filterChipText,
        selectedCategory === category && styles.selectedFilterChipText,
      ]}
      onPress={() => setSelectedCategory(category)}>
      {category}
    </Chip>
  );

  if (loading && !channels.length) {
    return <LoadingScreen message="Loading channels..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search channels..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.textSecondary}
        />
      </Surface>

      {/* Category Filter */}
      <Surface style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Categories:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({item}) => renderCategoryChip(item)}
          contentContainerStyle={styles.filterList}
        />
      </Surface>

      {error && <ErrorMessage message={error} onDismiss={clearError} onRetry={loadChannels} />}

      {/* Channels List */}
      <FlatList
        data={filteredChannels}
        keyExtractor={(item) => item._id}
        renderItem={renderChannel}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.channelsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="video-library" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'All' 
                ? 'No channels match your criteria' 
                : 'No channels available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter' 
                : 'Pull to refresh or check your connection'}
            </Text>
          </View>
        }
      />
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
  filterContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text,
  },
  selectedFilterChipText: {
    color: colors.textLight,
  },
  channelsList: {
    padding: 12,
  },
  channelItem: {
    marginBottom: 12,
  },
  channelCard: {
    borderRadius: 12,
    elevation: 2,
  },
  channelContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  channelThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  channelStats: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  channelDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: colors.primaryLight,
  },
  audienceChip: {
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: colors.secondary + '20',
  },
  chipText: {
    fontSize: 10,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  },
});

export default ChannelsScreen;
