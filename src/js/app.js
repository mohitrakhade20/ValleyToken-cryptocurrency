App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: "1000000000000000",
  tokensSold: 0,
  tokensAvailable: 750000,

  init: () => {
    console.log("App Initialized");
    return App.initWeb3();
  },

  initWeb3: () => {
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
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("ValleyTokenSale.json", (valleyTokenSale) => {
      App.contracts.ValleyTokenSale = TruffleContract(valleyTokenSale);
      App.contracts.ValleyTokenSale.setProvider(App.web3Provider);
      App.contracts.ValleyTokenSale.deployed().then((valleyTokenSale) => {
        console.log("Valley Token Sale Address: ", valleyTokenSale.address);
      });
    }).done(() => {
      $.getJSON("ValleyToken.json", (valleyToken) => {
        App.contracts.ValleyToken = TruffleContract(valleyToken);
        App.contracts.ValleyToken.setProvider(App.web3Provider);
        App.contracts.ValleyToken.deployed().then((valleyToken) => {
          console.log("Valley Token Address: ", valleyToken.address);
        });
      });
      App.listenForEvents();
      return App.render();
    });
  },

  // Listen the Sell event once the contract is initalized with web3
  listenForEvents: () => {
    App.contracts.ValleyTokenSale.deployed().then((instance) => {
      return instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch((error, event) => {
          console.log("Event Triggerd: " + event);
          App.render();
        });
    });
  },

  render: () => {
    if (App.loading) {
      return;
    }

    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase((error, account) => {
      if (error === null) {
        App.account = account;
        $("#accountAddress").html("Your account: " + account);
      }
    });

    App.contracts.ValleyTokenSale.deployed()
      .then((instance) => {
        valleyTokenSaleInstance = instance;
        return valleyTokenSaleInstance.tokenPrice();
      })
      .then((tokenPrice) => {
        App.tokenPrice = tokenPrice;
        console.log("Token Price in wei: " + tokenPrice);
        $(".token-price").html(
          web3.fromWei(App.tokenPrice.toNumber(), "ether")
        );
        return valleyTokenSaleInstance.tokensSold();
      })
      .then((tokensSold) => {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);

        var progressPercent = Math.ceil(
          (App.tokensSold / App.tokensAvailable) * 100
        );
        $("#progressValue").css({ width: progressPercent + "%" });

        App.contracts.ValleyToken.deployed()
          .then((instance) => {
            valleyTokenInstance = instance;
            return valleyTokenInstance.balanceOf(App.account);
          })
          .then((balance) => {
            $(".valley-balance").html(balance.toNumber());
            App.loading = false;
            loader.hide();
            content.show();
          });
      });
  },

  buyTokens: () => {
    $("#loader").show();
    $("#content").hide();
    var numberOfTokens = $("#numberOfTokens").val();
    console.log("Number of Tokens: " + numberOfTokens);
    App.contracts.ValleyTokenSale.deployed()
      .then((instance) => {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000, // Gas Limit
        });
      })
      .then((result) => {
        console.log("Tokens Bought");
        $("form").trigger("reset"); // Reset the number of tokens in the form
      });

    //Wait for sell event and once sell is triggered we refresh the page
  },
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
