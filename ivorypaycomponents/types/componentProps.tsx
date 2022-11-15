import {ViewStyle} from 'react-native';

import IIvoryPayError from '../classes/IvorypayError';
import {
  ICustomButtonProps,
  IPaymentType,
  ITransactionResponse,
  IvoryPayInitOptions,
} from '.';

/**
 * Basic Component that handles both initialization of transaction and
 * displaying the payment webview
 */
export interface IPayWithIvoryPayBase {
  options: IvoryPayInitOptions;
  onError?: (e: IIvoryPayError) => Promise<any> | void;
  customButton?: (props: ICustomButtonProps) => JSX.Element;
  disabled?: boolean;
  onClose?: () => Promise<any> | void;
  onSuccess?: (e: ITransactionResponse) => Promise<any> | void;
  onFailure?: (e: ITransactionResponse) => Promise<any> | void;
  allowPhantomConnect?: boolean;
}

/**
 * Ivorypay Official Button
 */
export interface IIvoryPayButton {
  onPress?: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * Webview modal for payment
 */
export interface IIvoryPayWebview {
  reference: string;
  show: boolean;
  onClose: () => Promise<any> | void;
  onSuccess: (e: ITransactionResponse) => Promise<any> | void;
  onFailure: (e: ITransactionResponse) => Promise<any> | void;
  onError: (e: IIvoryPayError) => Promise<any> | void;
}

/**
 * Popup to select between "Pay with wallet connect" and "Crypto transfer"
 */
export interface ISelectPaymentMethod {
  show: boolean;
  selectPaymentType: (e: IPaymentType) => Promise<void>;
  onCancel: () => void;
}

/**
 * Popup to connect to Phantom wallet
 */
export interface IPhantomConnect {
  show: boolean;
  onCancel: () => void;
}
