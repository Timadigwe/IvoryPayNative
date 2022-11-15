import React, {useState} from 'react';

import {Picker} from '@react-native-picker/picker';

import {ConnectionProvider} from '@solana/wallet-adapter-react';
import {clusterApiUrl} from '@solana/web3.js';
//Provider that wraps the entire app
import {Provider as PaperProvider} from 'react-native-paper';
//SnackbarProvider the context provider
import SnackbarProvider from './src/components/SnackbarProvider';

import PayWithIvoryPayBase from './ivorypaycomponents/components/PayWithIvoryPayBase';
import {baseFiat, cryptoCurrencies} from './ivorypaycomponents/constants';
import {ITransactionResponse} from './ivorypaycomponents/types';
import {View, Alert, ScrollView, TextInput} from 'react-native';

//devnet
const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl('devnet');

export default function App() {
  const [form, setForm] = useState({
    crypto: cryptoCurrencies[0],
    baseFiat: baseFiat[0],
    amount: '2000',
    reference: '',
    email: '',
    PUBLIC_KEY:
      'pk_LeVNjEiwkQok4vwgLCOoIl5CSi2N1svXn5Y9YX7Af3urymCRmKvClK3exWvwTJgb',
  });

  const setField = (key: string) => {
    return (e: string | number) => setForm(prev => ({...prev, [key]: e}));
  };

  const onClose = () => {
    console.log('closed');
  };

  const onSuccess = (e: ITransactionResponse) => {
    Alert.alert('Payment was successful');
  };

  const onFailure = (e: ITransactionResponse) => {
    Alert.alert('Payment was unsuccessful');
  };

  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      <PaperProvider>
        <SnackbarProvider>
          <ScrollView>
            <View style={{padding: 16}}>
              <TextInput
                keyboardType="email-address"
                placeholder="email"
                onChangeText={setField('email')}
                autoFocus
                value={form.email}
                style={{
                  borderWidth: 1,
                  padding: 12,
                  marginTop: 16,
                }}
              />
              <View
                style={{
                  borderWidth: 1,
                  marginTop: 16,
                  borderColor: 'black',
                }}>
                <Picker
                  placeholder="base fiat"
                  selectedValue={form.baseFiat}
                  onValueChange={setField('baseFiat')}>
                  {baseFiat.map(e => (
                    <Picker.Item key={e} label={e} value={e} />
                  ))}
                </Picker>
              </View>
              <TextInput
                keyboardType="phone-pad"
                placeholder="amount"
                value={form.amount}
                onChangeText={setField('amount')}
                style={{
                  borderWidth: 1,
                  padding: 12,
                  marginTop: 16,
                }}
              />
              <View
                style={{
                  borderWidth: 1,
                  marginTop: 16,
                  borderColor: 'black',
                }}>
                <Picker
                  placeholder="crypto"
                  selectedValue={form.crypto}
                  onValueChange={setField('crypto')}>
                  {cryptoCurrencies.map(e => (
                    <Picker.Item key={e} label={e} value={e} />
                  ))}
                </Picker>
              </View>
              <TextInput
                placeholder="api-key"
                onChangeText={setField('PUBLIC_KEY')}
                value={form.PUBLIC_KEY}
                style={{
                  borderWidth: 1,
                  padding: 12,
                  marginTop: 16,
                }}
              />
              <TextInput
                placeholder="reference (optional)"
                onChangeText={setField('reference')}
                selectTextOnFocus
                value={form.reference}
                style={{
                  borderWidth: 1,
                  padding: 12,
                  marginVertical: 16,
                }}
              />
              <PayWithIvoryPayBase
                // customButton={({initTransaction, isLoading}) => (
                //   <Button
                //     title={'Make payment'}
                //     disabled={isLoading}
                //     onPress={() => {
                //       console.log('started');
                //       initTransaction();
                //     }}
                //   />
                // )}
                onError={e => Alert.alert(e.message)}
                options={form}
                onClose={onClose}
                onSuccess={onSuccess}
                onFailure={onFailure}
                disabled={false}
                allowPhantomConnect={true}
              />
            </View>
          </ScrollView>
        </SnackbarProvider>
      </PaperProvider>
    </ConnectionProvider>
  );
}
