const EC=require('elliptic').ec;// install ellpitic library-->for key generation
const ec=new EC('secp256k1');
const SHA256=require('crypto-js/sha256');
const util = require('util');
const qrcode = require('qrcode-terminal')
//const users  =require('Users')

class Transaction
{
    constructor(fromAddress,toAddress,amount,productID,timestamp =Date.now())
    {
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
        this.timestamp=timestamp;
        this.productID = productID;
        this.hash=this.calculateHash();
    }
    calculateHash()
    {
        return SHA256(this.fromAddress+this.toAddress+this.amount+this.timestamp+this.productID/*this.senderID+this.receiverID+this.manuID*/).toString();
    }
    signTransaction(signingKey)
    {
        if(signingKey.getPublic('hex')!==this.fromAddress)
        {
            throw new Error('You cannot sign transactions for other people');
        }
        const hashTx=this.calculateHash();
        const sig=signingKey.sign(hashTx,'base64');
        this.signature=sig.toDER('hex');
    }
    isValid()
    {
        if(this.fromAddress==null)
        {
            return true;
        }//mining reward fromAddress=null
        if(!this.signature ||  this.signature.length===0)
        throw new Error('No signature in this transaction');
        
        const publicKey=ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
    distributorConfirm() {
        this.distributor_confirmed = true;
      }
    
      clientConfirm() {
        this.client_confirmed = true;
      }
    
      isConfirmed() {
        return this.distributor_confirmed && this.client_confirmed;
      }
    
      status() {
        if (this.isConfirmed) {
          return 'received';
        } else if (this.distributor_confirmed) {
          return 'dispatched';
        } else {
          return 'not dispatched';
        }
    }
   
}
class Block
{
    constructor(timestamp,transactions,previousHash='',index)
    {
        this.index=index;
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce=0;//used only in mineblock function to generate new Hash 
        this.merkelHash = this.merkelRoot();
    }

