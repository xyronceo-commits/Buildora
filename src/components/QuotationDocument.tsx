import React from 'react';
import { Business, SupplierQuote } from '../types';
import { HardHat, Phone, Mail, MapPin, Globe } from 'lucide-react';

interface QuotationDocumentProps {
  quote: SupplierQuote;
  business: Business;
  id?: string;
}

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({ quote, business, id = 'quotation-document' }) => {
  return (
    <div
      id={id}
      style={{ backgroundColor: '#ffffff', color: '#111111', borderColor: '#e5e5e5' }}
      className="bg-white text-[#111111] p-8 sm:p-10 rounded-2xl shadow-xl border border-[#e5e5e5] font-sans max-w-3xl mx-auto space-y-6 select-text print:shadow-none print:border-none"
    >
      {/* Top Header & Branding */}
      <div
        style={{ borderBottomColor: '#111111' }}
        className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#111111] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              style={{ backgroundColor: '#111111', color: '#fbbf24' }}
              className="h-9 w-9 rounded-xl bg-[#111111] text-[#fbbf24] flex items-center justify-center font-black text-sm shrink-0"
            >
              <HardHat className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-[#111111] tracking-tight" style={{ color: '#111111' }}>
              CONSTR<span style={{ color: '#f59e0b' }}>ORA</span>
            </span>
          </div>
          <p className="text-[10px] text-[#6b7280] uppercase tracking-widest font-bold" style={{ color: '#6b7280' }}>
            Construction Resource Discovery Platform
          </p>
        </div>

        <div className="text-right sm:text-right w-full sm:w-auto">
          <div
            style={{ backgroundColor: '#111111', color: '#fbbf24' }}
            className="bg-[#111111] text-[#fbbf24] text-xl font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider mb-2 shadow-xs"
          >
            OFFICIAL QUOTATION
          </div>
          <div className="text-xs space-y-0.5 text-[#4b5563] font-semibold" style={{ color: '#4b5563' }}>
            <div><span style={{ color: '#9ca3af' }}>QUOTE NO:</span> <strong style={{ color: '#111111' }}>{quote.quoteNumber}</strong></div>
            <div><span style={{ color: '#9ca3af' }}>DATE:</span> {new Date(quote.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><span style={{ color: '#9ca3af' }}>VALID UNTIL:</span> <span style={{ color: '#b45309' }}>{new Date(quote.validUntil || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
          </div>
        </div>
      </div>

      {/* Supplier & Client Address Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 text-xs">
        {/* Supplier Business Info */}
        <div
          style={{ backgroundColor: '#f7f7f5', borderColor: '#e5e5e5' }}
          className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e5e5e5] space-y-1.5"
        >
          <div style={{ color: '#b45309' }} className="text-[10px] font-black uppercase tracking-wider">SUPPLIER / ISSUER</div>
          <div style={{ color: '#111111' }} className="font-black text-[#111111] text-sm">{business.businessName || quote.businessName}</div>
          <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
            <span>{business.location?.address ? `${business.location.address}, ` : ''}{business.location?.city || 'Osogbo'}, {business.location?.state || 'Osun State'}</span>
          </div>
          <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
            <span>{business.phone || business.whatsapp || quote.clientPhone}</span>
          </div>
          {business.email && (
            <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
              <span>{business.email}</span>
            </div>
          )}
          {business.website && (
            <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
              <span>{business.website}</span>
            </div>
          )}
        </div>

        {/* Bill To Client Info */}
        <div
          style={{ backgroundColor: '#f7f7f5', borderColor: '#e5e5e5' }}
          className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e5e5e5] space-y-1.5"
        >
          <div style={{ color: '#6b7280' }} className="text-[10px] font-black uppercase tracking-wider">BILL TO / CLIENT</div>
          <div style={{ color: '#111111' }} className="font-black text-[#111111] text-sm">{quote.clientName}</div>
          <div style={{ color: '#374151' }} className="font-bold">Project: <span style={{ color: '#111111' }} className="font-extrabold">{quote.projectName}</span></div>
          <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
            <span>{quote.projectLocation}</span>
          </div>
          <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
            <span>{quote.clientPhone}</span>
          </div>
          {quote.clientEmail && (
            <div style={{ color: '#4b5563' }} className="text-[#4b5563] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
              <span>{quote.clientEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Table */}
      <div style={{ borderColor: '#e5e5e5' }} className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#111111', color: '#ffffff' }} className="bg-[#111111] text-white font-extrabold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3.5">ITEM / SERVICE</th>
              <th className="py-3 px-3.5">DESCRIPTION</th>
              <th className="py-3 px-3.5 text-center">QTY</th>
              <th className="py-3 px-3.5 text-center">UNIT</th>
              <th className="py-3 px-3.5 text-right">UNIT PRICE</th>
              <th className="py-3 px-3.5 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="text-[#1f2937] font-medium">
            {quote.items.map((it, idx) => (
              <tr key={it.itemId || idx} style={{ borderBottom: '1px solid #e5e5e5' }}>
                <td style={{ color: '#111111' }} className="py-3 px-3.5 font-bold">{it.item}</td>
                <td style={{ color: '#4b5563' }} className="py-3 px-3.5 text-[11px]">{it.description || '—'}</td>
                <td style={{ color: '#111111' }} className="py-3 px-3.5 text-center font-bold">{it.quantity}</td>
                <td style={{ color: '#4b5563' }} className="py-3 px-3.5 text-center">{it.unit}</td>
                <td style={{ color: '#1f2937' }} className="py-3 px-3.5 text-right font-mono">₦{Number(it.unitPrice || 0).toLocaleString()}</td>
                <td style={{ color: '#111111' }} className="py-3 px-3.5 text-right font-mono font-bold">₦{Number(it.total || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
        {/* Notes & Terms */}
        <div
          style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}
          className="flex-1 w-full p-4 rounded-xl border space-y-1 text-xs"
        >
          <div style={{ color: '#92400e' }} className="font-extrabold text-[11px] uppercase tracking-wider">NOTES & TERMS OF QUOTATION</div>
          <p style={{ color: '#374151' }} className="whitespace-pre-line text-[11px] leading-relaxed">
            {quote.notes || 'Prices are valid for the stated duration. Delivery and site logistics arranged as per quotation specs.'}
          </p>
        </div>

        {/* Calculation Table */}
        <div className="w-full sm:w-64 space-y-1.5 text-xs font-semibold">
          <div style={{ borderBottomColor: '#e5e5e5', color: '#4b5563' }} className="flex justify-between py-1 border-b">
            <span>SUBTOTAL</span>
            <span style={{ color: '#111111' }} className="font-mono font-bold">₦{Number(quote.subtotal || 0).toLocaleString()}</span>
          </div>

          {quote.discount > 0 && (
            <div style={{ borderBottomColor: '#e5e5e5', color: '#059669' }} className="flex justify-between py-1 border-b">
              <span>DISCOUNT</span>
              <span className="font-mono font-bold text-emerald-600">-₦{Number(quote.discount).toLocaleString()}</span>
            </div>
          )}

          {quote.deliveryFee > 0 && (
            <div style={{ borderBottomColor: '#e5e5e5', color: '#4b5563' }} className="flex justify-between py-1 border-b">
              <span>DELIVERY FEE</span>
              <span style={{ color: '#111111' }} className="font-mono font-bold">₦{Number(quote.deliveryFee).toLocaleString()}</span>
            </div>
          )}

          {quote.labourFee > 0 && (
            <div style={{ borderBottomColor: '#e5e5e5', color: '#4b5563' }} className="flex justify-between py-1 border-b">
              <span>OPERATOR / LABOUR</span>
              <span style={{ color: '#111111' }} className="font-mono font-bold">₦{Number(quote.labourFee).toLocaleString()}</span>
            </div>
          )}

          {quote.otherCharges > 0 && (
            <div style={{ borderBottomColor: '#e5e5e5', color: '#4b5563' }} className="flex justify-between py-1 border-b">
              <span>OTHER CHARGES</span>
              <span style={{ color: '#111111' }} className="font-mono font-bold">₦{Number(quote.otherCharges).toLocaleString()}</span>
            </div>
          )}

          {quote.tax > 0 && (
            <div style={{ borderBottomColor: '#e5e5e5', color: '#4b5563' }} className="flex justify-between py-1 border-b">
              <span>TAX</span>
              <span style={{ color: '#111111' }} className="font-mono font-bold">₦{Number(quote.tax).toLocaleString()}</span>
            </div>
          )}

          <div
            style={{ backgroundColor: '#111111', color: '#fbbf24' }}
            className="flex justify-between text-base font-black p-3 rounded-xl shadow-md mt-2"
          >
            <span>GRAND TOTAL</span>
            <span className="font-mono text-[#fbbf24]">₦{Number(quote.grandTotal || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ borderTopColor: '#e5e5e5' }} className="border-t pt-4 text-center text-[11px] text-[#6b7280] space-y-1">
        <p style={{ color: '#111111' }} className="font-extrabold uppercase tracking-widest">
          CONSTRORA — FIND WHAT YOU NEED TO BUILD
        </p>
        <p style={{ color: '#9ca3af' }} className="text-[10px]">
          Generated via CONSTRORA Construction Supplier Platform. Discover → Compare → Connect.
        </p>
      </div>
    </div>
  );
};
