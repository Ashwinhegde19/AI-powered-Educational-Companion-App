import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Surface, Card, Title, Paragraph, Chip, Button} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApi} from '../context/ApiContext';
import {colors} from '../theme/colors';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const {width} = Dimensions.get('window');

const HomeScreen = ({navigation}) => {
  const {
    channels,
    videos,
    loading,
    error,
    fetchChannels,
    fetchRandomVideos,
    clearError,
  } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchChannels(),
      fetchRandomVideos(8),
    ]);
  }, [fetchChannels, fetchRandomVideos]);

  const onRefresh = useCallback(() => {
    clearError();
    loadData();
  }, [loadData, clearError]);

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', {video});
  };

  const handleChannelPress = (channel) => {
    navigation.navigate('Channels', {
      screen: 'ChannelDetail',
      params: {channel},
    });
  };

  const handleSeeAllVideos = () => {
    navigation.navigate('Search');
  };

  const handleSeeAllChannels = () => {
    navigation.navigate('Channels');
  };

  if (loading && !channels.length && !videos.length) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }>
      
      {/* Header Gradient */}
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>AI Education Companion</Text>
          <Text style={styles.subtitle}>Discover educational videos with AI-powered NCERT concept mapping</Text>
        </View>
      </LinearGradient>

      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {/* Featured Videos Section */}
      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Featured Videos</Title>
          <Button
            mode="text"
            onPress={handleSeeAllVideos}
            textColor={colors.primary}>
            See All
          </Button>
        </View>
        
        {videos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onPress={() => handleVideoPress(video)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="video-library" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No videos available</Text>
            <Text style={styles.emptySubtext}>Pull to refresh or check your connection</Text>
          </View>
        )}
      </Surface>

      {/* Channels Section */}
      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Educational Channels</Title>
          <Button
            mode="text"
            onPress={handleSeeAllChannels}
            textColor={colors.primary}>
            See All
          </Button>
        </View>
        
        {channels.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {channels.slice(0, 6).map((channel) => (
              <ChannelCard
                key={channel._id}
                channel={channel}
                onPress={() => handleChannelPress(channel)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="library-books" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No channels available</Text>
            <Text style={styles.emptySubtext}>Pull to refresh or check your connection</Text>
          </View>
        )}
      </Surface>

      {/* Quick Actions Section */}
      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="search"
            title="Search Videos"
            subtitle="Find educational content"
            onPress={() => navigation.navigate('Search')}
          />
          <QuickActionCard
            icon="school"
            title="NCERT Concepts"
            subtitle="Browse curriculum topics"
            onPress={() => navigation.navigate('Concepts')}
          />
        </View>
      </Surface>
    </ScrollView>
  );
};

const VideoCard = ({video, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.videoCard}>
    <Card style={styles.card}>
      <FastImage
        source={{
          uri: video.thumbnails?.medium?.url || video.thumbnails?.default?.url || 
               'https://via.placeholder.com/300x200?text=No+Image'
        }}
        style={styles.videoThumbnail}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || 'Untitled Video'}
        </Text>
        <Text style={styles.channelName} numberOfLines={1}>
          {video.channelTitle || 'Unknown Channel'}
        </Text>
        <View style={styles.videoStats}>
          <Icon name="play-arrow" size={16} color={colors.textSecondary} />
          <Text style={styles.statsText}>
            {video.statistics?.viewCount || '0'} views
          </Text>
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

const ChannelCard = ({channel, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.channelCard}>
    <Card style={styles.card}>
      <FastImage
        source={{
          uri: channel.thumbnails?.medium?.url || channel.thumbnails?.default?.url ||
               'https://via.placeholder.com/150x150?text=Channel'
        }}
        style={styles.channelThumbnail}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.channelTitle} numberOfLines={2}>
          {channel.title || 'Untitled Channel'}
        </Text>
        <Text style={styles.subscriberCount} numberOfLines={1}>
          {channel.statistics?.subscriberCount || '0'} subscribers
        </Text>
        <View style={styles.categoriesContainer}>
          {channel.educationalCategories?.slice(0, 2).map((category, index) => (
            <Chip key={index} style={styles.categoryChip} textStyle={styles.chipText}>
              {category}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

const QuickActionCard = ({icon, title, subtitle, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
    <Surface style={styles.quickActionSurface}>
      <Icon name={icon} size={32} color={colors.primary} />
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </Surface>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalScroll: {
    paddingRight: 10,
  },
  videoCard: {
    marginRight: 15,
  },
  channelCard: {
    marginRight: 15,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  videoThumbnail: {
    width: 280,
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  channelThumbnail: {
    width: 200,
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subscriberCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 10,
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionSurface: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
