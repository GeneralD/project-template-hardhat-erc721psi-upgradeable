import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { __SYMBOL__ } from '../typechain-types/contracts/__SYMBOL__'

export const latest__SYMBOL__Factory = ethers.getContractFactory("__SYMBOL__")
export type Latest__SYMBOL__ = __SYMBOL__ & Contract
