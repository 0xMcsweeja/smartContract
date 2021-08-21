require("dotenv").config();
const API_URL = process.env.API_URL;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);
const PUBKEY = process.env.PUBLIC_KEY;
const PRIVKEY = process.env.PRIVATE_KEY;

//need to access the Application Binary Interface (ABI) to interact with the contract
const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");

const contractAddress = "0x1902c9a4a40f4a180b8e618923f4e623714a8a1e";
const helloWorldContract = new web3.eth.Contract(contract.abi, contractAddress);

async function updateMessage(newMessage) {
  const nonce = await web3.eth.getTransactionCount(PUBKEY, "latest");
  const gasEstimate = await helloWorldContract.methods
    .update(newMessage)
    .estimateGas();

  //create transaction
  const txn = {
    from: PUBKEY,
    to: contractAddress,
    nonce: nonce,
    gas: gasEstimate,
    maxFeePerGas: 1000000108,
    data: helloWorldContract.methods.update(newMessage).encodeABI(),
  };

  //sign transaction
  const signPromise = web3.eth.accounts.signTransaction(txn, PRIVKEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "Hash of transaction: ",
              hash,
              "\n Check Alchemy mempool to review status of transaction"
            );
          } else {
            console.log("something went wrong submitting txn: ", err);
          }
        }
      );
    })
    .catch((err) => {
      console.log("promise failed", err);
    });
}

async function main() {
  const message = await helloWorldContract.methods.message().call();
  console.log("the message is: " + message);
  await updateMessage("Hello mcsweeja");
}
main();
