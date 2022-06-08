//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./PriceConverter.sol";
import "hardhat/console.sol";

// Get Funds from Users
// Withdraw Funds
// Set a minimun funding value in USD

// constant and immutable keywords can be used to save gas. Constant when we know a variable will never be reassigned.
// immutable is used for variables that are assigned only once.

// 843,096
// 823,794

error FundMe__NotOwner(); // This helps in identifying the contract at which error has been triggered
error FundMe__CallFailed();
error FundMe__InsufficientFunds();

// error FundMe__SendFailed();

// Style Guide - Interface, Library, Contract

/**
    @title A contract for crowd funding
    @author Srikanth Alva
    @notice This contract is Demo for sample funding contract
    @dev This implements price feed as a library
 */
contract FundMe {
    // Type Declaration
    using PriceConverter for uint256;
    // State Variables
    address private immutable i_owner;
    uint256 public constant MIN_USD = 5 * 1e18; // 5USD
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Access Denied!!");

        if (msg.sender != i_owner) {
            // this saves gas as we dont have to save the Error Message string inside the contract
            revert FundMe__NotOwner();
        }
        _; // Do rest of the code
    }

    //Function

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
        @notice This function funds the contract
        @dev This implements price feed as out library
     */

    function fund() public payable {
        console.log("Inside fund function");
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "Insufficient Funds"
        ); // reverts and returns remaining gas
        // if (msg.value.getConversionRate(priceFeed) >= MIN_USD) {
        //     revert FundMe__InsufficientFunds();
        // }
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
        // msg.value has 18 decimal places
    }

    function withdraw() external onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        //call
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        // require(callSuccess, "call Failed!");
        if (callSuccess == false) {
            revert FundMe__CallFailed();
        }
        //transfer
        // payable(owner).transfer(address(this).balance);

        //send
        // bool sendSuccess = payable(owner).send(address(this).balance);
        // require(sendSuccess, "Send Failed!");
        // if(sendSuccess == false) { revert FundMe__SendFailed();}
    }

    function cheaperWithdraw() external {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        //call
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        // require(callSuccess, "call Failed!");
        if (callSuccess == false) {
            revert FundMe__CallFailed();
        }
    }

    // View/Pure Functions

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // View functions have gas costs when called by Contracts
    // Mappings cannot be in Memory
    // constant and immutable keywords save gas by storing the values in the bytecode of the contract instead of Etheruem Storage Slot
}
