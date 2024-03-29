import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-web3'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import * as dotenv from 'dotenv'

import { HardhatUserConfig, task } from 'hardhat/config'

import checkBalanceTask from './tasks/checkBalanceTask'
import checkProxyAddressTask from './tasks/checkProxyAddressTask'
import exportHashedAllowlistJsonTask from './tasks/exportHashedAllowlistJsonTask'
import verifyEtherscanTask from './tasks/verifyEtherscanTask'

dotenv.config()

task("accounts")
  .setDescription("Prints the list of accounts")
  .setAction(async (args, env) => {
    const accounts = await env.ethers.getSigners()
    for (const account of accounts) console.log(account.address)
  })

task("balance")
  .setDescription("Prints the balance of an account")
  .setAction(checkBalanceTask)

task("proxyAddress")
  .setDescription("Prints the address of the deployed proxy")
  .setAction(checkProxyAddressTask)

task("verifyEtherscan")
  .setDescription("alternative verify task but sets arguments automatically")
  .setAction(verifyEtherscanTask)

task("exportAllowlist")
  .setDescription("Export hashed-allowlist addresses to a JSON file")
  .setAction(exportHashedAllowlistJsonTask)

const accounts = [
  process.env.DEPROY_WALLET_PRIVATE_KEY,
].filter((elm?: string): elm is string => elm !== undefined)

const testAccounts = [
  process.env.TEST_WALLET_PRIVATE_KEY,
].filter((elm?: string): elm is string => elm !== undefined)

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Ethereum networks
    mainnet: {
      url: process.env.MAINNET_URL || "",
      chainId: 1,
      accounts: accounts,
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      chainId: 5,
      accounts: testAccounts,
    },
    // Binance smart chains
    bsc_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: accounts,
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
      chainId: 97,
      accounts: testAccounts,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "JPY",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    // Note: To see full list of supported networks, run `npx hardhat verify --list-networks`.
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY ?? "",
      goerli: process.env.ETHERSCAN_API_KEY ?? "",
      bsc: process.env.BSCSCAN_API_KEY ?? "",
      bscTestnet: process.env.BSCSCAN_API_KEY ?? "",
    },
  },
}

export default config
