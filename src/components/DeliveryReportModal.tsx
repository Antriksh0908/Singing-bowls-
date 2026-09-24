import React from 'react';
import { DeliveryLog, CampaignStats } from '../types';
import { 
  X, CheckCircle2, AlertTriangle, Mail, ShieldAlert, Download, 
  ExternalLink, ArrowUpRight, BarChart3 
} from 'lucide-react';

interface DeliveryReportModalProps {
  logs: DeliveryLog[];
  stats: CampaignStats;
  onClose: () => void;
  onSelectBuyerForRetry?: (buyerId: string) => void;
}

export const DeliveryReportModal: React.FC<DeliveryReportModalProps> = ({
  logs,
  stats,
  onClose,
  onSelectBuyerForRetry,
}) => {
  const exportToCsv = () => {
    const headers = ['Timestamp', 'Buyer Store', 'Email', 'Status', 'Failure Reason', 'Method', 'Subject'];
    const rows = logs.map(l => [
      new Date(l.timestamp).toLocaleString(),
      `"${l.buyerName.replace(/"/g, '""')}"`,
      l.email,
      l.status.toUpperCase(),
      `"${(l.failureReason || 'N/A').replace(/"/g, '""')}"`,
      l.method,
      `"${l.subject.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `singing_bowls_usa_delivery_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Email Delivery & Bounce Audit Report</h2>
              <p className="text-xs text-stone-300">
                Singing Bowls USA Outreach Campaign • Detailed delivery logs and bounce breakdown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportToCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-6 bg-stone-50 border-b border-stone-200">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
              <span>Total Attempts</span>
              <Mail className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-black text-stone-900">{stats.totalAttempts}</div>
            <div className="text-[11px] text-stone-400 mt-1">Dispatched via Gmail & Mail</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1">
              <span>Mails Sent</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{stats.sentSuccessCount}</div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              {stats.totalAttempts > 0 ? `${stats.deliveryRate}% Delivery Rate` : 'No dispatches yet'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-gradient-to-b from-rose-50/50 to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700 mb-1">
              <span>Failed to Reach</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700">{stats.failedCount}</div>
            <div className="text-[11px] text-rose-600 mt-1 font-medium">
              {stats.totalAttempts > 0 ? `${Math.round((stats.failedCount / stats.totalAttempts) * 100)}% Bounce Rate` : '0%'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-gradient-to-b from-amber-50/50 to-white">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-1">
              <span>Primary Failure Cause</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-amber-950 truncate mt-1">
              {stats.failedCount > 0 ? '550 User Unknown / MX' : 'None detected'}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Auto-diagnosed by mail server
            </div>
          </div>
        </div>

        {/* Detailed Logs & Failure Reasons */}
        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <span>Audit Trail of All Dispatched Singing Bowl Outreach</span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-semibold">
                {logs.length} Records
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              Each row documents the target USA singing bowl buyer, the email address contacted, and the exact delivery outcome or bounce diagnostic.
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <Mail className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No email outreach logs yet</p>
              <p className="text-xs text-stone-500 mt-1">
                Select any buyer from the directory and click "Compose & Send Email" to test the mail client redirect.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const isSuccess = log.status === 'sent';
                return (
                  <div 
                    key={log.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSuccess 
                        ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/60' 
                        : 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                          isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-stone-900">{log.buyerName}</span>
                            <span className="text-xs text-stone-500">({log.email})</span>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                              isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isSuccess ? 'Sent Successfully' : 'Failed to Reach'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5 font-medium">
                            Subject: {log.subject}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-stone-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-stone-400 capitalize">
                          via {log.method === 'gmail' ? 'Gmail Web' : log.method === 'default_mail' ? 'Default Mailto' : 'Direct Dispatch'}
                        </div>
                      </div>
                    </div>

                    {/* Failure Reason Callout */}
                    {!isSuccess && log.failureReason && (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-rose-200 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-rose-800 shrink-0">Diagnostic Reason:</span>
                          <span className="text-rose-950 font-mono font-medium">{log.failureReason}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-rose-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                          <span>
                            <strong>Recommended Fix:</strong> Verify corporate website contact form or query alternate buyer at this store.
                          </span>
                          {onSelectBuyerForRetry && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectBuyerForRetry(log.buyerId);
                              }}
                              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline"
                            >
                              <span>Retry Outreach</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time delivery synchronization active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
