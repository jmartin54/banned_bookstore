const Listing = artifacts.require("Listing");
const DEFAULT = require("./utils/DEFAULT.json");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Listing", function ([seller]) {
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

  it("should init with a seller", async () =>
    assert.equal(seller, await deployed.seller.call()));
  it("should init with a price", async () =>
    assert.equal(DEFAULT.price, await deployed.price.call()));
  it("should init with a title", async () =>
    assert.equal(DEFAULT.title, book.title));
  it("should init with an author", async () =>
    assert.equal(DEFAULT.author, book.author));
  it("should init with an isbn", async () =>
    assert.equal(DEFAULT.isbn, book.isbn));
  it("should init with a description", async () =>
    assert.equal(DEFAULT.description, book.description));
  it("should init with a condition", async () =>
    assert.equal(DEFAULT.condition, book.condition));

  it("should init in created state", async () =>
    assert.equal(DEFAULT.STATES.CREATED, await deployed.state.call()));
});
