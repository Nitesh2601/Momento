 // this is server.Js
const express = require('express');

// const bodyParser =require('body-parser');   //using express.json instead

const cors = require ('cors');

const AuthRouter = require('./Routes/AuthRouter');

const UserRouter = require('./Routes/UserRouter');


require('dotenv').config();

const connectDB = require('./Models/db'); // Adjust the path to your db.js file

const app = express();

// Connect to MongoDB
connectDB();



app.use(express.json()); 
app.use(cors());

app.use('/auth',AuthRouter);
app.use('/user',UserRouter);

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
