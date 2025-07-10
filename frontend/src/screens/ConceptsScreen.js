import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {Surface, Chip, Card, Searchbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApi} from '../context/ApiContext';
import {colors} from '../theme/colors';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const ConceptsScreen = ({navigation}) => {
  const {
    concepts,
    loading,
    error,
    fetchConcepts,
    clearError,
  } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [filteredConcepts, setFilteredConcepts] = useState([]);

  const grades = ['All', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = [
    'All',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Political Science',
    'Economics',
    'English',
    'Hindi',
  ];

  useEffect(() => {
    loadConcepts();
  }, []);

  useEffect(() => {
    filterConcepts();
  }, [concepts, searchQuery, selectedGrade, selectedSubject]);

  const loadConcepts = useCallback(async () => {
    await fetchConcepts();
  }, [fetchConcepts]);

  const onRefresh = useCallback(() => {
    clearError();
    loadConcepts();
  }, [loadConcepts, clearError]);

  const filterConcepts = useCallback(() => {
    let filtered = concepts;

    // Filter by grade
    if (selectedGrade !== 'All') {
      filtered = filtered.filter(concept => 
        concept.grade?.toString() === selectedGrade
      );
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(concept => 
        concept.subject === selectedSubject
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(concept =>
        concept.title?.toLowerCase().includes(query) ||
        concept.description?.toLowerCase().includes(query) ||
        concept.keywords?.some(keyword => 
          keyword.toLowerCase().includes(query)
        )
      );
    }

    setFilteredConcepts(filtered);
  }, [concepts, searchQuery, selectedGrade, selectedSubject]);

  const handleConceptPress = (concept) => {
    navigation.navigate('ConceptDetail', {concept});
  };

  const renderConcept = ({item: concept}) => (
    <TouchableOpacity
      onPress={() => handleConceptPress(concept)}
      style={styles.conceptItem}>
      <Card style={styles.conceptCard}>
        <Card.Content style={styles.conceptContent}>
          <View style={styles.conceptHeader}>
            <Text style={styles.conceptTitle} numberOfLines={2}>
              {concept.title || 'Untitled Concept'}
            </Text>
            <View style={styles.conceptMeta}>
              <Chip style={styles.gradeChip} textStyle={styles.chipText}>
                Grade {concept.grade || 'N/A'}
              </Chip>
              <Chip style={styles.subjectChip} textStyle={styles.chipText}>
                {concept.subject || 'General'}
              </Chip>
            </View>
          </View>

          {concept.description && (
            <Text style={styles.conceptDescription} numberOfLines={3}>
              {concept.description}
            </Text>
          )}

          <View style={styles.conceptDetails}>
            <View style={styles.detailItem}>
              <Icon name="book" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                Chapter {concept.chapter?.number || 'N/A'}: {concept.chapter?.title || 'Unknown'}
              </Text>
            </View>
            
            {concept.difficulty && (
              <View style={styles.detailItem}>
                <Icon name="trending-up" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  Difficulty: {concept.difficulty}
                </Text>
              </View>
            )}
          </View>

          {concept.keywords && concept.keywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              {concept.keywords.slice(0, 4).map((keyword, index) => (
                <Chip 
                  key={index} 
                  style={styles.keywordChip} 
                  textStyle={styles.keywordText}>
                  {keyword}
                </Chip>
              ))}
              {concept.keywords.length > 4 && (
                <Text style={styles.moreKeywords}>
                  +{concept.keywords.length - 4} more
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderGradeChip = (grade) => (
    <Chip
      key={grade}
      style={[
        styles.filterChip,
        selectedGrade === grade && styles.selectedFilterChip,
      ]}
      textStyle={[
        styles.filterChipText,
        selectedGrade === grade && styles.selectedFilterChipText,
      ]}
      onPress={() => setSelectedGrade(grade)}>
      {grade === 'All' ? 'All Grades' : `Grade ${grade}`}
    </Chip>
  );

  const renderSubjectChip = (subject) => (
    <Chip
      key={subject}
      style={[
        styles.filterChip,
        selectedSubject === subject && styles.selectedFilterChip,
      ]}
      textStyle={[
        styles.filterChipText,
        selectedSubject === subject && styles.selectedFilterChipText,
      ]}
      onPress={() => setSelectedSubject(subject)}>
      {subject}
    </Chip>
  );

  if (loading && !concepts.length) {
    return <LoadingScreen message="Loading NCERT concepts..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search NCERT concepts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.primary}
        />
      </Surface>

      {/* Filters */}
      <Surface style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Grade:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={grades}
          keyExtractor={(item) => item}
          renderItem={({item}) => renderGradeChip(item)}
          contentContainerStyle={styles.filterList}
        />
        
        <Text style={[styles.filterTitle, styles.secondFilterTitle]}>Filter by Subject:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={subjects}
          keyExtractor={(item) => item}
          renderItem={({item}) => renderSubjectChip(item)}
          contentContainerStyle={styles.filterList}
        />
      </Surface>

      {error && <ErrorMessage message={error} onDismiss={clearError} onRetry={loadConcepts} />}

      {/* Results Summary */}
      {filteredConcepts.length > 0 && (
        <Surface style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Found {filteredConcepts.length} concept{filteredConcepts.length !== 1 ? 's' : ''}
            {selectedGrade !== 'All' && ` for Grade ${selectedGrade}`}
            {selectedSubject !== 'All' && ` in ${selectedSubject}`}
          </Text>
        </Surface>
      )}

      {/* Concepts List */}
      <FlatList
        data={filteredConcepts}
        keyExtractor={(item) => item._id || item.conceptId}
        renderItem={renderConcept}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.conceptsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="school" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery || selectedGrade !== 'All' || selectedSubject !== 'All'
                ? 'No concepts match your criteria'
                : 'No NCERT concepts available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedGrade !== 'All' || selectedSubject !== 'All'
                ? 'Try adjusting your search or filters'
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
    marginBottom: 8,
  },
  secondFilterTitle: {
    marginTop: 16,
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
  summaryContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: colors.primaryLight + '20',
  },
  summaryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  conceptsList: {
    padding: 12,
  },
  conceptItem: {
    marginBottom: 12,
  },
  conceptCard: {
    borderRadius: 12,
    elevation: 2,
  },
  conceptContent: {
    padding: 16,
  },
  conceptHeader: {
    marginBottom: 12,
  },
  conceptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  conceptMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: colors.secondary + '20',
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: colors.primary + '20',
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
  },
  conceptDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  conceptDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  keywordChip: {
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: colors.ncert + '20',
  },
  keywordText: {
    fontSize: 11,
    color: colors.text,
  },
  moreKeywords: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
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

export default ConceptsScreen;
