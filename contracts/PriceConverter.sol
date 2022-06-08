// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        //ABI
        //Address Kovan - 0x9326BFA02ADD2366b30bacB125260Af641031331
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x9326BFA02ADD2366b30bacB125260Af641031331
        // );
        (, int256 price, , , ) = priceFeed.latestRoundData(); // pricefeed gives 8 decimal places ex. 3000.00000000
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethAmount * ethPrice) / 1e18;
        return ethAmountInUsd;
    }

    // function getVersion() internal view returns (uint256) {
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(
    //         0x9326BFA02ADD2366b30bacB125260Af641031331
    //     );
    //     return priceFeed.version();
    // }
}
