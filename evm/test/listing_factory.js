const Listing = artifacts.require("Listing");
const ListingFactory = artifacts.require("ListingFactory");
const DEFAULT = require("./utils/DEFAULT.json");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ListingFactory", function ([seller, buyer]) {
  let addresses = [];
  let expectedUnordered = [];

  it("should assert true", async function () {
    await ListingFactory.deployed();
    return assert.isTrue(true);
  });

  describe("should deploy Listing contracts", () => {
    it("should deploy valid Listing with ListedBook event", async () => {
      const deployed = await ListingFactory.deployed();
      const receipt = await deployed.listBook(
        DEFAULT.price,
        DEFAULT.title,
        DEFAULT.author,
        DEFAULT.isbn,
        DEFAULT.description,
        DEFAULT.condition
      );

      assert.ok(
        web3.utils.isAddress(receipt.logs[0].address),
        "not an address"
      );

      expectedUnordered.push(receipt.logs[0].args.listing);
      addresses.push({ key: "+ ", address: receipt.logs[0].args.listing });
    });

    it("should update book list", async () => {
      const deployed = await ListingFactory.deployed();
      const address = await deployed.listed.call(0);

      const listing = await Listing.at(address);
      const price = await listing.price.call();
      const book = await listing.book.call();

      assert.notEqual(address, 0);
      assert.ok(web3.utils.isAddress(address));

      assert.equal(price, DEFAULT.price);
      assert.equal(book.author, DEFAULT.author);
    });

    it("should update seller mapping", async () => {
      const deployed = await ListingFactory.deployed();
      const address = await deployed.sellerToListings.call(seller, 0);

      assert.ok(web3.utils.isAddress(address));
    });

    it("should attach factory as parent to Listing", async () => {
      const deployed = await ListingFactory.deployed();
      const address = await deployed.listed.call(0);
      const listing = await Listing.at(address);
      const factoryAddress = await listing.factory.call();
      const idOnFactory = await listing.idOnFactory.call();

      assert.equal(idOnFactory, 0);
      assert.equal(deployed.address, factoryAddress);
    });
  });

  describe("ListingFactory should update for Listing calls", () => {
    async function newListing() {
      const { price, title, author, isbn, description, condition } = DEFAULT;
      const factory = await ListingFactory.deployed();
      const tx = await factory.listBook(
        price,
        title,
        author,
        isbn,
        description,
        condition,
        {
          from: seller,
        }
      );

      return Listing.at(tx.logs[0].args.listing);
    }

    async function newDelisted() {
      const listing = await newListing();
      await listing.delist({ from: seller });
      return listing;
    }
    async function newOrder() {
      const listing = await newListing();
      await listing.order(DEFAULT.args.shippingAddress, {
        from: buyer,
        value: DEFAULT.price,
      });
      return listing;
    }
    async function newCanceled() {
      const listing = await newOrder();
      await listing.cancel({ from: buyer });
      return listing;
    }
    async function newRejected() {
      const listing = await newOrder();
      await listing.reject({ from: seller });
      return listing;
    }
    async function newRejectedAndDelisted() {
      const listing = await newOrder();
      await listing.rejectAndDelist({ from: seller });
      return listing;
    }
    async function newRefundedShipped() {
      const listing = await newOrder();
      await listing.setShipped({ from: seller });
      await listing.refundShipped({ from: seller });
      return listing;
    }

    it("should update buyer mapping after Listing.delist", async () => {
      const delisted = await newDelisted();
      assert.equal(await delisted.state.call(), DEFAULT.STATES.DELISTED);
      // assert not in listed
      addresses.push({ key: "delisted", address: delisted.address });
    });
    it("should update buyer mapping after Listing.order", async () => {
      await newOrder(); // push the index forward to check non-zero id
      const ordered = await newOrder();
      const deployed = await ListingFactory.deployed();
      const currentOrder = await ordered.currentOrder.call();
      const buyerIdOnFactory = currentOrder.buyerIdOnFactory;
      const buyerListing = await deployed.buyerToListings.call(
        buyer,
        buyerIdOnFactory
      );
      assert.equal(await ordered.state.call(), DEFAULT.STATES.ORDERED);
      // assert not listed
      // assert buyerToListing()
      assert.equal(buyerListing, ordered.address);
      // assert orderEvent
      //
      addresses.push({ key: "ordered", address: ordered.address });
    });
    it("should update buyer mapping after Listing.cancel", async () => {
      const canceled = await newCanceled();
      assert.equal(await canceled.state.call(), DEFAULT.STATES.CREATED);
      expectedUnordered.push(canceled.address);
      addresses.push({ key: "+ canceled", address: canceled.address });
    });
    it("should update buyer mapping after Listing.reject", async () => {
      const rejected = await newRejected();
      assert.equal(await rejected.state.call(), DEFAULT.STATES.CREATED);
      // assert not in listed
      expectedUnordered.push(rejected.address);
      addresses.push({ key: "+ rejected", address: rejected.address });
    });
    it("should update buyer mapping after Listing.rejectAndDelist", async () => {
      const rejectedAndDelisted = await newRejectedAndDelisted();
      assert.equal(
        await rejectedAndDelisted.state.call(),
        DEFAULT.STATES.DELISTED
      );
      // assert not in listed
      addresses.push({
        key: "rejectedAndDelisted",
        address: rejectedAndDelisted.address,
      });
    });
    it("should update buyer mapping after Listing.refundShipped", async () => {
      const refundedShipped = await newRefundedShipped();
      assert.equal(await refundedShipped.state.call(), DEFAULT.STATES.CREATED);
      // assert not in listed
      expectedUnordered.push(refundedShipped.address);
      addresses.push({
        key: "+ refundedShipped",
        address: refundedShipped.address,
      });
    });
    it("should have unorderedLinks", async () => {
      const deployed = await ListingFactory.deployed();
      const booksYouCanBuy = await deployed.allUnordered.call();
      expectedUnordered.forEach((e, i) => assert.equal(e, booksYouCanBuy[i]));
      // console.log(expectedUnordered, booksYouCanBuy);
    });
  });
});
