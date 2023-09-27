const EC=require('elliptic').ec;// install ellpitic library-->for key generation
const ec=new EC('secp256k1');
const SHA256=require('crypto-js/sha256');
class Transaction
{
    constructor(fromAddress,toAddress,amount)
    {
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
    }
    calculateHash()
    {
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }
    signTransaction(signingKey)
    {
        if(signingKey.getPublic('hex')!==this.fromAddress)
        {
            throw new Error('You cannot sign transactions for other wallets');
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

}
class Block
{
    constructor(timestamp,transactions,previousHash='')
    {
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce=0;//used only in mineblock function to generate new Hash 
    }

    calculateHash()
    {
        return SHA256(this.timestamp+this.previousHash+JSON.stringify(this.transactions)+this.nonce).toString();
    }
    mineBlock(difficulty)
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
        for(const tx of this.transaction)
        {
            if(!tx.isValid())
             return false;
        }
        return true;
    }
}
class Blockchain
{
    constructor()
    {
        this.chain=[this.createGenesisBlock()];//array of blocks
        this.difficulty=2;
        this.pendingTransactions=[];
        this.miningReward=100;
    }
    createGenesisBlock()
    {
        return new Block("26/9/2023","Genesis Block","0");
    }
    getLatestBlock()
    {
       return this.chain[this.chain.length-1];
    }
    minePendingTransactions(miningRewardAddress)
    {   //improvised add_block function
        const rewardTx=new Transaction(null,miningRewardAddress,this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block mined");
        this.chain.push(block);

        this.pendingTransactions=[
        new Transaction(null,miningRewardAddress,this.miningReward)];
    }
    addTransaction(transaction)
    {
        if(!transaction.fromAddress || !transaction.toAddress)
          throw new Error("Transaction must have from and to address");

        if(!transaction.isValid())
           throw new Error('Cannot add invalid transaction to chain');

        this.pendingTransactions.push(transaction);
    }

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

            }
        }
        return bal;
    }

    isValidChain()
    {
        for(let i=1;i<this.chain.length;i++)
        {
            const currentBlock=this.chain[i];
            const prevBlock=this.chain[i-1];
            
            if(!currentBlock.hasValidTransaction)
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
}   

module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;