const Listing = artifacts.require("Listing");
const ListingFactory = artifacts.require("ListingFactory");
const DEFAULT = require("../test/utils/DEFAULT.json");

module.exports = async function (deployer, network, [seller]) {
  console.log(network);
  if (!["test", "ganache", "develop"].includes(network)) {
    throw "2_deploy_listing_factory CANNOT HANDLE THIS NETWORK";
  }
  const factory = await ListingFactory.deployed();
  // TODO: neither of these work
  //   await factory.listBook(
  //     DEFAULT.price,
  //     DEFAULT.title,
  //     DEFAULT.author,
  //     DEFAULT.isbn,
  //     DEFAULT.description,
  //     DEFAULT.condition,
  //     { from: seller }
  //   );

  //   deployer.deploy(
  //     Listing,
  //     factory.address,
  //     seller,
  //     DEFAULT.price,
  //     DEFAULT.title,
  //     DEFAULT.author,
  //     DEFAULT.isbn,
  //     DEFAULT.description,
  //     DEFAULT.condition
  //   );
};
