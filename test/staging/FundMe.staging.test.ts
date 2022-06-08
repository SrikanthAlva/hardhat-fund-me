import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { assert, expect } from "chai"
import { FundMe } from "../../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { developmentChains } from "../../helper-hardhat-config"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Stage - FundMe", () => {
          let fundMe: FundMe
          let deployer: SignerWithAddress
          const sendEther = ethers.utils.parseEther("0.003")

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              //   deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allow people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendEther })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
