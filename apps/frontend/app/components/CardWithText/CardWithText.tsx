import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { CardWithTextProps } from './types';

const CardWithText: React.FC<CardWithTextProps> = ({
  imageSource,
  containerStyle,
  imageContainerStyle,
  imageStyle,
  contentStyle,
  borderColor,
  imageChildren,
  children,
  ...rest
}) => {
  const contentBorder = borderColor
    ? { borderTopColor: borderColor, borderTopWidth: 3 }
    : null;

  return (
    <TouchableOpacity style={[styles.card, containerStyle]} {...rest}>
      <View style={[styles.imageContainer, imageContainerStyle]}>
        <Image style={[styles.image, imageStyle]} source={imageSource} />
        {imageChildren}
      </View>
      <View style={[styles.cardContent, contentBorder, contentStyle]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default CardWithText;
