import React from 'react';
import { X, FileText, Shield, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] rounded-3xl max-w-3xl w-full my-auto flex flex-col max-h-[85vh] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-[#374151] bg-[#F7F7F5] dark:bg-[#111111] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#F59E0B]">
              {isTerms ? <ScaleIcon className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="font-['Cabinet_Grotesk'] text-base sm:text-lg font-black text-[#111111] dark:text-white uppercase tracking-wide">
                {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
              </h2>
              <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                Constrora Platform · Last Updated: September 12, 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed space-y-6">
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#374151] bg-[#F7F7F5] dark:bg-[#111111] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-medium text-center sm:text-left">
            Questions? Contact <a href="mailto:support@constrora.ng" className="text-[#F59E0B] font-bold hover:underline">support@constrora.ng</a>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-extrabold rounded-xl transition-all cursor-pointer uppercase tracking-wider text-center"
          >
            I UNDERSTAND & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

const ScaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3M3 6v14a2 2 0 002 2h14a2 2 0 002-2V6M3 6l9 6 9-6" />
  </svg>
);

const TermsContent: React.FC = () => (
  <div className="space-y-6">
    <div className="p-4 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#111111] dark:text-amber-200 text-xs font-semibold leading-relaxed">
      <strong>Important Notice:</strong> Constrora is a marketplace platform connecting clients with independent construction trade contractors and suppliers. Constrora is not a party to direct service contracts, does not process construction project payments directly on-platform, and disclaims liability for work outcomes.
    </div>

    {/* Section 1 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        1. Introduction & Acceptance of Terms
      </h3>
      <p>
        These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User", "Client", or "Supplier") and <strong>Constrora</strong> (operating as Buildora), concerning your access to and use of the Constrora platform and services.
      </p>
      <p>
        By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must discontinue use immediately.
      </p>
    </section>

    {/* Section 2 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        2. Description of Platform & Facilitator Model
      </h3>
      <p>
        Constrora serves as an independent online venue connecting <strong>Clients</strong> (seeking trade services, equipment rental, or building supplies) and <strong>Suppliers</strong> (businesses publishing listings and responding to quote requests).
      </p>
      <p>
        Constrora is not a construction contractor, equipment owner, or agent for any party. Constrora is not a party to any contract or quotation negotiated between Clients and Suppliers.
      </p>
    </section>

    {/* Section 3 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        3. User Accounts, Roles & Eligibility
      </h3>
      <p>
        You must be at least 18 years of age to register an account. Accounts are classified into <strong>Client Accounts</strong> and <strong>Supplier Accounts</strong>. Authentication is secured via Firebase Authentication. You are responsible for maintaining credential confidentiality and all account activities.
      </p>
    </section>

    {/* Section 4 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        4. Business Verification Badges & Disclaimers
      </h3>
      <p>
        "Verified" badges indicate basic administrative document reviews (such as submitted business registration numbers or identity cards). Verification does not constitute an endorsement, safety guarantee, quality assurance, or endorsement of work execution. Clients must perform independent due diligence.
      </p>
    </section>

    {/* Section 5 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        5. Supplier Listings, Quotes & Content Ownership
      </h3>
      <p>
        Suppliers warrant that all listings, pricing specs, photos, and availability details are accurate. Suppliers retain ownership of uploaded media while granting Constrora a license to host and display content on the platform. Quote estimates generated in-app serve as estimates between Client and Supplier.
      </p>
    </section>

    {/* Section 6 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        6. Off-Platform Transactions & Direct Contracting
      </h3>
      <p>
        Constrora does not hold, process, or escrow funds for construction jobs or equipment rentals. All financial transactions, payments, deposits, and refunds occur directly off-platform between Client and Supplier. Constrora bears no liability for payment disputes or unfulfilled work.
      </p>
    </section>

    {/* Section 7 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        7. User Conduct & Prohibited Activities
      </h3>
      <p>
        Users agree not to publish deceptive listings, fake reviews, impersonate contractors, distribute malware, or engage in unlicensed trade practices violating local building codes.
      </p>
    </section>

    {/* Section 8 & 9 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        8. Disclaimers of Warranties & Limitation of Liability
      </h3>
      <p>
        The platform is provided "AS-IS". To the maximum extent permitted by law, Constrora disclaims all warranties regarding trade quality, site safety, structural performance, or project delays. Constrora is not liable for indirect, incidental, site accident, or financial damages.
      </p>
    </section>

    {/* Section 10 & 11 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        9. Termination & Governing Law
      </h3>
      <p>
        Constrora reserves the right to suspend accounts for fraud or rule violations. These Terms are governed by applicable local commercial laws. Disputes between Users must be settled directly between the involved parties.
      </p>
    </section>
  </div>
);

const PrivacyContent: React.FC = () => (
  <div className="space-y-6">
    <div className="p-4 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#111111] dark:text-amber-200 text-xs font-semibold leading-relaxed">
      <strong>Privacy Summary:</strong> Constrora respects your privacy. We store project data securely via Google Cloud / Firebase infrastructure, do not sell your personal data to advertisers, and use browser local storage only for essential app settings.
    </div>

    {/* Section 1 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        1. Overview & Data Controller
      </h3>
      <p>
        This Privacy Policy describes how Constrora collects, uses, and safeguards personal data across our web application. Constrora acts as the data controller for account management and quote facilitation.
      </p>
    </section>

    {/* Section 2 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        2. Information We Collect
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Public Information:</strong> Business name, address/service area, phone number, category, equipment photos, and pricing published in supplier listings.</li>
        <li><strong>Private Information:</strong> Name, email address, role, quote request specifications, and saved project favorites. Passwords are securely hashed by Firebase Authentication and never visible to Constrora.</li>
        <li><strong>Technical Data:</strong> IP addresses, device browser info, and general operational log metadata.</li>
      </ul>
    </section>

    {/* Section 3 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        3. Legal Bases for Processing
      </h3>
      <p>
        We process your data under legitimate legal bases: contract performance (delivering quote requests and listing services), legitimate business interests (preventing fraud and securing accounts), and legal compliance.
      </p>
    </section>

    {/* Section 4 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        4. Subprocessors & Cloud Storage
      </h3>
      <p>
        Data is processed and hosted securely on <strong>Google Cloud Platform / Firebase</strong> (Firestore Database & Firebase Authentication). Constrora <strong>does not sell, rent, or trade</strong> your personal information to third-party ad networks.
      </p>
    </section>

    {/* Section 5 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        5. Cookies & Local Storage
      </h3>
      <p>
        We do not use third-party ad tracking cookies. Browser <code className="bg-[#E5E5E5] dark:bg-[#374151] px-1 py-0.5 rounded text-[11px]">localStorage</code> is used exclusively for functional state, such as theme preferences (<code className="bg-[#E5E5E5] dark:bg-[#374151] px-1 py-0.5 rounded text-[11px]">constrora_theme</code>) and session persistence.
      </p>
    </section>

    {/* Section 6 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        6. Account Deletion & Data Rights
      </h3>
      <p>
        You have the right to access, update, or delete your personal account data at any time. Account deletion removes your profile and saved listing metadata from our active production database. Contact <a href="mailto:support@constrora.ng" className="text-[#F59E0B] font-bold hover:underline">support@constrora.ng</a> to exercise data protection rights.
      </p>
    </section>

    {/* Section 7 */}
    <section className="space-y-2">
      <h3 className="font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">
        7. Children's Privacy
      </h3>
      <p>
        Constrora is intended solely for adult professionals and business representatives. We do not knowingly collect personal information from individuals under 18 years of age.
      </p>
    </section>
  </div>
);
