# Kickstart-Campaign SmartContract

## Make sure to have node installed in your local machine:

-   [Guide to download and install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
-   [Nodejs download link (Please use LTS version)](https://nodejs.org/en/download/)

## Recommended VSCode extensions for the project (not really required)

1. [solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
2. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
3. [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
4. [Material Theme Icons](https://marketplace.visualstudio.com/items?itemName=Equinusocio.vsc-material-theme-icons)

## Available scripts to interact with the project

### `npm install` **(required)**

Install project's dependencies

If there's anything wrong happened, possible way to fix:

```
rm -rf node_modules/
rm -rf package-lock.json
npm install
```

### `ts-node ethereum/scripts/compile.ts` **(required)**

Run the `compile.ts` file to get all `.json` files in the `./ethereum/build/` directory.
Those `.json` files are needed to get the `abi` & `evm` of each contract

`node ethereum/scripts/compile.ts` would do the same in this case

### `npm run test`

To run all test files in the `./ethereum/test/*` folder

### `ts-node scripts/deploy.ts | tee scripts/assets/deployOutput.txt`

To actually deploy the contract to the Rinkeby Testnet by using InfuraAPI
Write the output on the terminal to the `deployOutput.txt` file by using `| tee`

**IMPORTANT!**
Make sure to duplicate the mnemonic.js.sample and the infuraAPI.js.sample
into .js files and put your own mnemonic and infuraAPI key in there.

`node scripts/deploy.ts | tee scripts/assets/deployOutput.txt` DOES NOT WORKING
in this case since we are writing in TypeScript

## To use Remix IDE to work with local project:

1. Make sure there is `@remix-project/remixd` module in the dependencies section in `package.json`
   If not, install it globally by `npm install -g @remix-project/remixd`
2. For https connection:
   `remixd -s ./ --remix-ide https://remix.ethereum.org`
   For http connection:
   `remixd -s ./ -u http://localhost:8080`
