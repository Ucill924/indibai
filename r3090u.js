const fs = require('fs');
const nearAPI  = require('near-api-js');
const { connect, KeyPair, keyStores, utils } = nearAPI;

require('dotenv').config();

const sender = 'dd5cd25efa59ae5d759340425a2b4a4f8ae25c56a5d9083dfdc0bd9d019d04ca'; // your wallet address
const networkId = 'testnet';

async function sendTransactionWithRandomAmountAndDelay(receiver) {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(process.env.SENDER_PRIVATE_KEY);
  await keyStore.setKey(networkId, sender, keyPair);

  const config = {
    networkId,
    keyStore,
    nodeUrl: "https://near-testnet.lava.build/lava-referer-0baf4609-017d-423b-810c-d34ccf0ade92/", // your RPC Testnet near lava
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
  };

  const near = await connect(config);
  const senderAccount = await near.account(sender);

  let success = false;
  let attempts = 0;

  while (!success && attempts < 3) {
    try {
      attempts++;
      
      // Generate random amount between 0.0001 and 0.01 NEAR, rounded to two decimal places
      const randomAmount = Math.random() * (0.01 - 0.0001) + 0.0001;
      const roundedAmount = parseFloat(randomAmount.toFixed(2));
      const amount = utils.format.parseNearAmount(roundedAmount.toString());

      console.log(`Sending ${utils.format.formatNearAmount(amount)}Ⓝ from ${sender} to ${receiver}...`);
      const result = await senderAccount.sendMoney(receiver, amount);

      console.log('Transaction Results: ', result.transaction);
      console.log('--------------------------------------------------------------------------------------------');
      console.log('OPEN LINK BELOW to see the transaction in NEAR Explorer!');
      console.log(`${config.explorerUrl}/transactions/${result.transaction.hash}`);
      console.log('--------------------------------------------------------------------------------------------');

      // Transaction successful, set success to true to exit the loop
      success = true;
    } catch(error) {
      console.error(`Error on attempt ${attempts}:`, error);

      // Generate random delay between 30 and 90 seconds
      const randomDelay = Math.floor(Math.random() * (90 - 30 + 1) + 30);
      console.log(`Waiting for ${randomDelay} seconds before the next attempt...`);
      await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
    }
  }
}

async function repeatTransactionsWithRandomAmountAndDelay() {
  try {
    const receivers = fs.readFileSync('receivers.txt', 'utf8').split('\n').map(address => address.trim()).filter(Boolean);

    for (let i = 0; i < receivers.length; i++) {
      console.log(`Transaction ${i + 1}:`);
      await sendTransactionWithRandomAmountAndDelay(receivers[i]);
    }
  } catch (error) {
    console.error('Error reading receivers from file:', error);
  }
}

repeatTransactionsWithRandomAmountAndDelay();
