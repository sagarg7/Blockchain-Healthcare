pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Hospital {
    uint public hospitalCount = 0;

    struct Hospital {
        uint id;
        string name;
    }
    event hospital_node_added(
        uint id,
        string name
    );
    mapping(uint => Hospital) public hospitals;

    constructor() public {
        createHospital("Demo Hospital");
    }

    function createHospital(string memory _name) public {
        hospitalCount ++;
        hospitals[hospitalCount] = Hospital(hospitalCount,_name);
        emit hospital_node_added(hospitalCount,_name);

    }

    function getHospital(uint _id) public returns(Hospital memory h) {
        return hospitals[_id];
    }
    
}