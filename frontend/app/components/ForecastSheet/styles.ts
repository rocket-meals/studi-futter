import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    padding: 10,
    paddingBottom: 0,
    alignItems: 'center',
  },
  sheetHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
  },
  sheetcloseButton: {
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeading: {
    fontFamily: 'Poppins_700Bold',
    
  },
  forecastContainer: {
    width: '100%',
    minHeight: 400,
  },
  graphStyle: {
    width: '100%',
  },
});
