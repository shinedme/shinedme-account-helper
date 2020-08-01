
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
const port = 3000

const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

cryptoWaitReady().then(async () => {
    let keyring = new Keyring({ type: 'sr25519' })
    const wsProvider = new WsProvider();
    const api = await ApiPromise.create({
        provider: wsProvider, types: {
            // mapping the actual specified address format
            Address: 'AccountId',
            // mapping the lookup
            LookupSource: 'AccountId'
        }
    });

    console.log(api.genesisHash.toHex());
    const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

    app.post('/', async (req, res) => {
        let addr = req.body.addr;
        // The actual address that we will use
        const ADDR = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

        // Retrieve the last timestamp
        const now = await api.query.timestamp.now();

        // Retrieve the account balance & nonce via the system module
        const { nonce, data: balance } = await api.query.system.account(ADDR);

        console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);
        const txHash = await
            api.tx.balances
                .transfer(addr, 1000000)
                .signAndSend(alice);

        // Show the hash
        // const txHash = await api.rpc.system.chain();
        console.log(`Submitted with hash ${txHash}`);
        res.json({ txHash })
    })
    app.get('/', (req, res) => res.send('Hello World!'))
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

})
