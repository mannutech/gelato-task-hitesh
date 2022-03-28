import 'dotenv/config';
import { ethers } from 'ethers';

const SECOND = 1000;

// JavaScript dates have millisecond resolution
// 2 Minutes pass
const expiry = Math.trunc((Date.now() + 120 * SECOND) / SECOND);

// Contract address of RelayProxyV1 on Polygon Mainnet 
const spender = process.env.RELAY_PROXY_CONTRACT_ADDRESS;

const holderAddress = process.env.FROM_ADDRESS;

const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_PROVIDER, "matic");

const signer = new ethers.Wallet(process.env.PRIVATE_KEY_SIGNER, provider);

const permitSchema = [
    { name: "holder", type: "address" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "allowed", type: "bool" },
];


const domains = {
    daiMainnet: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "1",
        verifyingContract: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    daiKovan: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: "42",
        verifyingContract: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
    },
    daiRemix: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: 42,
        verifyingContract: "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47",
    },
    daiPolygon: {
        name: "(PoS) Dai Stablecoin",
        version: "1",
        verifyingContract: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        salt: ethers.utils.hexZeroPad(ethers.BigNumber.from(137).toHexString(), 32),
    }
};

const message = {
    holder: holderAddress,
    spender: spender,
    expiry: expiry,
    allowed: true,
};


signPermit(signer, provider, domains.daiPolygon, message).then().catch(console.error);

async function signPermit(signer: ethers.Wallet, provider: ethers.providers.JsonRpcProvider, domain: any, message: any) {

    console.log('Signing Typed Data:')
    console.log(`** Note: Permit Expires in TWO Minutes from now. **`);
    console.log(`Signer Account: ${signer.address}`);
    console.log(`Domain Separator: ${JSON.stringify(domain)}`);
    console.log(`Message to be signed: ${JSON.stringify(message)}`);

    if (signer.address.toLowerCase() !== message.holder.toLowerCase()) {
        throw (`signPermit: address of signer does not match holder address in message`);
    }

    let nonce;
    let tokenAbi;
    let tokenContract;

    if (domain.name === "(PoS) Dai Stablecoin") {
        tokenAbi = ['function getNonce(address holder) view returns (uint)'];
        tokenContract = new ethers.Contract(domain.verifyingContract, tokenAbi, signer);
        nonce = await tokenContract.getNonce(signer.getAddress());
    } else {
        tokenAbi = ['function nonces(address holder) view returns (uint)'];
        tokenContract = new ethers.Contract(domain.verifyingContract, tokenAbi, signer);
        nonce = await tokenContract.nonces(signer.getAddress());
    }


    message = { ...message, nonce: nonce.toNumber(), };

    // Sign Typed Data
    let sig = await signer._signTypedData(
        domain,
        { Permit: permitSchema, }, message);

    const r = sig.slice(0, 66);
    const s = "0x" + sig.slice(66, 130);
    const v = Number("0x" + sig.slice(130, 132));
    console.log(`\n |********| signedPermit |********| \n`)
    console.log( JSON.stringify({ ...message, v, r, s }));
}