// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./ListingFactory.sol";

contract Listing {

  // State Machine

  enum State { CREATED, DELISTED, ORDERED, SHIPPED, SELLER_PAID_CONTRACT_CLOSED }
  State public state;
  // Valid State Changes:
  // Created -> [Delisted, Ordered]
  // Delisted -> none
  // Ordered -> [Created (Canceled), Created (Rejected),  Delisted, Shipped]
  // Shipped -> [Created (Refunded), SellerPaidContractClosed]
  // SellerPaidContractClosed -> none

  // Data
  ListingFactory public factory;
  address payable public seller;
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
    address payable buyer;
    string shippingAddress;
  }
  Order public currentOrder;

  // Modifiers

  modifier onlySeller() {
    require(msg.sender == seller, "Listing: only the seller can call this function");
    _;
  }

  modifier onlyBuyer() {
    require(address(0) != currentOrder.buyer, "Listing: only the buyer can call this function, and none is set");
    require(msg.sender == currentOrder.buyer, "Listing: only the buyer can call this function");
    _;
  }

  modifier onlyPaid() {
    require(msg.value >= price, "Listing: you did not meet the minimum price");
    _;
  }


  modifier onlyState(State _state) {
    require(state == _state, "Listing: the contract is in the wrong state for this function to be called");
    _;
  }

  // Functions
  constructor(
    ListingFactory _factory,
    address payable _seller, 
    uint _price, 
    string memory _title,
    string memory _author,
    string memory _isbn,
    string memory _description,
    uint8 _condition
  ) {
    factory = _factory;
    state = State.CREATED;
    seller = _seller;
    price = _price;
    book = Book(_title, _author, _isbn, _description, _condition);
  }

// CREATED
  function delist() 
  public 
  onlyState(State.CREATED) 
  onlySeller()
  {
    state = State.DELISTED;
  }

  function order(
    string memory _shippingAddress
  ) 
  public 
  payable 
  onlyState(State.CREATED) 
  onlyPaid() 
  {
    state = State.ORDERED;
    currentOrder = Order(payable(msg.sender), _shippingAddress);
  }

// DELISTED — None

// ORDERED
  function cancel()
  public 
  onlyState(State.ORDERED) 
  onlyBuyer()
  {
    state = State.CREATED;
    _refund();
  }

  function reject()
  public 
  onlyState(State.ORDERED)
  onlySeller() 
  {
    state = State.CREATED;
    _refund();
    currentOrder = Order(payable(0), "");
  }

  function rejectAndDelist() 
  public
  onlyState(State.ORDERED)
  onlySeller() 
  {
    reject();
    state = State.DELISTED;
  }

  function setShipped()
  public
  onlyState(State.ORDERED)
  onlySeller()
  {
    state = State.SHIPPED;
  }

  // SHIPPED
  function refundShipped() 
  public
  onlyState(State.SHIPPED)
  onlySeller()
  {
    state = State.CREATED;
    _refund();
  }
  // refund shipped and delist?

  // withdraw
  function withdraw()
  public
  onlyState(State.SHIPPED)
  onlySeller()
  {
    state = State.SELLER_PAID_CONTRACT_CLOSED;
    seller.transfer(address(this).balance);
  }

  // SELLER_PAID_CONTRACT_CLOSED — None

  // private
  function _refund() private {
    currentOrder.buyer.transfer(address(this).balance);
  }
}