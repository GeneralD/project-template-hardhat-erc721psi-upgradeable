import { expect } from 'chai'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("__SYMBOL__ TokenURI", () => {
    it("Check URIs before and after changing stage", async () => {
        const [_, alice] = await ethers.getSigners()

        const instanceA = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__

        await instanceA.setHighestStage(2)
        await instanceA.setMintLimit(10)
        await instanceA.setBaseURI("https://sample.com/")
        await instanceA.setKeccakPrefix(0, "Before_")
        await instanceA.setKeccakPrefix(1, "After_")

        await instanceA.adminMintTo(alice.address, 4)

        {
            const hash = keccak256(toUtf8Bytes("Before_3"))
            expect(hash.startsWith("0x")).to.be.true
            const name = hash.substring(2)

            expect(await instanceA.tokenURI(3))
                .to.equal(`https://sample.com/${name}.json`)
        }

        instanceA.setStage(3, 1)

        {
            const hash = keccak256(toUtf8Bytes("After_3"))
            expect(hash.startsWith("0x")).to.be.true
            const name = hash.substring(2)

            expect(await instanceA.tokenURI(3))
                .to.equal(`https://sample.com/${name}.json`)
        }
    })
})