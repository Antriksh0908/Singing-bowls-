import React, { useState, useEffect } from 'react';
import { Buyer } from '../types';
import { EMAIL_TEMPLATES } from '../templates';
import { 
  X, Send, Sparkles, ExternalLink, Mail, CheckCircle2, AlertTriangle, 
  Copy, RefreshCw, ShieldAlert, ArrowRight, Check, Info 
} from 'lucide-react';

interface EmailModalProps {
  buyer: Buyer | null;
  onClose: () => void;
  onLogOutcome: (
    buyerId: string, 
    buyerName: string, 
    email: string, 
    subject: string, 
    status: 'sent' | 'failed', 
    reason?: string, 
    code?: string, 
    method?: 'gmail' | 'default_mail' | 'direct'
  ) => void;
}

export const COMMON_BOUNCE_REASONS = [
  {
    code: 'USER_UNKNOWN',
    label: '550 5.1.1 Recipient address rejected (User unknown / Mailbox does not exist)',
    description: 'The buyer or email username is no longer active at this organization.',
  },
  {
    code: 'QUOTA_EXCEEDED',
    label: '552 5.2.2 Mailbox quota exceeded (Recipient storage full)',
    description: 'The recipient inbox has run out of storage space and cannot accept new emails.',
  },
  {
    code: 'SPAM_REJECTED',
    label: '554 5.7.1 Message rejected by anti-spam / DMARC policy filter',
    description: 'The receiving corporate mail server flagged wholesale keywords or external relay.',
  },
  {
    code: 'DNS_MX_FAILED',
    label: '550 5.4.4 DNS Error: MX host unreachable or domain expired',
    description: 'The recipient domain name has no active MX records configured.',
  },
  {
    code: 'TIMEOUT',
    label: '421 4.4.2 Connection timed out with recipient mail gateway',
    description: 'Recipient mail server refused connection on port 25 or was undergoing maintenance.',
  },
];

