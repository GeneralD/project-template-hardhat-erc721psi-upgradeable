import { expect } from 'chai'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("__SYMBOL__ TokenURI", () => {
    it("Check URIs before and after changing stage", async () => {
        const [_, alice] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__

        await instance.setHighestStage(2)
        await instance.setMintLimit(10)
        await instance.setBaseURI("https://sample.com/")
        await instance.setKeccakPrefix(0, "Before_")
        await instance.setKeccakPrefix(1, "After_")

        await instance.adminMintTo(alice.address, 4)

        {
            const hash = keccak256(toUtf8Bytes("Before_3"))
            expect(hash.startsWith("0x")).to.be.true
            const name = hash.substring(2)

            expect(await instance.tokenURI(3))
                .to.equal(`https://sample.com/${name}.json`)
        }

        instance.setStage(3, 1)

        {
            const hash = keccak256(toUtf8Bytes("After_3"))
            expect(hash.startsWith("0x")).to.be.true
            const name = hash.substring(2)

            expect(await instance.tokenURI(3))
                .to.equal(`https://sample.com/${name}.json`)
        }
    })
})