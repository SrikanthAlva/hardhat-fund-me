import { run } from "hardhat"

const verify = async (contractAddress: string, args: any[]) => {
    console.log("Verifying Contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log(`Error Message: ${e.message}`)
        }
    }
}

export default verify
