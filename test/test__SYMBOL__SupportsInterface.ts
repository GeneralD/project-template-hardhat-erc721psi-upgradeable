import { expect } from 'chai'
import { upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("__SYMBOL__ SupportsInterface (ERC165)", () => {
    it("Check if the contract supports ERC165", async () => {
        const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__
        expect(await instance.supportsInterface("0x01ffc9a7")).to.be.true
    })

    it("Check if the contract supports ERC721", async () => {
        const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__
        expect(await instance.supportsInterface("0x80ac58cd")).to.be.true
    })

    it("Check if the contract supports ERC2981", async () => {
        const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__
        expect(await instance.supportsInterface("0x2a55205a")).to.be.true
    })

    it("Check if the contract doesn't supports unknown interface", async () => {
        const instance = await upgrades.deployProxy(await latest__SYMBOL__Factory) as Latest__SYMBOL__
        expect(await instance.supportsInterface("0xffffffff")).to.be.false
    })
})