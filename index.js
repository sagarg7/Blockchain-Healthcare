var app = require('express')()
var bodyParser = require('body-parser')

//Set view engine to ejs
app.set('view engine', 'ejs')

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
  PatientJSON = require(path.join(__dirname, 'build/contracts/Patient.json'))

//ganache
var provider = new Web3.providers.HttpProvider('http://localhost:8545')

//BigchainDB setup
const driver = require('bigchaindb-driver')
const API_PATH = 'http://localhost:9984/api/v1/' //Needs to be set to whatever you run your node on
const conn = new driver.Connection(API_PATH)
const bip39 = require('bip39')
const seed = bip39.mnemonicToSeed('seedPhrase').slice(0, 32)
const alice = new driver.Ed25519Keypair(seed)

//Accessing the contracts
var Hospital = contract(HospitalJSON)
var Patient = contract(PatientJSON)
Hospital.setProvider(provider)
Patient.setProvider(provider)

var patients = []
var hospitals = []
let patientCount
let hospitalCount

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
                id: result.id.toNumber(),
                fname: result.fname,
                lname: result.lname,
                hospital_id: result.hospital_id.toNumber(),
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
                  id: result.id.toNumber(),
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

app.get('/', function (req, res) {
  console.log(patients)
  console.log(hospitals)
  //Create views 
  res.render('index', { patients: patients })
});

app.get('/:id', function (req, res) {
  var id = req.params.id
  var i
  var patient = null;
  for (i = 0; i < patientCount; i++) {
    if (patients[i].id == id) {
      patient = patients[i];
      break;
    }
  }
  if (patient == null) {
    //return to main menu with error message
  }
  else {
    let finalPatient
    let i
    conn.searchAssets(id)
      .then((assets) => {
        for (i = 0; i < assets.length; i++) {
          if (assets[i].data.id == id) {
            finalPatient = {
              ...patient,
              ...assets[i].data
            };
            break;
          }
        }
        //set up the view for this
        res.render('detail', { patient: finalPatient });
      });
  }
});

app
  .route('/add')
  .get(function (req, res) {
    //set up the view for this
    res.render('add')
  })
  .post(function (req, res) {
    patientCount += 1
    var fname = req.body.fname;
    var lname = req.body.lname;
    var hospital_id = req.body.hospital_id;

    //Adding to blockchain
    Patient.deployed()
      .then((instance) => {
        instance.createPatient(fname, lname, hospital_id);
      });

    //Adding to BigchainDB
    data = {
      id: patientCount,
      heartbeat: req.body.heartbeat,
      CO: req.body.CO,
      CO2: req.body.CO2,
      body_temp_w: req.body.body_temp_w,
      body_temp_d: req.body.body_temp_d,
      room_temp_w: req.body.room_temp_w,
      room_temp_d: req.body.room_temp_d,
      diagnosis: equal.body.diagnosis
    }
    metadata = {}
    const newTxn = driver.Transaction.makeCreateTransaction(
      data,
      metadata,

      [driver.Transaction.makeOutput(
        driver.Transacation.makeEd25519Condition(alice.publicKey)
      )],
      alice.publicKey
    );
    const newTxnSigned = driver.Transaction.signTransaction(newTxn, alice.privateKey);
    conn.postTransactionCommit(newTxnSigned);
    console.log('Successfully added patient');
    res.redirect('/');
  })

app
  .route('/edit/:id')
  .get(function (req, res) {
    res.render('edit')
  })
  .post(function (req, res) {
    res.render('edit')
  })

app.listen(8080, () => {
  console.log('Server online on http://localhost:8080/')
})
