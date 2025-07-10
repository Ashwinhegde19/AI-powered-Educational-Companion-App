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
import {Surface, Card, Button, Chip, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../theme/colors';
import {ApiContext} from '../context/ApiContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const ConceptDetailScreen = ({route, navigation}) => {
  const {concept} = route.params;
  const {apiService} = useContext(ApiContext);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRelatedVideos();
  }, []);

  const fetchRelatedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch videos related to this concept
      const response = await apiService.getRandomVideos(5);
      setRelatedVideos(response.videos || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch related videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', {video, concept});
  };

  const renderVideo = ({item}) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleVideoPress(item)}>
      <Card style={styles.card}>
        <View style={styles.videoRow}>
          <View style={styles.videoThumbnail}>
            {item.thumbnailUrl ? (
              <Image source={{uri: item.thumbnailUrl}} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Icon name="play-circle-filled" size={32} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.videoMeta} numberOfLines={1}>
              {item.channelTitle} • {item.duration || 'N/A'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.title}>{concept.title || 'Concept Details'}</Text>
        <View style={styles.meta}>
          <Chip style={styles.gradeChip}>Grade {concept.grade || 'N/A'}</Chip>
          <Chip style={styles.subjectChip}>{concept.subject || 'General'}</Chip>
        </View>
      </Surface>

      <Surface style={styles.content}>
        <Text style={styles.description}>
          {concept.description || 'No description available'}
        </Text>

        {concept.keywords && concept.keywords.length > 0 && (
          <View style={styles.keywordsSection}>
            <Text style={styles.sectionTitle}>Keywords</Text>
            <View style={styles.keywordsContainer}>
              {concept.keywords.map((keyword, index) => (
                <Chip key={index} style={styles.keywordChip}>
                  {keyword}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading related videos...</Text>
          </View>
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={fetchRelatedVideos}
            style={styles.errorContainer}
          />
        ) : (
          <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Related Videos</Text>
            {relatedVideos.length > 0 ? (
              <FlatList
                data={relatedVideos}
                renderItem={renderVideo}
                keyExtractor={(item) => item._id || item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="video-library" size={64} color={colors.textSecondary} />
                <Text style={styles.placeholderText}>
                  No related videos found for this concept
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
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
  },
  gradeChip: {
    marginRight: 8,
    backgroundColor: colors.secondary + '20',
  },
  subjectChip: {
    backgroundColor: colors.primary + '20',
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
  keywordsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: colors.surface,
    marginBottom: 4,
    marginRight: 8,
  },
  videosSection: {
    marginTop: 16,
  },
  videoCard: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  videoRow: {
    flexDirection: 'row',
    padding: 12,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
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
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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

export default ConceptDetailScreen;
