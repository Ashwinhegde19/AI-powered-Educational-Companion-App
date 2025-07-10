import React, {createContext, useContext, useReducer} from 'react';
import ApiService from '../services/ApiService';

const ApiContext = createContext();

const initialState = {
  channels: [],
  videos: [],
  concepts: [],
  loading: false,
  error: null,
  currentVideo: null,
  searchResults: [],
};

const apiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_ERROR':
      return {...state, error: action.payload, loading: false};
    case 'SET_CHANNELS':
      return {...state, channels: action.payload, loading: false};
    case 'SET_VIDEOS':
      return {...state, videos: action.payload, loading: false};
    case 'SET_CONCEPTS':
      return {...state, concepts: action.payload, loading: false};
    case 'SET_CURRENT_VIDEO':
      return {...state, currentVideo: action.payload};
    case 'SET_SEARCH_RESULTS':
      return {...state, searchResults: action.payload, loading: false};
    case 'CLEAR_ERROR':
      return {...state, error: null};
    default:
      return state;
  }
};

export const ApiProvider = ({children}) => {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  const setLoading = (loading) => dispatch({type: 'SET_LOADING', payload: loading});
  const setError = (error) => dispatch({type: 'SET_ERROR', payload: error});
  const clearError = () => dispatch({type: 'CLEAR_ERROR'});

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getChannels();
      dispatch({type: 'SET_CHANNELS', payload: response.data});
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchRandomVideos = async (limit = 10) => {
    try {
      setLoading(true);
      const response = await ApiService.getRandomVideos(limit);
      dispatch({type: 'SET_VIDEOS', payload: response.data});
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchConcepts = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getConcepts();
      dispatch({type: 'SET_CONCEPTS', payload: response.data});
    } catch (error) {
      setError(error.message);
    }
  };

  const searchVideos = async (query) => {
    try {
      setLoading(true);
      const response = await ApiService.searchVideos(query);
      dispatch({type: 'SET_SEARCH_RESULTS', payload: response.data});
    } catch (error) {
      setError(error.message);
    }
  };

  const setCurrentVideo = (video) => {
    dispatch({type: 'SET_CURRENT_VIDEO', payload: video});
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    fetchChannels,
    fetchRandomVideos,
    fetchConcepts,
    searchVideos,
    setCurrentVideo,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
