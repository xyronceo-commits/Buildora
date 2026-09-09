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
      className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif] max-w-3xl mx-auto space-y-6 select-text print:shadow-none print:border-none"
    >
      {/* Top Header & Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center font-black text-sm shrink-0">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="font-['Cabinet_Grotesk'] text-2xl font-black text-slate-900 tracking-tight">
              CONSTR<span className="text-amber-500">ORA</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Construction Resource Discovery Platform
          </p>
        </div>

        <div className="text-right sm:text-right w-full sm:w-auto">
          <div className="bg-slate-900 text-amber-400 font-['Cabinet_Grotesk'] text-xl font-black px-4 py-1.5 rounded-xl inline-block uppercase tracking-wider mb-2">
            OFFICIAL QUOTATION
          </div>
          <div className="text-xs space-y-0.5 text-slate-600 font-semibold">
            <div><span className="text-slate-400 font-normal">QUOTE NO:</span> <strong className="text-slate-900 font-extrabold">{quote.quoteNumber}</strong></div>
            <div><span className="text-slate-400 font-normal">DATE:</span> {new Date(quote.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><span className="text-slate-400 font-normal">VALID UNTIL:</span> <span className="text-amber-600 font-bold">{new Date(quote.validUntil || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
          </div>
        </div>
      </div>

      {/* Supplier & Client Address Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 text-xs">
        {/* Supplier Business Info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="text-[10px] font-black uppercase text-amber-600 tracking-wider">SUPPLIER / ISSUER</div>
          <div className="font-black text-slate-900 text-sm">{business.businessName || quote.businessName}</div>
          <div className="text-slate-600 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{business.location?.address ? `${business.location.address}, ` : ''}{business.location?.city || 'Osogbo'}, {business.location?.state || 'Osun State'}</span>
          </div>
          <div className="text-slate-600 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{business.phone || business.whatsapp || quote.clientPhone}</span>
          </div>
          {business.email && (
            <div className="text-slate-600 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{business.email}</span>
            </div>
          )}
          {business.website && (
            <div className="text-slate-600 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{business.website}</span>
            </div>
          )}
        </div>

        {/* Bill To Client Info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">BILL TO / CLIENT</div>
          <div className="font-black text-slate-900 text-sm">{quote.clientName}</div>
          <div className="text-slate-700 font-bold">Project: <span className="text-slate-900 font-extrabold">{quote.projectName}</span></div>
          <div className="text-slate-600 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{quote.projectLocation}</span>
          </div>
          <div className="text-slate-600 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{quote.clientPhone}</span>
          </div>
          {quote.clientEmail && (
            <div className="text-slate-600 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{quote.clientEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-extrabold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3.5">ITEM / SERVICE</th>
              <th className="py-3 px-3.5">DESCRIPTION</th>
              <th className="py-3 px-3.5 text-center">QTY</th>
              <th className="py-3 px-3.5 text-center">UNIT</th>
              <th className="py-3 px-3.5 text-right">UNIT PRICE</th>
              <th className="py-3 px-3.5 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {quote.items.map((it, idx) => (
              <tr key={it.itemId || idx} className="hover:bg-slate-50">
                <td className="py-3 px-3.5 font-bold text-slate-900">{it.item}</td>
                <td className="py-3 px-3.5 text-slate-600 text-[11px]">{it.description || '—'}</td>
                <td className="py-3 px-3.5 text-center font-bold">{it.quantity}</td>
                <td className="py-3 px-3.5 text-center text-slate-600">{it.unit}</td>
                <td className="py-3 px-3.5 text-right font-mono">₦{Number(it.unitPrice || 0).toLocaleString()}</td>
                <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">₦{Number(it.total || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
        {/* Notes & Terms */}
        <div className="flex-1 w-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
          <div className="font-extrabold text-amber-900 text-[11px] uppercase tracking-wider">NOTES & TERMS OF QUOTATION</div>
          <p className="text-slate-700 whitespace-pre-line text-[11px] leading-relaxed">
            {quote.notes || 'Prices are valid for the stated duration. Delivery and site logistics arranged as per quotation specs.'}
          </p>
        </div>

        {/* Calculation Table */}
        <div className="w-full sm:w-64 space-y-1.5 text-xs font-semibold">
          <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200">
            <span>SUBTOTAL</span>
            <span className="font-mono font-bold text-slate-900">₦{Number(quote.subtotal || 0).toLocaleString()}</span>
          </div>

          {quote.discount > 0 && (
            <div className="flex justify-between text-emerald-600 py-1 border-b border-slate-200">
              <span>DISCOUNT</span>
              <span className="font-mono font-bold">-₦{Number(quote.discount).toLocaleString()}</span>
            </div>
          )}

          {quote.deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200">
              <span>DELIVERY FEE</span>
              <span className="font-mono font-bold text-slate-900">₦{Number(quote.deliveryFee).toLocaleString()}</span>
            </div>
          )}

          {quote.labourFee > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200">
              <span>OPERATOR / LABOUR</span>
              <span className="font-mono font-bold text-slate-900">₦{Number(quote.labourFee).toLocaleString()}</span>
            </div>
          )}

          {quote.otherCharges > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200">
              <span>OTHER CHARGES</span>
              <span className="font-mono font-bold text-slate-900">₦{Number(quote.otherCharges).toLocaleString()}</span>
            </div>
          )}

          {quote.tax > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-200">
              <span>TAX</span>
              <span className="font-mono font-bold text-slate-900">₦{Number(quote.tax).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black bg-slate-900 text-amber-400 p-3 rounded-xl shadow-md mt-2">
            <span>GRAND TOTAL</span>
            <span className="font-mono">₦{Number(quote.grandTotal || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 space-y-1">
        <p className="font-extrabold text-slate-900 uppercase tracking-widest">
          CONSTRORA — FIND WHAT YOU NEED TO BUILD
        </p>
        <p className="text-[10px] text-slate-400">
          Generated via CONSTRORA Construction Supplier Platform. Discover → Compare → Connect.
        </p>
      </div>
    </div>
  );
};
