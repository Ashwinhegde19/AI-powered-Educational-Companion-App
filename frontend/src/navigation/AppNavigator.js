import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import ChannelsScreen from '../screens/ChannelsScreen';
import ChannelDetailScreen from '../screens/ChannelDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ConceptsScreen from '../screens/ConceptsScreen';
import ConceptDetailScreen from '../screens/ConceptDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

import {colors} from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{title: 'AI Education Companion'}}
    />
    <Stack.Screen 
      name="VideoPlayer" 
      component={VideoPlayerScreen}
      options={{
        title: 'Video Player',
        headerShown: false, // Hide header for video player
      }}
    />
  </Stack.Navigator>
);

const ChannelsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="ChannelsMain" 
      component={ChannelsScreen} 
      options={{title: 'Channels'}}
    />
    <Stack.Screen 
      name="ChannelDetail" 
      component={ChannelDetailScreen}
      options={{title: 'Channel Details'}}
    />
    <Stack.Screen 
      name="VideoPlayer" 
      component={VideoPlayerScreen}
      options={{
        title: 'Video Player',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="SearchMain" 
      component={SearchScreen} 
      options={{title: 'Search'}}
    />
    <Stack.Screen 
      name="VideoPlayer" 
      component={VideoPlayerScreen}
      options={{
        title: 'Video Player',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const ConceptsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="ConceptsMain" 
      component={ConceptsScreen} 
      options={{title: 'NCERT Concepts'}}
    />
    <Stack.Screen 
      name="ConceptDetail" 
      component={ConceptDetailScreen}
      options={{title: 'Concept Details'}}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{title: 'Profile'}}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Channels') {
            iconName = 'video-library';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Concepts') {
            iconName = 'school';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Channels" component={ChannelsStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Concepts" component={ConceptsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
