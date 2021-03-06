const ListingFactory = artifacts.require("ListingFactory");
const Listing = artifacts.require("Listing");
const DEFAULT = require("./utils/DEFAULT.json");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Listing", function ([seller, buyer, other]) {
  // utils
  function BN(num) {
    return new web3.utils.BN(num);
  }

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

  async function assertStateRestrictions(contract) {
    const state = await contract.state.call();
    if (!state.eq(BN(DEFAULT.STATES.CREATED))) {
      // delist onlySeller
      try {
        await contract.delist({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
      // order
      try {
        await contract.order(DEFAULT.args.shippingAddress, {
          from: buyer,
          value: DEFAULT.price,
        });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
    }
    if (!state.eq(BN(DEFAULT.STATES.ORDERED))) {
      // cancel onlyBuyer
      try {
        await contract.cancel({ from: buyer });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
      // reject onlySeller
      try {
        await contract.reject({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
      // rejectAndDelist onlySeller
      try {
        await contract.rejectAndDelist({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }

      // setShipped onlySeller
      try {
        await contract.setShipped({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
    }
    if (!state.eq(BN(DEFAULT.STATES.SHIPPED))) {
      // refund
      try {
        await contract.refundShipped({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
      // withdraw
      try {
        await contract.withdraw({ from: seller });
        assert.fail();
      } catch (error) {
        assert.ok(/wrong state/.test(error.message), "wrong error");
      }
    }
  }
  async function assertTransfer(action, from, to) {
    const fromBefore = await web3.eth.getBalance(from);
    const toBefore = await web3.eth.getBalance(to);

    await action();

    const fromAfter = await web3.eth.getBalance(from);
    const toAfter = await web3.eth.getBalance(to);

    const dTo = BN(toAfter).sub(BN(toBefore));
    const priceSubGas = BN(DEFAULT.price - DEFAULT.util.gasTolerance);

    assert.equal(fromBefore, DEFAULT.price);
    assert.equal(fromAfter, 0);
    assert.ok(dTo.gt(priceSubGas));
  }
  async function assertRefund(contract, action) {
    return assertTransfer(action, contract.address, buyer);
  }
  async function assertSellerPaid(contract, action) {
    return assertTransfer(action, contract.address, seller);
  }
  // tests
  it("should assert true", async function () {
    // TODO: I have no idea why this is failing
    await Listing.deployed();
    return assert.isTrue(true);
  });

  describe("it should initialize correctly", () => {
    let listing;
    let book;

    beforeEach(async () => {
      listing = await newListing();
      book = await listing.book.call();
    });

    it("with a seller", async () =>
      assert.equal(seller, await listing.seller.call()));
    it("with a price", async () =>
      assert.equal(DEFAULT.price, await listing.price.call()));
    it("with a title", async () => assert.equal(DEFAULT.title, book.title));
    it("with an author", async () => assert.equal(DEFAULT.author, book.author));
    it("with an isbn", async () => assert.equal(DEFAULT.isbn, book.isbn));
    it("with a description", async () =>
      assert.equal(DEFAULT.description, book.description));
    it("with a condition", async () =>
      assert.equal(DEFAULT.condition, book.condition));

    it("should init in created state", async () =>
      assert.equal(DEFAULT.STATES.CREATED, await listing.state.call()));
  });

  describe("it should perform actions in CREATED state", () => {
    let listing;
    beforeEach(async () => {
      listing = await newListing();
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
    it("throw for all other actions", () => assertStateRestrictions(listing));
  });

  describe("should not perform actions in DELISTED state", () => {
    let listing;
    beforeEach(async () => {
      listing = await newListing();
      await listing.delist({ from: seller });
    });
    it("throws for all actions", () => assertStateRestrictions(listing));
  });

  describe("should perform actions in the ORDERED state", () => {
    let listing;
    beforeEach(async () => {
      listing = await newListing();
      await listing.order(DEFAULT.args.shippingAddress, {
        from: buyer,
        value: DEFAULT.price,
      });
    });
    it("cancel order for buyer, and refunds", async () => {
      const action = () => listing.cancel({ from: buyer });
      await assertRefund(listing, action);
      assert.equal(DEFAULT.STATES.CREATED, await listing.state.call());
    });
    it("throw when cancel order from not buyer", async () => {
      try {
        await listing.cancel({ from: other });
      } catch (error) {
        assert.ok(/only the buyer/.test(error.message));
      }
    });

    it("rejects order for seller, and refunds", async () => {
      const action = () => listing.reject({ from: seller });
      await assertRefund(listing, action);
      const currentOrder = await listing.currentOrder.call();
      assert.equal(DEFAULT.STATES.CREATED, await listing.state.call());
      assert.equal(0, currentOrder.buyer);
      assert.equal("", currentOrder.shippingAddress);
    });
    it("throw when reject called from not seller", async () => {
      try {
        await listing.reject({ from: other });
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));
      }
    });

    it("rejects order and delists for seller, then refunds", async () => {
      const action = () => listing.rejectAndDelist({ from: seller });
      await assertRefund(listing, action);
      const currentOrder = await listing.currentOrder.call();
      assert.equal(DEFAULT.STATES.DELISTED, await listing.state.call());
      assert.equal(0, currentOrder.buyer);
      assert.equal("", currentOrder.shippingAddress);
    });
    it("throw when reject and delist from not seller", async () => {
      try {
        await listing.rejectAndDelist({ from: other });
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));
      }
    });

    it("sets shipped for seller", async () => {
      await listing.setShipped({ from: seller });
      assert.equal(DEFAULT.STATES.SHIPPED, await listing.state.call());
    });
    it("throws when sets shipped from not seller", async () => {
      try {
        await listing.setShipped({ from: other });
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));
      }
    });

    it("throws for all except, cancel, reject, and rejectAndDelist", () =>
      assertStateRestrictions(listing));
  });

  describe("should perform actions in the SHIPPED state", () => {
    let listing;
    beforeEach(async () => {
      listing = await newListing();
      await listing.order(DEFAULT.args.shippingAddress, {
        from: buyer,
        value: DEFAULT.price,
      });
      await listing.setShipped({ from: seller });
    });
    it("refunds if seller calls", async () => {
      const action = () => listing.refundShipped({ from: seller });
      await assertRefund(listing, action);
      assert.equal(DEFAULT.STATES.CREATED, await listing.state.call());
    });
    it("throws if not seller calls refund", async () => {
      try {
        await listing.refundShipped({ from: other });
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));
      }
    });

    it("withdraws funds for seller", async () => {
      const action = () => listing.withdraw({ from: seller });
      await assertSellerPaid(listing, action);
      assert.equal(
        DEFAULT.STATES.SELLER_PAID_CONTRACT_CLOSED,
        await listing.state.call()
      );
    });
    it("throws if not seller withdraws", async () => {
      try {
        await listing.withdraw({ from: other });
      } catch (error) {
        assert.ok(/only the seller/.test(error.message));
      }
    });

    it("throws for all except, refund, withdraw", () =>
      assertStateRestrictions(listing));
  });

  describe("should not perform actions in the ESCROW_RELEASED state", () => {
    let listing;
    beforeEach(async () => {
      listing = await newListing();
      await listing.order(DEFAULT.args.shippingAddress, {
        from: buyer,
        value: DEFAULT.price,
      });
      await listing.setShipped({ from: seller });
      await listing.withdraw({ from: seller });
    });
    it("throws for all actions", () => assertStateRestrictions(listing));
  });
});
