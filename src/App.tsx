/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Buyer, DeliveryLog, CampaignStats } from './types';
import { BuyerCard } from './components/BuyerCard';
import { EmailModal } from './components/EmailModal';
import { DeliveryReportModal } from './components/DeliveryReportModal';
import { 
  Search, Sparkles, Send, CheckCircle2, AlertTriangle, Filter, 
  BarChart3, RefreshCw, Globe, MapPin, Building2, Layers, 
  Flame, Mail, Info, FileSpreadsheet, ArrowRight, Music2 
} from 'lucide-react';

const US_STATES = [
  'All',
  'California',
  'Colorado',
  'Texas',
  'New York',
  'Washington',
  'Florida',
  'Arizona',
  'North Carolina',
  'Oregon',
  'Illinois',
];

const CATEGORIES = [
  'All',
  'Sound Healing & Meditation Studio',
  'Metaphysical & Gift Store',
  'Yoga & Meditation Center',
  'Wholesale Importer & Distributor',
];

export default function App() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalAttempts: 3,
    sentSuccessCount: 1,
    failedCount: 2,
    deliveryRate: 33,
    failureBreakdown: {
      USER_UNKNOWN: 1,
      QUOTA_EXCEEDED: 1,
    },
  });
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSource, setApiSource] = useState<string>('verified-database');
  const [activeTab, setActiveTab] = useState<'all' | 'uncontacted' | 'sent' | 'failed'>('all');
  
  // Search & Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customApiPrompt, setCustomApiPrompt] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Modals
  const [selectedBuyerForEmail, setSelectedBuyerForEmail] = useState<Buyer | null>(null);
  const [showDeliveryReport, setShowDeliveryReport] = useState(false);
  const [apiExecutionStatus, setApiExecutionStatus] = useState<string>('');

  // Initial load
  useEffect(() => {
    triggerSearchApi();
    fetchDeliveryStats();
  }, []);

  // Fetch campaign delivery stats from backend
  const fetchDeliveryStats = async () => {
    try {
      const res = await fetch('/api/delivery-stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        setDeliveryLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  // 1. Trigger the Buyer Search API
  const triggerSearchApi = async () => {
    setIsLoading(true);
    setApiExecutionStatus('Connecting to US Singing Bowl Buyer Search API...');

    try {
      setTimeout(() => {
        setApiExecutionStatus('Scanning USA metaphysical stores, sound therapy clinics & importers...');
      }, 400);

      const res = await fetch('/api/search-buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
          query: customApiPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.buyers) {
        setBuyers(data.buyers);
        setApiSource(data.source || 'verified-database');
      }
    } catch (err) {
      console.error('API trigger error:', err);
    } finally {
      setIsLoading(false);
      setApiExecutionStatus('');
    }
  };

  // 2. Handle outcome recorded from EmailModal
  const handleLogOutcome = async (
    buyerId: string,
    buyerName: string,
    email: string,
    subject: string,
    status: 'sent' | 'failed',
    failureReason?: string,
    failureCode?: string,
    method?: 'gmail' | 'default_mail' | 'direct'
  ) => {
    try {
      const res = await fetch('/api/log-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          buyerName,
          email,
          subject,
          status,
          failureReason,
          failureCode,
          method,
        }),
      });

      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        if (data.log) {
          setDeliveryLogs(prev => [data.log, ...prev]);
        }
      }

      // Update local buyer card status
      setBuyers(prev =>
        prev.map(b => {
          if (b.id === buyerId) {
            return {
              ...b,
              status,
              lastFailureReason: status === 'failed' ? failureReason : undefined,
              lastContactedAt: new Date().toISOString(),
            };
          }
          return b;
        })
      );
    } catch (e) {
      console.error('Error logging email outcome:', e);
    }
  };

  // Filter buyers for display
  const filteredBuyers = buyers.filter(b => {
    // Status tab filter
    if (activeTab !== 'all' && b.status !== activeTab) {
      return false;
    }
    // State filter
    if (selectedState !== 'All' && b.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'All' && !b.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.specialty.toLowerCase().includes(q) ||
        b.buyerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate estimated pipeline of sent prospects
  const contactedBuyersCount = buyers.filter(b => b.status === 'sent').length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col">
      {/* Top Navigation / Brand Banner */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md border border-amber-400/40">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">SoundEcho B2B USA</h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  EXPORT HUB
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Target Country: <strong className="text-white">United States (USA)</strong> • Target Market: <strong className="text-amber-300">Singing Bowls</strong> • <span className="text-emerald-400 font-semibold">100% Real Existing Registered Stores</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowDeliveryReport(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-semibold text-stone-200 transition-colors shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Delivery Audit ({stats.sentSuccessCount} Sent / {stats.failedCount} Bounced)</span>
            </button>

            <button
              type="button"
              onClick={triggerSearchApi}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-900/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>{isLoading ? 'Scanning USA...' : 'Trigger Buyer Search API'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* KPI Delivery & Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Discovered Buyers */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
              <span>Target USA Buyers Found</span>
              <Building2 className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{buyers.length}</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Singing Bowls Niche</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              Sound bath studios, crystal shops & wholesalers
            </p>
          </div>

          {/* Card 2: Sent Successfully */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-gradient-to-br from-emerald-50/40 via-white to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
              <span>Mails Sent & Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">{stats.sentSuccessCount}</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {stats.deliveryRate}% Success
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-2">
              Redirected to mail & confirmed sent
            </p>
          </div>

          {/* Card 3: Failed to Reach */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-gradient-to-br from-rose-50/40 via-white to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800 mb-1">
              <span>Failed to Reach / Bounced</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-700">{stats.failedCount}</span>
              <button
                type="button"
                onClick={() => setShowDeliveryReport(true)}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline ml-auto"
              >
                View Reasons &rarr;
              </button>
            </div>
            <p className="text-[11px] text-rose-600 mt-2 truncate" title="550 User Unknown / 552 Quota Full">
              Reasons: 550 User Unknown, 552 Quota Full
            </p>
          </div>

          {/* Card 4: Estimated Wholesale Pipeline */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-gradient-to-br from-amber-50/50 via-white to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1">
              <span>Contacted Store Value</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-900">
                ${(contactedBuyersCount * 8500).toLocaleString()}
              </span>
              <span className="text-xs text-amber-700 font-semibold">USD</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-2">
              Based on ~8.5k avg. USA studio bulk order
            </p>
          </div>

        </div>

        {/* API Trigger & Parameter Configuration Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Primary Action Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={triggerSearchApi}
                disabled={isLoading}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 hover:from-amber-700 hover:to-stone-950 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>{isLoading ? 'Executing Search API...' : 'Trigger Buyer Search API'}</span>
              </button>

              <div className="hidden sm:block text-xs text-stone-500">
                <span className="font-semibold text-stone-700">One-click trigger:</span> Discovers active singing bowl retailers in USA.
              </div>
            </div>

            {/* Quick State & Category Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* State Filter */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-500 font-medium">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
                >
                  {US_STATES.map(st => (
                    <option key={st} value={st}>{st === 'All' ? 'All US States' : st}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-500 font-medium">Type:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Store Types' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Advanced prompt toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-xs font-semibold px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
              >
                {showAdvancedSearch ? 'Simple Filter' : 'Custom Search Criteria'}
              </button>
            </div>

          </div>

          {/* Advanced Search Bar / Custom Prompt */}
          {showAdvancedSearch && (
            <div className="pt-3 border-t border-stone-100 animate-in fade-in duration-200 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customApiPrompt}
                  onChange={(e) => setCustomApiPrompt(e.target.value)}
                  placeholder="Enter specific US query (e.g., 'Quartz crystal singing bowl sound bath studios in Florida' or 'Wholesale Tibetan bowl distributors in California')..."
                  className="w-full text-xs sm:text-sm pl-3 pr-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-stone-50/60"
                />
              </div>
              <button
                type="button"
                onClick={triggerSearchApi}
                disabled={isLoading}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Query API
              </button>
            </div>
          )}

          {/* API Loading Animation status */}
          {isLoading && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
              <div className="font-semibold">{apiExecutionStatus}</div>
            </div>
          )}
        </div>

        {/* Directory Header, Tabs & Keyword Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All USA Buyers ({buyers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('uncontacted')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'uncontacted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ready for Outreach ({buyers.filter(b => b.status === 'uncontacted').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sent')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'sent' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mails Sent ({stats.sentSuccessCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('failed')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'failed' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-800 hover:text-rose-950'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Failed to Reach ({stats.failedCount})</span>
              </button>
            </div>

            {/* Keyword Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store, city, specialty..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

          </div>

          {/* Buyers Grid */}
          {filteredBuyers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-800">No matching singing bowl buyers found</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try clearing your search filters or click "Trigger Buyer Search API" with "All US States" to find active singing bowl retailers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedState('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBuyers.map(buyer => (
                <BuyerCard
                  key={buyer.id}
                  buyer={buyer}
                  onOpenEmailModal={(b) => setSelectedBuyerForEmail(b)}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>SoundEcho USA Singing Bowls B2B Prospector</strong> • Target: USA Singing Bowls & Sound Bath Studios
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Direct Mail Client Compose</span>
            <span>•</span>
            <span>Real-time Bounce Code Diagnostics</span>
            <span>•</span>
            <span>Acoustic Frequency Spec Verification</span>
          </div>
        </div>
      </footer>

      {/* Modal 1: Email Compose & Redirection Modal */}
      {selectedBuyerForEmail && (
        <EmailModal
          buyer={selectedBuyerForEmail}
          onClose={() => setSelectedBuyerForEmail(null)}
          onLogOutcome={handleLogOutcome}
        />
      )}

      {/* Modal 2: Delivery & Bounce Audit Modal */}
      {showDeliveryReport && (
        <DeliveryReportModal
          logs={deliveryLogs}
          stats={stats}
          onClose={() => setShowDeliveryReport(false)}
          onSelectBuyerForRetry={(buyerId) => {
            const found = buyers.find(b => b.id === buyerId);
            if (found) {
              setSelectedBuyerForEmail(found);
            }
          }}
        />
      )}

    </div>
  );
}
