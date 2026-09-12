import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Save,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Box,
  Share2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { doc, setDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Business, QuoteRequest, SupplierQuote, QuoteLineItem } from '../types';
import { QuotationDocument } from './QuotationDocument';
import { normalizePhoneForWhatsApp } from '../utils/phone';

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
    existingQuote?.projectName || quoteRequest?.projectName || 'Site Construction Project'
  );
  const [projectLocation, setProjectLocation] = useState<string>(() => {
    const raw = existingQuote?.projectLocation || quoteRequest?.projectLocation;
    if (!raw) return 'Osogbo, Osun State';
    if (typeof raw === 'string') return raw;
    return `${raw.address ? raw.address + ', ' : ''}${raw.city || 'Osogbo'}, ${raw.state || 'Osun State'}`;
  });

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
  const [deliveryFee, setDeliveryFee] = useState<number>(existingQuote?.deliveryFee || 50000);
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

  // Share Fallback Instructional Modal State
  const [isShareFallbackOpen, setIsShareFallbackOpen] = useState(false);
  const [fallbackFileType, setFallbackFileType] = useState<'pdf' | 'png'>('pdf');
  const [fallbackFileUrl, setFallbackFileUrl] = useState<string | null>(null);
  const [fallbackFileName, setFallbackFileName] = useState<string>('');

  if (!isOpen) return null;

  // Calculate Subtotal & Grand Total
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const grandTotal = Math.max(
    0,
    subtotal - (Number(discount) || 0) + (Number(deliveryFee) || 0) + (Number(labourFee) || 0) + (Number(otherCharges) || 0) + (Number(tax) || 0)
  );

  // Item Handlers
  const handleItemChange = (index: number, field: keyof QuoteLineItem, value: string | number) => {
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
    businessId: business?.businessId || 'biz_default',
    businessName: business?.businessName || 'Supplier Business',
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
      if (currentUser && business?.businessId) {
        const quoteRef = doc(db, 'businesses', business.businessId, 'quotes', currentQuoteObj.quoteId);
        await setDoc(quoteRef, sanitizeForFirestore(currentQuoteObj), { merge: true });
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

  // Helper to cleanly capture document canvas using html-to-image (supports Tailwind v4 oklch & modern CSS)
  const getDocumentCanvas = async (): Promise<HTMLCanvasElement | null> => {
    let el = document.getElementById('quotation-document-capture');
    if (!el) {
      el = document.getElementById('quotation-document-preview');
    }
    if (!el) return null;

    try {
      return await toCanvas(el, {
        quality: 0.98,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });
    } catch (err) {
      console.warn('Primary toCanvas render info:', err);
      return await toCanvas(el, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 1.5,
      });
    }
  };

  // Export PDF Action
  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await handleSaveQuote();
      const canvas = await getDocumentCanvas();
      if (!canvas) throw new Error('Document capture element not found');

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: pdfHeight > 297 ? [pdfWidth, pdfHeight] : 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `CONSTRORA_Quotation_${quoteNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      pdf.save(fileName);
      setShareFeedback('PDF Quotation downloaded successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // Share/Download PNG Image Action
  const handleShareAsImage = async () => {
    setExporting('image');
    try {
      await handleSaveQuote();
      const canvas = await getDocumentCanvas();
      if (!canvas) throw new Error('Document capture element not found');

      canvas.toBlob((blob) => {
        if (!blob) return;
        const fileName = `CONSTRORA_Quotation_${quoteNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
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

  // Unified Share Handler with navigator.canShare() check & UI Fallback Modal
  const handleShareDocument = async (format: 'pdf' | 'png' = 'pdf') => {
    setExporting(format === 'pdf' ? 'pdf-share' : 'image-share');
    try {
      await handleSaveQuote();
      const canvas = await getDocumentCanvas();
      if (!canvas) throw new Error('Document capture element not found');

      const fileName = `CONSTRORA_Quotation_${quoteNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;
      const waText = `Hello ${clientName},\n\nPlease find your official quotation for ${projectName}.\n\nQuote No: ${quoteNumber}\nGrand Total: ₦${grandTotal.toLocaleString()}\n\nThank you,\n${business.businessName}`;

      let fileObj: File;
      let blobObj: Blob;

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: pdfHeight > 297 ? [pdfWidth, pdfHeight] : 'a4',
        });
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        blobObj = pdf.output('blob');
        fileObj = new File([blobObj], fileName, { type: 'application/pdf' });
      } else {
        blobObj = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas blob failed'))), 'image/png');
        });
        fileObj = new File([blobObj], fileName, { type: 'image/png' });
      }

      // Check for navigator.canShare() native file support
      const canNativeShareFiles =
        typeof navigator !== 'undefined' &&
        !!navigator.share &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [fileObj] });

      if (canNativeShareFiles) {
        try {
          await navigator.share({
            files: [fileObj],
            title: `Quotation ${quoteNumber}`,
            text: waText,
          });
          setShareFeedback(`Quotation ${format.toUpperCase()} shared successfully!`);
          return;
        } catch (e: any) {
          if (e.name === 'AbortError') {
            setShareFeedback('Sharing cancelled.');
            return;
          }
          console.log('Native file share failed, proceeding with download fallback:', e);
        }
      }

      // Fallback for browsers without native file sharing support:
      // Trigger URL.createObjectURL download and open instructional modal
      const downloadUrl = URL.createObjectURL(blobObj);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setFallbackFileType(format);
      setFallbackFileUrl(downloadUrl);
      setFallbackFileName(fileName);
      setIsShareFallbackOpen(true);
      setShareFeedback(`Quotation ${format.toUpperCase()} downloaded to device! Follow the instructions on screen to send.`);
    } catch (e) {
      console.error('Document sharing failed:', e);
      alert('Could not prepare quotation for sharing. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Capture container positioned behind modal overlay at (0,0) for fail-proof PDF/PNG rendering */}
        <div
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            width: '800px',
            pointerEvents: 'none',
            zIndex: -1,
            backgroundColor: '#ffffff',
          }}
        >
          <QuotationDocument quote={currentQuoteObj} business={business} id="quotation-document-capture" />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl my-4 sm:my-8 rounded-3xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-8 shadow-2xl text-[#111111] dark:text-white flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#B45309] dark:text-[#FBBF24]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-['Cabinet_Grotesk'] text-xl sm:text-2xl font-black text-[#111111] dark:text-white flex items-center gap-2">
                  CONSTRORA QUOTATION BUILDER
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">Professional Supplier Quote Generator & Export Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'editor' ? 'bg-[#FBBF24] text-[#111111] font-extrabold' : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  Edit Quotation
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'preview' ? 'bg-[#FBBF24] text-[#111111] font-extrabold' : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview Document
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {shareFeedback && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{shareFeedback}</span>
              </div>
              <button onClick={() => setShareFeedback(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            {activeTab === 'editor' ? (
              <div className="space-y-6">
                {/* Quote Info Grid */}
                <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider">QUOTE INFORMATION</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Quote Number
                      </label>
                      <input
                        type="text"
                        value={quoteNumber}
                        onChange={(e) => setQuoteNumber(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#B45309] dark:text-[#FBBF24] font-bold focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Valid Until Date
                      </label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Issuer Business Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={business.businessName}
                        className="w-full bg-slate-100 dark:bg-slate-950/60 border border-[#E5E5E5] dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-[#6B7280] dark:text-slate-300 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider">CLIENT & PROJECT DETAILS</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Client Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Project Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider">
                      ITEMIZED RESOURCES & SERVICES
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#B45309] dark:text-[#FBBF24] hover:bg-[#FBBF24]/25 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Line Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.itemId || index}
                        className="p-3 bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800/80 rounded-2xl space-y-3 shadow-2xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                              Item / Resource Name
                            </label>
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                              className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                              Unit (e.g. Bags, Trips, Days)
                            </label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                              Description / Specification
                            </label>
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="e.g. Grade 42.5N, 20-ton tipper delivery"
                              className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#111111] dark:text-slate-300 focus:outline-none focus:border-[#FBBF24]"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                                Unit Price (₦)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#B45309] dark:text-[#FBBF24] font-mono font-bold focus:outline-none focus:border-[#FBBF24]"
                              />
                            </div>

                            <div className="shrink-0 text-right min-w-[90px]">
                              <label className="text-[9px] font-bold text-[#6B7280] dark:text-slate-500 uppercase block mb-1">
                                Total (₦)
                              </label>
                              <div className="text-xs font-mono font-extrabold text-[#111111] dark:text-white py-1.5">
                                ₦{(Number(item.total) || 0).toLocaleString()}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-[#6B7280] dark:text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors mt-3 cursor-pointer"
                              title="Remove Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Fees & Calculation Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Fee Inputs */}
                  <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
                    <div className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider">
                      LOGISTICS, LABOUR & TAX ADJUSTMENTS
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase block mb-1">
                          Delivery / Haulage Fee (₦)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase block mb-1">
                          Labour / Operator Fee (₦)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={labourFee}
                          onChange={(e) => setLabourFee(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase block mb-1">
                          Discount Offered (₦)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[#FBBF24] font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase block mb-1">
                          Tax / VAT (₦)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tax}
                          onChange={(e) => setTax(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider">
                      QUOTATION FINANCIAL SUMMARY
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <div className="flex justify-between text-[#6B7280] dark:text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-mono text-[#111111] dark:text-white font-bold">₦{subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Discount:</span>
                          <span className="font-mono font-bold">-₦{discount.toLocaleString()}</span>
                        </div>
                      )}
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-[#6B7280] dark:text-slate-400">
                          <span>Delivery Fee:</span>
                          <span className="font-mono text-[#111111] dark:text-white font-bold">₦{deliveryFee.toLocaleString()}</span>
                        </div>
                      )}
                      {labourFee > 0 && (
                        <div className="flex justify-between text-[#6B7280] dark:text-slate-400">
                          <span>Labour / Operator:</span>
                          <span className="font-mono text-[#111111] dark:text-white font-bold">₦{labourFee.toLocaleString()}</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between text-[#6B7280] dark:text-slate-400">
                          <span>Tax / VAT:</span>
                          <span className="font-mono text-[#111111] dark:text-white font-bold">₦{tax.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-[#FBBF24] text-[#111111] rounded-xl flex items-center justify-between font-black text-base shadow-sm mt-2">
                      <span>GRAND TOTAL</span>
                      <span className="font-mono text-xl">₦{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                <div className="bg-[#F7F7F5] dark:bg-slate-900/80 border border-[#E5E5E5] dark:border-slate-800 p-4 rounded-2xl space-y-2">
                  <label className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider block">
                    NOTES & TERMS OF QUOTATION
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Prices valid for 7 days..."
                    className="w-full bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-xl p-3 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Quotation Document Preview Mode */
              <div className="py-2">
                <QuotationDocument quote={currentQuoteObj} business={business} id="quotation-document-preview" />
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-[#E5E5E5] dark:border-slate-800 pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-[#6B7280] dark:text-slate-300 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
              <span>GRAND TOTAL:</span>
              <span className="text-[#B45309] dark:text-[#FBBF24] font-mono text-xl font-black">₦{grandTotal.toLocaleString()}</span>
            </div>

            {/* Sharing & Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveQuote}
                disabled={saving}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#111111] dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Save record to Firestore"
              >
                <Save className="h-4 w-4 text-[#F59E0B]" />
                <span>{saving ? 'Saving...' : 'Save Record'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareDocument('pdf')}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm uppercase"
                title="Share quotation via native share sheet or download fallback"
              >
                <Share2 className="h-4 w-4" />
                <span>{exporting === 'pdf-share' ? 'Sharing...' : 'Share Quotation'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase"
              >
                <Download className="h-4 w-4" />
                <span>{exporting === 'pdf' ? 'PDF...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareAsImage}
                disabled={exporting !== null}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#111111] dark:text-[#FBBF24] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Instructional Sharing Fallback Modal */}
        <AnimatePresence>
          {isShareFallbackOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-700 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-[#111111] dark:text-white"
              >
                <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#FBBF24]/15 border border-[#FBBF24]/30 rounded-xl text-[#B45309] dark:text-[#FBBF24]">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#111111] dark:text-white">Share Quotation</h3>
                      <p className="text-[10px] text-[#6B7280] dark:text-slate-400">Step-by-step sharing instructions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsShareFallbackOpen(false)}
                    className="p-1 text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 dark:text-emerald-200">
                    <p className="font-bold">File downloaded to your device!</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-0.5 font-mono break-all">{fallbackFileName}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#111111] dark:text-slate-300">
                  <p className="font-bold text-[#111111] dark:text-slate-200">How to send to {clientName}:</p>
                  <ol className="space-y-2 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#FBBF24] text-[#111111] font-black text-[10px] shrink-0">1</span>
                      <span>Your <strong>{fallbackFileType.toUpperCase()}</strong> file is now in your device's <strong>Downloads</strong> folder.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#FBBF24] text-[#111111] font-black text-[10px] shrink-0">2</span>
                      <span>Open WhatsApp, Email, Telegram, or any chat app.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#FBBF24] text-[#111111] font-black text-[10px] shrink-0">3</span>
                      <span>Attach the downloaded file from Downloads to send to <strong>{clientName}</strong>.</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {clientPhone && (
                    <a
                      href={`https://wa.me/${normalizePhoneForWhatsApp(clientPhone)}?text=${encodeURIComponent(
                        `Hello ${clientName},\n\nPlease find your official quotation for ${projectName}.\n\nQuote No: ${quoteNumber}\nGrand Total: ₦${grandTotal.toLocaleString()}\n\nThank you,\n${business.businessName}\n\n(Attached quotation ${fallbackFileType.toUpperCase()} is in my downloads)`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm uppercase transition-all cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Open WhatsApp Chat ({clientPhone})</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    {fallbackFileUrl && (
                      <a
                        href={fallbackFileUrl}
                        download={fallbackFileName}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#111111] dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-[#B45309] dark:text-[#FBBF24]" />
                        <span>Re-Download</span>
                      </a>
                    )}
                    <button
                      onClick={() => setIsShareFallbackOpen(false)}
                      className="flex-1 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Got It
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
