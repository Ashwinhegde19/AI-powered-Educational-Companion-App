import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Surface, Card, Button, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../theme/colors';
import {ApiContext} from '../context/ApiContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const ChannelDetailScreen = ({route, navigation}) => {
  const {channel} = route.params;
  const {apiService} = useContext(ApiContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChannelVideos();
  }, []);

  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, fetch random videos since we don't have channel-specific endpoint
      const response = await apiService.getRandomVideos(10);
      setVideos(response.videos || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', {video});
  };

  const renderVideo = ({item}) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleVideoPress(item)}>
      <Card style={styles.card}>
        <View style={styles.videoThumbnail}>
          {item.thumbnailUrl ? (
            <Image source={{uri: item.thumbnailUrl}} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Icon name="play-circle-filled" size={48} color={colors.primary} />
            </View>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoMeta} numberOfLines={1}>
            {item.channelTitle} • {item.duration || 'N/A'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.title}>{channel.title || 'Channel Details'}</Text>
        <Text style={styles.subtitle}>
          {channel.statistics?.subscriberCount || '0'} subscribers
        </Text>
      </Surface>

      <Surface style={styles.content}>
        <Text style={styles.description}>
          {channel.description || 'No description available'}
        </Text>

        {error ? (
          <ErrorMessage
            message={error}
            onRetry={fetchChannelVideos}
            style={styles.errorContainer}
          />
        ) : (
          <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            {videos.length > 0 ? (
              <FlatList
                data={videos}
                renderItem={renderVideo}
                keyExtractor={(item) => item._id || item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="video-library" size={64} color={colors.textSecondary} />
                <Text style={styles.placeholderText}>
                  No videos available for this channel
                </Text>
              </View>
            )}
          </View>
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 20,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  videosSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  videoCard: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  videoThumbnail: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
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
  videoMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginVertical: 16,
    textAlign: 'center',
  },
  errorContainer: {
    marginVertical: 20,
  },
});

export default ChannelDetailScreen;
