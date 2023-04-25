import { parseEther } from 'ethers/lib/utils'
import env, { ethers, upgrades } from 'hardhat'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'

async function main() {
  const util = new HardhatRuntimeUtility(env)
  if (await util.isProxyDeployed()) throw Error("Proxy has already been deployed! 'Upgrade' instead.")

  const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__
  await instance.deployed()

  console.log(await instance.name(), " is deployed to: ", instance.address)
  console.info("Perform `hardhat run initialize` immediately after this! This contract has just been deployed and not been setup yet.")
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
