const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();
console.log(toHex(privateKey));
const publicKey = secp.getPublicKey(
  "a42bac96417792f85e912a6b6ddd4c8652d4a0f489e0502cb078fa065a0e6b9f"
);
console.log(toHex(publicKey));
const addressArray = publicKey.slice(-20);
const address = `0x${toHex(addressArray)}`;
console.log(address);
