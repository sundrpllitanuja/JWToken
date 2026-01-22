const express = require('express');
const mongoose = require('mongoose');
const ToDo = require('./model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Userdata = require('./user');

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://sundrpllitanuja231006_db_user:hBZo2hR4WaA9E6hB@cluster0.gbyauu1.mongodb.net/').then(() => console.log('Connected to MongoDB')).catch(err => console.log(err));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).json({'message' : 'Access token required'});
    }
    jwt.verify(token, 'this is my secret key', (err, user) => {
        if(err) {
            return res.status(403).json({'message' : 'Invalid token'});
        }
        req.user = user;
        next();
    });
}
app.post('/signup', async (req, res) => {
    const {username} = req.body;
    const {email} = req.body;
    const {password} = req.body;
    try{
        const extistingUser = await Userdata.findOne({email});
        if(extistingUser){
            return res.status(400).json({'message' : 'User already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashed_Password = await bcrypt.hash(password,salt);

        const newUser = new Userdata({username, email, password: hashed_Password});
            await newUser.save();
            const token = jwt.sign({userId: newUser._id},'this is my secret key',{expiresIn : '1h'});
            return res.json({
                message : 'User created successfully',
                token,
                user : {
                    id : newUser._id,
                    username : newUser.username,
                    email : newUser.email
                }   
            })
    } catch(err){
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
    const {email} = req.body;
    const {password} = req.body;
    try{
        const foundUser = await Userdata.findOne({email});
        if(!foundUser){
            return res.status(400).json({'message' : 'Invalid Credentials'});
        }
        const salt = await bcrypt.genSalt(10);
        const ismatch = await bcrypt.compare(password, foundUser.password);
        if(!ismatch){
            return res.status(400).json({'message' : 'Invalid Password'});
        }
            const token = jwt.sign({userId: foundUser._id},'this is my secret key',{expiresIn : '1h'});
            return res.status(201).json({
                message : 'User logged in successfully',
                token,
                user : {
                    id : foundUser._id,
                    username : foundUser.username,
                    email : foundUser.email
                }   
            })
    } catch(err){
        console.log(err);
        return res.status(500).json({'message' : 'Server Error'});
    }
});
app.post('/todo', authenticateToken, async (req, res) => {
    try{
        const {title, description} = req.body;
        const newToDo = new ToDo({title,description, userId: req.user.id});
        await newToDo.save();
        return res.status(201).json({
            message : 'ToDo created successfully',
            todo : newToDo
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({'message' : 'Server Error'});
    }
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'))