import { StyleSheet } from 'react-native';

export default StyleSheet.create({
        sheetView: {
                width: '100%',
                height: '100%',
                padding: 0,
        },
	contentContainer: {
		alignItems: 'center',
	},
	sheetHeader: {
		width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
        },
        sheetHeading: {
                fontFamily: 'Poppins_700Bold',
        },
        optionsContainer: {
                width: '100%',
                marginTop: 0,
        },
        flagIcon: {
                width: 32,
                height: 32,
        },
});
