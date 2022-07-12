// Using "path" module instead of writing "path/to/file.js"
// to avoid problems with different operating systems
const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

/**
 * Delete everthing inside the "build" directory
 */
const buildDirPath = path.resolve(__dirname, "../build");
fs.removeSync(buildDirPath); // Remove the directory
fs.ensureDirSync(buildDirPath); // Re-create the directory

/**
 * Read the "Campaign.sol" file in the "contracts" directory
 */
const campaignPath = path.resolve(__dirname, "../contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

/**
 * Compile both contracts with solidity compiler
 */
const input = {
    language: "Solidity",
    sources: {
        "Campaign.sol": {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
    "Campaign.sol"
]

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildDirPath, contract + ".json"),
        output[contract]
    );
}
