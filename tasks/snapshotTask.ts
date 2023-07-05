import {
    Network,
    OwnedNft,
    getNftsForOwner,
    getOwnersForCollection,
    initializeAlchemy
} from '@alch/alchemy-sdk'

import { HardhatRuntimeEnvironment } from 'hardhat/types'
import ObjectsToCsv from 'objects-to-csv'
import { constants } from 'ethers'
import { join } from 'path'

export default async (arg: any, env: HardhatRuntimeEnvironment) => {
    const alchemy = initializeAlchemy({
        apiKey: process.env.MAINNET_KEY,
        network: Network.ETH_MAINNET,
        maxRetries: 3,
    })

    // Airdrops are supplied to owners of this NFT
    const contractAddress = process.env.SNAPSHOT_TARGET_CONTRACT_ADDRESS!

    const ownersResponse = await getOwnersForCollection(alchemy, contractAddress)
    // filter to exclude burnt (zero address)
    const owners = ownersResponse.owners.filter(owner => owner !== constants.AddressZero)

    const rows: { address: string, balance: number }[] = []
    for (const owner of owners) {
        async function ownedNfts(pageKey: string | undefined = undefined) {
            const response = await getNftsForOwner(alchemy, owner, { contractAddresses: [contractAddress], pageKey })
            if (!response.pageKey) return response.ownedNfts
            const next: OwnedNft[] = await ownedNfts(response.pageKey)
            return response.ownedNfts.concat(next)
        }
        const nfts = await ownedNfts()
        rows.push({ address: owner, balance: nfts.length, })
    }

    const csv = new ObjectsToCsv(rows)
    csv.toDisk(join(__dirname, "holders.csv"))
}
