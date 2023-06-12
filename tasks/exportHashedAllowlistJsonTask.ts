import { HardhatRuntimeEnvironment } from 'hardhat/types'
import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'
import { join } from 'path'
import { keccak256 } from 'ethers/lib/utils'
import { writeFileSync } from 'fs'

export default async (arg: any, env: HardhatRuntimeEnvironment) => {
    const util = new HardhatRuntimeUtility(env)
    const data = `[\n${util.allowlistedAddresses().map(keccak256).map(s => `    "${s}"`).join(",\n")}\n]`
    const exportPath = join(__dirname, "allowlist.json")
    console.info(`writing a file to ${exportPath}`)
    writeFileSync(exportPath, data, { flag: "w" })
}