// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Listing {
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
  constructor(
    address _seller, 
    uint _price, 
    string memory _title,
    string memory _author,
    string memory _isbn,
    string memory _description,
    uint8 _condition
  ) {
    seller = _seller;
    price = _price;
    book = Book(_title, _author, _isbn, _description, _condition);
  }
}
