'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function createHelloReq(ecdhPublicKey, associationKeypairPrivateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKeyBuffer = yield crypto.subtle.exportKey('raw', ecdhPublicKey);
        const signatureBuffer = yield crypto.subtle.sign({ hash: 'SHA-256', name: 'ECDSA' }, associationKeypairPrivateKey, publicKeyBuffer);
        const response = new Uint8Array(publicKeyBuffer.byteLength + signatureBuffer.byteLength);
        response.set(new Uint8Array(publicKeyBuffer), 0);
        response.set(new Uint8Array(signatureBuffer), publicKeyBuffer.byteLength);
        return response;
    });
}

const SEQUENCE_NUMBER_BYTES = 4;
function createSequenceNumberVector(sequenceNumber) {
    if (sequenceNumber >= 4294967296) {
        throw new Error('Outbound sequence number overflow. The maximum sequence number is 32-bytes.');
    }
    const byteArray = new ArrayBuffer(SEQUENCE_NUMBER_BYTES);
    const view = new DataView(byteArray);
    view.setUint32(0, sequenceNumber, /* littleEndian */ false);
    return new Uint8Array(byteArray);
}

function generateAssociationKeypair() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield crypto.subtle.generateKey({
            name: 'ECDSA',
            namedCurve: 'P-256',
        }, false /* extractable */, ['sign'] /* keyUsages */);
    });
}

function generateECDHKeypair() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield crypto.subtle.generateKey({
            name: 'ECDH',
            namedCurve: 'P-256',
        }, false /* extractable */, ['deriveKey', 'deriveBits'] /* keyUsages */);
    });
}

const INITIALIZATION_VECTOR_BYTES = 12;
function encryptJsonRpcMessage(jsonRpcMessage, sharedSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        const plaintext = JSON.stringify(jsonRpcMessage);
        const sequenceNumberVector = createSequenceNumberVector(jsonRpcMessage.id);
        const initializationVector = new Uint8Array(INITIALIZATION_VECTOR_BYTES);
        crypto.getRandomValues(initializationVector);
        const ciphertext = yield crypto.subtle.encrypt(getAlgorithmParams(sequenceNumberVector, initializationVector), sharedSecret, Buffer.from(plaintext));
        const response = new Uint8Array(sequenceNumberVector.byteLength + initializationVector.byteLength + ciphertext.byteLength);
        response.set(new Uint8Array(sequenceNumberVector), 0);
        response.set(new Uint8Array(initializationVector), sequenceNumberVector.byteLength);
        response.set(new Uint8Array(ciphertext), sequenceNumberVector.byteLength + initializationVector.byteLength);
        return response;
    });
}
function decryptJsonRpcMessage(message, sharedSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        const sequenceNumberVector = message.slice(0, SEQUENCE_NUMBER_BYTES);
        const initializationVector = message.slice(SEQUENCE_NUMBER_BYTES, SEQUENCE_NUMBER_BYTES + INITIALIZATION_VECTOR_BYTES);
        const ciphertext = message.slice(SEQUENCE_NUMBER_BYTES + INITIALIZATION_VECTOR_BYTES);
        const plaintextBuffer = yield crypto.subtle.decrypt(getAlgorithmParams(sequenceNumberVector, initializationVector), sharedSecret, ciphertext);
        const plaintext = getUtf8Decoder().decode(plaintextBuffer);
        const jsonRpcMessage = JSON.parse(plaintext);
        if (Object.hasOwnProperty.call(jsonRpcMessage, 'error')) {
            throw new SolanaMobileWalletAdapterProtocolError(jsonRpcMessage.id, jsonRpcMessage.error.code, jsonRpcMessage.error.message);
        }
        return jsonRpcMessage;
    });
}
function getAlgorithmParams(sequenceNumber, initializationVector) {
    return {
        additionalData: sequenceNumber,
        iv: initializationVector,
        name: 'AES-GCM',
        tagLength: 128, // 16 byte tag => 128 bits
    };
}
let _utf8Decoder;
function getUtf8Decoder() {
    if (_utf8Decoder === undefined) {
        _utf8Decoder = new TextDecoder('utf-8');
    }
    return _utf8Decoder;
}

