import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { BaseMessageSignerWalletAdapter, WalletReadyState, WalletPublicKeyError, WalletNotReadyError, WalletConnectionError, WalletDisconnectedError, WalletNotConnectedError, WalletSignTransactionError, WalletSendTransactionError, WalletSignMessageError } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function toUint8Array(base64EncodedByteArray) {
    return new Uint8Array(window
        .atob(base64EncodedByteArray)
        .split('')
        .map((c) => c.charCodeAt(0)));
}

function getIsSupported() {
    return (typeof window !== 'undefined' &&
        window.isSecureContext &&
        typeof document !== 'undefined' &&
        /android/i.test(navigator.userAgent));
}

const SolanaMobileWalletAdapterWalletName = 'Default wallet app';
const SIGNATURE_LENGTH_IN_BYTES = 64;
function getPublicKeyFromAddress(address) {
    const publicKeyByteArray = toUint8Array(address);
    return new PublicKey(publicKeyByteArray);
}
class SolanaMobileWalletAdapter extends BaseMessageSignerWalletAdapter {
    constructor(config) {
        super();
        this.supportedTransactionVersions = new Set(
        // FIXME(#244): We can't actually know what versions are supported until we know which wallet we're talking to.
        ['legacy', 0]);
        this.name = SolanaMobileWalletAdapterWalletName;
        this.url = 'https://solanamobile.com';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI4IiB3aWR0aD0iMjgiIHZpZXdCb3g9Ii0zIDAgMjggMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI0RDQjhGRiI+PHBhdGggZD0iTTE3LjQgMTcuNEgxNXYyLjRoMi40di0yLjRabTEuMi05LjZoLTIuNHYyLjRoMi40VjcuOFoiLz48cGF0aCBkPSJNMjEuNiAzVjBoLTIuNHYzaC0zLjZWMGgtMi40djNoLTIuNHY2LjZINC41YTIuMSAyLjEgMCAxIDEgMC00LjJoMi43VjNINC41QTQuNSA0LjUgMCAwIDAgMCA3LjVWMjRoMjEuNnYtNi42aC0yLjR2NC4ySDIuNFYxMS41Yy41LjMgMS4yLjQgMS44LjVoNy41QTYuNiA2LjYgMCAwIDAgMjQgOVYzaC0yLjRabTAgNS43YTQuMiA0LjIgMCAxIDEtOC40IDBWNS40aDguNHYzLjNaIi8+PC9nPjwvc3ZnPg==';
        this._connecting = false;
        this._readyState = getIsSupported() ? WalletReadyState.Loadable : WalletReadyState.Unsupported;
        this._authorizationResultCache = config.authorizationResultCache;
        this._addressSelector = config.addressSelector;
        this._appIdentity = config.appIdentity;
        this._cluster = config.cluster;
        if (this._readyState !== WalletReadyState.Unsupported) {
            this._authorizationResultCache.get().then((authorizationResult) => {
                if (authorizationResult) {
                    // Having a prior authorization result is, right now, the best
                    // indication that a mobile wallet is installed. There is no API
                    // we can use to test for whether the association URI is supported.
                    this.emit('readyStateChange', (this._readyState = WalletReadyState.Installed));
                }
            });
        }
    }
    get publicKey() {
        if (this._publicKey == null && this._selectedAddress != null) {
            try {
                this._publicKey = getPublicKeyFromAddress(this._selectedAddress);
            }
            catch (e) {
                throw new WalletPublicKeyError((e instanceof Error && (e === null || e === void 0 ? void 0 : e.message)) || 'Unknown error', e);
            }
        }
        return this._publicKey ? this._publicKey : null;
    }
    get connected() {
        return !!this._authorizationResult;
    }
    get connecting() {
        return this._connecting;
    }
    get readyState() {
        return this._readyState;
    }
    runWithGuard(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield callback();
            }
            catch (e) {
                this.emit('error', e);
                throw e;
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runWithGuard(() => __awaiter(this, void 0, void 0, function* () {
                if (this._readyState !== WalletReadyState.Installed && this._readyState !== WalletReadyState.Loadable) {
                    throw new WalletNotReadyError();
                }
                this._connecting = true;
                const cachedAuthorizationResult = yield this._authorizationResultCache.get();
                if (cachedAuthorizationResult) {
                    this._authorizationResult = cachedAuthorizationResult;
                    this._connecting = false;
                    if (this._readyState !== WalletReadyState.Installed) {
                        this.emit('readyStateChange', (this._readyState = WalletReadyState.Installed));
                    }
                    this._selectedAddress = yield this._addressSelector.select(cachedAuthorizationResult.accounts.map(({ address }) => address));
                    this.emit('connect', 
                    // Having just set `this._selectedAddress`, `this.publicKey` is definitely non-null
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.publicKey);
                    return;
                }
                try {
                    yield this.transact((wallet) => __awaiter(this, void 0, void 0, function* () {
                        const authorizationResult = yield wallet.authorize({
                            cluster: this._cluster,
                            identity: this._appIdentity,
                        });
                        this.handleAuthorizationResult(authorizationResult); // TODO: Evaluate whether there's any threat to not `awaiting` this expression
                    }));
                }
                catch (e) {
                    throw new WalletConnectionError((e instanceof Error && e.message) || 'Unknown error', e);
                }
                finally {
                    this._connecting = false;
                }
            }));
        });
    }
    handleAuthorizationResult(authorizationResult) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const didPublicKeysChange = 
            // Case 1: We started from having no authorization.
            this._authorizationResult == null ||
                // Case 2: The number of authorized accounts changed.
                ((_a = this._authorizationResult) === null || _a === void 0 ? void 0 : _a.accounts.length) !== authorizationResult.accounts.length ||
                // Case 3: The new list of addresses isn't exactly the same as the old list, in the same order.
                this._authorizationResult.accounts.some((account, ii) => account.address !== authorizationResult.accounts[ii].address);
            this._authorizationResult = authorizationResult;
            if (didPublicKeysChange) {
                const nextSelectedAddress = yield this._addressSelector.select(authorizationResult.accounts.map(({ address }) => address));
                if (nextSelectedAddress !== this._selectedAddress) {
                    this._selectedAddress = nextSelectedAddress;
                    delete this._publicKey;
                    this.emit('connect', 
                    // Having just set `this._selectedAddress`, `this.publicKey` is definitely non-null
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.publicKey);
                }
            }
            yield this._authorizationResultCache.set(authorizationResult);
        });
    }
    performReauthorization(wallet, authToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authorizationResult = yield wallet.reauthorize({
                    auth_token: authToken,
                });
                this.handleAuthorizationResult(authorizationResult); // TODO: Evaluate whether there's any threat to not `awaiting` this expression
            }
            catch (e) {
                this.disconnect();
                throw new WalletDisconnectedError((e instanceof Error && (e === null || e === void 0 ? void 0 : e.message)) || 'Unknown error', e);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this._authorizationResultCache.clear(); // TODO: Evaluate whether there's any threat to not `awaiting` this expression
            delete this._authorizationResult;
            delete this._publicKey;
            delete this._selectedAddress;
            this.emit('disconnect');
        });
    }
    transact(callback) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const walletUriBase = (_a = this._authorizationResult) === null || _a === void 0 ? void 0 : _a.wallet_uri_base;
            const config = walletUriBase ? { baseUri: walletUriBase } : undefined;
            return yield transact(callback, config);
        });
    }
    assertIsAuthorized() {
        if (!this._authorizationResult || !this._selectedAddress)
            throw new WalletNotConnectedError();
        return {
            authToken: this._authorizationResult.auth_token,
            selectedAddress: this._selectedAddress,
        };
    }
    performSignTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authToken } = this.assertIsAuthorized();
            try {
                return yield this.transact((wallet) => __awaiter(this, void 0, void 0, function* () {
                    yield this.performReauthorization(wallet, authToken);
                    const signedTransactions = yield wallet.signTransactions({
                        transactions,
                    });
                    return signedTransactions;
                }));
            }
            catch (error) {
                throw new WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
            }
        });
    }
    sendTransaction(transaction, connection, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runWithGuard(() => __awaiter(this, void 0, void 0, function* () {
                const { authToken } = this.assertIsAuthorized();
                const minContextSlot = options === null || options === void 0 ? void 0 : options.minContextSlot;
                try {
                    return yield this.transact((wallet) => __awaiter(this, void 0, void 0, function* () {
                        yield Promise.all([
                            this.performReauthorization(wallet, authToken),
                            'version' in transaction
                                ? null
                                : /**
                                   * Unlike versioned transactions, legacy `Transaction` objects
                                   * may not have an associated `feePayer` or `recentBlockhash`.
                                   * This code exists to patch them up in case they are missing.
                                   */
                                    (() => __awaiter(this, void 0, void 0, function* () {
                                        var _a;
                                        transaction.feePayer || (transaction.feePayer = (_a = this.publicKey) !== null && _a !== void 0 ? _a : undefined);
                                        if (transaction.recentBlockhash == null) {
                                            let targetCommitment;
                                            switch (connection.commitment) {
                                                case 'confirmed':
                                                case 'finalized':
                                                case 'processed':
                                                    targetCommitment = connection.commitment;
                                                    break;
                                                default:
                                                    targetCommitment = 'finalized';
                                            }
                                            let targetPreflightCommitment;
                                            switch (options === null || options === void 0 ? void 0 : options.preflightCommitment) {
                                                case 'confirmed':
                                                case 'finalized':
                                                case 'processed':
                                                    targetPreflightCommitment = options.preflightCommitment;
                                                    break;
                                                case undefined:
                                                    targetPreflightCommitment = targetCommitment;
                                                default:
                                                    targetPreflightCommitment = 'finalized';
                                            }
                                            const preflightCommitmentScore = targetPreflightCommitment === 'finalized'
                                                ? 2
                                                : targetPreflightCommitment === 'confirmed'
                                                    ? 1
                                                    : 0;
                                            const targetCommitmentScore = targetCommitment === 'finalized'
                                                ? 2
                                                : targetCommitment === 'confirmed'
                                                    ? 1
                                                    : 0;
                                            const { blockhash } = yield connection.getLatestBlockhash({
                                                commitment: preflightCommitmentScore < targetCommitmentScore
                                                    ? targetPreflightCommitment
                                                    : targetCommitment,
                                            });
                                            transaction.recentBlockhash = blockhash;
                                        }
                                    }))(),
                        ]);
                        const signatures = yield wallet.signAndSendTransactions({
                            minContextSlot,
                            transactions: [transaction],
                        });
                        return signatures[0];
                    }));
                }
                catch (error) {
                    throw new WalletSendTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }));
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runWithGuard(() => __awaiter(this, void 0, void 0, function* () {
                const [signedTransaction] = yield this.performSignTransactions([transaction]);
                return signedTransaction;
            }));
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runWithGuard(() => __awaiter(this, void 0, void 0, function* () {
                const signedTransactions = yield this.performSignTransactions(transactions);
                return signedTransactions;
            }));
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runWithGuard(() => __awaiter(this, void 0, void 0, function* () {
                const { authToken, selectedAddress } = this.assertIsAuthorized();
                try {
                    return yield this.transact((wallet) => __awaiter(this, void 0, void 0, function* () {
                        yield this.performReauthorization(wallet, authToken);
                        const [signedMessage] = yield wallet.signMessages({
                            addresses: [selectedAddress],
                            payloads: [message],
                        });
                        const signature = signedMessage.slice(-SIGNATURE_LENGTH_IN_BYTES);
                        return signature;
                    }));
                }
                catch (error) {
                    throw new WalletSignMessageError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }));
        });
    }
}

