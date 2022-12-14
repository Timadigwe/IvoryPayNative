// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
declare const SolanaMobileWalletAdapterErrorCode: {
    readonly ERROR_ASSOCIATION_PORT_OUT_OF_RANGE: "ERROR_ASSOCIATION_PORT_OUT_OF_RANGE";
    readonly ERROR_FORBIDDEN_WALLET_BASE_URL: "ERROR_FORBIDDEN_WALLET_BASE_URL";
    readonly ERROR_SECURE_CONTEXT_REQUIRED: "ERROR_SECURE_CONTEXT_REQUIRED";
    readonly ERROR_SESSION_CLOSED: "ERROR_SESSION_CLOSED";
    readonly ERROR_WALLET_NOT_FOUND: "ERROR_WALLET_NOT_FOUND";
};
type SolanaMobileWalletAdapterErrorCodeEnum = (typeof SolanaMobileWalletAdapterErrorCode)[keyof typeof SolanaMobileWalletAdapterErrorCode];
type ErrorDataTypeMap = {
    [SolanaMobileWalletAdapterErrorCode.ERROR_ASSOCIATION_PORT_OUT_OF_RANGE]: {
        port: number;
    };
    [SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL]: undefined;
    [SolanaMobileWalletAdapterErrorCode.ERROR_SECURE_CONTEXT_REQUIRED]: undefined;
    [SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_CLOSED]: {
        closeEvent: CloseEvent;
    };
    [SolanaMobileWalletAdapterErrorCode.ERROR_WALLET_NOT_FOUND]: undefined;
};
declare class SolanaMobileWalletAdapterError<TErrorCode extends SolanaMobileWalletAdapterErrorCodeEnum> extends Error {
    data: ErrorDataTypeMap[TErrorCode] | undefined;
    code: TErrorCode;
    constructor(...args: ErrorDataTypeMap[TErrorCode] extends Record<string, unknown> ? [
        code: TErrorCode,
        message: string,
        data: ErrorDataTypeMap[TErrorCode]
    ] : [
        code: TErrorCode,
        message: string
    ]);
}
type JSONRPCErrorCode = number;
// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
declare const SolanaMobileWalletAdapterProtocolErrorCode: {
    readonly ERROR_AUTHORIZATION_FAILED: -1;
    readonly ERROR_INVALID_PAYLOADS: -2;
    readonly ERROR_NOT_SIGNED: -3;
    readonly ERROR_NOT_SUBMITTED: -4;
    readonly ERROR_TOO_MANY_PAYLOADS: -5;
    readonly ERROR_ATTEST_ORIGIN_ANDROID: -100;
};
type SolanaMobileWalletAdapterProtocolErrorCodeEnum = (typeof SolanaMobileWalletAdapterProtocolErrorCode)[keyof typeof SolanaMobileWalletAdapterProtocolErrorCode];
type ProtocolErrorDataTypeMap = {
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_AUTHORIZATION_FAILED]: undefined;
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_INVALID_PAYLOADS]: undefined;
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_NOT_SIGNED]: undefined;
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_NOT_SUBMITTED]: undefined;
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_TOO_MANY_PAYLOADS]: undefined;
    [SolanaMobileWalletAdapterProtocolErrorCode.ERROR_ATTEST_ORIGIN_ANDROID]: {
        attest_origin_uri: string;
        challenge: string;
        context: string;
    };
};
declare class SolanaMobileWalletAdapterProtocolError<TErrorCode extends SolanaMobileWalletAdapterProtocolErrorCodeEnum> extends Error {
    data: ProtocolErrorDataTypeMap[TErrorCode] | undefined;
    code: TErrorCode | JSONRPCErrorCode;
    jsonRpcMessageId: number;
    constructor(...args: ProtocolErrorDataTypeMap[TErrorCode] extends Record<string, unknown> ? [
        jsonRpcMessageId: number,
        code: TErrorCode | JSONRPCErrorCode,
        message: string,
        data: ProtocolErrorDataTypeMap[TErrorCode]
    ] : [
        jsonRpcMessageId: number,
        code: TErrorCode | JSONRPCErrorCode,
        message: string
    ]);
}
type Account = Readonly<{
    address: Base64EncodedAddress;
    label?: string;
}>;
/**
 * Properties that wallets may present to users when an app
 * asks for authorization to execute privileged methods (see
 * {@link PrivilegedMethods}).
 */
