"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is ZeroBit?",
    a: "ZeroBit is a decentralized peer-to-peer marketplace built on the Stellar blockchain. Buyers and sellers trade directly — every deal is automatically protected by a trustless Stellar escrow contract.",
  },
  {
    q: "How does the escrow work?",
    a: "When a buyer places an order, funds are locked in a smart escrow contract on the Stellar network. The seller delivers, the buyer confirms, and the escrow releases payment automatically. Neither party needs to trust the other — the blockchain enforces the deal.",
  },
  {
    q: "What can I trade on ZeroBit?",
    a: "Anything two people agree on — rentals, freelance services, physical goods, tutoring, design work, vehicles, music, and more. If you can describe it and price it, you can list it.",
  },
  {
    q: "What wallets are supported?",
    a: "ZeroBit supports Stellar Freighter (the native Stellar wallet) and MetaMask via WalletConnect. You can also sign in with email and Firebase auth without a wallet.",
  },
  {
    q: "What are the fees?",
    a: "Stellar network fees are a fraction of a cent per transaction — typically under $0.01. ZeroBit does not add a platform fee on top of that. You keep almost everything you earn.",
  },
  {
    q: "Is ZeroBit non-custodial?",
    a: "Yes. Your funds are locked in an on-chain escrow contract — not in ZeroBit's bank account or wallet. We never hold your money. Only the smart contract does, and it only releases on agreed conditions.",
  },
  {
    q: "What currency is used?",
    a: "Deals are priced in XLM (Stellar Lumens) or USDC on Stellar. Because Stellar supports any asset, more currencies can be added over time.",
  },
  {
    q: "What happens if there's a dispute?",
    a: "The escrow contract supports a dispute resolution flow where both parties can raise a claim. A resolver can be designated at deal creation to arbitrate if needed. Funds stay locked until the dispute resolves.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-14 px-6 md:px-20">
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
        <p className="text-white/40 max-w-lg mx-auto">
          Everything you need to know about trading on ZeroBit.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden
              ${open === i
                ? "border-[#2857B8]/60 bg-[#2857B8]/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-semibold text-white text-sm md:text-base">{faq.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180 text-blue-400" : ""}`}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-sm text-white/60 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
