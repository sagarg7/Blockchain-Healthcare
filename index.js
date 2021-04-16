var app = require('express')()
var session = require('express-session')
var bodyParser = require('body-parser')
const request = require('request')

//BigchainDB setup
baseURL = 'http://127.0.0.1:5000/'

//Set view engine to ejs
app.set('view engine', 'ejs')

//Set session conditions for server app
app.use(session({ secret: 'XASDASDA' }));
var ssn;

//Tell Express where we keep our index.ejs
app.set('views', __dirname + '/views')

//Use body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Web3 setup
var Web3 = require('web3'),
  contract = require('@truffle/contract'),
  path = require('path'),
  HospitalJSON = require(path.join(__dirname, 'build/contracts/Hospital.json')),
  PatientJSON = require(path.join(__dirname, 'build/contracts/Patient.json')),
  DoctorJSON = require(path.join(__dirname, 'build/contracts/Doctor.json'));

//ganache
var provider = new Web3.providers.HttpProvider('http://localhost:8545')

//setting up account
var web3 = new Web3(provider);
web3.eth.getAccounts()
  .then((instances) => {
    web3.eth.defaultAccount = instances[0];
  })
  .catch((error) => {
    console.log('Error:', error);
  });

//Accessing the contracts
var Hospital = contract(HospitalJSON)
var Patient = contract(PatientJSON)
var Doctor = contract(DoctorJSON)
Hospital.setProvider(provider)
Patient.setProvider(provider)
Doctor.setProvider(provider)

var patients = []
var hospitals = []
var doctors = []
let patientCount
let hospitalCount
let doctorCount

Patient.deployed()
  .then((instance) => {
    instance
      .patientCount()
      .then((result) => {
        patientCount = result.toNumber()
        console.log('PC:', patientCount)
      })
      .then(() => {
        for (i = 1; i <= patientCount; i++) {
          instance
            .patients(i)
            .then((result) => {
              patients.push({
                pos: result.pos.toNumber(),
                uid: result.uid,
                fname: result.fname,
                lname: result.lname,
                hospital_id: result.hospital_id.toNumber(),
                password: result.password
              })
            })
            .catch((error) => {
              console.log('Error:', error)
            })
        }
      })
      .catch((error) => {
        console.log('Error:', error)
      })
  })
  .then(() => {
    Hospital.deployed().then((instance) => {
      instance
        .hospitalCount()
        .then((result) => {
          hospitalCount = result.toNumber()
          console.log('HC:', hospitalCount)
        })
        .then(() => {
          for (i = 1; i <= hospitalCount; i++) {
            instance
              .hospitals(i)
              .then((result) => {
                hospitals.push({
                  pos: result.pos.toNumber(),
                  uid: result.uid,
                  name: result.name,
                })
              })
              .catch((error) => {
                console.log('Error', error)
              })
          }
        })
        .catch((error) => {
          console.log('Error:', error)
        })
    })
  })
  .then(() => {
    Doctor.deployed()
      .then((instance) => {
        instance
          .doctorCount()
          .then((result) => {
            doctorCount = result.toNumber()
            console.log('DC:', doctorCount)
          })
          .then(() => {
            for (i = 1; i <= doctorCount; i++) {
              instance
                .doctors(i)
                .then((result) => {
                  doctors.push({
                    pos: result.pos.toNumber(),
                    uid: result.uid,
                    fname: result.fname,
                    lname: result.lname,
                    hospital_id: result.hospital_id.toNumber(),
                    password: result.password
                  })
                })
                .catch((error) => {
                  console.log('Error:', error)
                })
            }
          })
          .catch((error) => {
            console.log('Error:', error)
          })
      })
  })


////////////////////////////////////////////   PATIENT VIEWS   /////////////////////////////////////////////////////////////////////

