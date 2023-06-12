import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import env, { ethers } from 'hardhat'

import HardhatRuntimeUtility from '../libraries/HardhatRuntimeUtility'
import { parseEther } from 'ethers/lib/utils'

async function main() {
    const util = new HardhatRuntimeUtility(env)
    const factory = await latest__SYMBOL__Factory
    const instance = factory.attach((await util.deployedProxy()).address) as Latest__SYMBOL__

    const [deployer] = await ethers.getSigners()
    let nonce = await ethers.provider.getTransactionCount(deployer.address)

    // TODO: Properly fill in the following settings!!

    ///////////////////////////////////////////////////////////////////
    //// Base URI
    ///////////////////////////////////////////////////////////////////

    await instance.setBaseURI("https://__symbol__-nft.com/", { nonce: nonce++ }) // should end with a slash

    ///////////////////////////////////////////////////////////////////
    //// Minting limit
    ///////////////////////////////////////////////////////////////////

    await instance.setMintLimit(1000, { nonce: nonce++ })
    await instance.setAllowlistedMemberMintLimit(3, { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Public minting period
    ///////////////////////////////////////////////////////////////////

    const publicMintStartDate = new Date("2023-10-01T00:00:00Z")
    const publicMintEndDate = new Date("2023-10-31T23:59:59Z")
    await instance.setPublicMintAvailablePeriod(Math.floor(publicMintStartDate.getTime() / 1000), Math.floor(publicMintEndDate.getTime() / 1000), { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Allowlist minting period
    ///////////////////////////////////////////////////////////////////

    const allowlistMintStartDate = new Date("2023-10-01T00:00:00Z")
    const allowlistMintEndDate = new Date("2023-10-31T23:59:59Z")
    await instance.setAllowlistMintAvailablePeriod(Math.floor(allowlistMintStartDate.getTime() / 1000), Math.floor(allowlistMintEndDate.getTime() / 1000), { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Pricing
    ///////////////////////////////////////////////////////////////////

    await instance.setPublicPrice(parseEther("0.01"), { nonce: nonce++ })
    await instance.setAllowlistPrice(parseEther("0.005"), { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Reveal
    ///////////////////////////////////////////////////////////////////

    await instance.setKeccakPrefix("__SYMBOL___", { nonce: nonce++ })
    const revealTime = new Date("2023-11-01T00:00:00Z")
    await instance.setRevealTimestamp(Math.floor(revealTime.getTime() / 1000), { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Royalty
    ///////////////////////////////////////////////////////////////////

    await instance.setRoyaltyFraction(500, { nonce: nonce++ }) // 5%
    await instance.setRoyaltyReceiver("0x1111111111222222222233333333334444444444", { nonce: nonce++ })

    ///////////////////////////////////////////////////////////////////
    //// Withdrawal
    ///////////////////////////////////////////////////////////////////

    await instance.setWithdrawalReceiver("0x5555555555666666666677777777778888888888", { nonce: nonce++ })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
