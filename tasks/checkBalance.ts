import { HardhatRuntimeEnvironment } from 'hardhat/types'

export default async (arg: any, env: HardhatRuntimeEnvironment) => {
    const [deployer] = await env.ethers.getSigners()
    const balance = await deployer.getBalance()
    const ether = env.ethers.utils.formatEther(balance)
    console.info(`${ether} ETH (${balance} wei) in ${deployer.address}`)
}