function parseHelloRsp(payloadBuffer, // The X9.62-encoded wallet endpoint ephemeral ECDH public keypoint.
associationPublicKey, ecdhPrivateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const [associationPublicKeyBuffer, walletPublicKey] = yield Promise.all([
            crypto.subtle.exportKey('raw', associationPublicKey),
            crypto.subtle.importKey('raw', payloadBuffer, { name: 'ECDH', namedCurve: 'P-256' }, false /* extractable */, [] /* keyUsages */),
        ]);
        const sharedSecret = yield crypto.subtle.deriveBits({ name: 'ECDH', public: walletPublicKey }, ecdhPrivateKey, 256);
        const ecdhSecretKey = yield crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false /* extractable */, ['deriveKey'] /* keyUsages */);
        const aesKeyMaterialVal = yield crypto.subtle.deriveKey({
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new Uint8Array(associationPublicKeyBuffer),
            info: new Uint8Array(),
        }, ecdhSecretKey, { name: 'AES-GCM', length: 128 }, false /* extractable */, ['encrypt', 'decrypt']);
        return aesKeyMaterialVal;
    });
}

function getRandomAssociationPort() {
    return assertAssociationPort(49152 + Math.floor(Math.random() * (65535 - 49152 + 1)));
}
function assertAssociationPort(port) {
    if (port < 49152 || port > 65535) {
        throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_ASSOCIATION_PORT_OUT_OF_RANGE, `Association port number must be between 49152 and 65535. ${port} given.`, { port });
    }
    return port;
}

// https://stackoverflow.com/a/9458996/802047
function arrayBufferToBase64String(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let ii = 0; ii < len; ii++) {
        binary += String.fromCharCode(bytes[ii]);
    }
    return window.btoa(binary);
}

function getStringWithURLUnsafeCharactersReplaced(unsafeBase64EncodedString) {
    return unsafeBase64EncodedString.replace(/[/+=]/g, (m) => ({
        '/': '_',
        '+': '-',
        '=': '.',
    }[m]));
}

const INTENT_NAME = 'solana-wallet';
function getPathParts(pathString) {
    return (pathString
        // Strip leading and trailing slashes
        .replace(/(^\/+|\/+$)/g, '')
        // Return an array of directories
        .split('/'));
}
function getIntentURL(methodPathname, intentUrlBase) {
    let baseUrl = null;
    if (intentUrlBase) {
        try {
            baseUrl = new URL(intentUrlBase);
        }
        catch (_a) { } // eslint-disable-line no-empty
        if ((baseUrl === null || baseUrl === void 0 ? void 0 : baseUrl.protocol) !== 'https:') {
            throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, 'Base URLs supplied by wallets must be valid `https` URLs');
        }
    }
    baseUrl || (baseUrl = new URL(`${INTENT_NAME}:/`));
    const pathname = methodPathname.startsWith('/')
        ? // Method is an absolute path. Replace it wholesale.
            methodPathname
        : // Method is a relative path. Merge it with the existing one.
            [...getPathParts(baseUrl.pathname), ...getPathParts(methodPathname)].join('/');
    return new URL(pathname, baseUrl);
}
function getAssociateAndroidIntentURL(associationPublicKey, putativePort, associationURLBase) {
    return __awaiter(this, void 0, void 0, function* () {
        const associationPort = assertAssociationPort(putativePort);
        const exportedKey = yield crypto.subtle.exportKey('raw', associationPublicKey);
        const encodedKey = arrayBufferToBase64String(exportedKey);
        const url = getIntentURL('v1/associate/local', associationURLBase);
        url.searchParams.set('association', getStringWithURLUnsafeCharactersReplaced(encodedKey));
        url.searchParams.set('port', `${associationPort}`);
        return url;
    });
}

// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
const Browser = {
    Firefox: 0,
    Other: 1,
};
function assertUnreachable(x) {
    return x;
}
function getBrowser() {
    return navigator.userAgent.indexOf('Firefox/') !== -1 ? Browser.Firefox : Browser.Other;
}
function getDetectionPromise() {
    // Chrome and others silently fail if a custom protocol is not supported.
    // For these, we wait to see if the browser is navigated away from in
    // a reasonable amount of time (ie. the native wallet opened).
    return new Promise((resolve, reject) => {
        function cleanup() {
            clearTimeout(timeoutId);
            window.removeEventListener('blur', handleBlur);
        }
        function handleBlur() {
            cleanup();
            resolve();
        }
        window.addEventListener('blur', handleBlur);
        const timeoutId = setTimeout(() => {
            cleanup();
            reject();
        }, 2000);
    });
}
let _frame = null;
function launchUrlThroughHiddenFrame(url) {
    if (_frame == null) {
        _frame = document.createElement('iframe');
        _frame.style.display = 'none';
        document.body.appendChild(_frame);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    _frame.contentWindow.location.href = url.toString();
}
function startSession(associationPublicKey, associationURLBase) {
    return __awaiter(this, void 0, void 0, function* () {
        const randomAssociationPort = getRandomAssociationPort();
        const associationUrl = yield getAssociateAndroidIntentURL(associationPublicKey, randomAssociationPort, associationURLBase);
        if (associationUrl.protocol === 'https:') {
            // The association URL is an Android 'App Link' or iOS 'Universal Link'.
            // These are regular web URLs that are designed to launch an app if it
            // is installed or load the actual target webpage if not.
            window.location.assign(associationUrl);
        }
        else {
            // The association URL has a custom protocol (eg. `solana-wallet:`)
            try {
                const browser = getBrowser();
                switch (browser) {
                    case Browser.Firefox:
                        // If a custom protocol is not supported in Firefox, it throws.
                        launchUrlThroughHiddenFrame(associationUrl);
                        // If we reached this line, it's supported.
                        break;
                    case Browser.Other: {
                        const detectionPromise = getDetectionPromise();
                        window.location.assign(associationUrl);
                        yield detectionPromise;
                        break;
                    }
                    default:
                        assertUnreachable(browser);
                }
            }
            catch (e) {
                throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_WALLET_NOT_FOUND, 'Found no installed wallet that supports the mobile wallet protocol.');
            }
        }
        return randomAssociationPort;
    });
}

