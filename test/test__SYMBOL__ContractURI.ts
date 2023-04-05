import { expect } from 'chai'
import { upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { Latest__SYMBOL__, latest__SYMBOL__Factory } from '../libraries/const'

describe("__SYMBOL__ Contract URI", () => {
    it("Check contractURI", async () => {
        const factory = await latest__SYMBOL__Factory
        const instance = await upgrades.deployProxy(factory) as Latest__SYMBOL__

        await instance.setBaseURI("https://test.com/")
        expect(await instance.contractURI()).to.equal("https://test.com/index.json")
    })
})
