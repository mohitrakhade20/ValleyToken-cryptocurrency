pragma solidity >=0.4.21 <0.7.0;

import "./ValleyToken.sol";


contract ValleyTokenSale {
    address payable admin;
    ValleyToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(ValleyToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, " ");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice), "");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, "");
        require(tokenContract.transfer(msg.sender, _numberOfTokens), "");

        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, "");
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            ),
            ""
        );

        selfdestruct(admin);
    }
}
