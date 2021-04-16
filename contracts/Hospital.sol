pragma solidity ^0.5.0;

contract Hospital {
    uint public hospitalCount = 0;

    struct Hospital {
        uint pos;
        string uid;
        string name;
    }
    event hospital_node_added(
        uint pos,
        string uid,
        string name
    );
    mapping(uint => Hospital) public hospitals;

    constructor() public {
        createHospital("Demo Hospital","shjvr");
    }

    function createHospital(string memory _name, string memory _uid) public {
        hospitalCount ++;
        hospitals[hospitalCount] = Hospital(hospitalCount,_uid,_name);
        emit hospital_node_added(hospitalCount, _uid,_name);
    }   
}