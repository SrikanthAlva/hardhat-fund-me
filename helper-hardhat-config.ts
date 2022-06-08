export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    rinkeby: {
        blockConfirmations: 6,
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    kovan: {
        blockConfirmations: 6,
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
    mumbai: {
        blockConfirmations: 6,
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    },
    polygon: {
        blockConfirmations: 6,
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

export const developmentChains = ["hardhat", "localhost"]
