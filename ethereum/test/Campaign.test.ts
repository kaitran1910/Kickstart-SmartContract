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

/**
 * Mocha functions:
 * - beforeEach: Execute some general setup code before each test
 * - it: Run a test and make an assertion
 * - describe: Group "it" tests together
 */
// let accounts;
// let factory;
// let campaignAddress;
// let campaign;
let accounts: any[];
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
let campaign: {
    options: { address: any };
    methods: {
        manager: () => { (): any; new (): any; call: { (): any; new (): any } };
        contribute: () => {
            (): any;
            new (): any;
            send: { (arg0: { value: any; from: any }): any; new (): any };
        };
        approvers: (arg0: any) => {
            (): any;
            new (): any;
            call: { (): any; new (): any };
        };
        createRequest: (
            arg0: string,
            arg1: string,
            arg2: any
        ) => {
            (): any;
            new (): any;
            send: { (arg0: { from: any; gas: string }): any; new (): any };
        };
        requests: (arg0: number) => {
            (): any;
            new (): any;
            call: { (): any; new (): any };
        };
        approveRequest: (arg0: number) => {
            (): any;
            new (): any;
            send: { (arg0: { from: any; gas: string }): any; new (): any };
        };
        finalizeRequest: (arg0: number) => {
            (): any;
            new (): any;
            send: { (arg0: { from: any; gas: string }): any; new (): any };
        };
    };
};

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
        compiledCampaign.abi,
        campaignAddress
    );
});

/**
 * Use it.only() to run a specific test
 */
describe("Campaigns", () => {
    it("deploys a CampaignFactory contract and a Campaign contract", () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it("marks caller as the campaign manager", async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[1], manager);
    });

    it("allows people to contribute money and marks them as approvers", async () => {
        await campaign.methods.contribute().send({
            value: "200",
            from: accounts[2],
        });

        const isContributor = await campaign.methods
            .approvers(accounts[2])
            .call();
        assert(isContributor);
    });

    it("requires a minimum contribution", async () => {
        try {
            await campaign.methods.contribute().send({
                value: "5",
                from: accounts[2],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it("allows a manager to make a payment request", async () => {
        await campaign.methods
            .createRequest("Buy screen", "100", accounts[3])
            .send({
                from: accounts[1],
                gas: "3000000",
            });

        const chosenRequest = await campaign.methods.requests(0).call();
        assert.equal("Buy screen", chosenRequest.description);
    });

    it.only("processes requests from beginning to the end", async () => {
        await campaign.methods.contribute().send({
            from: accounts[2],
            value: web3.utils.toWei("10", "ether"),
        });
        console.log("\taccounts[2] contribute 10 ether - become a contributor");

        await campaign.methods
            .createRequest(
                "A new screen",
                web3.utils.toWei("5", "ether"),
                accounts[5]
            )
            .send({
                from: accounts[1],
                gas: "3000000",
            });
        console.log(
            "\taccounts[1] - contract manager, create a request to send 5 Ether to accounts[5]"
        );

        await campaign.methods.approveRequest(0).send({
            from: accounts[2],
            gas: "3000000",
        });
        console.log("\tContributor approve the request");

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[1],
            gas: "3000000",
        });
        console.log("\tContract manager, finalize the request");

        let finalBalance = await web3.eth.getBalance(accounts[5]);
        finalBalance = web3.utils.fromWei(finalBalance, "ether");
        finalBalance = parseFloat(finalBalance);
        console.log("\tCurrent balance of accounts[5]: " + finalBalance);

        let baseBalance = await web3.eth.getBalance(accounts[6]);
        baseBalance = web3.utils.fromWei(baseBalance, "ether");
        baseBalance = parseFloat(baseBalance);
        console.log("\tBase balance of an account: " + baseBalance);

        // assert(balance > 104);
        assert(finalBalance > baseBalance + 4);
    });
});
