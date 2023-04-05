import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("Mint __SYMBOL__ as admin", () => {
  it("Owner can mint in the limit", async () => {
    const [deployer] = await ethers.getSigners()
    const factory = await latest__SYMBOL__Factory
    const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

    await instance.setMintLimit(100)

    await expect(instance.adminMint(10))
      .to.emit(instance, "Transfer") // just last event can be seen in the test
      .withArgs("0x0000000000000000000000000000000000000000", deployer.address, 9)

    expect(await instance.totalSupply()).to.equal(10)
  })

  it("Owner can mint to other", async () => {
    const [, , bob] = await ethers.getSigners()
    const factory = await latest__SYMBOL__Factory
    const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

    await instance.setMintLimit(200)

    await expect(instance.adminMintTo(bob.address, 50))
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", bob.address, 49)

    expect(await instance.balanceOf(bob.address)).to.equal(50)
  })

  it("Other than owner can't adminMint", async () => {
    const [, alice, bob] = await ethers.getSigners()
    const factory = await latest__SYMBOL__Factory
    const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

    await instance.setMintLimit(100)

    await expect(instance.connect(alice).adminMint(50)).revertedWith("Ownable: caller is not the owner")
    await expect(instance.connect(alice).adminMintTo(bob.address, 50)).revertedWith("Ownable: caller is not the owner")
  })

  it("Even admin can't mint over the limit", async () => {
    const [deployer, alice] = await ethers.getSigners()

    const factory = await latest__SYMBOL__Factory
    const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

    await instance.setMintLimit(20)

    await expect(instance.adminMint(10))
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", deployer.address, 9)

    expect(await instance.totalSupply()).to.equal(10)

    await expect(instance.adminMint(15)).to.be.reverted

    await expect(instance.adminMintTo(alice.address, 10))
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", alice.address, 19)

    expect(await instance.totalSupply()).to.equal(20)
    expect(await instance.ownerOf(10)).to.equal(alice.address)
    expect(await instance.ownerOf(19)).to.equal(alice.address)
  })
})
