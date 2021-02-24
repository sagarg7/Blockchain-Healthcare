App = {
        loading: false,
        contracts: {},
        addDiagnosis: async () =>{
          const pid = document.getElementById("pid").value;
          const diagnosis = document.getElementById("diagnosis").value;

          var patient = await App.patients.patients(pid);
          App.patients.addDiagnosis(pid,diagnosis);
          console.log("Diagnosis added");
        },

        load: async () => {
            await App.loadWeb3()
            await App.loadAccount()
            await App.loadContracts()
            await App.render()
        },

        loadWeb3: async () => {
            if (typeof web3 !== 'undefined') {
              App.web3Provider = web3.currentProvider
              web3 = new Web3(web3.currentProvider)
            } else {
              window.alert("Please connect to Metamask.")
            }
            if (window.ethereum) {
              window.web3 = new Web3(ethereum)
              try {
                await ethereum.enable()
                web3.eth.sendTransaction({/* ... */})
              } catch (error) {
              }
            }
            else if (window.web3) {
              App.web3Provider = web3.currentProvider
              window.web3 = new Web3(web3.currentProvider)
              web3.eth.sendTransaction({/* ... */})
            }
            else {
              console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
            }
          },

        loadAccount: async () => {
            App.account = web3.eth.accounts[0]
        },
        
        loadContracts: async () => {
            const hospital = await $.getJSON('Hospital.json')
            const patient = await $.getJSON('Patient.json')
            App.contracts.Hospital = TruffleContract(hospital)
            App.contracts.Patient = TruffleContract(patient)              
            App.contracts.Hospital.setProvider(App.web3Provider)
            App.contracts.Patient.setProvider(App.web3Provider)

            App.hospitals = await App.contracts.Hospital.deployed()
            App.patients = await App.contracts.Patient.deployed()
        },
        loadDiagnosisForm: async () => {
          const patientCount = await App.patients.patientCount();
          const values = Array.from({length: patientCount}, (_, i) => i + 1);

          var select = document.getElementsByTagName("select")[0];
          
          if(select.length == 0){
            for (const val of values) {
              var option = document.createElement("option");
              option.value = val;
              option.text = val.toString();
              select.appendChild(option);
            }
          }
        },

        loadPatientDetails: async () => {
          const pid = document.getElementById("pid").value;
          const patient = await App.patients.patients(pid);

          document.getElementById('fname').value = patient[1];
          document.getElementById('lname').value = patient[2];
          document.getElementById('hbeat').value = patient[3];
          document.getElementById('co').value = patient[4];
          document.getElementById('co2').value = patient[5];
          document.getElementById('btemp').value = patient[6] + "." + patient[7];
          document.getElementById('rtemp').value = patient[8] + "." + patient[9];
          const hid = patient[10]
          const hospital = await App.hospitals.hospitals(hid)
          document.getElementById('hospital').value = hospital[1];
        },

        render: async () => {
            if(App.loading){
                return;
            }

            App.setLoading(true)

            $('#account').html(App.account)

            await App.renderPatients()

            App.setLoading(false)
        },

        renderPatients: async () => {
            const hospitalCount = await App.hospitals.hospitalCount()
            const patientCount = await App.patients.patientCount()

            for(var i = 1; i<=patientCount; i++){
                const patient = await App.patients.patients(i)
                const pid = patient[0].toNumber()
                const fname = patient[1]
                const lname = patient[2]
                const heartbeat = patient[3].toNumber()
                const CO = patient[4].toNumber()
                const CO2 = patient[5].toNumber()
                const body_temp_w = patient[6].toNumber()
                const body_temo_d = patient[7].toNumber()
                const room_temp_w = patient[8].toNumber()
                const room_temp_d = patient[9].toNumber()
                const hid = patient[10]
                const hospital = await App.hospitals.hospitals(hid)
                const hos_name = hospital[1]
                const diagnosis = patient[11]
                // console.log(patient);

                var table_row = '<tr><td>'+pid.toString()+'</td><td>'+fname+'</td><td>'+lname+'</td><td>'+heartbeat.toString()+'</td><td>'+CO.toString()+'</td><td>'+CO2.toString()+'</td><td>'+body_temp_w.toString()+'.'+body_temo_d.toString()+'</td><td>'+room_temp_w.toString()+'.'+room_temp_d.toString()+'</td><td>'+hos_name+'</td><td>';
                if(diagnosis!='') {
                  table_row = table_row + diagnosis + '</td></tr>'
                }
                else {
                  table_row = table_row + 'Undiagnosed</td></tr>'
                }
                // console.log(table_row);
                $('table').append(table_row);
            }
        },

        setLoading: (boolean) => {
          App.loading = boolean
          const loader = $('#loader')
          const content = $('#content')
          if (boolean) {
            loader.show()
            content.hide()
          } else {
            loader.hide()
            content.show()
          }
        }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})

