import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'
import { describe, it } from 'mocha'
import { ethers, upgrades } from 'hardhat'

import createMerkleTree from '../libraries/createMerkleTree'
import { expect } from 'chai'
import { keccak256 } from 'ethers/lib/utils'

describe("__SYMBOL__ Minting Period", () => {
    it("Can public mint if minting period is not set", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setPublicPrice(ethers.utils.parseEther("1"))

        await instance.connect(alice).publicMint(1, { value: ethers.utils.parseEther("1") })
    })

    it("Can't set public minting period if start date is later than end date", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const dayBeforeYesterday = yesterday - 86400

        await expect(instance.setPublicMintAvailablePeriod(yesterday, dayBeforeYesterday))
            .to.be.revertedWith("invalid period")
    })

    it("Can't public mint if minting period is not started", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setPublicPrice(ethers.utils.parseEther("1"))

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const tommorow = now + 86400
        const dayAfterTommorow = tommorow + 86400
        await instance.setPublicMintAvailablePeriod(tommorow, dayAfterTommorow)

        await expect(instance.connect(alice).publicMint(1, { value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith("public minting: not started or ended")
    })

    it("Can't public mint if minting period is ended", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setPublicPrice(ethers.utils.parseEther("1"))

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const dayBeforeYesterday = yesterday - 86400
        await instance.setPublicMintAvailablePeriod(dayBeforeYesterday, yesterday)

        await expect(instance.connect(alice).publicMint(1, { value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith("public minting: not started or ended")
    })

    it("Can public mint if it's in minting period", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setPublicPrice(ethers.utils.parseEther("1"))

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const tommorow = now + 86400
        await instance.setPublicMintAvailablePeriod(yesterday, tommorow)

        await instance.connect(alice).publicMint(1, { value: ethers.utils.parseEther("1") })
    })

    it("Can allowlist mint if minting period is not set", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice, bob] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setAllowlistPrice(ethers.utils.parseEther("1"))

        // register allowlist
        const allowlisted = [alice, bob].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        const proof = tree.getHexProof(keccak256(alice.address))
        await instance.connect(alice).allowlistMint(1, proof, { value: ethers.utils.parseEther("1") })
    })

    it("Can't set allowlist minting period if start date is later than end date", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const dayBeforeYesterday = yesterday - 86400

        await expect(instance.setAllowlistMintAvailablePeriod(yesterday, dayBeforeYesterday))
            .to.be.revertedWith("invalid period")
    })

    it("Can't allowlist mint if minting period is not started", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice, bob] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setAllowlistPrice(ethers.utils.parseEther("1"))

        // register allowlist
        const allowlisted = [alice, bob].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const tommorow = now + 86400
        const dayAfterTommorow = tommorow + 86400
        await instance.setAllowlistMintAvailablePeriod(tommorow, dayAfterTommorow)

        const proof = tree.getHexProof(keccak256(alice.address))
        await expect(instance.connect(alice).allowlistMint(1, proof, { value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith("allowlist minting: not started or ended")
    })

    it("Can't allowlist mint if minting period is ended", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice, bob] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setAllowlistPrice(ethers.utils.parseEther("1"))

        // register allowlist
        const allowlisted = [alice, bob].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const dayBeforeYesterday = yesterday - 86400
        await instance.setAllowlistMintAvailablePeriod(dayBeforeYesterday, yesterday)

        const proof = tree.getHexProof(keccak256(alice.address))
        await expect(instance.connect(alice).allowlistMint(1, proof, { value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith("allowlist minting: not started or ended")
    })

    it("Can allowlist mint if it's in minting period", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__
        const [, alice, bob] = await ethers.getSigners()

        await instance.setMintLimit(10)
        await instance.setAllowlistPrice(ethers.utils.parseEther("1"))

        // register allowlist
        const allowlisted = [alice, bob].map(account => account.address)
        const tree = createMerkleTree(allowlisted)
        const root = tree.getHexRoot()
        await instance.setAllowlist(root)

        const now = (await ethers.provider.getBlock("latest")).timestamp
        const yesterday = now - 86400
        const tommorow = now + 86400
        await instance.setAllowlistMintAvailablePeriod(yesterday, tommorow)

        const proof = tree.getHexProof(keccak256(alice.address))
        await instance.connect(alice).allowlistMint(1, proof, { value: ethers.utils.parseEther("1") })
    })
})