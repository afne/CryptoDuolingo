"use client";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import Image from "next/image";

const newsArticles = [
  {
    id: "bitgo-ipo",
    title: "Bitgo Files Confidentially for IPO, Joins Crypto Rivals in Public Market Push",
    source: "Bitcoin.com",
    date: "10 minutes ago",
    summary: "Cryptocurrency custody firm Bitgo Holdings Inc. has confidentially submitted a draft registration statement for a proposed initial public offering.",
    thumbnail: "🟠", // BTC emoji
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
    thumbnail: "🟣", // ETH emoji
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
    thumbnail: "💧", // XRP emoji
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
    thumbnail: "🟩", // SOL emoji
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
    thumbnail: "🐕", // DOGE emoji
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
    thumbnail: "🔷", // MATIC emoji
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
    thumbnail: "💵", // USDT emoji
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
    thumbnail: "🟥", // AVAX emoji
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
    thumbnail: "⚪", // LTC emoji
    tag: "LTC",
    tagChange: "+2.8%",
    content: `Litecoin's network hashrate has reached an all-time high, indicating strong network activity and anticipation for the upcoming halving event.`
  }
];

export default function NewsPage() {
  return (
    <div className="bg-white min-h-screen">
      <NavBar />
      <main className="ml-64 max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Latest Crypto News</h1>

        {/* Featured Article */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-blue-700 mb-2">Featured News</h2>
            <Image
              src="/btc_non_hover.png"
              alt="Featured News Hero"
              width={600}
              height={400}
              className="w-full h-80 md:h-96 object-cover rounded-2xl shadow mb-4"
            />
            <Link href={`/news/${newsArticles[0].id}`} className="flex items-center gap-4 group hover:bg-blue-50 rounded-xl p-2 transition">
              <span className="text-6xl lg:text-7xl">{newsArticles[0].thumbnail}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
                  {newsArticles[0].title}
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  {newsArticles[0].summary}
                </p>
                <div className="text-xs text-gray-400 mt-1">{newsArticles[0].source} • {newsArticles[0].date}</div>
              </div>
            </Link>
          </div>

          {/* Side News */}
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-md font-bold text-blue-700 mb-2">Latest Updates</h2>
            {newsArticles.slice(1).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer group bg-white shadow-sm hover:shadow-md hover:bg-blue-50`}
              >
                <span className="text-3xl flex items-center justify-center h-12 w-12 bg-gray-100 rounded-full">{article.thumbnail}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-700 transition">
                    {article.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {article.source} • {article.date}
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0">
                  {article.tag} <span className="text-green-600">{article.tagChange}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}