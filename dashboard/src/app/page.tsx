'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [keys, setKeys] = useState<{ id: string; name: string; key: string; tpm: number }[]>([
    { id: '1', name: 'Production App', key: 'qf_live_8f92a1b...', tpm: 150000 },
    { id: '2', name: 'Development', key: 'qf_test_99xbc22...', tpm: 10000 },
  ]);

  const handleGenerateKey = () => {
    const newId = Math.random().toString(36).substring(7);
    const newKeyString = 'qf_live_' + Math.random().toString(36).substring(2, 12);
    const newKey = {
      id: newId,
      name: `New App ${keys.length + 1}`,
      key: newKeyString,
      tpm: 50000
    };
    setKeys([newKey, ...keys]);
  };

  return (
    <div className="min-h-screen p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">QueueFlow</span> Control Plane
          </h1>
          <p className="text-white/50 mt-2 font-medium">Manage your Enterprise AI Gateway</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-pill px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            System Online
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white/20"></div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: API Keys & Configs */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* API Keys Card */}
          <section className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                Gateway API Keys
              </h2>
              <button
                onClick={handleGenerateKey}
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors active:scale-95 duration-200"
              >
                + Generate Key
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {keys.map((k) => (
                <div key={k.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <h3 className="font-semibold">{k.name}</h3>
                    <code className="text-emerald-400 text-sm mt-1 block font-mono bg-emerald-400/10 px-2 py-1 rounded inline-block">
                      {k.key}
                    </code>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs font-medium uppercase tracking-wider">TPM Limit</p>
                    <p className="font-bold font-mono">{k.tpm.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Configurations */}
          <section className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <h2 className="text-xl font-bold">Global Configurations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">Semantic Caching</h3>
                    <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 mt-2">Uses pgvector to match similar prompts and save 99% cost.</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">Priority Queuing</h3>
                    <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 mt-2">Holds requests in Redis when TPM limit is reached instead of dropping.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Analytics & Stats */}
        <div className="flex flex-col gap-8">
          <section className="glass-panel p-6 rounded-2xl flex flex-col gap-6 flex-grow">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Live Analytics
            </h2>

            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 p-5 rounded-xl">
                <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Costs Saved (Cache)</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">$4,291.50</p>
                <p className="text-emerald-400/60 text-sm mt-2">↑ 12% this week</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Tokens Processed</p>
                <p className="text-3xl font-bold text-white mt-1">12.4M</p>
                <p className="text-white/40 text-sm mt-2">Last 30 days</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Avg Latency Penalty</p>
                <p className="text-3xl font-bold text-white mt-1">12<span className="text-xl text-white/50">ms</span></p>
                <p className="text-white/40 text-sm mt-2">Proxy routing overhead</p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <a href="http://localhost:3000/metrics" target="_blank" className="w-full block text-center bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl font-medium text-sm">
                View Prom-Client /metrics ↗
              </a>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