type AppIdentity = Readonly<{
    uri?: string;
    icon?: string;
    name?: string;
}>;
/**
 * An ephemeral elliptic-curve keypair on the P-256 curve.
 * This public key is used to create the association token.
 * The private key is used during session establishment.
 */
type AssociationKeypair = CryptoKeyPair;
/**
 * The context returned from a wallet after having authorized a given
 * account for use with a given application. You can cache this and
 * use it later to invoke privileged methods.
 */
type AuthorizationResult = Readonly<{
    accounts: Account[];
    auth_token: AuthToken;
    wallet_uri_base: string;
}>;
type AuthToken = string;
type Base64EncodedAddress = string;
type Base64EncodedSignature = string;
type Base64EncodedMessage = string;
type Base64EncodedSignedMessage = string;
type Base64EncodedSignedTransaction = string;
type Base64EncodedTransaction = string;
type Cluster = "devnet" | "testnet" | "mainnet-beta";
type Finality = "confirmed" | "finalized" | "processed";
type WalletAssociationConfig = Readonly<{
    baseUri?: string;
}>;
interface AuthorizeAPI {
    authorize(params: {
        cluster: Cluster;
        identity: AppIdentity;
    }): Promise<AuthorizationResult>;
}
interface CloneAuthorizationAPI {
    cloneAuthorization(params: {
        auth_token: AuthToken;
    }): Promise<Readonly<{
        auth_token: AuthToken;
    }>>;
}
interface DeauthorizeAPI {
    deauthorize(params: {
        auth_token: AuthToken;
    }): Promise<Readonly<Record<string, never>>>;
}
interface ReauthorizeAPI {
    reauthorize(params: {
        auth_token: AuthToken;
    }): Promise<AuthorizationResult>;
}
interface SignMessagesAPI {
    signMessages(params: {
        addresses: Base64EncodedAddress[];
        payloads: Base64EncodedMessage[];
    }): Promise<Readonly<{
        signed_payloads: Base64EncodedSignedMessage[];
    }>>;
}
interface SignTransactionsAPI {
    signTransactions(params: {
        payloads: Base64EncodedTransaction[];
    }): Promise<Readonly<{
        signed_payloads: Base64EncodedSignedTransaction[];
    }>>;
}
interface SignAndSendTransactionsAPI {
    signAndSendTransactions(params: {
        options?: Readonly<{
            min_context_slot?: number;
        }>;
        payloads: Base64EncodedTransaction[];
    }): Promise<Readonly<{
        signatures: Base64EncodedSignature[];
    }>>;
}
interface MobileWallet extends AuthorizeAPI, CloneAuthorizationAPI, DeauthorizeAPI, ReauthorizeAPI, SignMessagesAPI, SignTransactionsAPI, SignAndSendTransactionsAPI {
}
declare function transact<TReturn>(callback: (wallet: MobileWallet) => TReturn, config?: WalletAssociationConfig): Promise<TReturn>;
export { SolanaMobileWalletAdapterErrorCode, SolanaMobileWalletAdapterError, SolanaMobileWalletAdapterProtocolErrorCode, SolanaMobileWalletAdapterProtocolError, transact, Account, AppIdentity, AssociationKeypair, AuthorizationResult, AuthToken, Base64EncodedAddress, Base64EncodedTransaction, Cluster, Finality, WalletAssociationConfig, AuthorizeAPI, CloneAuthorizationAPI, DeauthorizeAPI, ReauthorizeAPI, SignMessagesAPI, SignTransactionsAPI, SignAndSendTransactionsAPI, MobileWallet };
//# sourceMappingURL=index.d.ts.map