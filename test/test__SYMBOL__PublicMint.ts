import { expect } from 'chai'
import { ZeroAddress } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("__SYMBOL__ Public Minting", () => {
    it("Can public mint", async () => {
        const [, john] = await ethers.getSigners()
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setMintLimit(300)

        // check balance to mint
        const price = await instance.publicPrice()
        const quantity = 200n
        const totalPrice = price * quantity
        const balance = await ethers.provider.getBalance(john)
        expect(balance).is.greaterThanOrEqual(totalPrice)

        await expect(instance.connect(john).publicMint(quantity, { value: totalPrice }))
            // can check only an event per an 'expect' expression, but 1000 events were emitted
            .to.emit(instance, "Transfer")
            .withArgs(ZeroAddress, john.address, quantity)

        expect(await instance.totalSupply()).to.equal(quantity)
        expect(await instance.balanceOf(john.address)).to.equal(quantity)
        expect(await instance.ownerOf(1)).to.equal(john.address)
        expect(await instance.ownerOf(quantity)).to.equal(john.address)
    })

    it("Can't public-mint over the limit", async () => {
        const [, john] = await ethers.getSigners()
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setMintLimit(300)

        // check balance to mint
        const price = await instance.publicPrice()
        const quantity = 400n
        const totalPrice = price * quantity
        const balance = await ethers.provider.getBalance(john)
        expect(balance).is.greaterThanOrEqual(totalPrice)

        await expect(instance.connect(john).publicMint(quantity, { value: totalPrice }))
            .to.revertedWith("minting exceeds the limit")
    })

    it("Cannot mint if sent ETH is not enough", async () => {
        const [, john] = await ethers.getSigners()
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setMintLimit(300)

        // check balance to mint
        const price = await instance.publicPrice()
        const quantity = 200n
        const totalPrice = price * quantity
        const balance = await ethers.provider.getBalance(john)
        expect(balance).is.greaterThanOrEqual(totalPrice)

        // try to mint without enough ETH
        const paid = totalPrice * 99n / 100n // 99% of the total price
        await expect(instance.connect(john).publicMint(quantity, { value: paid }))
            .to.revertedWith("invalid amount of eth sent")
    })
})
