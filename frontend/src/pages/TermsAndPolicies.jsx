import React from 'react';
import Navbar from '../components/common/Navbar';
import { Shield, FileText, AlertTriangle, Scale, Lock, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsAndPolicies() {
  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Terms of Service, Privacy Policy &amp; Dispute Rules
          </h1>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            Please read these terms carefully. By accessing or using WILRICH STORE, you agree to abide by our marketplace trading standards and dispute resolution policies.
          </p>
        </div>

        {/* Publisher Compliance Notice */}
        <div className="glass-panel rounded-2xl p-5 text-xs text-stone-800 space-y-2 shadow-2xs">
          <div className="font-bold flex items-center text-stone-900">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-quantum-600" />
            Publisher &amp; Trademark Notice
          </div>
          <p className="leading-relaxed">
            Call of Duty: Mobile is a registered trademark of Activision Publishing, Inc. WILRICH STORE is an independent intermediary coordination platform and is not affiliated with, authorized, maintained, sponsored, or endorsed by Activision Publishing, Inc., TiMi Studio Group, or Tencent Games.
          </p>
          <p className="leading-relaxed">
            All game titles, trademarks, logos, and registered trademarks displayed on this site are the property of their respective owners. WILRICH STORE acts as a technology platform facilitating vendor-to-customer communications and order tracking.
          </p>
        </div>

        {/* Terms of Service Sections */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center">
              <Scale className="w-4 h-4 mr-2 text-quantum-600" />
              1. Marketplace Structure &amp; WhatsApp Handoff
            </h2>
            <p>
              WILRICH STORE provides an immutable ledger of vendor inventory (Call of Duty: Mobile accounts and CP bundles) and customer orders. Initial releases coordinate communication through verified vendor WhatsApp click-to-chat links with prefilled order references.
            </p>
            <p>
              Customers must only transact with verified vendors listed on WILRICH STORE using the authoritative order reference generated at checkout (e.g. <code>WS-2026-XXXXXX</code>).
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-ice-200">
            <h2 className="text-sm font-bold text-stone-900 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-quantum-600" />
              2. Authoritative Pricing &amp; Currency Estimates
            </h2>
            <p>
              All vendor inventory and listing prices are established authoritatively in base Tanzanian Shillings (TZS). Secondary converted values in US Dollars (USD) and Nigerian Naira (NGN) are clearly labeled estimates updated via verified exchange rate benchmarks.
            </p>
            <p>
              Once an order is created, the snapshot price recorded at order creation is permanent and cannot be modified retroactively.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-ice-200">
            <h2 className="text-sm font-bold text-stone-900 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-quantum-600" />
              3. Privacy Policy &amp; Evidence Storage
            </h2>
            <p>
              Customer account data, hashed credentials, and contact numbers are protected with industry-standard encryption and strict role isolation.
            </p>
            <p>
              Supporting image evidence uploaded during dispute ticket creation is stored in private, unguessable storage and is served exclusively through policy-protected endpoints accessible only to the customer, the assigned vendor, and platform Super Admins. Unrelated vendors have no access.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-ice-200">
            <h2 className="text-sm font-bold text-stone-900 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2 text-quantum-600" />
              4. Dispute Resolution &amp; Refunds
            </h2>
            <p>
              If a credential discrepancy or delivery delay occurs during WhatsApp fulfillment:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Open a support ticket through the customer portal with your order reference.</li>
              <li>Attach clear screenshot evidence of the conversation and transaction.</li>
              <li>The vendor has 24 hours to respond and provide a resolution.</li>
              <li>Super Admins continuously monitor active disputes and arbitrate final determinations.</li>
            </ol>
          </section>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
