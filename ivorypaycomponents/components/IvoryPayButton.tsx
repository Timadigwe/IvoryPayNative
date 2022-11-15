import { Image, StyleSheet, TouchableNativeFeedback, View } from 'react-native';

import Spinner from '../assets/animations/Spinner';
import { IIvoryPayButton } from '../types';

var FundWithCrypto = require('../assets/images/FundWithCrypto.png');
export const IvoryPayButton = ({
  onPress,
  isLoading,
  disabled,
}: IIvoryPayButton) => {
  return (
    <TouchableNativeFeedback onPress={onPress} disabled={disabled}>
      <View
        style={{
          ...styles.buttonStyle,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            style={{width: 150, height: 50}}
            source={FundWithCrypto}
            resizeMethod="scale"
            resizeMode="contain"
          />
          {isLoading && <Spinner />}
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 4,
    backgroundColor: '#02084B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {width: 150, height: 50},
});
