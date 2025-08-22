// Very small in-memory JSON DB for starter purposes.
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DB_FILE = path.join(__dirname, '..', 'db.json');

function readDb(){
  if(!fs.existsSync(DB_FILE)) return { users: [], leads: [] };
  return JSON.parse(fs.readFileSync(DB_FILE,'utf8'));
}
function writeDb(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function initDb(){
  if(fs.existsSync(DB_FILE)) return;
  const users = [{ id: uuidv4(), email: 'test@demo.com', password: '$2b$10$placeholder', firstName:'Test', lastName:'User' }];
  const leads = [];
  for(let i=1;i<=100;i++){
    leads.push({
      id: uuidv4(),
      first_name: 'Lead'+i,
      last_name: 'Demo',
      email: `lead${i}@example.com`,
      phone: '9999999999',
      company: 'Example Co',
      city: 'Hyderabad',
      state: 'TS',
      source: ['website','facebook_ads','google_ads','referral','events','other'][i%6],
      status: ['new','contacted','qualified','lost','won'][i%5],
      score: Math.floor(Math.random()*101),
      lead_value: Math.round(Math.random()*10000)/100,
      last_activity_at: null,
      is_qualified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  writeDb({ users, leads });
}

module.exports = { readDb, writeDb, initDb };
