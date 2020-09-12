var Shop = artifacts.require("./Shop.sol");

// test suite
contract('Shop', function(accounts){
  var ShopInstance;
  var seller = accounts[1];
  var itemName = "item 1";
  var itemDescription = "Description for item 1";
  var itemPrice = 10;

  it("should be initialized with empty values", function() {
    return Shop.deployed().then(function(instance) {
      return instance.getItem();
    }).then(function(data) {
      assert.equal(data[0], 0x0, "seller must be empty");
      assert.equal(data[1], "", "item name must be empty");
      assert.equal(data[2], "", "item description must be empty");
      assert.equal(data[3].toNumber(), 0, "item price must be zero");
    })
  });

  it("should sell an item", function() {
    return Shop.deployed().then(function(instance) {
      shopInstance = instance;
      return shopInstance.sellItem(itemName, itemDescription, web3.toWei(itemPrice, "ether"), { from: seller});
    }).then(function() {
      return shopInstance.getItem();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], itemName, "item name must be " + itemName);
      assert.equal(data[2], itemDescription, "item description must be " + itemDescription);
      assert.equal(data[3].toNumber(), web3.toWei(itemPrice, "ether"), "item price must be " + web3.toWei(itemPrice, "ether"));
    });
  });
    it("should trigger an event when a new item is sold", function() {
    return Shop.deployed().then(function(instance) {
      shopInstance = instance;
      return shopInstance.sellItem(itemName, itemDescription, web3.toWei(itemPrice, "ether"), {from: seller});
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellItem", "event should be LogSellItem");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, itemName, "event item name must be " + itemName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice, "ether"), "event item price must be " + web3.toWei(itemPrice, "ether"));
    });

  });
});
