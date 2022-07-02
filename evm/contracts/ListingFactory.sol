// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./Listing.sol";
contract ListingFactory {
  event ListedBook(address listing, address seller, uint price, string title, string author);

  Listing[] public listed;
  mapping(address => Listing[]) public sellerToListings;
  constructor() {
  }

  function listBook(
    uint _price, 
    string memory _title,
    string memory _author,
    string memory _isbn,
    string memory _description,
    uint8 _condition
  ) public {

    Listing listing = new Listing(
      this,
      payable(msg.sender),
      _price, 
      _title, 
      _author, 
      _isbn, 
      _description,
       _condition
    );

    listed.push(listing);
    sellerToListings[msg.sender].push(listing);

    emit ListedBook(address(listing), msg.sender, _price, _title, _author);
  }
}