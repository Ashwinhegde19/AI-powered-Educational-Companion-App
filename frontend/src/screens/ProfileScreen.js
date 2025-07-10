import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Surface, Card, Button, List, Switch} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../theme/colors';

const ProfileScreen = ({navigation}) => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={64} color={colors.primary} />
        </View>
        <Text style={styles.userName}>Student User</Text>
        <Text style={styles.userEmail}>student@example.com</Text>
      </Surface>

      {/* Learning Progress */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Videos Watched</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Concepts Learned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Hours Studied</Text>
          </View>
        </View>
      </Surface>

      {/* Settings */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <List.Item
          title="Notifications"
          description="Get notified about new content"
          left={() => <List.Icon icon="notifications" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color={colors.primary}
            />
          )}
        />
        
        <List.Item
          title="Dark Mode"
          description="Switch to dark theme"
          left={() => <List.Icon icon="brightness-6" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color={colors.primary}
            />
          )}
        />
        
        <List.Item
          title="Download Quality"
          description="HD"
          left={() => <List.Icon icon="high-quality" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        
        <List.Item
          title="Language"
          description="English"
          left={() => <List.Icon icon="language" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </Surface>

      {/* About */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <List.Item
          title="Help & Support"
          left={() => <List.Icon icon="help" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        
        <List.Item
          title="Privacy Policy"
          left={() => <List.Icon icon="privacy-tip" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        
        <List.Item
          title="Terms of Service"
          left={() => <List.Icon icon="description" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        
        <List.Item
          title="App Version"
          description="1.0.0"
          left={() => <List.Icon icon="info" />}
        />
      </Surface>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AI-powered Educational Companion
        </Text>
        <Text style={styles.footerSubtext}>
          Making learning smarter with AI
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    margin: 12,
    borderRadius: 12,
    elevation: 2,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default ProfileScreen;
