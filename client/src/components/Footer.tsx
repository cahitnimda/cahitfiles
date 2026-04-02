import { useState } from "react";
import { MapPin, Phone, Mail, Lock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Footer() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [, navigate] = useLocation();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <footer className="bg-slate-900 text-white pt-16 pb-8" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png"
                alt="Cahit Logo"
                className="h-10 w-auto mb-4"
                data-testid="img-footer-logo"
              />
              <p className="text-slate-400 text-sm leading-relaxed">
                Cahit Trading & Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition text-start" data-testid="footer-link-home">Home</button></li>
                <li><button onClick={() => scrollTo("about-section")} className="hover:text-white transition text-start" data-testid="footer-link-about">About</button></li>
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start" data-testid="footer-link-services">Services</button></li>
                <li><button onClick={() => scrollTo("projects-section")} className="hover:text-white transition text-start" data-testid="footer-link-projects">Projects</button></li>
                <li><button onClick={() => scrollTo("testimonials-section")} className="hover:text-white transition text-start" data-testid="footer-link-testimonials">Testimonials</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Our Services</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start">Marine & Coastal Construction</button></li>
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start">Infrastructure Development</button></li>
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start">Earthworks</button></li>
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start">Dewatering & Shoring</button></li>
                <li><button onClick={() => scrollTo("expertise-section")} className="hover:text-white transition text-start">MEP Works</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <div className="space-y-3 text-slate-400 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Khaleej Tower</p>
                    <p>6th Floor, No. 603</p>
                    <p>Ghala, Muscat, Sultanate of Oman</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <a href="tel:+96824112406" className="hover:text-white transition">+968 2411 2406 Ext 101</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <a href="tel:+96890966562" className="hover:text-white transition">+968 9096 6562</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <a href="mailto:ctc@cahitcontracting.com" className="hover:text-white transition">ctc@cahitcontracting.com</a>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-slate-500 hover:text-slate-300 transition text-xs mt-4 flex items-center gap-1.5"
                  data-testid="button-admin-login"
                >
                  <Lock className="w-3 h-3" />
                  Admin Login
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm" data-testid="text-copyright">
              &copy; 2025 Cahit Trading & Contracting LLC. All Rights Reserved.
            </p>
            <p className="text-slate-500 text-xs">A Solid Ground For Your Project</p>
          </div>
        </div>
      </footer>

      {showLogin && (
        <AdminLoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
          onSuccess={() => { setShowLogin(false); navigate("/admin"); }}
        />
      )}

      {showRegister && (
        <AdminRegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
    </>
  );
}

function AdminLoginModal({ onClose, onSwitchToRegister, onSuccess }: { onClose: () => void; onSwitchToRegister: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", "/api/admin/login", { email, password });
      onSuccess();
    } catch (err: any) {
      setError(err.message?.includes("403") ? "Account pending approval" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} data-testid="modal-admin-login">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Admin Login</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" data-testid="button-close-admin-login"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg" data-testid="text-login-error">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900" placeholder="admin@example.com" data-testid="input-admin-email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900" placeholder="••••••••" data-testid="input-admin-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#0A3D6B] hover:bg-[#0D5A9E] text-white" data-testid="button-admin-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-sky-600 hover:text-sky-700 font-medium" data-testid="button-switch-register">Register</button>
        </p>
      </div>
    </div>
  );
}

function AdminRegisterModal({ onClose, onSwitchToLogin }: { onClose: () => void; onSwitchToLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/admin/register", { username, email, password });
      const data = await res.json();
      if (data.admin?.isApproved) {
        setSuccess("Account created and approved! You can now log in.");
      } else {
        setSuccess("Registration submitted. An existing admin will need to approve your account.");
      }
    } catch (err: any) {
      setError(err.message?.includes("400") ? "Email already registered" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} data-testid="modal-admin-register">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Admin Registration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" data-testid="button-close-admin-register"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900" placeholder="John Doe" data-testid="input-register-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900" placeholder="admin@example.com" data-testid="input-register-email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900" placeholder="Minimum 6 characters" data-testid="input-register-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#0A3D6B] hover:bg-[#0D5A9E] text-white" data-testid="button-register-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Register
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-sky-600 hover:text-sky-700 font-medium" data-testid="button-switch-login">Sign In</button>
        </p>
      </div>
    </div>
  );
}
