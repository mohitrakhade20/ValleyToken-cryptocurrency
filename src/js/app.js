App = {
  web3Provider: null,
  contracts: {},
  account: "0*0",
  init: function () {
    console.log("App initilized...");
    return App.initWeb3();
  },
  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    App.initContracts();
  },

  initContracts: function () {
    $.getJSON("ValleyTokenSale.json", function (valleyTokenSale) {
      App.contracts.valleyTokenSale = TruffleContract(valleyTokenSale);
      App.contracts.valleyTokenSale.setProvider(App.web3Provider);
      App.contracts.valleyTokenSale.deployed().then(function (valleyTokenSale) {
        console.log("VALLEY token sale Address: ", valleyTokenSale.address);
      });
    }).done(function () {
      $.getJSON("ValleyToken.json", function (valleyToken) {
        App.contracts.valleyToken = TruffleContract(valleyToken);
        App.contracts.valleyToken.setProvider(App.web3Provider);
        App.contracts.valleyToken.deployed().then(function (valleyToken) {
          console.log("VALLEY token  Address: ", valleyToken.address);
        });
        return App.render();
      });
    });
  },

  render: function () {
    //Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        console.log("account", account);
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
