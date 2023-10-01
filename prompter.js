const Users = require('./registration.js')
const { Blockchain, Transaction} = require("./blockchain");
var bc = new Blockchain();
const prompt = require('prompt-sync')();
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');
const util = require('util');

// console.log(util.inspect(Users,{depth:null}))

/* ****error
function toFromVerification(fromKey, toKey) { 
    if (Users.Clients.some(pubKey => fromKey === pubKey)) return false;
    
    if (Users.Manufacturers.some(pubKey => fromKey === pubKey)) {
        return Users.Distributors.some(pubKey1 => toKey === pubKey1);
    }
    
    if (Users.Distributors.some(pubKey => fromKey === pubKey)) {
        return Users.Clients.some(pubKey1 => toKey === pubKey1);
    }
    return false;
}



function isAddDistributor(fromPublicKey) {
    return Users.Distributors.some(dist => fromPublicKey === dist);
}
*/

//    console.log(('Click 0: Add transactions\nClick 1: See transactions added\nClick 2: Start mining block\nClick 3: confirm delivery\nClick 4: print blockchain\nClick 5: distributor initiates delivery\nClick 6: QR code status\nClick 7: distributor confirms dispatch\nClick 8: issue with delivery (only if you have not received the product)\nClick 9: Exit\n'))

while(1){
    console.log(('Click 0: Add transactions\nClick 1: See pending transactions\nClick 2: Start mining block\nClick 3: print blockchain\nClick 4: QR code status\nClick 5: Dispute! \nClick 6: Exit\n'))
    const choice = prompt()
    if(choice==6)   break;
    switch (choice) {
        case '0':


            //rn we are taking public key and private key so that toFromVerification works we can make it better by just taking name and priate key 
            fromPublicKey= prompt('From user public key: ')
            toKey = prompt('To user public key: ')
            productID = prompt('ProductID: ')
            //verify to and from constraints



            // if(!toFromVerification(fromPublicKey,toKey))  throw new Error("M->D->C")
            fromPrivateKey = prompt('From user private key: ')
            amount = prompt('Enter amount: ')

            // //to confirm if distributer has product
            // if(!isAddDistributor(fromPublicKey) || !bc.checkFromAdressHoldsProduct(productID,fromPublicKey)){
            //     console.log("Distrubuter doesnot have the product!")
            //     break;
            // }

            tx1 = new Transaction(fromPublicKey,toKey,amount,productID)
            const fromKey=ec.keyFromPrivate(fromPrivateKey);
            tx1.signTransaction(fromKey)
            bc.addTransaction(tx1)


            break;
        case '1':
            for(const tx of bc.pendingTransactions)
                console.log(tx)
            break;
        case '2':
            fromPublicAdd = prompt ("From user public key: ")
            bc.minePendingTransactions(fromPublicAdd)
            break;
        case '3':
            bc.printBlockchain()
            break;
        case '4':
            const pid = prompt('Enter product ID: ')
            bc.generateQRCode(pid)
            break;
        case '5':
            break;
        default:
            console.log("Unrecognized choice");
    }
}