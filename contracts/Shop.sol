pragma solidity ^0.4.18;

contract Shop {
  // state variables
  address seller;
  string name;
  string description;
  uint256 price;

  event LogSellItem(
  address indexed _seller,
  string _name,
  uint256 _price
  );

  // Create Item
  function sellItem(string _name, string _description, uint256 _price) public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;
    LogSellItem(seller, name, price);
  }

  // get an Item
  function getItem() public view returns (
    address _seller,
    string _name,
    string _description,
    uint256 _price
  ) {
      return(seller, name, description, price);
  }
}
