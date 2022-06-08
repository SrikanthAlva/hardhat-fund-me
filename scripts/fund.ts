import { getNamedAccounts, ethers } from "hardhat"
import { FundMe } from "../typechain"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: FundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract...")
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.003"),
    })
    await transactionResponse.wait(1)
    console.log("Contract Funded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
