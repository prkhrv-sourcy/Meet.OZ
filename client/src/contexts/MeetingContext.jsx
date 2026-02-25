import { createContext, useContext, useReducer } from 'react';

const MeetingContext = createContext(null);

const initialState = {
  code: null,
  title: '',
  userName: '',
  participants: [],
  emotionData: [],
  transcript: [],
  status: null,
  localEmotion: null,
  remoteEmotions: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MEETING':
      return { ...state, code: action.code, title: action.title, status: action.status };
    case 'SET_USER':
      return { ...state, userName: action.name };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.participants };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.participant] };
    case 'REMOVE_PARTICIPANT':
      return { ...state, participants: state.participants.filter(p => p.id !== action.id) };
    case 'ADD_EMOTION':
      return { ...state, emotionData: [...state.emotionData, action.snapshot] };
    case 'ADD_EMOTIONS_BATCH':
      return { ...state, emotionData: [...state.emotionData, ...action.snapshots] };
    case 'SET_LOCAL_EMOTION':
      return { ...state, localEmotion: action.emotion };
    case 'SET_REMOTE_EMOTION':
      return { ...state, remoteEmotions: { ...state.remoteEmotions, [action.uid]: action.emotion } };
    case 'ADD_TRANSCRIPT':
      return { ...state, transcript: [...state.transcript, action.segment] };
    case 'ADD_TRANSCRIPT_BATCH':
      return { ...state, transcript: [...state.transcript, ...action.segments] };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function MeetingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error('useMeeting must be used within MeetingProvider');
  return ctx;
}
