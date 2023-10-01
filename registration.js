const prompt = require('prompt-sync')();
let manufacturerInstance = null;
const depositAmt = 100;

class Manufacturer {
    constructor(key) {
        if (!manufacturerInstance) {
            this.key = key;
            manufacturerInstance = this;
        } else {
            console.log("There can be only one Manufacturer");
        }
        return manufacturerInstance;
    }
}

class Distributor {
    constructor(key, deposit) {
        this.key = key;
        this.deposit = deposit;
    }
}

class Client {
    constructor(key, deposit) {
        this.key = key;
        this.deposit = deposit;
    }
}

class Users {
    static Manufacturers = [];
    static Distributors = [];
    static Clients = [];

    static addManufacturer(key) {
        this.Manufacturers.push(new Manufacturer(key));
    }

    static addDistributor(key, deposit) {
        this.Distributors.push(new Distributor(key, deposit));
    }

    static addClient(key, deposit) {
        this.Clients.push(new Client(key, deposit));
    }
}

function checkDeposit(deposit) {
    if (deposit < depositAmt) {
        throw new Error("Deposit should be more than 100");
    }
}

//to check if we are creating a duplicate user
function checkDupKey(key) {
    Users.Manufacturers.forEach(function(pubKey) {
        if (key === pubKey) {
            throw new Error("Key already exists! Duplicate key entered.");
        }
    });
    Users.Distributors.forEach(function(pubKey) {
        if (key === pubKey) {
            throw new Error("Key already exists! Duplicate key entered.");
        }
    });
    Users.Clients.forEach(function(pubKey) {
        if (key === pubKey) {
            throw new Error("Key already exists! Duplicate key entered.");
        }
    });
}

function register() {
    const type = prompt("Enter type: ");
    // key is the public key 
    const key = prompt("Enter key: ");
    checkDupKey(key);
    switch (type) {
        case 'M':
            Users.addManufacturer(key);
            break;
        case 'D':
            const distributorDeposit = prompt("Enter deposit: ");
            checkDeposit(distributorDeposit);
            console.log("\nDeposit tranfered to trusted third party.\n")
            Users.addDistributor(key, distributorDeposit);
            break;
        case 'C':
            const clientDeposit = prompt("Enter deposit: ");
            checkDeposit(clientDeposit);
            console.log("\nDeposit tranfered to trusted third party.\n")
            Users.addClient(key, clientDeposit);
            break;
        default:
            console.log("Unrecognized user type");
    }
}

while(1){
    // const choice  = prompt("Enter choice");
    register();
    quit  = prompt("press E to exit registration, Press A to add another user: ");
    if(quit=='E')   break;
}

module.exports.Users = Users