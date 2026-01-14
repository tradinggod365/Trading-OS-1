import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const SESSIONS = ['Asia','London','NY'];
const EMOTIONS = ['Calm','Focused','FOMO','Fear','Bored'];

export default function AnalyticsDashboard() {
  const [trades,setTrades] = useState([]);
  const [equityData,setEquityData] = useState([]);
  const [sessionData,setSessionData] = useState([]);
  const [emotionData,setEmotionData] = useState([]);

  useEffect(()=>{ fetchTrades(); }, []);

  const fetchTrades = async () => {
    const { data } = await supabase.from('trades').select('*').order('trade_date',{ascending:true});
    if(data){
      setTrades(data);
      generateEquityCurve(data);
      generateSessionAnalytics(data);
      generateEmotionAnalytics(data);
    }
  };

  const generateEquityCurve = (trades)=>{
    let cum=0;
    const curve = trades.map((t,i)=>{cum+=parseFloat(t.pnl_percent||0); return {name:`Trade ${i+1}`,PnL:cum}});
    setEquityData(curve);
  };

  const generateSessionAnalytics = (trades)=>{
    const data = SESSIONS.map(session=>{
      const s=trades.filter(t=>t.session===session);
      const pnl = s.reduce((sum,t)=>sum+parseFloat(t.pnl_percent||0),0);
      const wins = s.filter(t=>parseFloat(t.pnl_percent||0)>0).length;
      const total = s.length;
      return {session, pnl, winRate: total>0?(wins/total*100).toFixed(0):0};
    });
    setSessionData(data);
  };

  const generateEmotionAnalytics = (trades)=>{
    const data = EMOTIONS.map(emotion=>{
      const s = trades.filter(t=>t.pre_emotion===emotion);
      const pnl = s.reduce((sum,t)=>sum+parseFloat(t.pnl_percent||0),0);
      const wins = s.filter(t=>parseFloat(t.pnl_percent||0)>0).length;
      const total = s.length;
      return {emotion, pnl, winRate: total>0?(wins/total*100).toFixed(0):0};
    });
    setEmotionData(data);
  };

  return (
    <div style={{padding:20, background:'#111', color:'#fff'}}>
      <h1>Analytics Dashboard</h1>
      <LineChart width={500} height={250} data={equityData}>
        <XAxis dataKey="name"/>
        <YAxis/>
        <CartesianGrid stroke="#333" strokeDasharray="5 5"/>
        <Tooltip/>
        <Line type="monotone" dataKey="PnL" stroke="#00ffcc"/>
      </LineChart>
      <BarChart width={500} height={250} data={sessionData}>
        <XAxis dataKey="session"/>
        <YAxis/>
        <Tooltip/>
        <Legend/>
        <Bar dataKey="pnl