//Login View
app
  .route('/patient')
  .get(function (req, res) {
    res.render('patient/login', {
      'error': ''
    })
  })
  .post(function (req, res) {
    ssn = req.session;
    var uid, pwd;
    uid = req.body.uid;
    pwd = req.body.pwd;

    var patient = null, i;
    for (i = 0; i < patientCount; i++) {
      if (patients[i].uid == uid) {
        patient = patients[i];
        break;
      }
    }

    if (patient == null) {
      res.render('patient/login', {
        'error': 'No such patient registered!'
      });
    }
    else {
      if (patient.password == pwd) {
        ssn.uid = uid;
        ssn.pos = patient.pos - 1;
        //TO be changed
        res.redirect('/patient/home');
      }
      else {
        res.render('patient/login', {
          'error': 'Invalid credentials!'
        });
      }
    }
  });


//Home View
app
  .route('/patient/home')
  .get(function (req, res) {
    ssn = req.session;
    if (ssn.uid) {
      var uid, pos;
      uid = ssn.uid;
      pos = ssn.pos;

      patient = patients[pos];
      var data;
      request.get(baseURL + 'query/all/' + uid, (ERR, RES, body) => {
        data = JSON.parse(body)
        console.log(data);
        try {
          res.render('patient/home', {
            'hist': data,
            'patient': patient
          })
        }
        catch {
          console.log(err)
        }
      })
    }
    else {
      res.redirect('/patient')
    }
  });


//Add View
app
  .route('/patient/add')
  .get(function (req, res) {
    if (ssn.uid) {
      res.render('patient/add', {
        'error': ''
      })
    }
    else {
      res.redirect('/patient')
    }
  })
  .post(function (req, res) {
    ssn = req.session;
    var uid = ssn.uid;

    bpm = req.body.bpm;
    temp = req.body.temp;
    symp = req.body.symp;
    console.log(symp);
    request.post(baseURL + '/add',
      {
        json: {
          bpm: bpm,
          temperature: temp,
          symptoms: symp,
          uid: uid
        }
      },
      (body) => {
        console.log(body);
        res.redirect('/patient/home')
      })
  }
  );


//Edit View
app
  .route('/patient/edit/:euid')
  .get(function (req, res) {
    if (ssn.uid) {

      ssn = req.session;
      var pos = ssn.pos;
      patient = patients[pos];
      var euid = req.params.euid;

      var data;
      request.get(baseURL + 'query/' + euid, (ERR, RES, body) => {
        data = JSON.parse(body)
        console.log(data);
        res.render('patient/edit', {
          'bpm': data.data.bpm,
          'temp': data.data.temperature,
          'symp': data.data.symptoms,
          'patient': patient
        })
      })
    }
    else {
      res.redirect('/patient')
    }
  })
  .post(function (req, res) {
    ssn = req.session;
    var uid = ssn.uid;
    var euid = req.params.euid;

    bpm = req.body.bpm;
    temp = req.body.temp;
    symp = req.body.symp;

    request.post(baseURL + '/edit',
      {
        json: {
          bpm: bpm,
          temperature: temp,
          symptoms: symp,
          euid: euid,
          uid: uid
        }
      },
      (body) => {
        console.log(body);
        res.redirect('/patient/home')
      })
  }
  );

//Delete view
app
  .route('/patient/delete/:euid')
  .get(function (req, res) {
    if (ssn.uid) {
      var euid = req.params.euid;
      ssn = req.session;
      var uid = ssn.uid;
      request.post(baseURL + '/delete',
        {
          json: {
            euid: euid,
            uid: uid,
            deleted: true,
            bpm: 0,
            symptoms: "",
            temperature: 0
          }
        },
        (body) => {
          console.log(body);
          res.redirect('/patient/home')
        })
    }
    else {
      res.redirect('/patient')
    }
  }
  );

//Logout View
app
  .route('/patient/logout')
  .get(function (req, res) {
    delete req.session.uid;
    res.redirect('/patient')
  });


////////////////////////////////////////////   DOCTOR VIEWS   /////////////////////////////////////////////////////////////////////