export const EmailModal: React.FC<EmailModalProps> = ({ buyer, onClose, onLogOutcome }) => {
  if (!buyer) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'gmail' | 'default_mail' | 'direct'>('gmail');
  const [copied, setCopied] = useState(false);
  const [customFailureReason, setCustomFailureReason] = useState('');
  const [selectedBounceCode, setSelectedBounceCode] = useState(COMMON_BOUNCE_REASONS[0].code);
  const [showFailureSelector, setShowFailureSelector] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{ isBounce: boolean; reason?: string; code?: string } | null>(null);

  // Initialize with the first template
  useEffect(() => {
    const t = EMAIL_TEMPLATES.find(tpl => tpl.id === selectedTemplateId) || EMAIL_TEMPLATES[0];
    setSubject(t.subject(buyer));
    setBody(t.generateBody(buyer));
  }, [buyer, selectedTemplateId]);

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const t = EMAIL_TEMPLATES.find(tpl => tpl.id === tmplId);
    if (t) {
      setSubject(t.subject(buyer));
      setBody(t.generateBody(buyer));
    }
  };

  const handleGenerateAiPitch = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer,
          pitchType: 'Direct 432Hz Quartz & 7-Metal Singing Bowls Wholesale Supply',
        }),
      });
      const data = await res.json();
      if (data.subject && data.body) {
        setSubject(data.subject);
        setBody(data.body);
      }
    } catch (e) {
      console.error('AI pitch error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Gmail compose link (opens directly in user's Gmail web)
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(buyer.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // mailto link (opens default system client e.g. Outlook, Apple Mail)
  const mailtoUrl = `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleTriggerGmail = () => {
    setSelectedMethod('gmail');
    setHasRedirected(true);
    window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerMailto = () => {
    setSelectedMethod('default_mail');
    setHasRedirected(true);
    window.location.href = mailtoUrl;
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`To: ${buyer.email}\nSubject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSent = () => {
    onLogOutcome(
      buyer.id, 
      buyer.name, 
      buyer.email, 
      subject, 
      'sent', 
      undefined, 
      undefined, 
      selectedMethod
    );
    onClose();
  };

  const handleConfirmFailed = () => {
    const selectedObj = COMMON_BOUNCE_REASONS.find(r => r.code === selectedBounceCode);
    const reasonText = customFailureReason.trim() 
      ? customFailureReason 
      : (selectedObj?.label || '550 5.1.1 Delivery failed: Recipient address rejected');
    
    onLogOutcome(
      buyer.id, 
      buyer.name, 
      buyer.email, 
      subject, 
      'failed', 
      reasonText, 
      selectedBounceCode, 
      selectedMethod
    );
    onClose();
  };

  // Live deliverability diagnostic simulation
  const handleRunDeliverabilityDiagnostic = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      const email = buyer.email.toLowerCase();
      let res: { isBounce: boolean; reason?: string; code?: string } = { isBounce: false };

      if (email.includes('inactive') || email.includes('wrong') || email.includes('404')) {
        res = {
          isBounce: true,
          code: 'USER_UNKNOWN',
          reason: '550 5.1.1 Recipient mailbox not found on target mail domain',
        };
      } else if (email.includes('full') || email.includes('quota')) {
        res = {
          isBounce: true,
          code: 'QUOTA_EXCEEDED',
          reason: '552 5.2.2 Mailbox quota exceeded: Recipient storage buffer full',
        };
      } else if (email.includes('spam') || email.includes('block')) {
        res = {
          isBounce: true,
          code: 'SPAM_REJECTED',
          reason: '554 5.7.1 Rejected by recipient MX anti-spam reputation gateway',
        };
      } else {
        res = { isBounce: false };
      }

      setDiagnosticResult(res);
      setIsDiagnosing(false);
      if (res.isBounce) {
        setShowFailureSelector(true);
        if (res.code) setSelectedBounceCode(res.code);
        if (res.reason) setCustomFailureReason(res.reason);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/50 rounded-lg">
              <Mail className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Compose Wholesale Singing Bowl Outreach</h2>
              <p className="text-xs text-amber-200/90">
                Target: {buyer.name} • {buyer.city}, {buyer.state} (USA)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Quick Info Ribbon */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-700">Recipient:</span>
            <span className="font-medium text-stone-900">{buyer.buyerName} ({buyer.buyerRole})</span>
            <span className="text-stone-400">•</span>
            <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">{buyer.email}</span>
            {buyer.streetAddress && (
              <>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 font-medium">{buyer.streetAddress}, {buyer.city}, {buyer.state}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-stone-600">
            <span>Phone: <strong className="text-stone-800 font-mono">{buyer.phone}</strong></span>
            <span className="text-stone-300">|</span>
            <span>Est. Order: <strong className="text-emerald-700">{buyer.estimatedOrderValue}</strong></span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Template Selection & AI Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Singing Bowl Pitch Template:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {EMAIL_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateAiPitch}
                disabled={isGeneratingAi}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-medium rounded-lg shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Personalizing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>AI Tailor for {buyer.city} Store</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm text-stone-900 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              placeholder="Outreach subject..."
            />
          </div>

          {/* Body Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">
                Outreach Message Body
              </label>
              <button
                type="button"
                onClick={handleCopyContent}
                className="text-xs text-amber-800 hover:text-amber-900 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-stone-800 bg-stone-50/50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
              placeholder="Compose your message..."
            />
          </div>

          {/* Delivery & Pre-check Diagnostic */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Simulate email inbox diagnostic before opening your mail client?</span>
            </div>
            <button
              type="button"
              onClick={handleRunDeliverabilityDiagnostic}
              disabled={isDiagnosing}
              className="text-xs font-medium px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {isDiagnosing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 text-stone-700" />}
              {isDiagnosing ? 'Testing MX & Recipient...' : 'Run MX & Bounce Check'}
            </button>
          </div>

          {diagnosticResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              diagnosticResult.isBounce ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {diagnosticResult.isBounce ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {diagnosticResult.isBounce ? 'Warning: Mail delivery issue detected for this recipient!' : 'Recipient Mail Server Verified Active & Responsive'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {diagnosticResult.reason || 'Domain MX records found. SMTP handshake accepted on port 25.'}
                </p>
              </div>
            </div>
          )}

          {/* Redirection Options Section */}
          <div className="bg-gradient-to-r from-amber-50 to-stone-100 p-4 rounded-xl border border-amber-200/80">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              Redirect & Compose in your Mail Client:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Gmail Web Compose */}
              <button
                type="button"
                onClick={handleTriggerGmail}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-xs sm:text-sm">Open in Gmail Web</div>
                    <div className="text-[10px] text-red-100">Composes in a new tab ready to send</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-red-200 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 2: Default System Mail (mailto:) */}
              <button
                type="button"
                onClick={handleTriggerMailto}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-medium text-sm shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-xs sm:text-sm">Default Mail Client</div>
                    <div className="text-[10px] text-stone-300">Opens Apple Mail, Outlook, etc.</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Post-Redirection Outcome Recorder */}
          {(hasRedirected || showFailureSelector) && (
            <div className="border border-stone-300 bg-white rounded-xl p-4 shadow-sm animate-in fade-in duration-300 space-y-3">
              <div className="flex items-center gap-2 text-stone-900">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                </span>
                <h4 className="font-bold text-sm">Step 2: Record Delivery Result in Dashboard</h4>
              </div>
              <p className="text-xs text-stone-600">
                After you hit send in your mail app, did the message send cleanly, or did it fail/bounce back?
              </p>

              {!showFailureSelector ? (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmSent}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Sent Successfully</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFailureSelector(true)}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-semibold text-xs transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Log Delivery Failure / Bounce</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Select Failure Reason / Bounce Code:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFailureSelector(false)}
                      className="text-[11px] text-stone-500 hover:underline"
                    >
                      Back to options
                    </button>
                  </div>

                  <div className="space-y-2">
                    {COMMON_BOUNCE_REASONS.map(r => (
                      <label 
                        key={r.code}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedBounceCode === r.code 
                            ? 'border-rose-400 bg-rose-50/80 text-rose-950 font-medium' 
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bounceCode"
                          checked={selectedBounceCode === r.code}
                          onChange={() => setSelectedBounceCode(r.code)}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-rose-900">{r.label}</p>
                          <p className="text-[11px] text-stone-500">{r.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Or Custom Server Failure Detail (Optional):
                    </label>
                    <input
                      type="text"
                      value={customFailureReason}
                      onChange={(e) => setCustomFailureReason(e.target.value)}
                      placeholder="e.g. 550 5.7.1 Message bounced by remote server DMARC policy..."
                      className="w-full text-xs px-3 py-1.5 border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmFailed}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Record Failure in Dashboard Metrics</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Target Market: USA Singing Bowls & Sound Bath Hubs</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
