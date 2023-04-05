import { HardhatRuntimeEnvironment } from 'hardhat/types'

import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'

export default async (arg: any, env: HardhatRuntimeEnvironment) => {
    const util = new HardhatRuntimeUtility(env)
    const proxy = await util.deployedProxy()

    env.run("verify:verify", {
        address: proxy.address,
    })
}