const WEBSOCKET_CONNECTION_CONFIG = {
    /**
     * 300 milliseconds is a generally accepted threshold for what someone
     * would consider an acceptable response time for a user interface
     * after having performed a low-attention tapping task. We set the initial
     * interval at which we wait for the wallet to set up the websocket at
     * half this, as per the Nyquist frequency, with a progressive backoff
     * sequence from there. The total wait time is 30s, which allows for the
     * user to be presented with a disambiguation dialog, select a wallet, and
     * for the wallet app to subsequently start.
     */
    retryDelayScheduleMs: [150, 150, 200, 500, 500, 750, 750, 1000],
    timeoutMs: 30000,
};
const WEBSOCKET_PROTOCOL = 'com.solana.mobilewalletadapter.v1';
function assertSecureContext() {
    if (typeof window === 'undefined' || window.isSecureContext !== true) {
        throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SECURE_CONTEXT_REQUIRED, 'The mobile wallet adapter protocol must be used in a secure context (`https`).');
    }
}
function assertSecureEndpointSpecificURI(walletUriBase) {
    let url;
    try {
        url = new URL(walletUriBase);
    }
    catch (_a) {
        throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, 'Invalid base URL supplied by wallet');
    }
    if (url.protocol !== 'https:') {
        throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, 'Base URLs supplied by wallets must be valid `https` URLs');
    }
}
function getSequenceNumberFromByteArray(byteArray) {
    const view = new DataView(byteArray);
    return view.getUint32(0, /* littleEndian */ false);
}
function transact(callback, config) {
    return __awaiter(this, void 0, void 0, function* () {
        assertSecureContext();
        const associationKeypair = yield generateAssociationKeypair();
        const sessionPort = yield startSession(associationKeypair.publicKey, config === null || config === void 0 ? void 0 : config.baseUri);
        const websocketURL = `ws://localhost:${sessionPort}/solana-wallet`;
        let connectionStartTime;
        const getNextRetryDelayMs = (() => {
            const schedule = [...WEBSOCKET_CONNECTION_CONFIG.retryDelayScheduleMs];
            return () => (schedule.length > 1 ? schedule.shift() : schedule[0]);
        })();
        let nextJsonRpcMessageId = 1;
        let lastKnownInboundSequenceNumber = 0;
        let state = { __type: 'disconnected' };
        return new Promise((resolve, reject) => {
            let socket;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonRpcResponsePromises = {};
            const handleOpen = () => __awaiter(this, void 0, void 0, function* () {
                if (state.__type !== 'connecting') {
                    console.warn('Expected adapter state to be `connecting` at the moment the websocket opens. ' +
                        `Got \`${state.__type}\`.`);
                    return;
                }
                const { associationKeypair } = state;
                socket.removeEventListener('open', handleOpen);
                const ecdhKeypair = yield generateECDHKeypair();
                socket.send(yield createHelloReq(ecdhKeypair.publicKey, associationKeypair.privateKey));
                state = {
                    __type: 'hello_req_sent',
                    associationPublicKey: associationKeypair.publicKey,
                    ecdhPrivateKey: ecdhKeypair.privateKey,
                };
            });
            const handleClose = (evt) => {
                if (evt.wasClean) {
                    state = { __type: 'disconnected' };
                }
                else {
                    reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_CLOSED, `The wallet session dropped unexpectedly (${evt.code}: ${evt.reason}).`, { closeEvent: evt }));
                }
                disposeSocket();
            };
            const handleError = (_evt) => __awaiter(this, void 0, void 0, function* () {
                disposeSocket();
                if (Date.now() - connectionStartTime >= WEBSOCKET_CONNECTION_CONFIG.timeoutMs) {
                    reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_WALLET_NOT_FOUND, `Failed to connect to the wallet websocket on port ${sessionPort}.`));
                }
                else {
                    yield new Promise((resolve) => {
                        const retryDelayMs = getNextRetryDelayMs();
                        retryWaitTimeoutId = window.setTimeout(resolve, retryDelayMs);
                    });
                    attemptSocketConnection();
                }
            });
            const handleMessage = (evt) => __awaiter(this, void 0, void 0, function* () {
                const responseBuffer = yield evt.data.arrayBuffer();
                switch (state.__type) {
                    case 'connected':
                        try {
                            const sequenceNumberVector = responseBuffer.slice(0, SEQUENCE_NUMBER_BYTES);
                            const sequenceNumber = getSequenceNumberFromByteArray(sequenceNumberVector);
                            if (sequenceNumber !== (lastKnownInboundSequenceNumber + 1)) {
                                throw new Error('Encrypted message has invalid sequence number');
                            }
                            lastKnownInboundSequenceNumber = sequenceNumber;
                            const jsonRpcMessage = yield decryptJsonRpcMessage(responseBuffer, state.sharedSecret);
                            const responsePromise = jsonRpcResponsePromises[jsonRpcMessage.id];
                            delete jsonRpcResponsePromises[jsonRpcMessage.id];
                            responsePromise.resolve(jsonRpcMessage.result);
                        }
                        catch (e) {
                            if (e instanceof SolanaMobileWalletAdapterProtocolError) {
                                const responsePromise = jsonRpcResponsePromises[e.jsonRpcMessageId];
                                delete jsonRpcResponsePromises[e.jsonRpcMessageId];
                                responsePromise.reject(e);
                            }
                            else {
                                throw e;
                            }
                        }
                        break;
                    case 'hello_req_sent': {
                        const sharedSecret = yield parseHelloRsp(responseBuffer, state.associationPublicKey, state.ecdhPrivateKey);
                        state = { __type: 'connected', sharedSecret };
                        const wallet = new Proxy({}, {
                            get(target, p) {
                                if (target[p] == null) {
                                    const method = p
                                        .toString()
                                        .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                                        .toLowerCase();
                                    target[p] = function (params) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            const id = nextJsonRpcMessageId++;
                                            socket.send(yield encryptJsonRpcMessage({
                                                id,
                                                jsonrpc: '2.0',
                                                method,
                                                params,
                                            }, sharedSecret));
                                            return new Promise((resolve, reject) => {
                                                jsonRpcResponsePromises[id] = {
                                                    resolve(result) {
                                                        switch (p) {
                                                            case 'authorize':
                                                            case 'reauthorize': {
                                                                const { wallet_uri_base } = result;
                                                                if (wallet_uri_base != null) {
                                                                    try {
                                                                        assertSecureEndpointSpecificURI(wallet_uri_base);
                                                                    }
                                                                    catch (e) {
                                                                        reject(e);
                                                                        return;
                                                                    }
                                                                }
                                                                break;
                                                            }
                                                        }
                                                        resolve(result);
                                                    },
                                                    reject,
                                                };
                                            });
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
                        try {
                            resolve(yield callback(wallet));
                        }
                        catch (e) {
                            reject(e);
                        }
                        finally {
                            disposeSocket();
                            socket.close();
                        }
                        break;
                    }
                }
            });
            let disposeSocket;
            let retryWaitTimeoutId;
            const attemptSocketConnection = () => {
                if (disposeSocket) {
                    disposeSocket();
                }
                state = { __type: 'connecting', associationKeypair };
                if (connectionStartTime === undefined) {
                    connectionStartTime = Date.now();
                }
                socket = new WebSocket(websocketURL, [WEBSOCKET_PROTOCOL]);
                socket.addEventListener('open', handleOpen);
                socket.addEventListener('close', handleClose);
                socket.addEventListener('error', handleError);
                socket.addEventListener('message', handleMessage);
                disposeSocket = () => {
                    window.clearTimeout(retryWaitTimeoutId);
                    socket.removeEventListener('open', handleOpen);
                    socket.removeEventListener('close', handleClose);
                    socket.removeEventListener('error', handleError);
                    socket.removeEventListener('message', handleMessage);
                };
            };
            attemptSocketConnection();
        });
    });
}

exports.SolanaMobileWalletAdapterError = SolanaMobileWalletAdapterError;
exports.SolanaMobileWalletAdapterErrorCode = SolanaMobileWalletAdapterErrorCode;
exports.SolanaMobileWalletAdapterProtocolError = SolanaMobileWalletAdapterProtocolError;
exports.SolanaMobileWalletAdapterProtocolErrorCode = SolanaMobileWalletAdapterProtocolErrorCode;
exports.transact = transact;
