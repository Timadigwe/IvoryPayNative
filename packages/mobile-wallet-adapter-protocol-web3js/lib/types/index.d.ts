import { TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { Transaction as LegacyTransaction } from "@solana/web3.js";
import { AuthorizeAPI, Base64EncodedAddress, CloneAuthorizationAPI, DeauthorizeAPI, ReauthorizeAPI, WalletAssociationConfig } from "@solana-mobile/mobile-wallet-adapter-protocol";
interface Web3SignAndSendTransactionsAPI {
    signAndSendTransactions<T extends LegacyTransaction | VersionedTransaction>(params: {
        minContextSlot?: number;
        transactions: T[];
    }): Promise<TransactionSignature[]>;
}
interface Web3SignTransactionsAPI {
    signTransactions<T extends LegacyTransaction | VersionedTransaction>(params: {
        transactions: T[];
    }): Promise<T[]>;
}
interface Web3SignMessagesAPI {
    signMessages(params: {
        addresses: Base64EncodedAddress[];
        payloads: Uint8Array[];
    }): Promise<Uint8Array[]>;
}
interface Web3MobileWallet extends AuthorizeAPI, CloneAuthorizationAPI, DeauthorizeAPI, ReauthorizeAPI, Web3SignAndSendTransactionsAPI, Web3SignTransactionsAPI, Web3SignMessagesAPI {
}
declare function transact<TReturn>(callback: (wallet: Web3MobileWallet) => TReturn, config?: WalletAssociationConfig): Promise<TReturn>;
export { Web3MobileWallet, transact };
//# sourceMappingURL=index.d.ts.map