const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { initDb } = require('./db');

const app = express();
initDb(); // create seed data
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/auth', authRoutes);
app.use('/leads', leadRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend running on', PORT));
