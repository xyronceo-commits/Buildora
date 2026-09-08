import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Share2,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Save,
  HardHat,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Box,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Business, QuoteRequest, SupplierQuote, QuoteLineItem } from '../types';
import { QuotationDocument } from './QuotationDocument';

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  quoteRequest?: QuoteRequest | null;
  existingQuote?: SupplierQuote | null;
  onQuoteSaved?: (quote: SupplierQuote) => void;
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  isOpen,
  onClose,
  business,
  quoteRequest,
  existingQuote,
  onQuoteSaved,
}) => {
  const { currentUser } = useAuth();
  const documentRef = useRef<HTMLDivElement>(null);

  // Auto-generate quote number
  const defaultQuoteNum = useRef(
    existingQuote?.quoteNumber || `CTR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
  ).current;

  // Header & Client Details
  const [quoteNumber, setQuoteNumber] = useState(defaultQuoteNum);
  const [clientName, setClientName] = useState(existingQuote?.clientName || quoteRequest?.clientName || 'John Doe');
  const [clientPhone, setClientPhone] = useState(
    existingQuote?.clientPhone || quoteRequest?.clientPhone || quoteRequest?.userPhone || ''
  );
  const [clientEmail, setClientEmail] = useState(
    existingQuote?.clientEmail || quoteRequest?.clientEmail || ''
  );
  const [projectName, setProjectName] = useState(
    existingQuote?.projectName || quoteRequest?.projectName || '3 Bedroom Duplex'
  );
  const [projectLocation, setProjectLocation] = useState(
    existingQuote?.projectLocation || quoteRequest?.projectLocation || 'Osogbo, Osun State'
  );

  // Validity Date
  const [validUntil, setValidUntil] = useState(() => {
    if (existingQuote?.validUntil) return existingQuote.validUntil;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Line Items
  const [items, setItems] = useState<QuoteLineItem[]>(() => {
    if (existingQuote?.items && existingQuote.items.length > 0) {
      return existingQuote.items;
    }
    if (quoteRequest?.items && quoteRequest.items.length > 0) {
      return quoteRequest.items.map((it, idx) => ({
        itemId: `item_${idx}_${Date.now()}`,
        item: it.name,
        description: it.specifications || 'Standard supply specifications',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'Units',
        unitPrice: 10500,
        total: (Number(it.quantity) || 1) * 10500,
      }));
    }
    if (quoteRequest?.itemName) {
      return [
        {
          itemId: `item_0_${Date.now()}`,
          item: quoteRequest.itemName,
          description: 'Supply and delivery as requested',
          quantity: 1,
          unit: 'Units',
          unitPrice: 50000,
          total: 50000,
        },
      ];
    }
    return [
      {
        itemId: `item_0_${Date.now()}`,
        item: 'Cement (50kg Dangote)',
        description: 'Grade 42.5N Ordinary Portland Cement',
        quantity: 100,
        unit: 'Bags',
        unitPrice: 10500,
        total: 1050000,
      },
      {
        itemId: `item_1_${Date.now()}`,
        item: 'Granite (3/4 inch)',
        description: 'Clean quarry crushed aggregate',
        quantity: 2,
        unit: 'Trips',
        unitPrice: 120000,
        total: 240000,
      },
    ];
  });

  // Additional Charges
  const [discount, setDiscount] = useState<number>(existingQuote?.discount || 0);
  const [deliveryFee, setDeliveryFee] = useState<number>(existingQuote?.deliveryFee || 100000);
  const [labourFee, setLabourFee] = useState<number>(existingQuote?.labourFee || 0);
  const [otherCharges, setOtherCharges] = useState<number>(existingQuote?.otherCharges || 0);
  const [tax, setTax] = useState<number>(existingQuote?.tax || 0);

  // Notes & Terms
  const [notes, setNotes] = useState(
    existingQuote?.notes ||
      'Prices are valid for 7 days from quote date.\nDelivery cost subject to final site access conditions.\nEquipment operator included where applicable.'
  );

  // UI State
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Subtotal & Grand Total
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const grandTotal = Math.max(
    0,
    subtotal - (Number(discount) || 0) + (Number(deliveryFee) || 0) + (Number(labourFee) || 0) + (Number(otherCharges) || 0) + (Number(tax) || 0)
  );

  // Item Handlers
  const handleItemChange = (index: number, field: keyof QuoteLineItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
        const price = Number(field === 'unitPrice' ? value : item.unitPrice) || 0;
        item.total = qty * price;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemId: `item_${Date.now()}`,
        item: 'New Resource / Service',
        description: 'Item details',
        quantity: 1,
        unit: 'Units',
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A quotation must have at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Build Supplier Quote Object
  const currentQuoteObj: SupplierQuote = {
    quoteId: existingQuote?.quoteId || `quote_doc_${Date.now()}`,
    quoteRequestId: quoteRequest?.quoteRequestId || existingQuote?.quoteRequestId || '',
    businessId: business.businessId,
    businessName: business.businessName,
    clientName,
    clientPhone,
    clientEmail,
    projectName,
    projectLocation,
    quoteNumber,
    items,
    subtotal,
    discount,
    deliveryFee,
    labourFee,
    otherCharges,
    tax,
    grandTotal,
    notes,
    validUntil,
    status: 'GENERATED',
    createdAt: existingQuote?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save Quote to Firestore
  const handleSaveQuote = async (): Promise<SupplierQuote> => {
    setSaving(true);
    try {
      if (currentUser && !currentUser.uid.startsWith('demo_')) {
        const quoteRef = doc(db, 'businesses', business.businessId, 'quotes', currentQuoteObj.quoteId);
        await setDoc(quoteRef, currentQuoteObj, { merge: true });
      }
      if (onQuoteSaved) {
        onQuoteSaved(currentQuoteObj);
      }
      return currentQuoteObj;
    } catch (e) {
      console.warn('Error saving quote to Firestore:', e);
      if (onQuoteSaved) {
        onQuoteSaved(currentQuoteObj);
      }
      return currentQuoteObj;
    } finally {
      setSaving(false);
    }
  };

  // Export PDF Action
  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await handleSaveQuote();
      const el = document.getElementById('quotation-document');
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${quoteNumber}_Quotation_${clientName.replace(/\s+/g, '_')}.pdf`);
      setShareFeedback('PDF Quotation downloaded successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // Share as Image Action
  const handleShareAsImage = async () => {
    setExporting('image');
    try {
      await handleSaveQuote();
      const el = document.getElementById('quotation-document');
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${quoteNumber}_Quotation.png`, { type: 'image/png' });

        // Try native share sheet if supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Quotation ${quoteNumber}`,
              text: `Quotation ${quoteNumber} for ${projectName} from ${business.businessName}`,
            });
            setShareFeedback('Quotation image shared via system sheet!');
            return;
          } catch (e) {
            console.log('User cancelled share or share failed:', e);
          }
        }

        // Fallback: direct download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quoteNumber}_Quotation.png`;
        a.click();
        URL.revokeObjectURL(url);
        setShareFeedback('Quotation image downloaded to device!');
      }, 'image/png');
    } catch (err) {
      console.error('Image export failed:', err);
      alert('Failed to export image.');
    } finally {
      setExporting(null);
    }
  };

  // WhatsApp Share Workflow (Section 15)
  const handleWhatsAppShare = async () => {
    setExporting('whatsapp');
    try {
      await handleSaveQuote();

      // Clean phone number for WhatsApp
      let cleanPhone = clientPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '234' + cleanPhone.substring(1);
      }

      const waText = `Hello ${clientName},\n\nPlease find your quotation for ${projectName}.\n\nQuote: ${quoteNumber}\nTotal: ₦${grandTotal.toLocaleString()}\n\nThank you,\n${business.businessName}`;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

      // Open WhatsApp prefilled message
      window.open(waUrl, '_blank');

      setShareFeedback('Quote ready to share on WhatsApp.');
    } catch (e) {
      console.error('WhatsApp workflow failed:', e);
    } finally {
      setExporting(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl my-4 sm:my-8 rounded-3xl bg-[#121418] border border-slate-800 p-4 sm:p-8 shadow-2xl text-white flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-['Cabinet_Grotesk'] text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  CONSTRORA QUOTATION BUILDER
                </h2>
                <p className="text-xs text-slate-400">Professional Supplier Quote Generator & Export Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'editor' ? 'bg-amber-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Edit Quotation
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'preview' ? 'bg-amber-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview Document
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {shareFeedback && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{shareFeedback}</span>
              </div>
              <button onClick={() => setShareFeedback(null)} className="text-emerald-300 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            {activeTab === 'editor' ? (
              <div className="space-y-6">
                {/* Quote Info Grid */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-black text-amber-500 uppercase tracking-wider">QUOTE INFORMATION</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Quote Number
                      </label>
                      <input
                        type="text"
                        value={quoteNumber}
                        onChange={(e) => setQuoteNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Valid Until Date
                      </label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Issuer Business Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={business.businessName}
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-black text-amber-500 uppercase tracking-wider">CLIENT & PROJECT DETAILS</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Client Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Project Site Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Editor */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-amber-500 uppercase tracking-wider">ITEMIZED LINE ITEMS</div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs rounded-xl hover:bg-amber-500 hover:text-black transition-all cursor-pointer flex items-center gap-1.5 uppercase"
                    >
                      <Plus className="h-3.5 w-3.5" /> ADD ITEM
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.itemId || idx}
                        className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Item / Resource Name</label>
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                              placeholder="e.g. CAT 320 Excavator"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Description / Spec</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              placeholder="e.g. Operating weight 22 tons, operator included"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Unit</label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              placeholder="Days, Bags"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 text-center focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-2 flex items-center gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Unit Price (₦)</label>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="mt-4 p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-1.5">
                          Line Total: <span className="text-white font-bold ml-1">₦{Number(item.total).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Costs & Totals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Additional Costs Inputs */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="text-xs font-black text-amber-500 uppercase tracking-wider">ADDITIONAL FEES & DISCOUNTS</div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Discount (₦)</label>
                        <input
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Fee (₦)</label>
                        <input
                          type="number"
                          min="0"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Operator / Labour Fee (₦)</label>
                        <input
                          type="number"
                          min="0"
                          value={labourFee}
                          onChange={(e) => setLabourFee(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tax / VAT (₦)</label>
                        <input
                          type="number"
                          min="0"
                          value={tax}
                          onChange={(e) => setTax(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculations Summary Card */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-semibold flex flex-col justify-between">
                    <div className="text-xs font-black text-amber-500 uppercase tracking-wider">FINANCIAL SUMMARY</div>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono text-white font-bold">₦{subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount:</span>
                          <span className="font-mono font-bold">-₦{discount.toLocaleString()}</span>
                        </div>
                      )}
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Delivery Fee:</span>
                          <span className="font-mono text-white font-bold">₦{deliveryFee.toLocaleString()}</span>
                        </div>
                      )}
                      {labourFee > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Labour / Operator:</span>
                          <span className="font-mono text-white font-bold">₦{labourFee.toLocaleString()}</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Tax / VAT:</span>
                          <span className="font-mono text-white font-bold">₦{tax.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-amber-500 text-black rounded-xl flex items-center justify-between font-black text-base shadow-lg shadow-amber-500/10 mt-2">
                      <span>GRAND TOTAL</span>
                      <span className="font-mono text-lg">₦{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <label className="text-xs font-black text-amber-500 uppercase tracking-wider block">
                    NOTES & TERMS OF QUOTATION
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Prices valid for 7 days..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Quotation Document Preview Mode */
              <div className="py-2">
                <QuotationDocument quote={currentQuoteObj} business={business} id="quotation-document" />
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-slate-800 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-300 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
              <span>GRAND TOTAL:</span>
              <span className="text-amber-400 font-mono text-lg font-black">₦{grandTotal.toLocaleString()}</span>
            </div>

            {/* Sharing & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveQuote}
                disabled={saving}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4 text-amber-400" />
                <span>{saving ? 'Saving...' : 'Save Record'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 uppercase"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareAsImage}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Share Image</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 uppercase"
              >
                <Download className="h-4 w-4" />
                <span>{exporting === 'pdf' ? 'Generating PDF...' : 'EXPORT PDF'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
