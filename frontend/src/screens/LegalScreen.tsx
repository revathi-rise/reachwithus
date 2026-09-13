import React from 'react';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

interface LegalScreenProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

const sectionClass = 'space-y-2';
const headingClass = 'text-sm font-bold text-white';
const bodyClass = 'text-sm leading-7 text-slate-300';

export default function LegalScreen({ type, onBack }: LegalScreenProps) {
  const isTerms = type === 'terms';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to ReachWithUs
      </button>

      <header className="border-b border-slate-800 pb-8 mb-8">
        <div className="flex items-center gap-3 mb-3">
          {isTerms ? <FileText className="w-6 h-6 text-indigo-400" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">ReachWithUs Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
        </h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: September 13, 2026</p>
      </header>

      {isTerms ? (
        <div className="space-y-8">
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Acceptance of these terms</h2>
            <p className={bodyClass}>By accessing or using ReachWithUs, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, do not use the platform. You must provide accurate information and use the service only for lawful, professional business requirements.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>2. Professional and lawful use</h2>
            <p className={bodyClass}>ReachWithUs is a business requirement sourcing platform. Every post, image, document, message, phone number, and other submission must be genuine, relevant, respectful, and suitable for professional business activity.</p>
            <p className={bodyClass}>You must not post or share illegal, fraudulent, misleading, defamatory, abusive, threatening, discriminatory, hateful, sexually explicit, pornographic, obscene, exploitative, or otherwise inappropriate content. Sexual services, adult solicitations, harassment, scams, malware, unlawful goods or services, and content that infringes another person&apos;s rights are strictly prohibited.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>3. Content, moderation, and enforcement</h2>
            <p className={bodyClass}>You are responsible for the content you submit and for having the rights and permissions needed to use it. We may review, reject, edit for safety, restrict visibility, remove content, suspend accounts, or permanently terminate access when content or conduct violates these terms or creates risk for users or the platform.</p>
            <p className={bodyClass}>We may preserve and disclose information where reasonably necessary to comply with law, protect users, investigate abuse, prevent fraud, or enforce these terms. We do not guarantee that every prohibited post will be identified before publication.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>4. Accounts and user conduct</h2>
            <p className={bodyClass}>Keep your account credentials secure and do not impersonate another person or business, create deceptive accounts, scrape the service, interfere with platform security, or use contact information for spam. You are responsible for activity performed through your account.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>5. Connections, payments, and disclaimers</h2>
            <p className={bodyClass}>ReachWithUs helps users discover requirements and connect with potential suppliers or partners. We do not guarantee the accuracy, quality, legality, availability, pricing, delivery, or performance of any user, requirement, product, or service. Users must independently verify all business details and comply with applicable laws.</p>
            <p className={bodyClass}>Any subscription or access payment is subject to the terms shown at checkout. Unless required by law or expressly stated otherwise, platform access fees are non-refundable.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>6. Intellectual property and liability</h2>
            <p className={bodyClass}>ReachWithUs branding, software, design, and platform materials belong to ReachWithUs or its licensors. You retain ownership of your content while granting us permission to host, display, moderate, and distribute it as needed to operate and improve the service.</p>
            <p className={bodyClass}>To the maximum extent permitted by law, ReachWithUs is not liable for indirect losses, user-to-user disputes, lost profits, or actions taken based on user-submitted content. Nothing in these terms excludes liability that cannot legally be excluded.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>7. Changes and contact</h2>
            <p className={bodyClass}>We may update these terms when the platform or law changes. Continued use after an update means you accept the revised terms. Questions or reports about prohibited content should be sent through the support contact provided on the platform.</p>
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Information we collect</h2>
            <p className={bodyClass}>We may collect account details such as your name, email address, phone number, profile information, submitted requirements, uploaded files, subscription records, and communications with us. We also receive technical information such as device, browser, log, and approximate usage data needed to secure and operate the platform.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>2. How we use information</h2>
            <p className={bodyClass}>We use information to create and secure accounts, moderate content, publish approved requirements, enable user connections, process subscriptions, provide support, prevent fraud and abuse, improve the service, and comply with legal obligations.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>3. Sharing and disclosure</h2>
            <p className={bodyClass}>We share information only as needed to provide the service, including with infrastructure, payment, hosting, analytics, and security providers. Public posts may display the information you choose to include. Protected contact details may be masked or revealed only through the platform&apos;s access rules. We may disclose information to authorities or other parties when legally required or necessary to protect rights and safety.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>4. Retention and security</h2>
            <p className={bodyClass}>We retain information for as long as needed for the purposes described here, legal requirements, dispute resolution, and legitimate business records. We use reasonable administrative, technical, and organizational safeguards, but no online service can guarantee absolute security.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>5. Your choices and rights</h2>
            <p className={bodyClass}>Depending on applicable law, you may request access, correction, deletion, or a copy of your personal information, or object to certain processing. Some information must be retained for legal, security, or transaction purposes. Contact us through the support channel on the platform to make a request.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>6. Cookies and third-party services</h2>
            <p className={bodyClass}>The platform may use local storage, cookies, and similar technologies to keep you signed in, remember preferences, measure performance, and protect accounts. Third-party services may process information under their own privacy policies.</p>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>7. Updates and contact</h2>
            <p className={bodyClass}>We may update this Privacy Policy as our service or legal obligations change. The updated version will be posted on this page. If you have a privacy question or request, contact ReachWithUs through the support channel provided on the platform.</p>
          </section>
        </div>
      )}
    </article>
  );
}