const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readDb, writeDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/register', async (req,res)=>{
  const db = readDb();
  const { email, password, firstName, lastName } = req.body;
  if(db.users.find(u=>u.email===email)) return res.status(400).json({error:'Email exists'});
  const hashed = await bcrypt.hash(password,10);
  const user = { id: Date.now().toString(), email, password: hashed, firstName, lastName };
  db.users.push(user); writeDb(db);
  res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', async (req,res)=>{
  const db = readDb();
  const { email, password } = req.body;
  const user = db.users.find(u=>u.email===email);
  if(!user) return res.status(401).json({ error: 'Invalid' });
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(401).json({ error: 'Invalid' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, sameSite:'lax' });
  res.json({ message: 'ok' });
});

router.post('/logout',(req,res)=>{
  res.clearCookie('token'); res.json({ message:'logged out' });
});

router.get('/me', (req,res)=>{
  const token = req.cookies.token;
  if(!token) return res.status(401).json({ error:'Unauthorized' });
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find(u=>u.id===payload.id);
    if(!user) return res.status(401).json({ error:'Unauthorized' });
    return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
  }catch(e){
    return res.status(401).json({ error:'Unauthorized' });
  }
});

module.exports = router;