//Login View
app
  .route('/doctor')
  .get(function (req, res) {
    res.render('doctor/login', {
      'error': ''
    })
  })
  .post(function (req, res) {
    ssn = req.session;
    var duid, pwd;
    duid = req.body.duid;
    pwd = req.body.pwd;

    var doctor = null, i;
    for (i = 0; i < doctorCount; i++) {
      if (doctors[i].uid == duid) {
        doctor = doctors[i];
        break;
      }
    }

    if (doctor == null) {
      res.render('doctor/login', {
        'error': 'No such doctor registered!'
      });
    }
    else {
      if (doctor.password == pwd) {
        ssn.duid = duid;
        ssn.pos = doctor.pos - 1;
        res.redirect('/doctor/home');
      }
      else {
        res.render('doctor/login', {
          'error': 'Invalid credentials!'
        });
      }
    }
  });



//Home view
app
  .route('/doctor/home')
  .get(function (req, res) {
    ssn = req.session;
    if (ssn.duid) {
      var uid, pos;
      duid = ssn.duid;
      pos = ssn.pos;

      doctor = doctors[pos];

      //make request to bigchaindb with the given uid
      var data;

      request.get(baseURL + 'query/doc', (ERR, RES, body) => {
        // console.log(body.length)
        data = JSON.parse(body)

        console.log(data);
        try {
          res.render('doctor/home', {
            'diag': data.diagnosed,
            'undiag': data.undiagnosed,
            'doctor': doctor
          })
        }
        catch {
          console.log(err)
        }
      })
    }
    else {
      res.redirect('/doctor')
    }
  });

//Add View
app
  .route('/doctor/diag/:euid')
  .get(function (req, res) {
    if (ssn.duid) {

      var euid = req.params.euid;

      var data;
      request.get(baseURL + 'query/' + euid, (ERR, RES, body) => {
        data = JSON.parse(body)
        console.log(data);
        res.render('doctor/add', {
          'bpm': data.data.bpm,
          'temp': data.data.temperature,
          'symp': data.data.symptoms
        })
      })
    }
    else {
      res.redirect('/doctor')
    }
  }
  )
  .post(function (req, res) {
    ssn = req.session;
    var uid = ssn.uid;
    var euid = req.params.euid;

    diag = req.body.diag;
    bpm = req.body.bpm;
    temp = req.body.temp;
    symp = req.body.symp;

    request.post(baseURL + '/diag',
      {
        json: {
          diagnosis: diag,
          bpm: bpm,
          temperature: temp,
          symptoms: symp,
          euid: euid,
          uid: uid
        }
      },
      (body) => {
        console.log(body);
        res.redirect('/doctor/home')
      })
  }
  );

//Edit View
app
  .route('/doctor/edit/:euid')
  .get(function (req, res) {
    if (ssn.duid) {

      var euid = req.params.euid;

      var data;
      request.get(baseURL + 'query/' + euid, (ERR, RES, body) => {
        data = JSON.parse(body)
        console.log(data);
        res.render('doctor/edit', {
          'bpm': data.data.bpm,
          'temp': data.data.temperature,
          'diag': data.data.diagnosis,
          'symp': data.data.symptoms
        })
      })
    }
    else {
      res.redirect('/doctor')
    }
  }
  )
  .post(function (req, res) {
    ssn = req.session;
    var uid = ssn.uid;
    var euid = req.params.euid;

    diag = req.body.diag;
    bpm = req.body.bpm;
    temp = req.body.temp;
    symp = req.body.symp;

    request.post(baseURL + '/diag',
      {
        json: {
          diagnosis: diag,
          bpm: bpm,
          temperature: temp,
          symptoms: symp,
          euid: euid,
          uid: uid
        }
      },
      (body) => {
        console.log(body);
        res.redirect('/doctor/home')
      })
  }
  );

//Logout View
app
  .route('/doctor/logout')
  .get(function (req, res) {
    delete req.session.duid;
    res.redirect('/doctor')
  });

























app.listen(8080, () => {
  console.log('Patient server online on http://localhost:8080/patient');
  console.log('Doctor server online on http://localhost:8080/doctor');
})
