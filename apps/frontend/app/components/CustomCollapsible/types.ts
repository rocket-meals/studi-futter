import { StyleProp, ViewStyle } from 'react-native';

export interface CustomCollapsibleProps {
	headerText: string;
	children: React.ReactNode;
	customColor?: string;
	//   containerStyle?: StyleProp<ViewStyle>;
}
