import { ICryptoType, IFiatType } from '../types';

export const STANDARD_URL = 'https://devapi.ivorypay.io/v1/transactions';
export const STANDARD_CHECKOUT_URL = 'https://dev-checkout.vercel.app/payment';


export const cryptoCurrencies: ICryptoType[] = ['USDC', 'USDT', 'SOL'];
export const baseFiat: IFiatType[] = ['NGN', 'KES', 'ZAR', 'GHS'];