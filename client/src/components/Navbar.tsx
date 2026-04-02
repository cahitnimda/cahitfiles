import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, MessageCircle, MapPin, Send } from "lucide-react";

interface NavbarProps {
  onGetQuoteClick?: () => void;
  onGetQuoteSubmit?: () => void;
}

export default function Navbar({ onGetQuoteClick, onGetQuoteSubmit }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [location] = useLocation();

  const [quoteForm, setQuoteForm] = useState({
    budget: "",
    funding: "",
    nonNegotiables: "",
    planningPermission: "",
    siteChallenges: "",
    timeline: "",
    deadlines: "",
    decisionMaker: "",
    updatePreference: [] as string[],
    fullName: "",
    email: "",
    phone: "",
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Projects" },
  ];

  const isActive = (href: string) => location === href;

  const handleGetQuoteOpen = () => {
    setShowQuoteModal(true);
    onGetQuoteClick?.();
  };

  const toggleUpdatePreference = (pref: string) => {
    setQuoteForm(prev => ({
      ...prev,
      updatePreference: prev.updatePreference.includes(pref)
        ? prev.updatePreference.filter(p => p !== pref)
        : [...prev.updatePreference, pref]
    }));
  };

  const handleQuoteSubmit = async () => {
    if (!quoteForm.fullName || !quoteForm.email) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "Quote Request",
          projectScope: `Budget: ${quoteForm.budget}, Funding: ${quoteForm.funding}, Non-negotiables: ${quoteForm.nonNegotiables}, Planning: ${quoteForm.planningPermission}, Site Challenges: ${quoteForm.siteChallenges}, Timeline: ${quoteForm.timeline}, Deadlines: ${quoteForm.deadlines}, Decision Maker: ${quoteForm.decisionMaker}, Updates: ${quoteForm.updatePreference.join(", ")}`,
          name: quoteForm.fullName,
          email: quoteForm.email,
          phone: quoteForm.phone,
        }),
      });
    } catch {}
    setQuoteSubmitted(true);
    onGetQuoteSubmit?.();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-sky-500 shadow-lg" data-testid="nav-main">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png" alt="Cahit Logo" className="h-14 w-auto" data-testid="img-logo" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition font-medium ${isActive(link.href) ? "text-white border-b-2 border-white pb-1" : "text-white/90 hover:text-white"}`}
                data-testid={`link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setShowContactPopup(true)}
              className="text-white/90 hover:text-white transition font-medium"
              data-testid="button-contact-nav"
            >
              Contact
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-white text-sky-600 hover:bg-sky-50 font-semibold hidden sm:inline-flex"
              onClick={handleGetQuoteOpen}
              data-testid="button-get-quote"
            >
              Get Quote
            </Button>
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-sky-600 border-t border-sky-400 px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block transition font-medium ${isActive(link.href) ? "text-white" : "text-white/80 hover:text-white"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setShowContactPopup(true); setMobileMenuOpen(false); }}
              className="block text-white/80 hover:text-white transition font-medium w-full text-left"
            >
              Contact
            </button>
          </div>
        )}
      </nav>

      {showContactPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          data-testid="modal-contact"
          onClick={(e) => { if (e.target === e.currentTarget) setShowContactPopup(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900" data-testid="text-contact-title">Contact Us</h2>
              <button onClick={() => setShowContactPopup(false)} className="text-slate-400 hover:text-slate-600 transition" data-testid="button-close-contact">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-5">
              <a href="tel:+96824112406" className="flex items-start gap-4 p-4 rounded-lg hover:bg-sky-50 transition cursor-pointer group" data-testid="link-phone">
                <Phone className="w-6 h-6 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-sky-600 transition">Call Us</p>
                  <p className="text-slate-600">+968 2411 2406 Ext 101</p>
                  <p className="text-slate-600">+968 9096 6562</p>
                </div>
              </a>
              <a href="mailto:ctc@cahitcontracting.com" className="flex items-start gap-4 p-4 rounded-lg hover:bg-sky-50 transition cursor-pointer group" data-testid="link-email">
                <Mail className="w-6 h-6 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-sky-600 transition">Email Us</p>
                  <p className="text-slate-600">ctc@cahitcontracting.com</p>
                </div>
              </a>
              <a href="https://wa.me/96890966562" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-lg hover:bg-sky-50 transition cursor-pointer group" data-testid="link-whatsapp">
                <MessageCircle className="w-6 h-6 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-sky-600 transition">WhatsApp</p>
                  <p className="text-slate-600">+968 9096 6562</p>
                </div>
              </a>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
                <MapPin className="w-6 h-6 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Address</p>
                  <p className="text-slate-600 text-sm">Khaleej Tower<br />6th Floor, No. 603<br />Ghala, Muscat<br />Sultanate of Oman</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuoteModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          data-testid="modal-quote"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQuoteModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#0E6BA8] px-6 py-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white italic" data-testid="text-quote-title">Request a Quote</h2>
                <p className="text-white/80 text-sm mt-1">Tell us about your project and we'll prepare a tailored proposal</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-white/70 hover:text-white transition" data-testid="button-close-quote">
                <X className="w-6 h-6" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Submitted!</h3>
                <p className="text-slate-600 mb-6">Thank you for your interest. Our team will review your project details and get back to you within 24 hours.</p>
                <Button onClick={() => setShowQuoteModal(false)} className="bg-sky-600 hover:bg-sky-700 text-white" data-testid="button-close-quote-success">
                  Close
                </Button>
              </div>
            ) : (
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-[#0E6BA8] uppercase tracking-wider mb-4">Project Details</h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">1. What is your budget range for this project?</label>
                      <select
                        value={quoteForm.budget}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white"
                        data-testid="select-budget"
                      >
                        <option value="">Select an option</option>
                        <option value="Under $500K">Under $500K</option>
                        <option value="$500K - $2M">$500K - $2M</option>
                        <option value="$2M - $10M">$2M - $10M</option>
                        <option value="$10M+">$10M+</option>
                        <option value="Not sure yet">Not sure yet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">2. Is your funding already secured and ready to go?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Yes", "Not yet", "Partially"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setQuoteForm(prev => ({ ...prev, funding: opt }))}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${quoteForm.funding === opt ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}
                            data-testid={`button-funding-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">3. What are your non-negotiables? And what's flexible?</label>
                      <textarea
                        value={quoteForm.nonNegotiables}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, nonNegotiables: e.target.value }))}
                        placeholder="E.g., specific materials, timeline constraints, quality standards..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none h-20"
                        data-testid="input-non-negotiables"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">4. Do you have planning permission, or do we need to factor that in?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Yes, I have it", "Need to obtain", "Not sure"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setQuoteForm(prev => ({ ...prev, planningPermission: opt }))}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${quoteForm.planningPermission === opt ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}
                            data-testid={`button-planning-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">5. Are there any site-specific challenges or restrictions we should know about?</label>
                      <textarea
                        value={quoteForm.siteChallenges}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, siteChallenges: e.target.value }))}
                        placeholder="E.g., access limitations, environmental concerns, soil conditions..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none h-20"
                        data-testid="input-site-challenges"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">6. When would you like the work to start and finish?</label>
                      <input
                        type="text"
                        value={quoteForm.timeline}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="E.g., Start in Q2 2026, complete by end of 2026"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        data-testid="input-timeline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">7. Are there any important deadlines we should work around?</label>
                      <input
                        type="text"
                        value={quoteForm.deadlines}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, deadlines: e.target.value }))}
                        placeholder="E.g., regulatory deadlines, event dates, seasonal constraints..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        data-testid="input-deadlines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">8. Who is the main point of contact or decision-maker?</label>
                      <input
                        type="text"
                        value={quoteForm.decisionMaker}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, decisionMaker: e.target.value }))}
                        placeholder="Name and role of the decision-maker"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        data-testid="input-decision-maker"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">9. How would you prefer to receive updates?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Email", "WhatsApp", "Weekly Meetings", "Phone Calls"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => toggleUpdatePreference(opt)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${quoteForm.updatePreference.includes(opt) ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}
                            data-testid={`button-update-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-[#0E6BA8] uppercase tracking-wider mb-4">Your Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={quoteForm.fullName}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        data-testid="input-quote-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        data-testid="input-quote-email"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-800 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+968 XXXX XXXX"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      data-testid="input-quote-phone"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleQuoteSubmit}
                  disabled={!quoteForm.fullName || !quoteForm.email}
                  className="w-full bg-[#0E6BA8] hover:bg-[#0A5C92] text-white font-bold py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-submit-quote"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Quote Request
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
