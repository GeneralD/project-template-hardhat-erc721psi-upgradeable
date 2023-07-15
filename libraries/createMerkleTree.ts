import MerkleTree from 'merkletreejs'
import { keccak256 } from 'ethers/lib/utils'

export default (addresses: string[]) => {
    const leaves = addresses.map(keccak256)
    return new MerkleTree(leaves, keccak256, { sort: true })
}