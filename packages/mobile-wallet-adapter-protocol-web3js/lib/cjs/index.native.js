'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var web3_js = require('@solana/web3.js');
var mobileWalletAdapterProtocol = require('@solana-mobile/mobile-wallet-adapter-protocol');
var bs58 = require('bs58');
var jsBase64 = require('js-base64');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var bs58__default = /*#__PURE__*/_interopDefaultLegacy(bs58);

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

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function getPayloadFromTransaction(transaction) {
    const serializedTransaction = 'version' in transaction
        ? transaction.serialize()
        : transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });
    const payload = jsBase64.fromUint8Array(serializedTransaction);
    return payload;
}
function getTransactionFromWireMessage(byteArray) {
    const version = web3_js.VersionedMessage.deserializeMessageVersion(byteArray);
    if (version === 'legacy') {
        return web3_js.Transaction.from(byteArray);
    }
    else {
        return web3_js.VersionedTransaction.deserialize(byteArray);
    }
}
function transact(callback, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const augmentedCallback = (wallet) => {
            const augmentedAPI = new Proxy({}, {
                get(target, p) {
                    if (target[p] == null) {
                        switch (p) {
                            case 'signAndSendTransactions':
                                target[p] = function (_a) {
                                    var { minContextSlot, transactions } = _a, rest = __rest(_a, ["minContextSlot", "transactions"]);
                                    return __awaiter(this, void 0, void 0, function* () {
                                        const payloads = transactions.map(getPayloadFromTransaction);
                                        const { signatures: base64EncodedSignatures } = yield wallet.signAndSendTransactions(Object.assign(Object.assign(Object.assign({}, rest), (minContextSlot != null
                                            ? { options: { min_context_slot: minContextSlot } }
                                            : null)), { payloads }));
                                        const signatures = base64EncodedSignatures.map(jsBase64.toUint8Array).map(bs58__default["default"].encode);
                                        return signatures;
                                    });
                                };
                                break;
                            case 'signMessages':
                                target[p] = function (_a) {
                                    var { payloads } = _a, rest = __rest(_a, ["payloads"]);
                                    return __awaiter(this, void 0, void 0, function* () {
                                        const base64EncodedPayloads = payloads.map(jsBase64.fromUint8Array);
                                        const { signed_payloads: base64EncodedSignedMessages } = yield wallet.signMessages(Object.assign(Object.assign({}, rest), { payloads: base64EncodedPayloads }));
                                        const signedMessages = base64EncodedSignedMessages.map(jsBase64.toUint8Array);
                                        return signedMessages;
                                    });
                                };
                                break;
                            case 'signTransactions':
                                target[p] = function (_a) {
                                    var { transactions } = _a, rest = __rest(_a, ["transactions"]);
                                    return __awaiter(this, void 0, void 0, function* () {
                                        const payloads = transactions.map(getPayloadFromTransaction);
                                        const { signed_payloads: base64EncodedCompiledTransactions } = yield wallet.signTransactions(Object.assign(Object.assign({}, rest), { payloads }));
                                        const compiledTransactions = base64EncodedCompiledTransactions.map(jsBase64.toUint8Array);
                                        const signedTransactions = compiledTransactions.map(getTransactionFromWireMessage);
                                        return signedTransactions;
                                    });
                                };
                                break;
                            default: {
                                target[p] = wallet[p];
                                break;
                            }
                        }
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
            return callback(augmentedAPI);
        };
        return yield mobileWalletAdapterProtocol.transact(augmentedCallback, config);
    });
}

exports.transact = transact;
