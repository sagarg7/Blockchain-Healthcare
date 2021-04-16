var Hospital = artifacts.require("./Hospital.sol");
var Patient = artifacts.require("./Patient.sol");
var Doctor = artifacts.require("./Doctor.sol");

module.exports = function(deployer) {
  deployer.deploy(Hospital);
  deployer.deploy(Patient);
  deployer.deploy(Doctor);
};