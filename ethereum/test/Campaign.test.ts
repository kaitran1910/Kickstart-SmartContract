/**
 * Modules usage explanation:
 *
 * - "assert": For making assertions about the test,
 * mostly used to assert some value is equal to another
 *
 * - "ganache-cli": for deploying a local test network,
 * do pretty much the same thing as using Remix Editor
 *
 * - "web3": a library for interacting with the test network
 * (here only use web3 constructor, hence using a capital Web3)
 * (web3 only supports promises + async/await since v1.*.*)
 *
 * - provider(): a communication layer between web3 library
 * and some specific ETH network, which is Ganache (the
 * local test network) in this case
 *
 * - abi: the ABI of the contract, which is the
 * interface between the contract and the test network
 * - evm: the bytecode of the contract, which is
 * the compiled code of the contract
 */
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../build/CampaignFactory.json");
const compiledCampaign = require("../build/Campaign.json");
// const { abi, evm } = require("../scripts/compile");

/**
 * Mocha functions:
 * - beforeEach: Execute some general setup code before each test
 * - it: Run a test and make an assertion
 * - describe: Group "it" tests together
 */
let accounts;
let factory: {
    methods: {
        createCampaign: (arg0: string) => {
            (): any;
            new (): any;
            send: { (arg0: { from: any; gas: string }): any; new (): any };
        };
        getDeployedCampaigns: () => {
            (): any;
            new (): any;
            call: { (): [any] | PromiseLike<[any]>; new (): any };
        };
    };
    options: { address: any };
};
let campaignAddress;
let campaign: { options: { address: any } };

/**
 * ? When gas is "1_000_000", the test will fail. Why???
 * ? The gas has been used that much????
 */
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy a new CampaignFactory contract
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({
            from: accounts[0],
            gas: "3000000",
        });

    // Calling createCampaign() from the CampaignFactory
    // to deploy a new Campaign contract
    await factory.methods.createCampaign("100").send({
        from: accounts[1],
        gas: "3000000",
    });

    // Get the address of all deployed Campaign instances
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    // Create a new contract instance
    campaign = await new web3.eth.Contract(
        compiledFactory.abi,
        campaignAddress
    );
});

/**
 * Use it.only() to run a specific test
 */
describe("Campaigns", () => {
    it("deploys a CampaignFactory and a Campaign", () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });
});
