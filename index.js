
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
        // The actual address that we will use
        try {
            let addr = req.body.addr;
            console.log(addr)
            console.log(req.body)
            // Retrieve the last timestamp
            const now = await api.query.timestamp.now();

            // Retrieve the account balance & nonce via the system module
            const { nonce, data: balance } = await api.query.system.account(addr);

            console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);
            const txHash = await
                api.tx.balances
                    .transfer(addr, 100000000000)
                    .signAndSend(alice);

            // Show the hash
            // const txHash = await api.rpc.system.chain();
            console.log(`Submitted with hash ${txHash}`);
            // console.log(await api.query.system.account(addr));
            res.json({ txHash })
        } catch (e) {
            res.status(400).json({ 'error': e.toString() })
        }
    })
    app.get('/', (req, res) => res.send('Hello World!'))
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

})
