
const Registration = require('./registration.js')
const Users  = Registration.Users
const { Blockchain, Transaction} = require("./blockchain");
var bc = new Blockchain();
const prompt = require('prompt-sync')();
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');
const util = require('util');


function toFromVerification(fromKey, toKey){
    // Clients can't sell products
    if(Users.Clients.some(client => client.key === fromKey)) return false;

    // Manufacturer can only sell to a distributor
    if(Users.Manufacturers.some(manufacturer => manufacturer.key === fromKey)){
        return Users.Distributors.some(distributor => distributor.key === toKey);
    }

    // Distributor can only sell to a client
    if(Users.Distributors.some(distributor => distributor.key === fromKey)){
        return Users.Clients.some(client => client.key === toKey);
    }

    return false;
}

function isAddDistributor(fromPublicKey) {
    return Users.Distributors.some(distributor => distributor.key === fromPublicKey) || false;
}

//    console.log(('Click 0: Add transactions\nClick 1: See transactions added\nClick 2: Start mining block\nClick 3: confirm delivery\nClick 4: print blockchain\nClick 5: distributor initiates delivery\nClick 6: QR code status\nClick 7: distributor confirms dispatch\nClick 8: issue with delivery (only if you have not received the product)\nClick 9: Exit\n'))

while(1){
    console.log(('Click 0: Add transactions\nClick 1: See pending transactions\nClick 2: Start mining block\nClick 3: print blockchain\nClick 4: QR code status\nClick 5: Dispute! \nClick 6: Exit\n'))
    const choice = prompt()
    if(choice==6)   break;
    switch (choice) {
        case '0':


            //rn we are taking public key and private key so that toFromVerification works we can make it better by just taking name and priate key 
            fromPublicKey= prompt('From user public key: ')
            toPublicKey = prompt('To user public key: ')
            productID = prompt('ProductID: ')
            //verify to and from constraints



            if(!toFromVerification(fromPublicKey,toPublicKey))  throw new Error("M->D->C")
            fromPrivateKey = prompt('From user private key: ')
            amount = prompt('Enter amount: ')

            //to confirm if distributer has product
            if(isAddDistributor(fromPublicKey) ){
                if(!bc.checkFromAdressHoldsProduct(productID,fromPublicKey)){
                    console.log("Distrubuter doesnot have the product!")
                    break;
                }
            }

            tx1 = new Transaction(fromPublicKey,toPublicKey,amount,productID)
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
