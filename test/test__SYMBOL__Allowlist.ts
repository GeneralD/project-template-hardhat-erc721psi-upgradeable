import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import { describe, it } from 'mocha'
import { ethers, upgrades } from 'hardhat'

import createMerkleTree from '../libraries/createMerkleTree'
import { expect } from 'chai'

describe("__SYMBOL__ allowlist", () => {
    it("Allowlisted member is verified", async () => {
        const [, john, jonny, jonathan] = await ethers.getSigners()
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.root

        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setAllowlist(root)

        // john is allowlisted
        const proofOfJohn = tree.getProof([john.address])
        expect(await instance.connect(john).isAllowlisted(proofOfJohn)).is.true
        // jonny is allowlisted
        const proofOfJonny = tree.getProof([jonny.address])
        expect(await instance.connect(jonny).isAllowlisted(proofOfJonny)).is.true
        // jonathan is allowlisted
        const proofOfJonathan = tree.getProof([jonathan.address])
        expect(await instance.connect(jonathan).isAllowlisted(proofOfJonathan)).is.true
    })

    it("Other's hex proof is invalid", async () => {
        const [, john, jonny, jonathan, mike] = await ethers.getSigners()
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.root

        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setAllowlist(root)

        const proofOfJohn = tree.getProof([john.address])
        expect(await instance.connect(mike).isAllowlisted(proofOfJohn)).is.false

        const proofOfJonny = tree.getProof([jonny.address])
        expect(await instance.connect(mike).isAllowlisted(proofOfJonny)).is.false

        const proofOfJonathan = tree.getProof([jonathan.address])
        expect(await instance.connect(mike).isAllowlisted(proofOfJonathan)).is.false

        // they are allowlisted, but other member's proof is not valid
        expect(await instance.connect(jonny).isAllowlisted(proofOfJohn)).is.false
        expect(await instance.connect(jonny).isAllowlisted(proofOfJonathan)).is.false
    })
})
