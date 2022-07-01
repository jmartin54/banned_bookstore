## The Banned Bookstore
### is a censorproof shop of censored books

The goal is to complete this in two days

### Milestones

Listing Smart contract + testing [4h]
	- enum state {created, ordered, accepted, shipped, refunded, delisted}
	- uint price
	- struct metadata {title, image, isbn, author, description}
	- address seller
	- struct order {buyer, address}
	-----
	- constructor(price, metadata)
	onlyState(created)
	- delist() -> delisted
	- buyer: order(address) payable ->  ordered
	onlyState(ordered)
	- buyer: cancelOrder() ->created
	- acceptOrder() -> accepted
	- rejectOrder() -> created
	- rejectOrderAndDelist() -> delisted
	onlyState(accepted)
	- markAsShipped() -> shipped
	[maybe:
		onlyState(shipped)
		- markAsReceivedWithRating()
		onlyState(received)
	]
	- withdraw()
	Any state
	- refund() -> refunded

	Notes:
		You might also want to update metadata/price etc
		For now, you can delist and list new
		
		You could time lock withdraw for 1w after markShipped
		Could allow dispute() from user during that week
		Listing Factory Owner could settle dispute `settle(uint refundAmount) onlyOwner`

Market smart contract + testing [4h]
	- address[]: unordered books
	- mapping(address -> address[]): sellerToListings;
	- mapping(address -> address[]): buyerToListings; 

	- listBook(metadata)

	onlyOwner()
	- withdrawPlatformFees() (every action is gas+sc-txn-fee)
	- setOwner()

	Convenience methods for accessing/paginating mappings
	
Setup react project [90m]
	- CRA or vite (expo app in the future)
	- Copy contracts before build/etc
	- Router
	- Empty index page
	- Empty /book/list
	- Empty /book/:id
	- Empty BookPreview
	- Empty Book
	- Empty BookAllStates
	- Empty BookStateX 
	- Loading with suspense
	- Global error handling

Explore blockchain interaction tracking [90m]

	[calling blockchain actions]
	It would be great to store things in local storage
	Maybe using redux
	but basically transaction -> local store
	(or query blockchain to get transactions by address? graph?)
	then transactions are loaded in a sidebar along with status
	this status updates realtime to give ux feedback
	hover over a transaction to explain why blockchain needs this
	subscribe to transaction updates
	when a subscription is refreshed, so is the UI, 
	along with a color flash from transparent, to 50% red to transparent
	When a user calls the blockchain the call goes to the list right away
	When the call is done it's removed from the list
	The user can clear the list
	
	Made a call
	Got an error
	Call is pending
	Call was rejected 
	Call was accepted
	These states ideally, come from the blockchain,
	but also handle MetaMask errors, etc
	
	[loading blockchain data]
	maybe a suspense scheme is good enough for this
	this needs to happen though

Connect pages to smart contract [4h]
