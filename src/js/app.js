App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
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
      App.contracts.ValleyTokenSale = TruffleContract(valleyTokenSale);
      App.contracts.ValleyTokenSale.setProvider(App.web3Provider);
      App.contracts.ValleyTokenSale.deployed().then(function (valleyTokenSale) {
        console.log("VALLEY token sale Address: ", valleyTokenSale.address);
      });
    }).done(function () {
      $.getJSON("ValleyToken.json", function (valleyToken) {
        App.contracts.ValleyToken = TruffleContract(valleyToken);
        App.contracts.ValleyToken.setProvider(App.web3Provider);
        App.contracts.ValleyToken.deployed().then(function (valleyToken) {
          console.log("VALLEY token  Address: ", valleyToken.address);
        });
        return App.render();
      });
    });
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    //Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        console.log("account", account);
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // load token SALE contract
    App.contracts.ValleyTokenSale.deployed()
      .then(function (instance) {
        valleyTokenSaleInstance = instance;
        return valleyTokenSaleInstance.tokenPrice();
      })
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );
        return valleyTokenSaleInstance.tokensSold();
      })
      .then(function (tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);

        var progressPercent =
          (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $("#progress").css("width", progressPercent + "%");

        // load token contract
        App.contracts.ValleyToken.deployed()
          .then(function (instance) {
            valleyTokenInstance = instance;
            return valleyTokenInstance.balanceOf(App.account);
          })
          .then(function (balance) {
            $(".valley-balance").html(balance.toNumber());
            App.loading = false;
            loader.hide();
            content.show();
          });
      });
  },

  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    var numberOfTokens = $("#numberOfTokens").val();
    App.contracts.ValleyTokenSale.deployed()
      .then(function (instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000, // Gas limit
        });
      })
      .then(function (result) {
        console.log("Tokens bought...");
        $("form").trigger("reset"); // reset number of tokens in form
        // Wait for Sell event
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
