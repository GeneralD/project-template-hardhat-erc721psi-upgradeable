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

  const [deployer] = await ethers.getSigners()
  let nonce = await ethers.provider.getTransactionCount(deployer.address)

  // set variables
  await instance.setBaseURI("https://__symbol__-nft.com/", { nonce: nonce++ }) // should end with a slash
  await instance.setMintLimit(1000, { nonce: nonce++ })
  // public mint
  if (!await instance.isPublicMintPaused()) await instance.pausePublicMint({ nonce: nonce++ })
  await instance.setPublicPrice(parseEther("0.01"), { nonce: nonce++ })
  // allowlist mint
  if (!await instance.isAllowlistMintPaused()) await instance.pauseAllowlistMint({ nonce: nonce++ })
  await instance.setAllowListPrice(parseEther("0.005"), { nonce: nonce++ })
  await instance.setAllowlistedMemberMintLimit(3, { nonce: nonce++ })
  // reveal
  await instance.setKeccakPrefix(0, "__SYMBOL___", { nonce: nonce++ })
  // await instance.setKeccakPrefix(1, "NEXT_", { nonce: nonce++ })
  await instance.setHighestStage(0, { nonce: nonce++ })
  // royalty
  await instance.setRoyaltyFraction(500, { nonce: nonce++ }) // 5%
  await instance.setRoyaltyReceiver("0x1111111111222222222233333333334444444444", { nonce: nonce++ })
  // withdrawal
  await instance.setWithdrawalReceiver("0x5555555555666666666677777777778888888888", { nonce: nonce++ })
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
