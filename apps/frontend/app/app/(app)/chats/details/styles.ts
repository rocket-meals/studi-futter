import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 10,
  },
  messageItem: {
    maxWidth: '80%',
    gap: 4,
  },
  bubble: {
    padding: 10,
    borderRadius: 3,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
});
