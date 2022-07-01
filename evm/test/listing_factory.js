const Listing = artifacts.require("Listing");
const ListingFactory = artifacts.require("ListingFactory");
const DEFAULT = require("./utils/DEFAULT.json");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ListingFactory", function ([seller]) {
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
    });

    it("should update book list", async () => {
      const deployed = await ListingFactory.deployed();
      const address = await deployed.books.call(0);

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
  });

  describe("ListingFactory should update for Listing calls", () => {
    it("should update buyer mapping on order");
    it("should update buyer mapping on Listing.delist");
    it("should update buyer mapping on Listing.order");
    it("should update buyer mapping on Listing.cancel");
    it("should update buyer mapping on Listing.reject");
    it("should update buyer mapping on Listing.rejectAndDelist");
    it("should update buyer mapping on Listing.refundShipped");
  });
});
