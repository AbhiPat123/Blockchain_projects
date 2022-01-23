let dashcore = require('@dashevo/dashcore-lib');
const got = require('got');
var sender = 'yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa'
var receiver = 'yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq'
var senderPrivatekey = 'adb27adb845cf776e49ba7f09e58cf53182fcdfd5c3c1ac919340117b41e1a7b'
let token = 'oaxhfxJ6TN20ZShquFflYLkYnP45B5yR'//Use the authentication obtained on registering with chain rider.
let url = `https://api.chainrider.io/v1/dash/testnet/addr/${sender}/utxo?token=${token}`
///url1=https://api.chainrider.io/v1/dash/testnet/addr/yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa/utxo?token=8PGdgeEbzxm7SvMWdM4MBIJU5lvnL2w7
//url2=https://api.chainrider.io/v1/dash/testnet/addr/yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq/utxo?token=8PGdgeEbzxm7SvMWdM4MBIJU5lvnL2w7
let send_amount = 10000
//  GRADED FUNCTION
//  TASK-1: Write a function that sends {send_amount} of dash from {sender} to {receiver}.
//  Register on ChainRider to get a ChainRider token (instructions provided) and input its value as {token}
//  Create a transaction using the {dashcore} library, and send the transaction using ChainRider
//  Send Raw Transaction API - https://www.chainrider.io/docs/dash/#send-raw-transaction
//  The resulting transaction ID is needed to be supplied through the Assignment on Coursera

// the create_trxn() function
function create_trxn(send_data, recv_data) {
    const retry = {
        retry: {
            limit: 10,
            statusCodes: [429, 500]
        }
    };

    // recreate url based on the incoming sender and receiver
    url = `https://api.chainrider.io/v1/dash/testnet/addr/${send_data.address}/utxo?token=${token}`;
    got(url, retry).then(response => {
        // object storing utxo info
        var utxo_obj = {};
        
        // parse response
        var url_res_body = JSON.parse(response.body);

        // variable to remember the balance amount to send back to sender
        // a value of -1 later in code indicates that we never had enough satoshis to transfer (in sender)
        var bal_amount = -1;

        for (var i=0; i<url_res_body.length; i++){
            var trxn_info = url_res_body[i];

            if (send_amount <= trxn_info.satoshis){
                // fill the utxo_obj
                utxo_obj['txId'] = trxn_info.txid;              //TXID
                utxo_obj['outputIndex'] = trxn_info.vout;       //vout
                utxo_obj['address'] = trxn_info.address;        //address
                utxo_obj['script'] = trxn_info.scriptPubKey;    //PubKey
                utxo_obj['satoshis'] = trxn_info.satoshis;      //satoshis

                // set the balance amount
                bal_amount = trxn_info.satoshis - send_amount;

                continue;
            }
        }

        // if utxo_obj is empty then we need to go through the transactions again
        // make a list of the multiple transactions that have a total of the send_amount        
        if ( JSON.stringify(utxo_obj) === '{}' ){
            console.log("Getting multiple transactions as array of objects");
            utxo_obj = [];

            // a variable to keep track if we have reached send_amount
            var satoshis_collected = 0;

            for (var i=0; i < url_res_body.length && satoshis_collected < send_amount; i++){
                var trxn_info = url_res_body[i];

                // create an object
                var obj = {
                    'txId' : trxn_info.txid,              //TXID
                    'outputIndex' : trxn_info.vout,       //vout
                    'address' : trxn_info.address,        //address
                    'script' : trxn_info.scriptPubKey,    //PubKey
                    'satoshis' : trxn_info.satoshis 
                };

                // add to the utxo_obj
                utxo_obj.push(obj);

                // update satoshis_collected
                satoshis_collected = satoshis_collected + obj.satoshis;
            }
            // set the balance amount
            bal_amount = satoshis_collected - send_amount;
        }

        console.log("Print utxo object:-");
        console.log(utxo_obj);
        console.log();

        // if bal_amount is positive then sender had enough satoshis and our utxo_obj is ready to go
        // else not enough ins ender account
        if ( bal_amount >= 0 ){
            // create a transaction on the utxo
            var transaction = new dashcore.Transaction()
            .from(utxo_obj) // Feed information about what unspent outputs one can use
            .to(recv_data.address, send_amount) // Add an output with the given amount of satoshis
            .change(send_data.address, bal_amount) // Sets up a change address where the rest of the funds will go
            .sign(send_data.pk)  // Signs all the inputs it can

            console.log("Print new transaction fields:-");
            console.log("to_address - " + recv_data.address);
            console.log("from_address - " + send_data.address);
            console.log("change - " + bal_amount);
            console.log("send_pk - " + send_data.pk+"\n");

            console.log("Print transaction:-");
            console.log(transaction);
            console.log();

            // create the raw transaction dictionary
            raw_trxn_dict = {
                "rawtx": String(transaction),
                "token": token
            }

            // send request for raw transaction
            const options = {
                json: raw_trxn_dict,
                responseType: 'json',
                retry: {
                    limit: 10,
                    statusCodes: [429, 500]
                }
            }

            console.log("Sending raw transaction------");
            got.post('https://api.chainrider.io/v1/dash/testnet/tx/send', options).then(trxn_response => {
                console.log("Print returned Transaction ID:-");
                console.log(trxn_response.body);
            }).catch(error => {
                console.log("trxn_error");
                console.log(error);
            });
        }
        else{
            // not enough in sender
            console.log("Sender does not have "+send_amount+" satoshis!");
        }
    }).catch(error => {
        console.log("error");
        console.log(error);
    });
} 

// create sender and receiver info dictionaries
var send_info = {
    pk: 'adb27adb845cf776e49ba7f09e58cf53182fcdfd5c3c1ac919340117b41e1a7b',
    address: 'yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa'
};
var recv_info = {
    pk: 'ce479af60e74653d9b8f0f09ec00dbd5ec0b60b8e4d0463d392e0dac60cf77f3',
    address: 'yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq'
};

// UNCOMMENT FOLLOWING TO SWAP sender-receiver info
/*
var temp_info = recv_info;
recv_info = send_info;
send_info = temp_info;
*/

// call the create_trxn() function for send_amount
create_trxn(send_info, recv_info);

/*
Verify which of the following addresses has money use that address as sender and the other address as receiver
{
    pk: 'adb27adb845cf776e49ba7f09e58cf53182fcdfd5c3c1ac919340117b41e1a7b',
    address: 'yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa'
}

{
    pk: 'ce479af60e74653d9b8f0f09ec00dbd5ec0b60b8e4d0463d392e0dac60cf77f3',
    address: 'yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq'
}*/

 


