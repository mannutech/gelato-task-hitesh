"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require("dotenv/config");
var ethers_1 = require("ethers");
var SECOND = 1000;
// JavaScript dates have millisecond resolution
// 2 Minutes pass
var expiry = Math.trunc((Date.now() + 120 * SECOND) / SECOND);
// Contract address of RelayProxyV1 on Polygon Mainnet 
var spender = process.env.RELAY_PROXY_CONTRACT_ADDRESS;
var holderAddress = process.env.FROM_ADDRESS;
var provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.ALCHEMY_PROVIDER, "matic");
var signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_SIGNER, provider);
var permitSchema = [
    { name: "holder", type: "address" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "allowed", type: "bool" },
];
var domains = {
    daiMainnet: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "1",
        verifyingContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    },
    daiKovan: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "42",
        verifyingContract: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
    },
    daiRemix: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: 42,
        verifyingContract: "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47"
    },
    daiPolygon: {
        name: "(PoS) Dai Stablecoin",
        version: "1",
        verifyingContract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        salt: ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.BigNumber.from(137).toHexString(), 32)
    }
};
var message = {
    holder: holderAddress,
    spender: spender,
    expiry: expiry,
    allowed: true
};
signPermit(signer, provider, domains.daiPolygon, message).then()["catch"](console.error);
function signPermit(signer, provider, domain, message) {
    return __awaiter(this, void 0, void 0, function () {
        var nonce, tokenAbi, tokenContract, sig, r, s, v;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (signer.address.toLowerCase() !== message.holder.toLowerCase()) {
                        throw ("signPermit: address of signer does not match holder address in message");
                    }
                    if (!(domain.name === "(PoS) Dai Stablecoin")) return [3 /*break*/, 2];
                    tokenAbi = ['function getNonce(address holder) view returns (uint)'];
                    tokenContract = new ethers_1.ethers.Contract(domain.verifyingContract, tokenAbi, signer);
                    return [4 /*yield*/, tokenContract.getNonce(signer.getAddress())];
                case 1:
                    nonce = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    tokenAbi = ['function nonces(address holder) view returns (uint)'];
                    tokenContract = new ethers_1.ethers.Contract(domain.verifyingContract, tokenAbi, signer);
                    return [4 /*yield*/, tokenContract.nonces(signer.getAddress())];
                case 3:
                    nonce = _a.sent();
                    _a.label = 4;
                case 4:
                    message = __assign(__assign({}, message), { nonce: nonce.toNumber() });
                    return [4 /*yield*/, signer._signTypedData(domain, { Permit: permitSchema }, message)];
                case 5:
                    sig = _a.sent();
                    r = sig.slice(0, 66);
                    s = "0x" + sig.slice(66, 130);
                    v = Number("0x" + sig.slice(130, 132));
                    console.log('signedPermit', JSON.stringify(__assign(__assign({}, message), { v: v, r: r, s: s })));
                    return [2 /*return*/];
            }
        });
    });
}
