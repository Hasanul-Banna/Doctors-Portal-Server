const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fileUpload = require('express-fileupload');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wqjmg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();
app.use(bodyParser.json())
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;
app.get('/', (req, res) => {
    res.send("hello from db db doog doog")
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("Appoinment");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });


    app.post('/appointmentByDate', (req, res) => {
        const date = req.body;
        appointmentCollection.find({ date: date.date })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/Allappointment', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(file, name, email);
        file.mv(`${__dirname}/doctors/${file.name}`, err => {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: "failed to upload" })
            }
            return res.send({ name: file.name, path: `/${file.name}` })
        })

        doctorCollection.insertOne({ name, email, image: file.name })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    });
});

app.listen(process.env.PORT || port)

