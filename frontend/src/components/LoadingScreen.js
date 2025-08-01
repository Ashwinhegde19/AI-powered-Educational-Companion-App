import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {colors} from '../theme/colors';

const LoadingScreen = ({message = 'Loading...'}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LoadingScreen;
