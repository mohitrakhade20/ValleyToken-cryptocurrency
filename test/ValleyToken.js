var ValleyToken = artifacts.require("./ValleyToken.sol");
contract("ValleyToken", function (accounts) {
  it("sets the total supply upon deployment", function () {
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
      });
  });
});
