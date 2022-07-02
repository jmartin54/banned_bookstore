// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./Listing.sol";
contract ListingFactory {
  event ListedBook(address listing, uint id, address seller, uint price, string title, string author);

  struct LinkedListing {
    address prev;
    address next;
  }

  Listing[] public listed; 
  mapping(address  => LinkedListing) public unordered;// TODO: I only want to show state==created
  address public unorderedHead;
  address public unorderedTail;
  mapping(address => Listing[]) public sellerToListings;
  mapping(address => Listing[]) public buyerToListings;
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
    uint id = listed.length;

    Listing listing = new Listing(
      this,
      id,
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

    if(unorderedHead == address(0)) {
      unorderedHead = address(listing);
      unorderedTail = address(listing);
      unordered[address(listing)] = LinkedListing(address(0),address(0));
    } else {
      address oldTail = unorderedTail;
      unordered[unorderedTail].next = address(listing);
      unorderedTail = address(listing);
      unordered[address(listing)] = LinkedListing(oldTail, address(0));
    }

    emit ListedBook(address(listing), id, msg.sender, _price, _title, _author);
  }

  function removeUnordered(
    address _buyer, 
    Listing _listing
  ) public 
  returns (uint)
  {
    address prev = unordered[address(_listing)].prev;
    address next = unordered[address(_listing)].next;
    if(prev != address(0) && next != address(0)) {
      unordered[prev].next = next;
      unordered[next].prev = prev;
    }
    if(prev != address(0) && next == address(0)) {
      unordered[prev].next = address(0);
      unorderedTail = prev;
    }
    if(prev == address(0) && next != address(0)) {
      unorderedHead = next;
      unordered[next].prev = address(0);
    }
    if(prev == address(0) && next == address(0)) {
      unorderedHead = address(0);
      unorderedTail = address(0);
    }

    if(_buyer != address(0)){
      Listing[] storage listings = buyerToListings[_buyer];
      listings.push(_listing);

      return listings.length - 1;
    }

    return 0;
  }

  function trackUnordered(Listing _listing) public {
    if(unorderedHead == address(0)) {
      unorderedHead = address(_listing);
      unorderedTail = address(_listing);
      unordered[(address(_listing))] = LinkedListing(address(_listing), address(0));
    } else {
      address oldTail = unorderedTail;
      unordered[oldTail].next = address(_listing);
      unorderedTail = address(_listing);
      unordered[address(_listing)] = LinkedListing(oldTail, address(0));
    }
  }

  function allUnordered() public view returns (address[100] memory) {
    address[100] memory flattenedLinks;
    if(unorderedHead == address(0)){
      return flattenedLinks;
    }


    address nodeKey = unorderedHead;
    for(uint i = 0; i < 100; i++) {
      flattenedLinks[i] = nodeKey;
      LinkedListing memory node = unordered[nodeKey];
      if(node.next != address(0)) {
        nodeKey = node.next;
      }
      if(node.next == address(0)) {
        return flattenedLinks;
      }
    }
    return flattenedLinks;
  }
}