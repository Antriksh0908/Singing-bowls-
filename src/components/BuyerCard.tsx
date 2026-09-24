import React, { useState } from 'react';
import { Buyer } from '../types';
import { 
  Building2, MapPin, Mail, Phone, ExternalLink, Send, CheckCircle2, 
  AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Sparkles, DollarSign 
} from 'lucide-react';

interface BuyerCardProps {
  buyer: Buyer;
  onOpenEmailModal: (buyer: Buyer) => void;
}

export const BuyerCard: React.FC<BuyerCardProps> = ({ buyer, onOpenEmailModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(buyer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getStatusBadge = () => {
    switch (buyer.status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sent & Delivered
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300" title={buyer.lastFailureReason || 'Delivery failed'}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Failed to Reach
          </span>
        );
      case 'drafted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            Draft Prepared
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            Uncontacted Lead
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Card Header Banner */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/70">
              {buyer.category}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {buyer.matchScore}% Match
              </span>
              {getStatusBadge()}
            </div>
          </div>

          <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
            {buyer.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-medium">
              {buyer.streetAddress ? `${buyer.streetAddress}, ` : ''}{buyer.city}, {buyer.state} (USA)
            </span>
          </div>
        </div>

        {/* Core Attributes */}
        <div className="px-5 py-2 space-y-2 text-xs border-t border-b border-stone-100 bg-stone-50/40">
          {/* Contact Person */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500 font-medium">Buyer / Lead:</span>
            <span className="text-stone-800 font-semibold truncate">
              {buyer.buyerName} <span className="text-stone-400 font-normal">({buyer.buyerRole})</span>
            </span>
          </div>

          {/* Email Address */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500 font-medium">Verified Email:</span>
            <div className="flex items-center gap-1 max-w-[200px]">
              <span className="font-mono text-stone-900 font-bold truncate" title={buyer.email}>
                {buyer.email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-stone-400 hover:text-stone-700 p-0.5"
                title="Copy email"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500 font-medium">Phone:</span>
            <span className="font-mono text-stone-700 font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3 text-stone-400" />
              {buyer.phone}
            </span>
          </div>

          {/* Specialty */}
          <div className="flex items-start justify-between gap-2 pt-1 border-t border-stone-100">
            <span className="text-stone-500 font-medium shrink-0">Singing Bowl Focus:</span>
            <span className="text-right text-stone-900 font-medium leading-tight">
              {buyer.specialty}
            </span>
          </div>

          {/* Est Order Value */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500 font-medium">Est. Wholesale Order:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-0.5">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              {buyer.estimatedOrderValue.replace('$', '')}
            </span>
          </div>
        </div>

        {/* Failure Reason Alert Banner if failed */}
        {buyer.status === 'failed' && buyer.lastFailureReason && (
          <div className="mx-4 my-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Delivery Failed Reason:</span>
            </div>
            <p className="text-rose-900 text-[11px] font-mono leading-tight">
              {buyer.lastFailureReason}
            </p>
          </div>
        )}

        {/* Expandable Notes */}
        {isExpanded && (
          <div className="px-5 py-3 bg-amber-50/30 text-xs space-y-2 border-b border-amber-100/60 animate-in fade-in duration-150">
            {buyer.painPoint && (
              <div>
                <span className="font-semibold text-stone-700">Procurement Need / Pain Point:</span>
                <p className="text-stone-600 mt-0.5 italic">"{buyer.painPoint}"</p>
              </div>
            )}
            <div>
              <span className="font-semibold text-stone-700">Store Profile Notes:</span>
              <p className="text-stone-600 mt-0.5">{buyer.notes}</p>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
              <span>Phone: {buyer.phone}</span>
              <a
                href={buyer.website}
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Visit Store Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-3 bg-white flex items-center justify-between gap-2 border-t border-stone-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-stone-500 hover:text-stone-800 text-xs font-medium flex items-center gap-1 py-1 px-1.5 rounded hover:bg-stone-100 transition-colors"
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => onOpenEmailModal(buyer)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
            buyer.status === 'sent'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : buyer.status === 'failed'
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-stone-900 hover:bg-amber-900 text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>
            {buyer.status === 'sent' ? 'Send Follow-Up' : buyer.status === 'failed' ? 'Retry Email' : 'Compose & Send Email'}
          </span>
        </button>
      </div>
    </div>
  );
};
