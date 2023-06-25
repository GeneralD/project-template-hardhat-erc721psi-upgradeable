import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import { describe, it } from 'mocha'
import { ethers, upgrades } from 'hardhat'

import { expect } from 'chai'

describe("ALC Ownable", () => {
    it("Check owner transferable", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [deployer, , , , , mallory] = await ethers.getSigners()

        // try to write something
        await instance.setMintLimit(10)

        // transfer ownership to mallory
        await instance.transferOwnership(mallory.address)
        await instance.connect(mallory).acceptOwnership()

        // check if the deployer can't write anymore
        await expect(instance.setMintLimit(20))
            .to.revertedWith("Ownable: caller is not the owner")

        // check if mallory can write
        instance.connect(mallory).setMintLimit(20)
    })
})
