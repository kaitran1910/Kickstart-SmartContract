// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
 
// import "hardhat/console.sol";

/**
 * @title CampaignFactory
 * @dev To control all the already deployed campaigns into 1 contract
 */
contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = address(new Campaign(minimum, msg.sender));
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}


/**
 * @title Campaign
 * @dev To actually deploy a Campaign
 */
contract Campaign {
    /***** Request Struct *****/
    struct Request {
        string description; // Purpose of request
        uint value; // Wei to transfer
        address recipient;  // Who gets the money
        bool complete;  // Whether the request is done
        mapping(address => bool) approvals; // Track who has voted
        uint approvalCount; // Track number of approvals
    }


    /***** State variables *****/
    // address of whom is managing this contract
    address public manager;

    // Minimum donation required to enter the contract as 'approvers'
    uint public minimumContribution;

    // List of addresses of every person who has donated
    uint public approverCount;
    mapping(address => bool) public approvers;

    // List of requests that the manager has created
    uint public requestCount;
    mapping (uint => Request) public requests;


    /***** Functions *****/
    /**
     * @dev modifier To check if caller is the manager
     */
    modifier restricted() {
        /* If the first argument of 'require' evaluates to 'false', execution terminates and all
        changes to the state and to Ether balances are reverted.
        This used to consume all gas in old EVM versions, but not anymore.
        It is often a good idea to use 'require' to check if functions are called correctly.
        As a second argument, you can also provide an explanation about what went wrong. */
        require(msg.sender == manager);
        _;
    }

    /**
     * @dev constructor Set contract deployer as manager
     * @param minimum Set the minimumContribution amount
     */
    constructor(uint minimum, address campaignCreator) {
        // console.log("This Campaign contract was deployed by: ", campaignCreator);
        // console.log("The minimum amount to enter this contract is: ", minimum);

        manager = campaignCreator;
        minimumContribution = minimum;
    }

    /**
     * @dev Called when someone want to donate money to the campaign
     * and enter the contract as an 'approver'
     */
    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        approverCount++;
    }

    /**
     * @dev Can only called by the manager to create a new spending request
     *
     * @param description Purpose of the request
     * @param value Amount to spend/transfer (Wei)
     * @param recipient The address of where the contract will spend money to 
     */
    function createRequest( 
        string memory description,
        uint value,
        address recipient 
    ) 
        public restricted 
    {
        Request storage newRequest = requests[requestCount++];
            newRequest.description = description;
            newRequest.value = value;
            newRequest.recipient = recipient;
            newRequest.complete = false;
            newRequest.approvalCount = 0;
    }

    /**
     * @dev Called by the donater who want to approve an existing spending request
     *
     * @param index Specify which request in the requests list that
     * the caller want to approve
     */
    function approveRequest(uint index) public {
        Request storage chosenRequest = requests[index];

        // Make sure the person who called this function IS A DONATER
        require(approvers[msg.sender]);
        // Make sure this donater HAS NOT ALREADY VOTED
        require(!chosenRequest.approvals[msg.sender]);

        chosenRequest.approvals[msg.sender] = true;
        chosenRequest.approvalCount++;
    }

    /**
     * @dev Can only called by the manager to finalize the specified request
     * At least more than 50% on contributors/donators need to approve the request
     * in order to finalize it
     *
     * @param index Specify which request in the requests list that
     */
    function finalizeRequest(uint index) public restricted {
        Request storage chosenRequest = requests[index];
        
        // Make sure the request IS NOT ALREADY FINALIZED
        require(!chosenRequest.complete);
        // The number of whom already approved the chosen request 
        // MUST be at least more than 50% of all approvers
        require(chosenRequest.approvalCount > (approverCount / 2));

        payable(chosenRequest.recipient).transfer(chosenRequest.value);
        chosenRequest.complete = true;
    }
}