const ListingFactory = artifacts.require("ListingFactory");

module.exports = async function (deployer, network) {
  if (!["test", "ganache", "develop"].includes(network)) {
    throw "2_deploy_listing_factory CANNOT HANDLE THIS NETWORK";
  }
  deployer.deploy(ListingFactory);
};
