const ValleyToken = artifacts.require("ValleyToken");

module.exports = function (deployer) {
  deployer.deploy(ValleyToken, 1000000);
};
