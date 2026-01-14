import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Dashboard() {
  const [trade, setTrade] = useState({market:'', session:'', direction:'', entry:'', exit:'', sl:'', r_multiple:'', pnl_percent:'', pre_emotion:'', post_emotion:'', confidence:3, impulse:3, followed_plan:true});
  const [dailyTradesCount, setDailyTradesCount] = useState(0);
  const MAX_DAILY_TRADES = 5;

  useEffect(()=>{ fetchDailyTrades(); }, []);

  const fetchDailyTrades = async () => {
    const today = new Date().toISOString().slice(0,10);
    const { data, error } = await supabase.from('trades').select('*').eq('trade_date', today);
    if(!error) setDailyTradesCount(data.length);
  };

  const handleChange = (field, value) => setTrade({...trade, [field]: value});

  const calculateRR = () => {
    const entry = parseFloat(trade.entry);
    const exit = parseFloat(trade.exit);
    const sl = parseFloat(trade.sl);
    if(!isNaN(entry) && !isNaN(exit) && !isNaN(sl)){
      const rr = Math.abs((exit - entry)/(entry - sl));
      handleChange('r_multiple', rr.toFixed(2));
      const pnl_percent = ((exit - entry)/entry*100).toFixed(2);
      handleChange('pnl_percent', pnl_percent);
    }
  };

  const saveTrade = async () => {
    if(dailyTradesCount >= MAX_DAILY_TRADES){
      alert('Daily trade limit reached!');
      return;
    }
    const today = new Date().toISOString().slice(0,10);
    const { error } = await supabase.from('trades').insert([{ ...trade, trade_date: today }]);
    if(error){ alert('Error saving trade: '+error.message); return; }
    setDailyTradesCount(dailyTradesCount + 1);
    alert('Trade saved!');
    setTrade({market:'', session:'', direction:'', entry:'', exit:'', sl:'', r_multiple:'', pnl_percent:'', pre_emotion:'', post_emotion:'', confidence:3, impulse:3, followed_plan:true});
  };

  return (
    <div style={{padding:20, background:'#111', color:'#fff'}}>
      <h1>Trading Dashboard</h1>
      <p>Trades Today: {dailyTradesCount} / {MAX_DAILY_TRADES}</p>
      <button onClick={calculateRR}>Calculate R / %</button>
      <button onClick={saveTrade}>Save Trade</button>
    </div>
  );
}
