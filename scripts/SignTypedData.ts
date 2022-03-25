import { ethers } from 'ethers';

const SECOND = 1000;

// JavaScript dates have millisecond resolution
const fromAddress = "<FROM_ADDRSS>";

// 2 Minutes pass
const expiry = Math.trunc((Date.now() + 120 * SECOND) / SECOND);

// Contract address of RelayProxyV1 on Polygon Mainnet 
const spender = "0xd3a67F512c338f63c3f81818eFD763fF8C916B73";

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

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/UwAVUHuYR0Xy78yu5rB4i-NvReHRnZLk', "matic");

const signer = new ethers.Wallet(process.env.PRIVATE_KEY_SIGNER, provider);

const message = {
    holder: fromAddress,
    spender: spender,
    expiry: expiry,
    allowed: true,
};

signPermit(signer, provider, domains.daiPolygon, message).then().catch(console.error);

async function signPermit(signer: ethers.Wallet, provider: ethers.providers.JsonRpcProvider, domain: any, message: any) {

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

    console.log('signedPermit', JSON.stringify({ ...message, v, r, s }));
}