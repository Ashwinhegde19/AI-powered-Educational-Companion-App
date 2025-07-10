import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import {Surface, Chip, Card, Button, Portal, Modal} from 'react-native-paper';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {colors} from '../theme/colors';
import {useApi} from '../context/ApiContext';
import LoadingScreen from '../components/LoadingScreen';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const VideoPlayerScreen = ({route, navigation}) => {
  const {video} = route.params;
  const {currentVideo, setCurrentVideo} = useApi();
  
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showConcepts, setShowConcepts] = useState(false);
  const [conceptsModalVisible, setConceptsModalVisible] = useState(false);
  
  const playerRef = useRef(null);

  useEffect(() => {
    setCurrentVideo(video);
    
    // Lock to portrait initially
    Orientation.lockToPortrait();
    
    return () => {
      // Reset orientation on unmount
      Orientation.unlockAllOrientations();
    };
  }, [video, setCurrentVideo]);

  useEffect(() => {
    if (fullscreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  }, [fullscreen]);

  const extractVideoId = (url) => {
    if (!url) return video.videoId || '';
    
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  const onStateChange = (state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  };

  const onProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const onDurationChange = (data) => {
    setDuration(data.duration);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleBack = () => {
    if (fullscreen) {
      setFullscreen(false);
    } else {
      navigation.goBack();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mockNCERTConcepts = [
    {
      id: 1,
      title: 'Motion in a Straight Line',
      subject: 'Physics',
      grade: 11,
      timestamp: 120,
      confidence: 0.92,
    },
    {
      id: 2,
      title: 'Velocity and Acceleration',
      subject: 'Physics',
      grade: 11,
      timestamp: 180,
      confidence: 0.88,
    },
    {
      id: 3,
      title: 'Equations of Motion',
      subject: 'Physics',
      grade: 11,
      timestamp: 240,
      confidence: 0.85,
    },
  ];

  const handleConceptPress = async (concept) => {
    try {
      if (playerRef.current) {
        await playerRef.current.seekTo(concept.timestamp);
        setCurrentTime(concept.timestamp);
        setConceptsModalVisible(false);
        Alert.alert(
          'Concept Navigation',
          `Jumped to ${concept.title} at ${formatTime(concept.timestamp)}`
        );
      }
    } catch (error) {
      console.error('Error seeking to timestamp:', error);
    }
  };

  if (!video) {
    return <LoadingScreen />;
  }

  const videoId = extractVideoId(video.url) || video.videoId || '';

  if (fullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.fullscreenBackButton} onPress={handleBack}>
          <Icon name="fullscreen-exit" size={32} color={colors.textLight} />
        </TouchableOpacity>
        
        <YoutubePlayer
          ref={playerRef}
          height={screenHeight}
          width={screenWidth}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onProgress={onProgress}
          onReady={() => console.log('Player ready')}
          initialPlayerParams={{
            controls: true,
            showClosedCaptions: true,
            preventFullScreen: false,
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title || 'Video Player'}
        </Text>
        <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
          <Icon name="fullscreen" size={24} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Video Player */}
        <View style={styles.playerContainer}>
          <YoutubePlayer
            ref={playerRef}
            height={220}
            width={screenWidth}
            play={playing}
            videoId={videoId}
            onChangeState={onStateChange}
            onProgress={onProgress}
            onReady={() => {
              console.log('Player ready');
              onDurationChange({duration: video.duration || 0});
            }}
            initialPlayerParams={{
              controls: true,
              showClosedCaptions: true,
              preventFullScreen: true,
            }}
          />
          
          {/* Player Controls Overlay */}
          <View style={styles.playerOverlay}>
            <TouchableOpacity
              style={styles.conceptsButton}
              onPress={() => setConceptsModalVisible(true)}>
              <Icon name="school" size={20} color={colors.textLight} />
              <Text style={styles.conceptsButtonText}>NCERT Concepts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Info */}
        <Surface style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title || 'Untitled Video'}</Text>
          <Text style={styles.channelName}>{video.channelTitle || 'Unknown Channel'}</Text>
          
          <View style={styles.videoStats}>
            <View style={styles.statItem}>
              <Icon name="visibility" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>
                {video.statistics?.viewCount || '0'} views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="thumb-up" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>
                {video.statistics?.likeCount || '0'} likes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="access-time" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {video.description && (
            <Text style={styles.description} numberOfLines={3}>
              {video.description}
            </Text>
          )}
        </Surface>

        {/* NCERT Concepts Preview */}
        <Surface style={styles.conceptsPreview}>
          <View style={styles.conceptsHeader}>
            <Text style={styles.conceptsTitle}>Related NCERT Concepts</Text>
            <Button
              mode="text"
              onPress={() => setConceptsModalVisible(true)}
              textColor={colors.primary}>
              View All
            </Button>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockNCERTConcepts.slice(0, 3).map((concept) => (
              <TouchableOpacity
                key={concept.id}
                onPress={() => handleConceptPress(concept)}
                style={styles.conceptCard}>
                <Card style={styles.conceptCardInner}>
                  <Card.Content>
                    <Text style={styles.conceptCardTitle} numberOfLines={2}>
                      {concept.title}
                    </Text>
                    <View style={styles.conceptMeta}>
                      <Chip style={styles.subjectChip}>{concept.subject}</Chip>
                      <Text style={styles.gradeText}>Grade {concept.grade}</Text>
                    </View>
                    <Text style={styles.timestampText}>
                      @ {formatTime(concept.timestamp)}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </ScrollView>

      {/* NCERT Concepts Modal */}
      <Portal>
        <Modal
          visible={conceptsModalVisible}
          onDismiss={() => setConceptsModalVisible(false)}
          contentContainerStyle={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>NCERT Concepts in this Video</Text>
            <TouchableOpacity onPress={() => setConceptsModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {mockNCERTConcepts.map((concept) => (
              <TouchableOpacity
                key={concept.id}
                onPress={() => handleConceptPress(concept)}
                style={styles.modalConceptItem}>
                <View style={styles.modalConceptContent}>
                  <Text style={styles.modalConceptTitle}>{concept.title}</Text>
                  <View style={styles.modalConceptMeta}>
                    <Text style={styles.modalConceptSubject}>{concept.subject}</Text>
                    <Text style={styles.modalConceptGrade}>Grade {concept.grade}</Text>
                    <Text style={styles.modalConceptTime}>
                      {formatTime(concept.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill,
                        {width: `${concept.confidence * 100}%`}
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {(concept.confidence * 100).toFixed(0)}% match
                  </Text>
                </View>
                <Icon name="play-arrow" size={24} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenBackButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginHorizontal: 12,
  },
  fullscreenButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  playerOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },
  conceptsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conceptsButtonText: {
    color: colors.textLight,
    fontSize: 12,
    marginLeft: 4,
  },
  videoInfo: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  channelName: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  conceptsPreview: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  conceptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conceptsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  conceptCard: {
    marginRight: 12,
    width: 200,
  },
  conceptCardInner: {
    borderRadius: 8,
  },
  conceptCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  conceptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectChip: {
    backgroundColor: colors.ncert,
    marginRight: 8,
  },
  gradeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timestampText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  modal: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    padding: 20,
  },
  modalConceptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalConceptContent: {
    flex: 1,
  },
  modalConceptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalConceptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalConceptSubject: {
    fontSize: 12,
    color: colors.primary,
    marginRight: 12,
  },
  modalConceptGrade: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
  },
  modalConceptTime: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

export default VideoPlayerScreen;
