import { ImageSourcePropType, StyleProp, ViewStyle, ImageStyle, TouchableOpacityProps } from 'react-native';
import React from 'react';

export interface CardWithTextProps extends TouchableOpacityProps {
  imageSource: ImageSourcePropType;
  containerStyle?: StyleProp<ViewStyle>;
  imageContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Optional border color for the content section. If provided the component
   * will automatically apply a border with a default width.
   */
  borderColor?: string;
  imageChildren?: React.ReactNode;
  children?: React.ReactNode;
}
