pragma solidity ^0.5.0;

import "./Hospital.sol";

contract Patient {
    uint public patientCount = 0;

    struct Patient {
        uint pos;
        string uid;
        string fname;
        string lname;

        uint hospital_id;
        string password;
    }
     event patient_node_added(
        uint pos,
        string uid,
        string fname,
        string lname,
        
        uint hospital_id,
        string password
    );

    mapping(uint => Patient) public patients;
    
    constructor() public {
        createPatient('Akhil','G',1,'bhjwk','password');
        createPatient('Sagar','G',1,'dktrv','password');
    }

    function createPatient(string memory _fname, string memory _lname,  uint _hospital_id, string memory _uid, string memory _password) public {
        patientCount ++;
        patients[patientCount] = Patient(patientCount,_uid,_fname,_lname,_hospital_id,_password);
        emit patient_node_added(patientCount,_uid,_fname,_lname,_hospital_id, _password);
    }
}