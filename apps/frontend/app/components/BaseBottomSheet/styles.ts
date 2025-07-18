import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    padding: 10,
  },
  handleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: '30%',
    height: 6,
    borderRadius: 3,
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  placeholder: {
    width: 45,
    height: 45,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});
