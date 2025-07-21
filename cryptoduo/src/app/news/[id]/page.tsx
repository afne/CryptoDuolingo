"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";

const newsArticles = [
  {
    id: "bitgo-ipo",
    title: "Bitgo Files Confidentially for IPO, Joins Crypto Rivals in Public Market Push",
    source: "Bitcoin.com",
    date: "10 minutes ago",
    summary: "Cryptocurrency custody firm Bitgo Holdings Inc. has confidentially submitted a draft registration statement for a proposed initial public offering.",
    thumbnail: "🟠",
    tag: "BTC",
    tagChange: "+0.5%",
    content: `Bitgo Holdings Inc., a leading cryptocurrency custody firm, has confidentially submitted a draft registration statement for a proposed initial public offering (IPO). The move comes as several crypto companies are seeking to go public amid renewed interest in digital assets. The IPO is expected to provide Bitgo with additional capital to expand its services and global reach.`
  },
  {
    id: "eth-nft-sales",
    title: "Ethereum NFTs dominate 7-day sales rankings as ETH nears $4K",
    source: "Cointelegraph",
    date: "17 minutes ago",
    summary: "ETH sales surge in the past week as NFTs gain traction.",
    thumbnail: "🟣",
    tag: "ETH",
    tagChange: "+1.6%",
    content: `Ethereum's NFT market has seen a significant uptick in sales over the past week, with several collections breaking records. As ETH approaches the $4,000 mark, analysts believe the NFT boom is contributing to the price surge.`
  },
  {
    id: "canada-nextgen-crypto",
    title: "Canada's NextGen Digital Launches Crypto Treasury Strategy with $1M Bitcoin Acquisition",
    source: "Cryptonews",
    date: "20 minutes ago",
    summary: "NextGen Digital commits to Bitcoin as part of their new corporate treasury strategy.",
    thumbnail: "🟠",
    tag: "BTC",
    tagChange: "+0.3%",
    content: `Canada's NextGen Digital has announced a new corporate treasury strategy, committing to acquiring $1M worth of Bitcoin. This move is part of their broader efforts to diversify their holdings and establish a more robust treasury structure.`
  },
  {
    id: "us-house-genius-act",
    title: "The US House Passed the ‘GENIUS Act’ and OurCryptoMiner Helped XRP Users Earn $4,300",
    source: "Cryptonews",
    date: "21 minutes ago",
    summary: "Legislation boosts crypto miner returns, especially for XRP holders.",
    thumbnail: "💧",
    tag: "XRP",
    tagChange: "+1.2%",
    content: `The US House of Representatives has passed the 'GENIUS Act', a bill aimed at promoting innovation in the cryptocurrency industry. This legislation is expected to provide clarity and stability for miners and users, potentially increasing returns for XRP holders.`
  },
  {
    id: "solana-network-recovery",
    title: "Solana Network Recovers After Outage",
    source: "Decrypt",
    date: "30 minutes ago",
    summary: "Solana's mainnet is back online after a 5-hour outage, with developers promising further stability improvements.",
    thumbnail: "🟩",
    tag: "SOL",
    tagChange: "+2.1%",
    content: `Solana's mainnet has been restored after a brief outage, with developers highlighting the importance of network stability and promising further improvements.`
  },
  {
    id: "dogecoin-social-media-hype",
    title: "Dogecoin Surges on Social Media Hype",
    source: "CoinTelegraph",
    date: "35 minutes ago",
    summary: "Dogecoin's price jumped 20% in a single day, fueled by viral tweets and renewed community interest.",
    thumbnail: "🐕",
    tag: "DOGE",
    tagChange: "+4.7%",
    content: `Dogecoin's price surged by 20% in a single day, driven by renewed community interest and viral tweets. The meme coin's recent performance has caught the attention of investors.`
  },
  {
    id: "polygon-zk-evm",
    title: "Polygon Announces zkEVM Mainnet Beta",
    source: "The Defiant",
    date: "40 minutes ago",
    summary: "Polygon launches its zkEVM mainnet beta, aiming to scale Ethereum with zero-knowledge technology.",
    thumbnail: "🔷",
    tag: "MATIC",
    tagChange: "+0.9%",
    content: `Polygon has announced the launch of its zkEVM mainnet beta, a zero-knowledge scaling solution for Ethereum. This development is expected to significantly improve transaction throughput and reduce gas fees.`
  },
  {
    id: "tether-market-cap",
    title: "Tether Market Cap Reaches $100B",
    source: "CoinDesk",
    date: "45 minutes ago",
    summary: "Tether (USDT) becomes the first stablecoin to surpass $100 billion in market capitalization.",
    thumbnail: "💵",
    tag: "USDT",
    tagChange: "+0.1%",
    content: `Tether (USDT) has become the first stablecoin to surpass $100 billion in market capitalization, solidifying its position as the world's largest stablecoin.`
  },
  {
    id: "avalanche-bank-partnership",
    title: "Avalanche Partners with Major Bank for Tokenized Assets",
    source: "CryptoSlate",
    date: "1 hour ago",
    summary: "Avalanche (AVAX) has announced a partnership with a major European bank to launch tokenized real-world assets on its blockchain.",
    thumbnail: "🟥",
    tag: "AVAX",
    tagChange: "+3.2%",
    content: `Avalanche (AVAX) has announced a partnership with a major European bank to launch tokenized real-world assets on its blockchain. This partnership is expected to accelerate the adoption of blockchain technology in traditional finance.`
  },
  {
    id: "litecoin-hashrate",
    title: "Litecoin Hashrate Hits Record High Ahead of Halving",
    source: "Bitcoin Magazine",
    date: "1 hour ago",
    summary: "Litecoin's network hashrate has reached an all-time high as the next halving event approaches.",
    thumbnail: "⚪",
    tag: "LTC",
    tagChange: "+2.8%",
    content: `Litecoin's network hashrate has reached an all-time high, indicating strong network activity and anticipation for the upcoming halving event.`
  }
];

export default function NewsDetailPage() {
  const { id } = useParams();
  const article = newsArticles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen">
        <NavBar />
        <main className="ml-64 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-600">News not found</h1>
          <Link href="/news" className="mt-4 text-blue-600 underline">Back to News</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen">
      <NavBar />
      <main className="ml-64 max-w-2xl mx-auto p-8">
        <Link href="/news" className="text-blue-600 hover:underline mb-6 inline-block">← Back to News</Link>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{article.thumbnail}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{article.title}</h1>
            <div className="text-xs text-gray-500">{article.source} • {article.date}</div>
            <span className="inline-block mt-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium text-xs">
              {article.tag} <span className="text-green-600">{article.tagChange}</span>
            </span>
          </div>
        </div>
        <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>
      </main>
    </div>
  );
} 