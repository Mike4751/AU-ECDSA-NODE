const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const privateKeys = [
  "a42bac96417792f85e912a6b6ddd4c8652d4a0f489e0502cb078fa065a0e6b9f",
  "996e8471f59a4cbe4e289ed93b9e97b0106f3d4731641dc4ce90e7a8e33bda5f",
  "7e087440672ed1034b27947ce06f5fb09d9273a67c22c9ef4682f889d8088e5d",
];

const balances = {
  "0xb687e6dcc6b0293e0f5a9f66c73bec105336d484": 100,
  "0x9b7061ce8bc87fbbc5b0dfe1c0413adec4db3ed6": 50,
  "0xcffc4a6f11bf6d6fe05961b83e2578356b2fbc48": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.post("/verify", (req, res) => {
  const { recipient, sig, sender, messageHash, recoveryBit } = req.body;
  console.log(recipient, sender);
  const publicKey = secp.recoverPublicKey(messageHash, sig, recoveryBit);
  const sigVer = secp.verify(sig, messageHash, publicKey);
  if (sigVer) {
    if (`0x${toHex(publicKey.slice(-20))}` == sender) {
      if (`0x${toHex(publicKey.slice(-20))}` == recipient) {
        res
          .status(400)
          .send({ message: "Why do you want to send money to yourself?" });
      } else {
        res.send({ response: true });
      }
    } else {
      res.status(400).send({ message: "User did not initiate transfer!" });
    }
  } else {
    res.status(400).send({ message: "Signature verification failed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
