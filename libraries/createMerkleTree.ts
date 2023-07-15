import { StandardMerkleTree } from "@openzeppelin/merkle-tree"

export default (addresses: string[]) => {
    return StandardMerkleTree.of(addresses.map(x => [x]), ["address"])
}