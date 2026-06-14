"use client";

import { useEffect, useState } from "react";

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const COIN_IDS = "bitcoin,ethereum,binancecoin,solana,stellar,usd-coin";

export default function LivePrices() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return;
      const data: CoinPrice[] = await res.json();
      // preserve desired order
      const order = ["bitcoin","ethereum","binancecoin","solana","stellar","usd-coin"];
      const sorted = order.map(id => data.find(c => c.id === id)).filter(Boolean) as CoinPrice[];
      setPrices(sorted);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // silently fail — network issue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number) =>
    n >= 1
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 }).format(n);

  return (
    <section className="py-10 px-6 md:px-20">
      <div className="text-center mb-6 space-y-2">
        <h2 className="text-3xl font-bold">Live Crypto Prices</h2>
        <p className="text-white/40 text-sm">
          Updated every 60 s via CoinGecko
          {lastUpdated && <span className="ml-2 text-white/30">· Last: {lastUpdated}</span>}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center gap-4 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-44 h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {prices.map((coin) => {
            const up = coin.price_change_percentage_24h >= 0;
            return (
              <div key={coin.id}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#2857B8]/50 hover:bg-[#2857B8]/10 transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coin.image} alt={coin.name} width={36} height={36} className="rounded-full" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{coin.symbol}</span>
                <span className="text-sm font-bold text-white">{fmt(coin.current_price)}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                  {up ? "▲" : "▼"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
