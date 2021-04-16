pragma solidity ^0.5.0;

import "./Hospital.sol";

contract Doctor {
    uint public doctorCount = 0;

    struct Doctor {
        uint pos;
        string uid;
        string fname;
        string lname;

        uint hospital_id;
        string password;
    }
     event doctor_node_added(
        uint pos,
        string uid,
        string fname,
        string lname,
        
        uint hospital_id,
        string password
    );

    mapping(uint => Doctor) public doctors;
    
    constructor() public {
        createDoctor('Salman','Khan',1,'lebhj','password');
        createDoctor('Bobby','Deol',1,'qldyd','password');
    }

    function createDoctor(string memory _fname, string memory _lname,  uint _hospital_id, string memory _uid, string memory _password) public {
        doctorCount ++;
        doctors[doctorCount] = Doctor(doctorCount,_uid,_fname,_lname,_hospital_id,_password);
        emit doctor_node_added(doctorCount,_uid,_fname,_lname,_hospital_id, _password);
    }
}