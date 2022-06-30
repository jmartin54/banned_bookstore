const Listing = artifacts.require("Listing");
const DEFAULT = require("./utils/DEFAULT.json");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Listing", function ([seller, buyer, other]) {
  // utils
  function throwForAll(contract, exceptions) {
    assert.pending();
  }
  // tests

  describe("it should initialize correctly", () => {
    let deployed;
    let book;

    beforeEach(async () => {
      deployed = await Listing.deployed();
      book = await deployed.book.call();
    });
    it("should assert true", async function () {
      await Listing.deployed();
      return assert.isTrue(true);
    });

    it("with a seller", async () =>
      assert.equal(seller, await deployed.seller.call()));
    it("with a price", async () =>
      assert.equal(DEFAULT.price, await deployed.price.call()));
    it("with a title", async () => assert.equal(DEFAULT.title, book.title));
    it("with an author", async () => assert.equal(DEFAULT.author, book.author));
    it("with an isbn", async () => assert.equal(DEFAULT.isbn, book.isbn));
    it("with a description", async () =>
      assert.equal(DEFAULT.description, book.description));
    it("with a condition", async () =>
      assert.equal(DEFAULT.condition, book.condition));

    it("should init in created state", async () =>
      assert.equal(DEFAULT.STATES.CREATED, await deployed.state.call()));
  });

  describe("it should perform actions in CREATED state", () => {
    let listing;
    beforeEach(async () => {
      const { price, title, author, isbn, description, condition } = DEFAULT;
      listing = await Listing.new(
        seller,
        price,
        title,
        author,
        isbn,
        description,
        condition
      );
    });
    it("delist for seller", async () => {
      await listing.delist({ from: seller });
      const state = await listing.state.call();
      assert.equal(DEFAULT.STATES.DELISTED, state);
    });
    it("throw when delist from not seller", async () => {
      try {
        await listing.delist({ from: other });
        assert.failure();
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));

        const state = await listing.state.call();
        assert.equal(DEFAULT.STATES.CREATED, state);
      }
    });
    it("set order with payment", async () => {
      await listing.order(DEFAULT.args.shippingAddress, {
        from: buyer,
        value: DEFAULT.price,
      });
      const state = await listing.state.call();
      const currentOrder = await listing.currentOrder.call();
      assert.equal(DEFAULT.STATES.ORDERED, state);
      assert.equal(buyer, currentOrder.buyer);
      assert.equal(DEFAULT.args.shippingAddress, currentOrder.shippingAddress);
    });
    it("throw when order without sufficient payment", async () => {
      try {
        await listing.order(DEFAULT.args.shippingAddress, {
          from: buyer,
          value: DEFAULT.price - 1,
        });
      } catch (error) {
        assert.ok(/minimum price/.test(error.message));
        const state = await listing.state.call();
        const currentOrder = await listing.currentOrder.call();
        assert.equal(DEFAULT.STATES.CREATED, state);
        assert.equal(0, currentOrder.buyer);
        assert.equal("", currentOrder.shippingAddress);
      }
    });
    it("throw for all other actions");
    // () => {
    //   exceptions = ["delist", "order"];
    //   throwForAll(listing, exceptions);
    // });
  });
});
