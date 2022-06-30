// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Listing {

  // Data

  enum State { CREATED, DELISTED, ORDERED }
  State public state;
  address public seller;
  uint public price;

  struct Book {
    string title;
    string author;
    string isbn;
    string description;
    uint8 condition;
  }
  Book public book;

  struct Order {
    address buyer;
    string shippingAddress;
  }
  Order public currentOrder;

  // Modifiers

  modifier onlySeller() {
    require(msg.sender == seller, "Listing: only the seller can call this function");
    _;
  }

  modifier onlyPaid() {
    require(msg.value >= price, "Listing: you did not meet the minimum price");
    _;
  }

  // Functions
  constructor(
    address _seller, 
    uint _price, 
    string memory _title,
    string memory _author,
    string memory _isbn,
    string memory _description,
    uint8 _condition
  ) {
    state = State.CREATED;
    seller = _seller;
    price = _price;
    book = Book(_title, _author, _isbn, _description, _condition);
  }

  function delist() public onlySeller() {
    state = State.DELISTED;
  }

  function order(string memory _shippingAddress) public payable onlyPaid() {
    state = State.ORDERED;
    currentOrder = Order(msg.sender, _shippingAddress);
  }
}
