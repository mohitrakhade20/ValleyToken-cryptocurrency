var ValleyToken = artifacts.require("./ValleyToken.sol");
contract("ValleyToken", function (accounts) {
  var tokenInstance;
  it("initialize the contract with correct values", function () {
    return ValleyToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function (name) {
        assert.equal(name, "Valley Token", "has a correct name");
        return tokenInstance.symbol();
      })
      .then(function (symbol) {
        assert.equal(symbol, "VALLEY", "has correct symbol");
        return tokenInstance.standard();
      })
      .then(function (standard) {
        assert.equal(standard, "Valley Token v1.0", "has correct standard");
      });
  });

  it("sets the initial supply upon deployment", function () {
    return ValleyToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function (totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "set total supply to one 1,000,000"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (adminBalance) {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "it allocates the initial supply to admin account"
        );
      });
  });

  it("transfers token ownership", function () {
    return ValleyToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 9999999999999999);
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(error.message, "error message must contain revert");
        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then(function (success) {
        assert(success, true, "it returns true");
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (reciept) {
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          250000,
          "adds the amount to the recieving amount"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from the sending account"
        );
      });
  });
});
