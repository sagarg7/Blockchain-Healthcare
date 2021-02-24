pragma solidity ^0.5.0;

import "./Hospital.sol";

contract Patient {
    uint public patientCount = 0;

    struct Patient {
        uint id;
        string fname;
        string lname;

        uint hospital_id;
    }
     event patient_node_added(
        uint id,
        string fname,
        string lname,
        
        uint hospital_id
    );

    mapping(uint => Patient) public patients;
    constructor() public {
        createPatient('Akhil','G',1);
        createPatient('Sagar','G',1);
    }

    function createPatient(string memory _fname, string memory _lname,  uint _hospital_id) public {
        patientCount ++;
        patients[patientCount] = Patient(patientCount,_fname,_lname,_hospital_id);
        emit patient_node_added(patientCount,_fname,_lname,_hospital_id);

    }

}