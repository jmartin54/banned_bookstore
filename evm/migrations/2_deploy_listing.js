const Listing = artifacts.require("Listing");
const ListingFactory = artifacts.require("ListingFactory");
const DEFAULT = require("../test/utils/DEFAULT.json");

module.exports = function (deployer, network, [seller]) {
  if (network != "test") {
    console.error("2_deploy_listing CANNOT HANDLE THIS NETWORK");
    return;
  }
  deployer.deploy(ListingFactory);
  deployer.deploy(
    Listing,
    seller,
    DEFAULT.price,
    DEFAULT.title,
    DEFAULT.author,
    DEFAULT.isbn,
    DEFAULT.description,
    DEFAULT.condition
  );
};
