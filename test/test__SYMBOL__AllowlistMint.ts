import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import { ethers, upgrades } from 'hardhat'
import { keccak256, parseEther } from 'ethers/lib/utils'

import createMerkleTree from '../libraries/createMerkleTree'
import { describe } from 'mocha'
import { expect } from 'chai'

describe("Mint ALC as allowlisted member", () => {
    it("Allowlisted member can mint", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await john.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // mint
        const proof = tree.getHexProof(keccak256(john.address))
        await expect(await instance.connect(john).allowlistMint(quantity, proof, { value: totalPrice }))
            .to.changeEtherBalances([instance, john], [totalPrice, totalPrice.mul(-1)])

        expect(await instance.allowlistMemberMintCount(john.address))
            .to.equal(quantity)
    })

    it("Not allowlisted member's minting is not allowed", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan, mike] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // try to mint
        const proof = tree.getHexProof(keccak256(mike.address))
        const enoughBadget = parseEther("1000")
        await expect(instance.connect(mike).allowlistMint(5, proof, { value: enoughBadget }))
            .to.revertedWith("invalid merkle proof")
    })

    it("Allowlisted member can mint but not over the limit", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await jonathan.getBalance()
        expect(balance.gte(totalPrice)).is.true

        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await expect(await instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice }))
            .to.changeEtherBalances([instance, jonathan], [totalPrice, totalPrice.mul(-1)])

        expect(await instance.allowlistMemberMintCount(jonathan.address))
            .to.equal(quantity)

        // try to mint more and fail
        await expect(instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice }))
            .to.revertedWith("allowlist minting exceeds the limit")

        // but other guy is still ok
        const proofOfJonny = tree.getHexProof(keccak256(jonny.address))
        await instance.connect(jonny).allowlistMint(quantity, proofOfJonny, { value: totalPrice })

        expect(await instance.allowlistMemberMintCount(jonny.address))
            .to.equal(quantity)
    })

    it("Allowlisted member exceeding the limit of allowlist mint can mint after the sale id is changed", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await jonathan.getBalance()
        expect(balance.gte(totalPrice)).is.true

        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await expect(await instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice }))
            .to.changeEtherBalances([instance, jonathan], [totalPrice, totalPrice.mul(-1)])

        expect(await instance.allowlistMemberMintCount(jonathan.address))
            .to.equal(quantity)

        // try to mint more and fail
        await expect(instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice }))
            .to.be.revertedWith("allowlist minting exceeds the limit")

        await instance.incrementAllowlistSaleId()

        // now jonathan can mint again
        await instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice })

        expect(await instance.allowlistMemberMintCount(jonathan.address))
            .to.equal(quantity)
    })

    it("Allowlisted member can mint in allowlist mint limit but not over the limit of entire contract", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(15)
        await instance.setAllowlistedMemberMintLimit(20)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await jonathan.getBalance()
        expect(balance.gte(totalPrice)).is.true

        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await expect(instance.connect(jonathan).allowlistMint(quantity, proofOfJonathan, { value: totalPrice }))
            .to.revertedWith("minting exceeds the limit")
    })

    it("Cannot mint if sent ETH is not enough", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await john.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // try to mint without enough ETH
        const proof = tree.getHexProof(keccak256(john.address))
        const paid = totalPrice.mul(99).div(100) // 99% of total price
        await expect(instance.connect(john).allowlistMint(quantity, proof, { value: paid }))
            .to.revertedWith("invalid amount of eth sent")
    })

    it("Cannot mint if too much ETH is sent", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john, jonny, jonathan] = await ethers.getSigners()

        await instance.setMintLimit(100)
        await instance.setAllowlistedMemberMintLimit(5)

        // register allowlist
        const allowlisted = [john, jonny, jonathan].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        // check balance to mint
        const price = await instance.allowlistPrice()
        const quantity = await instance.allowlistedMemberMintLimit()
        const totalPrice = price.mul(quantity)
        const balance = await john.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // try to mint without enough ETH
        const proof = tree.getHexProof(keccak256(john.address))
        const paid = totalPrice.mul(101).div(100) // 101% of total price
        await expect(instance.connect(john).allowlistMint(quantity, proof, { value: paid }))
            .to.revertedWith("invalid amount of eth sent")
    })

    it("Only contract owner can increment allowlist sale id", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const [, john] = await ethers.getSigners()

        await expect(instance.connect(john).incrementAllowlistSaleId())
            .to.be.revertedWith("Ownable: caller is not the owner")
    })
})