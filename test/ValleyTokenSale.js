var ValleyToken = artifacts.require("ValleyToken");
var ValleyTokenSale = artifacts.require("ValleyTokenSale");

contract("ValleyTokenSale", function (accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  var buyer = accounts[1];
  var admin = accounts[0];
  var tokenPrice = 1000000000000000; // in wei (0.001 ether)
  var tokensAvailable = 750000;
  var numberOfTokens;

  it("initilizes the contract with correct values", function () {
    return ValleyTokenSale.deployed()
      .then(function (instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function (price) {
        assert.equal(price, tokenPrice, "token price is correct.");
      });
  });

  it("facilitates token buying", function () {
    return ValleyToken.deployed()
      .then(function (instance) {
        // Grab token instance first
        tokenInstance = instance;
        return ValleyTokenSale.deployed();
      })
      .then(function (instance) {
        // Then grab token sale instance
        tokenSaleInstance = instance;
        // Provision 75% of all tokens to the token sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then(function (receipt) {
        numberOfTokens = 10;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          'should be the "Sell" event'
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then(function (amount) {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), numberOfTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        // Try to buy tokens different from the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal number of tokens in wei"
        );
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
      });
  });

  it("facilitates the endSale", () => {
    return ValleyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return ValleyTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message, "cannot endSale from someone other than admin");
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((receipt) => {
        return tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          999990,
          "balance left with admin after ending sale"
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 0, "contract has been reset");
      });
  });
});
