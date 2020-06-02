const ValleyToken = artifacts.require("ValleyToken");
const ValleyTokenSale = artifacts.require("ValleyTokenSale");
module.exports = function (deployer) {
  // deployer.deploy(ValleyToken, 1000000);
  // deployer.deploy(ValleyTokenSale);

  deployer.deploy(ValleyToken, 1000000).then(function () {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(ValleyTokenSale, ValleyToken.address, tokenPrice);
  });
};