function createDefaultAddressSelector() {
    return {
        select(addresses) {
            return __awaiter(this, void 0, void 0, function* () {
                return addresses[0];
            });
        },
    };
}

const CACHE_KEY = 'SolanaMobileWalletAdapterDefaultAuthorizationCache';
function createDefaultAuthorizationResultCache() {
    let storage;
    try {
        storage = window.localStorage;
        // eslint-disable-next-line no-empty
    }
    catch (_a) { }
    return {
        clear() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!storage) {
                    return;
                }
                try {
                    storage.removeItem(CACHE_KEY);
                    // eslint-disable-next-line no-empty
                }
                catch (_a) { }
            });
        },
        get() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!storage) {
                    return;
                }
                try {
                    return JSON.parse(storage.getItem(CACHE_KEY)) || undefined;
                    // eslint-disable-next-line no-empty
                }
                catch (_a) { }
            });
        },
        set(authorizationResult) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!storage) {
                    return;
                }
                try {
                    storage.setItem(CACHE_KEY, JSON.stringify(authorizationResult));
                    // eslint-disable-next-line no-empty
                }
                catch (_a) { }
            });
        },
    };
}

export { SolanaMobileWalletAdapter, SolanaMobileWalletAdapterWalletName, createDefaultAddressSelector, createDefaultAuthorizationResultCache };
