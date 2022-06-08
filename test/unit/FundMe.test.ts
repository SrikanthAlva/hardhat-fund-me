import { deployments, ethers, getNamedAccounts } from "hardhat"
import { assert, expect } from "chai"
import { FundMe, MockV3Aggregator } from "../../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("FundMe", () => {
    let fundMe: FundMe
    let deployer: SignerWithAddress
    let mockV3Aggregator: MockV3Aggregator
    const sendEther = ethers.utils.parseEther("0.003")

    beforeEach(async () => {
        // deploy Fund Me Contract
        // using hardhat deploy
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        // deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", () => {
        it("sets the aggregator address correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", () => {
        it("fails if you dont send enough ETH", async () => {
            // await fundMe.fund()
            await expect(fundMe.fund()).to.be.revertedWith("Insufficient Funds")
        })

        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sendEther })
            const response = await fundMe.getAddressToAmountFunded(
                deployer.address
            )
            assert.equal(response.toString(), sendEther.toString())
        })

        it("adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendEther })
            const funder = await fundMe.getFunders(0)
            assert(funder.toString(), deployer.address)
        })
    })

    describe("withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendEther })
        })

        it("withdraw ETH from a single founder", async () => {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                endingDeployerBalance.add(gasCost).toString(),
                startingFundMeBalance.add(startingDeployerBalance).toString()
            )
        })

        it("allows us to withdraw with multiple funders", async () => {
            const allAccounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    allAccounts[i]
                )
                await fundMeConnectedContract.fund({
                    value: sendEther,
                })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                endingDeployerBalance.add(gasCost).toString(),
                startingFundMeBalance.add(startingDeployerBalance).toString()
            )
            await expect(fundMe.getFunders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.getAddressToAmountFunded(
                            allAccounts[i].address
                        )
                    ).toString(),
                    "0"
                )
            }
        })

        it("only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]

            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })

        it("cheaper withdraw ETH from a single funder....", async () => {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                endingDeployerBalance.add(gasCost).toString(),
                startingFundMeBalance.add(startingDeployerBalance).toString()
            )
        })

        it("cheaper withdraw test...", async () => {
            const allAccounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    allAccounts[i]
                )
                await fundMeConnectedContract.fund({
                    value: sendEther,
                })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                endingDeployerBalance.add(gasCost).toString(),
                startingFundMeBalance.add(startingDeployerBalance).toString()
            )
            await expect(fundMe.getFunders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.getAddressToAmountFunded(
                            allAccounts[i].address
                        )
                    ).toString(),
                    "0"
                )
            }
        })
    })
})
