
import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, Sparkles, Coins, Globe } from 'lucide-react';

const currencyList = [
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar' },
  { code: 'TWD', symbol: '$', name: 'New Taiwan Dollar' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
].sort((a, b) => a.code.localeCompare(b.code));

const CurrencyCalculator: React.FC = () => {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurr, setFromCurr] = useState('');
  const [toCurr, setToCurr] = useState('');
  const [rate, setRate] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const convert = (val: string) => {
    if (!fromCurr || !toCurr) return '0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return (num * rate).toFixed(2);
  };

  const fetchRate = async () => {
    if (!fromCurr || !toCurr) return;
    setLoading(true);
    setTimeout(() => {
      const usdBaseRates: Record<string, number> = {
        'USD': 1.0, 'JPY': 150.25, 'HKD': 7.82, 'TWD': 31.5, 'CAD': 1.35, 'EUR': 0.92,
        'GBP': 0.79, 'AUD': 1.53, 'NZD': 1.62, 'CHF': 0.88, 'CNY': 7.19, 'KRW': 1330.0,
        'THB': 35.8, 'SGD': 1.34, 'MYR': 4.77, 'PHP': 56.1, 'IDR': 15600.0, 'VND': 24500.0,
        'INR': 83.0, 'AED': 3.67, 'BRL': 4.97, 'ZAR': 19.1, 'MXN': 17.05, 'SEK': 10.4,
        'NOK': 10.5, 'DKK': 6.85, 'PLN': 3.98, 'TRY': 31.2, 'SAR': 3.75, 'ILS': 3.65, 'EGP': 30.9,
      };
      
      let newRate = 1;
      if (fromCurr === toCurr) {
        newRate = 1;
      } else {
        const fromInUsd = 1 / (usdBaseRates[fromCurr] || 1);
        const usdToTarget = usdBaseRates[toCurr] || 1;
        newRate = fromInUsd * usdToTarget;
      }
      setRate(newRate * (1 + (Math.random() * 0.001 - 0.0005)));
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchRate();
  }, [fromCurr, toCurr]);

  const handleSwap = () => {
    if (!fromCurr || !toCurr) return;
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  const getSymbol = (code: string) => currencyList.find(c => c.code === code)?.symbol || '';

  return (
    <div className="flex flex-col animate-fadeIn px-4 pt-12 pb-20 space-y-8">
      <div className="text-center mb-2 flex flex-col items-center">
        <div className="w-16 h-1 bg-indigo-200 rounded-full mb-4 opacity-50"></div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
            <Globe size={20} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Wonder Coin Party</h1>
          <div className="p-2 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
            <Sparkles size={20} />
          </div>
        </div>
        <p className="text-[10px] text-indigo-600 mt-2 uppercase font-black tracking-[0.2em] opacity-60">Swap every coin in the world!</p>
      </div>

      <div className="bg-white p-8 rounded-[3.5rem] border-2 border-indigo-50 shadow-[0_15px_40px_rgba(79,70,229,0.08)] space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${fromCurr && toCurr ? 'bg-green-400' : 'bg-gray-300'} rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]`}></div>
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{fromCurr && toCurr ? 'Live Rates Active' : 'Select Currencies'}</span>
          </div>
          <button 
            onClick={fetchRate}
            disabled={loading || !fromCurr || !toCurr}
            className={`p-2.5 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-all active:scale-90 ${loading ? 'animate-spin' : ''} disabled:opacity-30`}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">From</label>
              <select 
                value={fromCurr} 
                onChange={(e) => setFromCurr(e.target.value)}
                className={`bg-indigo-100/50 px-4 py-1.5 rounded-full text-[10px] font-black border-none focus:ring-2 focus:ring-indigo-200 cursor-pointer text-left min-w-[140px] ${fromCurr === '' ? 'text-gray-400' : 'text-indigo-700'}`}
              >
                <option value="" disabled hidden>Select a Currency</option>
                {currencyList.map(c => <option key={c.code} value={c.code} className="text-gray-800">{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-indigo-200">{getSymbol(fromCurr)}</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right text-4xl font-black text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-full"
              />
            </div>
          </div>

          <div className="flex justify-center -my-8 relative z-20">
            <button 
              onClick={handleSwap}
              disabled={!fromCurr || !toCurr}
              className="bg-indigo-600 p-4 rounded-full border-4 border-white shadow-xl text-white transform transition-all hover:rotate-180 active:scale-90 group disabled:opacity-50 disabled:bg-gray-400"
            >
              <ArrowRightLeft className="rotate-90 group-hover:scale-110" size={24} />
            </button>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.2)] border-2 border-indigo-500 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <label className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">To</label>
              <select 
                value={toCurr} 
                onChange={(e) => setToCurr(e.target.value)}
                className={`bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black border-none focus:ring-2 focus:ring-indigo-300 backdrop-blur-md cursor-pointer text-left min-w-[140px] ${toCurr === '' ? 'text-indigo-200' : 'text-white'}`}
              >
                <option value="" disabled hidden>Select a Currency</option>
                {currencyList.map(c => <option key={c.code} value={c.code} className="text-gray-800">{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between text-white relative z-10">
              <span className="text-3xl font-black opacity-40">{getSymbol(toCurr)}</span>
              <span className="text-5xl font-black tracking-tight">{convert(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Hint Section */}
      <div className="p-5 bg-indigo-50/80 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4 shadow-sm animate-slideUp">
        <div className="w-12 h-12 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center border-2 border-indigo-50 shadow-sm overflow-hidden">
          <img src="https://picsum.photos/seed/hachiware_money/80" alt="Money Tip" className="w-full h-full object-cover" />
        </div>
        <p className="text-[11px] text-indigo-700 leading-relaxed font-bold pt-1">
          <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-0.5 text-indigo-400">Genie's Tip</span>
          Rates are estimates! Always check with your bank for final transaction fees and live spreads. 💎✨
        </p>
      </div>
    </div>
  );
};

export default CurrencyCalculator;
