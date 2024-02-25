const fs = require('fs');
const nearAPI = require('near-api-js');
const { connect, KeyPair, keyStores, utils } = nearAPI;

require('dotenv').config();

const sender = ''; // Ganti dengan alamat dompet Anda
const networkId = 'mainnet';

function getRandomAmount(min, max) {
  const randomValue = Math.random() * (max - min) + min;
  return randomValue.toFixed(6); // Menggunakan 6 desimal agar memenuhi rentang 0.00001 - 0.0001
}

async function sendTransaction(receiver) {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(process.env.SENDER_PRIVATE_KEY);
  await keyStore.setKey(networkId, sender, keyPair);

  const config = {
    networkId,
    keyStore,
    nodeUrl: "https://near.lava.build/lava-referer-0baf4609-017d-423b-810c-d34ccf0ade92/",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
  };

  const near = await connect(config);
  const senderAccount = await near.account(sender);

  try {
    const randomAmount = getRandomAmount(0.00001, 0.0001);
    const amount = utils.format.parseNearAmount(randomAmount.toString());

    console.log(`Sending ${utils.format.formatNearAmount(amount)}Ⓝ from ${sender} to ${receiver}...`);
    const result = await senderAccount.sendMoney(receiver, amount);

    console.log('Transaction Results: ', result.transaction);
    console.log('--------------------------------------------------------------------------------------------');
    console.log('OPEN LINK BELOW to see the transaction in NEAR Explorer!');
    console.log(`${config.explorerUrl}/transactions/${result.transaction.hash}`);
    console.log('--------------------------------------------------------------------------------------------');

    const minDelay = 40; // Minimal delay in seconds
    const maxDelay = 240; // Maximal delay in seconds (4 minutes)

    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
    console.log(`Waiting for ${randomDelay} seconds before the next transaction...`);
    await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));

  } catch (error) {
    console.error(error);
  }
}

async function repeatTransactions() {
  try {
    // Baca alamat penerima dari file txt
    const receivers = fs.readFileSync('mainnet-receivers.txt', 'utf8').split('\n').map(address => address.trim()).filter(Boolean);

    // Loop melalui alamat penerima dari file
    for (let i = 0; i < receivers.length; i++) {
      console.log(`Transaction ${i + 1}:`);
      const receiver = receivers[i % receivers.length];
      await sendTransaction(receiver);
    }
  } catch (error) {
    console.error(error);
  }
}

repeatTransactions();
