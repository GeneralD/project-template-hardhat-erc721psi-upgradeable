import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import env, { ethers } from 'hardhat'

import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'
import createMerkleRoot from '../libraries/createMerkleRoot'

async function main() {
    const util = new HardhatRuntimeUtility(env)
    const factory = await latest__SYMBOL__Factory
    const instance = factory.attach((await util.deployedProxy()).address) as Latest__SYMBOL__

    const [deployer] = await ethers.getSigners()
    let nonce = await ethers.provider.getTransactionCount(deployer.address)
    await instance.setAllowlist(createMerkleRoot(util.allowlistedAddresses()), { nonce: nonce++ })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
