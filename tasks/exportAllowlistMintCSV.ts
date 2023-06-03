import { BigNumber } from 'ethers'
import { writeFileSync } from 'fs'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { join } from 'path'

import { Latest__SYMBOL__ } from '../libraries/const'
import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'

export default async (arg: any, env: HardhatRuntimeEnvironment) => {
    const util = new HardhatRuntimeUtility(env)
    const factory = await env.ethers.getContractFactory("__SYMBOL__Ver0")
    const instance = factory.attach((await util.deployedProxy()).address) as Latest__SYMBOL__

    const data = await Promise.all(util.allowlistedAddresses.map(address => instance.allowlistMemberMintCount(address)
        .then((balance: any) => ({ address, balance }))
        .catch((_: any) => ({ address, balance: BigNumber.from(0) }))
    ))
    const csvBody = data
        .sort((lhs, rhs) => rhs.balance.toNumber() - lhs.balance.toNumber())
        .map(d => `${d.address},${d.balance}`)
        .join("\n")
    const csvHeader = "Address,Balance"
    const csv = `${csvHeader}\n${csvBody}`
    const exportPath = join(__dirname, "allowlist_mint_quantity.csv")
    console.info(`writing a file to ${exportPath}`)
    writeFileSync(exportPath, csv, { flag: "w" })
}
