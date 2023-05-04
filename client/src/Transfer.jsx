import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    
    try {
      const message = `Transferring ${sendAmount} from ${address} to ${recipient}`
      alert(message)
      const messageHash = keccak256(utf8ToBytes(message));
      const [sig, recoveryBit] = await secp.sign(messageHash, privateKey, {recovered: true})
      const {
        data: { response },
      } = await server.post(`verify`, {
        recipient,
        sig: toHex(sig),
        sender: address,
        messageHash: toHex(messageHash),
        recoveryBit: recoveryBit,
      });
    if (response) {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
      alert("Transfer Complete")
    } else {
    alert("User not Verified")
  }
    } catch (ex) {
      alert(ex.response.data.message);
    }
  
} 

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder="Input your private key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
