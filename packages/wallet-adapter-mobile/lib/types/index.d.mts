import { AppIdentity, AuthorizationResult, Base64EncodedAddress, Cluster } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { BaseMessageSignerWalletAdapter, WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, SendOptions, TransactionSignature, TransactionVersion, VersionedTransaction } from "@solana/web3.js";
import { Transaction as LegacyTransaction } from "@solana/web3.js";
interface AuthorizationResultCache {
    clear(): Promise<void>;
    get(): Promise<AuthorizationResult | undefined>;
    set(authorizationResult: AuthorizationResult): Promise<void>;
}
interface AddressSelector {
    select(addresses: Base64EncodedAddress[]): Promise<Base64EncodedAddress>;
}
declare const SolanaMobileWalletAdapterWalletName: WalletName<string>;
declare class SolanaMobileWalletAdapter extends BaseMessageSignerWalletAdapter {
    readonly supportedTransactionVersions: Set<TransactionVersion>;
    name: WalletName<string>;
    url: string;
    icon: string;
    private _addressSelector;
    private _appIdentity;
    private _authorizationResult;
    private _authorizationResultCache;
    private _connecting;
    private _cluster;
    private _publicKey;
    private _readyState;
    private _selectedAddress;
    constructor(config: {
        addressSelector: AddressSelector;
        appIdentity: AppIdentity;
        authorizationResultCache: AuthorizationResultCache;
        cluster: Cluster;
    });
    get publicKey(): PublicKey | null;
    get connected(): boolean;
    get connecting(): boolean;
    get readyState(): WalletReadyState;
    private runWithGuard;
    connect(): Promise<void>;
    private handleAuthorizationResult;
    private performReauthorization;
    disconnect(): Promise<void>;
    private transact;
    private assertIsAuthorized;
    private performSignTransactions;
    sendTransaction<T extends LegacyTransaction | VersionedTransaction>(transaction: T, connection: Connection, options?: SendOptions): Promise<TransactionSignature>;
    signTransaction<T extends LegacyTransaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends LegacyTransaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}
declare function createDefaultAddressSelector(): AddressSelector;
declare function createDefaultAuthorizationResultCache(): AuthorizationResultCache;
export { AuthorizationResultCache, AddressSelector, SolanaMobileWalletAdapterWalletName, SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache };
//# sourceMappingURL=index.d.mts.map