import IIvoryPayError from '../classes/IvorypayError';

/**
 * Error response got from IvoryPay backend
 */
export interface IErrorResponse {
  success: boolean;
  message: string;
  errors: string[];
  statusCode: number;
}

/**
 * Crypto currency types supported by IvoryPay
 */
export type ICryptoType = 'USDC' | 'SOL' | '$IVRY' | 'USDT';

/**
 * Fiat currency types supported by IvoryPay
 */
export type IFiatType = 'NGN' | 'GHS' | 'KES' | 'ZAR';

/**
 * Customer Details
 */
export interface ICustomer {
  uuid: string;
  refCode: string;
  firstName?: any;
  lastName?: any;
  email: string;
  phoneNumber?: any;
  totalSpendInUSD: number;
  businessId: string;
  userId: string;
  context: 'TEST' | 'LIVE';
  createdAtDateOnly: string;
  createdAt: Date;
}

/**
 * Response from a failed or successful transaction
 */
export interface ITransactionResponse {
  uuid: string;
  reference: string;
  cryptoTransactionHash?: any;
  expectedAmountInCrypto: number;
  expectedAmountInUSD: number;
  expectedAmountInBaseFiat: number;
  expectedAmountInBusinessPrimaryFiat: number;
  receivedAmountInCrypto: number;
  receivedAmountInUSD: number;
  receivedAmountInBaseFiat: number;
  receivedAmountInBusinessPrimaryFiat: number;
  excessAmountReceivedInCrypto: number;
  feeInCrypto: number;
  expectedAmountInCryptoPlusFee: number;
  crypto: string;
  baseFiat: string;
  businessPrimaryFiat: string;
  baseFiatToUSDRate: number;
  baseFiatToBusinessPrimaryFiatRate: number;
  usdToCryptoRate: number;
  address: string;
  metadata?: any;
  environment: 'TEST' | 'LIVE';
  origin: string;
  businessId: string;
  userId: string;
  customerId: string;
  expiresAt: Date;
  completedAt: Date;
  status: string;
  failureReason?: any;
  createdAtDateOnly: string;
  createdAt: Date;
  customer: ICustomer;
}

/**
 * @param crypto - Crypto currency a user wishes to pay with \n
 * @param baseFiat - The base currency of the amount the user wants to convert to crypto
 * @param amount - Amount in base fiat
 * @param email - Email of the customer
 * @param reference - Transaction reference for payment, it can be supplied or autogenerated
 * @param PUBLIC_KEY - The public key generated for the business from IvoryPay's dashboard
 */
export interface IvoryPayInitOptions {
  crypto: ICryptoType;
  baseFiat: IFiatType;
  amount: number | string;
  email: string;
  PUBLIC_KEY: string;
  reference?: string;
}

export interface IvoryPayError extends IIvoryPayError {}

/**
 * props for Custom Button
 */
export interface ICustomButtonProps {
  initTransaction: () => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
}

/**
 * Props for the custom button or IvoryPay Button
 */
export interface IRenderCustomButton {
  customButton?: (props: ICustomButtonProps) => JSX.Element;
  handleInit: () => Promise<any> | void;
  isLoading: boolean;
  disabled: boolean;
}

/**
 *
 */
export type IPaymentType = 'transfer' | 'connect' | null;
