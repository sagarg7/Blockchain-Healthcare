var Hospital = artifacts.require("./Hospital.sol");
var Patient = artifacts.require("./Patient.sol");
module.exports = function(deployer) {
  deployer.deploy(Hospital);
  deployer.deploy(Patient);
};