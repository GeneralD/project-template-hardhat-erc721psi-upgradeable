import env, { upgrades } from 'hardhat'

import { latest__SYMBOL__Factory } from '../libraries/const'
import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'

async function main() {
    const util = new HardhatRuntimeUtility(env)
    const proxy = await util.deployedProxy()
    const instance = await upgrades.upgradeProxy(proxy.address, await latest__SYMBOL__Factory)
    await instance.deployed()
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
