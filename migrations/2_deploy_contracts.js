const ValleyToken = artifacts.require("ValleyToken");

module.exports = function (deployer) {
  deployer.deploy(ValleyToken);
};
