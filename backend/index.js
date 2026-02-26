const express = require('express');
const auth_router = require('./routes/auth_route');
const candidate_router = require('./routes/candidate_route');
const connection = require('./database/Connection');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();

connection();

app.use(cors({
    origin:"http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials:true,
}))

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.use('/auth',auth_router);
app.use('/api/candidate',candidate_router);



app.get('/',(req,res)=>{
    return res.status(200).end(`<h1>Hello world</h1>`)
})



const PORT = 8001;

app.listen(PORT,()=>{
    console.log(`app is listening at :: http://localhost:${PORT}`);
})