const Listing = artifacts.require("Listing");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Listing", function (/* accounts */) {
  it("should assert true", async function () {
    await Listing.deployed();
    return assert.isTrue(true);
  });
});
