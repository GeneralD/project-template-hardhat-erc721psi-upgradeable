import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import env, { ethers } from 'hardhat'

import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'
import createMerkleTree from '../libraries/createMerkleTree'

async function main() {
    const util = new HardhatRuntimeUtility(env)
    const factory = await latest__SYMBOL__Factory
    const instance = factory.attach((await util.deployedProxy()).address) as Latest__SYMBOL__

    const [deployer] = await ethers.getSigners()
    let nonce = await ethers.provider.getTransactionCount(deployer.address)
    const tree = createMerkleTree(util.allowlistedAddresses())
    await instance.setAllowlist(tree.getHexRoot(), { nonce: nonce++ })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
