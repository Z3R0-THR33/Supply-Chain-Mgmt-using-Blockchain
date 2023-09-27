const { Blockchain, Transaction} = require("./blockchain");
const EC=require('elliptic').ec;// install ellpitic library-->for key generation
const ec=new EC('secp256k1');

const myKey=ec.keyFromPrivate('7bb0b5fdbd2ffb1bb7990256942e9fbe7001949df2148a3b7d1afd909184cdab');
const mywalletAddress=myKey.getPublic('hex');

let pjt=new Blockchain();

const tx1=new Transaction(mywalletAddress,'to someone else public key goes here',10);
tx1.signTransaction(myKey);
pjt.addTransaction(tx1);

console.log('\nStarting the miner....');
pjt.minePendingTransactions(mywalletAddress);

console.log('Balance is:',pjt.getBalanceofAddress(mywalletAddress));


