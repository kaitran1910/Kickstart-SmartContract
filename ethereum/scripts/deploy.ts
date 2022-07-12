/**
 * Read documentation in test/* for more details
 * about module usages
 */
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const compiledFactory = require("../build/CampaignFactory.json");

/**
 ** Remember to duplicate the mnemonic.js.sample and
 ** the infuraAPI.js.sample into .js files and put
 ** your own mnemonic and infuraAPI key in there.
 */
const mnemonic = require("./assets/mnemonic");
const infuraAPI = require("./assets/infuraAPI");
const provider = new HDWalletProvider(mnemonic, infuraAPI);
const web3 = new Web3(provider);

/**
 * To use the async/await syntax, we need to
 * wrap the code in a function
 */
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log(
        "Attempting to deploy CampaignFactory from account",
        accounts[0]
    );

    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: "3000000" });

    
    console.log("Contract deployed to:", result.options.address);

    // To prevent the hanging deployment
    provider.engine.stop();
};

export default deploy();
//ts-node deploy.ts | tee assets/deployOutput.txt
