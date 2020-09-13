App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // // initialize web3
    // if(typeof web3 !== 'undefined') {
    //   //reuse the provider of the Web3 object injected by Metamask
    //   App.web3Provider = web3.currentProvider;
    // } else {
    //   //create a new provider and plug it directly into our local node
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    // }
    // web3 = new Web3(App.web3Provider);
    const ethEnabled = () => {  if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      return true;
    }
    return false;
  }
  if (!ethEnabled()) {  alert("Please install MetaMask to use this dApp!");}
  App.displayAccountInfo();

  return App.initContract();
},

displayAccountInfo: function() {
  web3.eth.getCoinbase(function(err, account) {
    if(err === null) {
      console.log();
      App.account = account;
      $('#account').text(account);
      web3.eth.getBalance(account, function(err, balance) {
        if(err === null) {
          $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
        }
      })
    }
  });
},

initContract: function() {
  $.getJSON('Shop.json', function(shopArtifact) {
    // get the contract artifact file and use it to instantiate a truffle contract abstraction
    App.contracts.Shop = TruffleContract(shopArtifact);
    // set the provider for our contracts
    App.contracts.Shop.setProvider(window.web3.currentProvider);
    // listen to events
    App.listenToEvents();
    // retrieve the item from the contract
    return App.reloadItems();
  });
},
reloadItems: function() {
  // refresh account information because the balance might have changed
  App.displayAccountInfo();

  // retrieve the item placeholder and clear it
  $('#itemsRow').empty();

  App.contracts.Shop.deployed().then(function(instance) {
    return instance.getItem();
  }).then(function(item) {
    if(item[0] == 0x0) {
      // no item
      return;
    }

    // retrieve the item template and fill it
    var itemTemplate = $('#itemTemplate');
    itemTemplate.find('.panel-title').text(item[1]);
    itemTemplate.find('.item-description').text(item[2]);
    itemTemplate.find('.item-price').text(web3.fromWei(item[3], "ether"));

    var seller = item[0];
    if (seller == App.account) {
      seller = "You";
    }
    itemTemplate.find('.item-seller').text(seller);

    // add this item
    $('#itemsRow').append(itemTemplate.html());
  }).catch(function(err) {
    console.error(err.message);
  });
},
sellItem: function() {
  // retrieve the detail of the item
  var _item_name = $('#item_name').val();
  var _description = $('#item_description').val();
  var _price = web3.toWei(parseFloat($('#item_price').val() || 0), "ether");

  if((_item_name.trim() == '') || (_price == 0)) {
    // nothing to sell
    return false;
  }

  App.contracts.Shop.deployed().then(function(instance) {
    return instance.sellItem(_item_name, _description, _price, {
      from: App.account,
      gas: 500000
    });
  }).then(function(result) {

  }).catch(function(err) {
    console.error(err);
  });
},

// listen to events triggered by the contract
listenToEvents: function() {
  App.contracts.Shop.deployed().then(function(instance) {
    instance.LogSellItem({}, {}).watch(function(error, event) {
      if (!error) {
        $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
      } else {
        console.error(error);
      }
      App.reloadItems();
    })
  });
},
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
