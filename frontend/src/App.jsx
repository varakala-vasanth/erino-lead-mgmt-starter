import React, {useEffect, useState} from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', withCredentials: true });

function Login({onDone}){
  const [email,setEmail]=useState('test@demo.com'), [pw,setPw]=useState('password');
  async function submit(e){ e.preventDefault(); await api.post('/auth/login',{email,password:pw}); onDone(); }
  return (<form onSubmit={submit}>
    <h3>Login</h3>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/><br/>
    <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="password"/><br/>
    <button type="submit">Login</button>
  </form>);
}

function Leads(){
  const [page,setPage]=useState(1), [data,setData]=useState([]);
  useEffect(()=>{ api.get('/leads?page='+page).then(r=>setData(r.data.data)).catch(()=>{}); },[page]);
  return (<div>
    <h3>Leads (page {page})</h3>
    <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
    <button onClick={()=>setPage(p=>p+1)}>Next</button>
    <ul>{data.map(l=> <li key={l.id}>{l.first_name} {l.last_name} — {l.email}</li>)}</ul>
  </div>);
}

export default function App(){
  const [ok,setOk]=useState(false);
  return <div style={{padding:20}}>
    {!ok ? <Login onDone={()=>setOk(true)} /> : <Leads /> }
  </div>;
}