    calculateHash()
    {
        return SHA256(this.timestamp+this.merkelHash+this.previousHash+JSON.stringify(this.transactions)+this.nonce).toString();
    }
    mineBlock(difficulty)//POW Algorithm
    {
        while(this.hash.substring(0,difficulty)!==Array(difficulty+1).join("0"))
        {
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined:" + this.hash);
     
    }
    hasValidTransaction()
    {
        /*for(const tx of this.transaction)
        {
            if(!tx.isValid())
             return false;
        }
        return true;*/
        if(this.merkelHash!=this.merkelRoot())
         return false;

         return true;
    }
    merkelRoot()
    {  
        const leafNodes = this.transactions.length;//_leafNodes is the number of transactions a block can store 
        let nodePerItr = leafNodes;//nodePerItr is variable which gets updated every iteration of loop. It is number of leafNodes/hashNodes in each level of merkel tree
        
            let nodeArr = [];// nodeArr stores hashes in each nodes 
            let low = 0;// A low pointer 
            let h = low+1; //High pointer
            let i = 0;
            let j = 0;
            while(j < leafNodes){//loop used to stringify the transaction data
                //nodeArr[j] = SHA256(JSON.stringify(this.transactions[j]);
                nodeArr[j]=this.transactions[j].hash;
                j++;
            }
            while(nodePerItr >1){//Loop executes untill we get the merkel root. Which means one hash node in merkel root level 
                if(nodePerItr % 2 == 0){ 
                    while(h<=nodePerItr-1){
                      nodeArr[i] =  SHA256(nodeArr[low] + nodeArr[h] + Date.now());
                      low = h+1;
                      h = low + 1;
                      i++;
                  }
                  nodePerItr = nodePerItr/2;
              }
              else {  
                    while(h<=nodePerItr-1){
                      nodeArr[i] =  SHA256(nodeArr[low] + nodeArr[h] + Date.now());
                      low = h+1;
                      h = low + 1;
                      i++;
                      if(low == nodePerItr - 1){
                          h = low ;
                          continue;
                      }
                  }
                  nodePerItr = (nodePerItr + 1)/2;
              }
            }
            return nodeArr[0];
    }
    /*calculateMerkleHash(transactions) {
        // Helper function to calculate the hash of a single transaction
        calculateTransactionHash(transaction) 
        {
          //const hash = crypto.createHash('sha256');
          //return hash.update(transaction).digest('hex');
            return transaction.calculateHash();
        }
      
        // Base case: If there are no transactions, return an empty hash
        if (transactions.length === 0) {
          return crypto.createHash('sha256').digest('hex');
        }
      
        // If there's only one transaction, return its hash
        if (transactions.length === 1) {
          return calculateTransactionHash(transactions[0]);
        }
      
        // Recursively calculate the Merkle hash of pairs of transactions
        const pairedHashes = [];
        for (let i = 0; i < transactions.length; i += 2) {
          const tx1 = transactions[i];
          const tx2 = i + 1 < transactions.length ? transactions[i + 1] : tx1;
          const combinedHash = calculateTransactionHash(tx1 + tx2);
          pairedHashes.push(combinedHash);
        }
      
        // Recursively call the function on the paired hashes
        return calculateMerkleHash(pairedHashes);
      }*/     
}
class Blockchain
{
    constructor()
    {
        this.chain=[this.createGenesisBlock()];//array of blocks
        this.difficulty=2;//mining difficulty
        this.miningReward=100;
        this.pendingTransactions = []
    }
    createGenesisBlock()
    {
        return new Block(Date.now(),"Genesis Block","0");
    }
    getLatestBlock()
    {
       return this.chain[this.chain.length-1];
    }
    minePendingTransactions(miningRewardAddress)
    {   //improvised add_block function
        
        this.pendingTransactions.push(new Transaction(null,miningRewardAddress,this.miningReward,Date.now()));

        let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block mined");
        block.index=this.chain.length;
        this.chain.push(block);
        this.pendingTransactions=[];
        
     }//reward for mining the block
    getBalanceofAddress(address)
    {
        let bal=0;
        for(const block of this.chain)
        {
            for(const trans of block.transactions)
            {
                if(trans.fromAddress===address)
                    bal-=trans.amount;
                if(trans.toAddress===address)
                    bal+=trans.amount;

                    console.log("@",bal,"@")
            }
        }
        return bal;
    }
    printBlockchain(){
        console.log(util.inspect(this.chain,{depth:null}))
    }
    isValidChain()
    {
        for(let i=1;i<this.chain.length;i++)
        {
            const currentBlock=this.chain[i];
            const prevBlock=this.chain[i-1];
            
            if(!currentBlock.hasValidTransaction())
            {
                return false;
            }
            if(currentBlock.hash!=currentBlock.calculateHash())
            {
                return false;
            }
            if(currentBlock.previousHash!=prevBlock.hash)
            {
                return false;
            }
        }
        return true;
    }
    addTransaction(transaction)
    {
        if(!transaction.fromAddress || !transaction.toAddress)
            throw new Error("Transaction must have from and to address");

        if(!transaction.isValid())
            throw new Error("Cannot add invalid transaction to chain");
        
        
       //if(this.getBalanceofAddress(transaction.fromAddres)<100)//let security deposit=100
           // throw new Error("Balance is less than or equal to security deposit....Cannot make transactions");

        this.pendingTransactions.push(transaction);
    }//add transaction to a block

    generateQRCode(productID) 
    {
        for (let i = this.chain.length - 1; i >= 0; i--) {
            const block = this.chain[i];
            for (let j = block.transactions.length - 1; j >= 0; j--) {
              const transaction = block.transactions[j];
              if (transaction.productID === productID) 
                {
                const time = transaction.timestamp
                const date = new Date(time);

              const qrData = `Product ID: ${transaction.productID}\nAmount: ${transaction.amount}\nTime: ${date.toLocaleString()}\nFrom ID: ${transaction.fromAddress}\nTo ID: ${transaction.toAddress}`;

              qrcode.generate(qrData, { small: true });
              return;
                }
            }
          }  
        console.error('Product ID not found in the blockchain.');

    }  
    
    checkFromAdress(productID, fromAddress){
        
        for (let i = this.pendingTransactions.length - 1; i >= 0; i--) {
            const transaction = this.pendingTransactions[i];
            if (transaction.productID === productID && transaction.toAddress === fromAddress) {
              return true;
            }
          }
          for (let i = this.chain.length - 1; i >= 0; i--) {
            const block = this.chain[i];
            for (let j = block.transactions.length - 1; j >= 0; j--) {
              const transaction = block.transactions[j];
              if (transaction.productID === productID && transaction.toAddress === fromAddress) {
                return true;
              }
            }
          }
          
        return false;
      }

}

module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;