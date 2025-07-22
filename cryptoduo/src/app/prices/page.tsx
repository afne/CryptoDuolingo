"use client";
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Image from "next/image";

// --- Coin Data ---
interface CoinData {
  name: string;
  symbol: string;
  logo?: string;
  price: number;
  marketCap: number;
  change1h: number;
  change2h: number;
  change7d: number;
  volume24h: number;
}

const mockCoins: CoinData[] = [
  {
    name: "Bitcoin", symbol: "BTC", price: 69000, marketCap: 1350000000000,
    change1h: 0.5, change2h: 1.2, change7d: 5.1, volume24h: 35000000000,
    logo: "/logos/btc.png",
  },
  {
    name: "Ethereum", symbol: "ETH", price: 3800, marketCap: 450000000000,
    change1h: 0.2, change2h: 0.8, change7d: 3.7, volume24h: 18000000000,
    logo: "/logos/eth.png",
  },
  {
    name: "Solana", symbol: "SOL", price: 160, marketCap: 70000000000,
    change1h: -0.1, change2h: 0.3, change7d: 2.2, volume24h: 2500000000,
    logo: "/logos/sol.png",
  },
  {
    name: "Dogecoin", symbol: "DOGE", price: 0.15, marketCap: 21000000000,
    change1h: 0.0, change2h: 0.1, change7d: 1.0, volume24h: 800000000,
    logo: "/logos/doge.png",
  },
];

// --- Helpers ---
function formatCurrency(num: number) {
  return "A$" + num.toLocaleString();
}

export default function PricesPage() {
  const [sortKey, setSortKey] = useState<keyof CoinData>("marketCap");
  const [sortAsc, setSortAsc] = useState(false);

  // Live market cap and volume state
  const [marketCap, setMarketCap] = useState(6174277433643);
  const [marketCapChange, setMarketCapChange] = useState(-2.8);
  const [volume24h, setVolume24h] = useState(364545351069);
  const [volume24hChange, setVolume24hChange] = useState(1.5);
  const [marketCapFlash, setMarketCapFlash] = useState<string>("");
  const [volume24hFlash, setVolume24hFlash] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      // Market Cap
      const capDelta = Math.floor(Math.random() * 2) === 0 ? 1 : -1;
      setMarketCap(prev => {
        setMarketCapFlash(capDelta > 0 ? "flash-green" : "flash-red");
        return prev + capDelta * Math.floor(Math.random() * 10000000 + 1);
      });
      setMarketCapChange(prev => prev + capDelta * (Math.random() * 0.01));
      // 24h Volume
      const volDelta = Math.floor(Math.random() * 2) === 0 ? 1 : -1;
      setVolume24h(prev => {
        setVolume24hFlash(volDelta > 0 ? "flash-green" : "flash-red");
        return prev + volDelta * Math.floor(Math.random() * 5000000 + 1);
      });
      setVolume24hChange(prev => prev + volDelta * (Math.random() * 0.01));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Remove flash class after animation
  useEffect(() => {
    if (marketCapFlash) {
      const timeout = setTimeout(() => setMarketCapFlash(""), 350);
      return () => clearTimeout(timeout);
    }
  }, [marketCapFlash]);
  useEffect(() => {
    if (volume24hFlash) {
      const timeout = setTimeout(() => setVolume24hFlash(""), 350);
      return () => clearTimeout(timeout);
    }
  }, [volume24hFlash]);

  const sortedCoins = [...mockCoins].sort((a, b) => {
    const valA = a[sortKey] as number;
    const valB = b[sortKey] as number;
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div>
      <NavBar />
      <main className="ml-64 min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Cryptocurrency Prices by Market Cap</h1>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`bg-white p-4 rounded-xl shadow flex flex-col gap-2 transition-colors duration-300 ${marketCapFlash === 'flash-green' ? 'bg-green-50' : ''} ${marketCapFlash === 'flash-red' ? 'bg-red-50' : ''}`}>
            <span className="text-sm text-gray-600">Market Cap</span>
            <span className="text-2xl font-semibold text-red-500 transition-all duration-300">{formatCurrency(marketCap)}</span>
            <span className={`text-xs ${marketCapChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{marketCapChange >= 0 ? '▲' : '▼'} {marketCapChange.toFixed(2)}%</span>
          </div>
          <div className={`bg-white p-4 rounded-xl shadow flex flex-col gap-2 transition-colors duration-300 ${volume24hFlash === 'flash-green' ? 'bg-green-50' : ''} ${volume24hFlash === 'flash-red' ? 'bg-red-50' : ''}`}>
            <span className="text-sm text-gray-600">24h Trading Volume</span>
            <span className="text-2xl font-semibold text-green-500 transition-all duration-300">{formatCurrency(volume24h)}</span>
            <span className={`text-xs ${volume24hChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{volume24hChange >= 0 ? '▲' : '▼'} {volume24hChange.toFixed(2)}%</span>
          </div>
        </div>

        {/* Coin Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-xl text-sm text-black">
            <thead className="bg-gray-100 text-black sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-black uppercase tracking-wider rounded-tl-2xl">#</th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-black uppercase tracking-wider">Coin</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider cursor-pointer" onClick={() => setSortKey('price')}>Price</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider">1h</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider">2h</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider">7d</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider">24h Volume</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-black uppercase tracking-wider rounded-tr-2xl">Market Cap</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {sortedCoins.map((coin, idx) => (
                <tr
                  key={coin.symbol}
                  className={
                    `border-t text-black transition hover:bg-blue-50/60 ${idx === 0 ? 'font-semibold' : ''}`
                  }
                  style={{ boxShadow: idx % 2 === 0 ? '0 1px 0 0 #f3f4f6' : undefined }}
                >
                  <td className="px-6 py-4 align-middle">{idx + 1}</td>
                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <Image src={coin.logo || "/default-logo.png"} alt={coin.name} width={24} height={24} />
                    <div>
                      <div className="font-bold text-black">{coin.name}</div>
                      <div className="text-xs text-gray-500">{coin.symbol}</div>
                    </div>
                    <button className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Buy</button>
                  </td>
                  <td className="px-6 py-4 text-right align-middle font-mono">{formatCurrency(coin.price)}</td>
                  <td className={`px-6 py-4 text-right align-middle font-mono ${coin.change1h >= 0 ? 'text-green-600' : 'text-red-600'}`}>{coin.change1h >= 0 ? '▲' : '▼'} {Math.abs(coin.change1h)}%</td>
                  <td className={`px-6 py-4 text-right align-middle font-mono ${coin.change2h >= 0 ? 'text-green-600' : 'text-red-600'}`}>{coin.change2h >= 0 ? '▲' : '▼'} {Math.abs(coin.change2h)}%</td>
                  <td className={`px-6 py-4 text-right align-middle font-mono ${coin.change7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>{coin.change7d >= 0 ? '▲' : '▼'} {Math.abs(coin.change7d)}%</td>
                  <td className="px-6 py-4 text-right align-middle font-mono">{formatCurrency(coin.volume24h)}</td>
                  <td className="px-6 py-4 text-right align-middle font-mono">{formatCurrency(coin.marketCap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
