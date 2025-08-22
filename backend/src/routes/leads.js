const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authMiddleware(req,res,next){
  const token = req.cookies.token;
  if(!token) return res.status(401).json({ error:'Unauthorized' });
  try{
    jwt.verify(token, JWT_SECRET);
    return next();
  }catch(e){ return res.status(401).json({ error:'Unauthorized' }); }
}

// Create
router.post('/', authMiddleware, (req,res)=>{
  const db = readDb();
  const lead = { id: Date.now().toString(), ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  db.leads.unshift(lead); writeDb(db);
  res.status(201).json(lead);
});

// List with basic pagination & simple filters (contains equals)
router.get('/', authMiddleware, (req,res)=>{
  const db = readDb();
  let data = db.leads.slice();

  // filters: email_contains, company, status, score_gt, score_lt
  if(req.query.email_contains) data = data.filter(l=>l.email.includes(req.query.email_contains));
  if(req.query.company) data = data.filter(l=>l.company===req.query.company);
  if(req.query.status) data = data.filter(l=>l.status===req.query.status);
  if(req.query.score_gt) data = data.filter(l=>l.score > Number(req.query.score_gt));
  if(req.query.score_lt) data = data.filter(l=>l.score < Number(req.query.score_lt));

  const page = Math.max(1, parseInt(req.query.page||'1'));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit||'20')));
  const total = data.length;
  const totalPages = Math.ceil(total/limit);
  const start = (page-1)*limit;
  const pageData = data.slice(start, start+limit);
  res.json({ data: pageData, page, limit, total, totalPages });
});

// Single
router.get('/:id', authMiddleware, (req,res)=>{
  const db = readDb();
  const lead = db.leads.find(l=>l.id===req.params.id);
  if(!lead) return res.status(404).json({ error:'Not found' });
  res.json(lead);
});

// Update
router.put('/:id', authMiddleware, (req,res)=>{
  const db = readDb();
  const idx = db.leads.findIndex(l=>l.id===req.params.id);
  if(idx===-1) return res.status(404).json({ error:'Not found' });
  db.leads[idx] = { ...db.leads[idx], ...req.body, updated_at: new Date().toISOString() };
  writeDb(db);
  res.json(db.leads[idx]);
});

// Delete
router.delete('/:id', authMiddleware, (req,res)=>{
  const db = readDb();
  const idx = db.leads.findIndex(l=>l.id===req.params.id);
  if(idx===-1) return res.status(404).json({ error:'Not found' });
  const removed = db.leads.splice(idx,1)[0];
  writeDb(db);
  res.json({ message:'deleted', id: removed.id });
});

module.exports = router;
