'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reactNative = require('react-native');

// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
const SolanaMobileWalletAdapterErrorCode = {
    ERROR_ASSOCIATION_PORT_OUT_OF_RANGE: 'ERROR_ASSOCIATION_PORT_OUT_OF_RANGE',
    ERROR_FORBIDDEN_WALLET_BASE_URL: 'ERROR_FORBIDDEN_WALLET_BASE_URL',
    ERROR_SECURE_CONTEXT_REQUIRED: 'ERROR_SECURE_CONTEXT_REQUIRED',
    ERROR_SESSION_CLOSED: 'ERROR_SESSION_CLOSED',
    ERROR_WALLET_NOT_FOUND: 'ERROR_WALLET_NOT_FOUND',
};
class SolanaMobileWalletAdapterError extends Error {
    constructor(...args) {
        const [code, message, data] = args;
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'SolanaMobileWalletAdapterError';
    }
}
// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
const SolanaMobileWalletAdapterProtocolErrorCode = {
    // Keep these in sync with `mobilewalletadapter/common/ProtocolContract.java`.
    ERROR_AUTHORIZATION_FAILED: -1,
    ERROR_INVALID_PAYLOADS: -2,
    ERROR_NOT_SIGNED: -3,
    ERROR_NOT_SUBMITTED: -4,
    ERROR_TOO_MANY_PAYLOADS: -5,
    ERROR_ATTEST_ORIGIN_ANDROID: -100,
};
class SolanaMobileWalletAdapterProtocolError extends Error {
    constructor(...args) {
        const [jsonRpcMessageId, code, message, data] = args;
        super(message);
        this.code = code;
        this.data = data;
        this.jsonRpcMessageId = jsonRpcMessageId;
        this.name = 'SolanaMobileWalletAdapterProtocolError';
    }
}

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

const LINKING_ERROR = `The package 'solana-mobile-wallet-adapter-protocol' doesn't seem to be linked. Make sure: \n\n` +
    '- You rebuilt the app after installing the package\n' +
    '- If you are using Lerna workspaces\n' +
    '  - You have added `@solana-mobile/mobile-wallet-adapter-protocol` as an explicit dependency, and\n' +
    '  - You have added `@solana-mobile/mobile-wallet-adapter-protocol` to the `nohoist` section of your package.json\n' +
    '- You are not using Expo managed workflow\n';
const SolanaMobileWalletAdapter = reactNative.Platform.OS === 'android' && reactNative.NativeModules.SolanaMobileWalletAdapter
    ? reactNative.NativeModules.SolanaMobileWalletAdapter
    : new Proxy({}, {
        get() {
            throw new Error(reactNative.Platform.OS !== 'android'
                ? 'The package `solana-mobile-wallet-adapter-protocol` is only compatible with React Native Android'
                : LINKING_ERROR);
        },
    });
function getErrorMessage(e) {
    switch (e.code) {
        case 'ERROR_WALLET_NOT_FOUND':
            return 'Found no installed wallet that supports the mobile wallet protocol.';
        default:
            return e.message;
    }
}
function handleError(e) {
    if (e instanceof Error) {
        const reactNativeError = e;
        switch (reactNativeError.code) {
            case undefined:
                throw e;
            case 'JSON_RPC_ERROR': {
                const details = reactNativeError.userInfo;
                throw new SolanaMobileWalletAdapterProtocolError(0 /* jsonRpcMessageId */, details.jsonRpcErrorCode, e.message);
            }
            default:
                throw new SolanaMobileWalletAdapterError(reactNativeError.code, getErrorMessage(reactNativeError), reactNativeError.userInfo);
        }
    }
    throw e;
}
function transact(callback, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let didSuccessfullyConnect = false;
        try {
            yield SolanaMobileWalletAdapter.startSession(config);
            didSuccessfullyConnect = true;
            const wallet = new Proxy({}, {
                get(target, p) {
                    if (target[p] == null) {
                        const method = p
                            .toString()
                            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                            .toLowerCase();
                        target[p] = function (params) {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    return yield SolanaMobileWalletAdapter.invoke(method, params);
                                }
                                catch (e) {
                                    return handleError(e);
                                }
                            });
                        };
                    }
                    return target[p];
                },
                defineProperty() {
                    return false;
                },
                deleteProperty() {
                    return false;
                },
            });
            return yield callback(wallet);
        }
        catch (e) {
            return handleError(e);
        }
        finally {
            if (didSuccessfullyConnect) {
                yield SolanaMobileWalletAdapter.endSession();
            }
        }
    });
}

exports.SolanaMobileWalletAdapterError = SolanaMobileWalletAdapterError;
exports.SolanaMobileWalletAdapterErrorCode = SolanaMobileWalletAdapterErrorCode;
exports.SolanaMobileWalletAdapterProtocolError = SolanaMobileWalletAdapterProtocolError;
exports.SolanaMobileWalletAdapterProtocolErrorCode = SolanaMobileWalletAdapterProtocolErrorCode;
exports.transact = transact;
