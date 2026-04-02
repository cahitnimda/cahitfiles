import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Clock, Award } from "lucide-react";
import { clientLogos as importedLogos } from "@/lib/logos";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBotWidget from "@/components/ChatBotWidget";
import tahirVideoSrc from "@assets/Tahir_Sneyurt_intro__1773101636079.mp4";
import pashaVideoSrc from "@assets/Padhs_Huseyin_into__1773101636077.mp4";

const rollingImages = [
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg", alt: "Road construction" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GjfldJYeoGyqGIMR.jpeg", alt: "Asphalt paving" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/jdGZtMFCClzefYrV.png", alt: "Pipe installation" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/KwvgeYAlpTuNmOVB.png", alt: "Concrete formwork" },
];

export default function About() {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % rollingImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoHover = (key: string, isHovering: boolean) => {
    const video = videoRefs.current[key];
    if (video) {
      if (isHovering) {
        video.muted = false;
        video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
      } else {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative h-[180px] overflow-hidden border-0" data-testid="section-about-hero">
        <img
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png"
          alt="Infrastructure aerial"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E6BA8]/85 to-[#0A5C92]/75"></div>
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-2xl md:text-3xl font-bold italic text-white" data-testid="text-about-heading">About Us</h1>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-2xl">
              Cahit Trading & Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-0" data-testid="section-company-overview">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-testid="text-overview-title">Company Overview</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Building critical infrastructure across Oman since 2009</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <video ref={(el) => { if (el) videoRefs.current["overview"] = el; }} className="w-full rounded-2xl shadow-xl cursor-pointer" loop muted onMouseEnter={() => handleVideoHover("overview", true)} onMouseLeave={() => handleVideoHover("overview", false)}>
                <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/AtcBFtPQatxcgPuw.mp4" type="video/mp4" />
              </video>
              <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden shadow-xl" data-testid="about-rolling-images">
                {rollingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeImageIndex ? "opacity-100" : "opacity-0"}`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cahit Trading & Contracting LLC has been operating in Oman since 2009, delivering a wide range of construction and infrastructure services.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                The company has successfully participated in major projects across marine construction, infrastructure development and industrial services.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Through experienced leadership and skilled engineering teams, Cahit continues to contribute to the development of critical infrastructure throughout the region.
              </p>
              <Link href="/services">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold" data-testid="button-view-services">
                  View Our Services <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-0" data-testid="section-stats">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600" data-testid="stat-years">15+</div>
              <p className="text-slate-600 text-sm mt-2">Years Experience</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600" data-testid="stat-projects">50+</div>
              <p className="text-slate-600 text-sm mt-2">Projects Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600" data-testid="stat-satisfaction">100%</div>
              <p className="text-slate-600 text-sm mt-2">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-0" data-testid="section-mission-vision">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-sky-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To apply our knowledge and experience in the construction industry to deliver high-quality infrastructure projects while contributing to the development of Oman.
              </p>
            </div>
            <div className="bg-sky-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To become a leading regional contractor recognized for excellence in marine construction, infrastructure development and industrial services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 border-0" data-testid="section-leadership">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4" data-testid="text-leadership-title">Leadership</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet the professionals behind Cahit Trading & Contracting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="card-leader-tahir">
              <div className="relative h-64 bg-slate-900 cursor-pointer group flex items-center justify-center" onMouseEnter={() => handleVideoHover("tahir", true)} onMouseLeave={() => handleVideoHover("tahir", false)}>
                <video ref={(el) => { if (el) videoRefs.current["tahir"] = el; }} className="w-[85%] h-[85%] object-contain" loop muted>
                  <source src={tahirVideoSrc} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded">Hover to Watch</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">Tahir Şenyurt</h3>
                <p className="text-sky-600 font-semibold text-sm mb-4">Managing Director</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Tahir Şenyurt is a Civil Engineer with over 25 years of experience in the construction and contracting industry. He has successfully led numerous projects including marine infrastructure, road construction, industrial facilities and residential developments across Turkey and the GCC.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  As Managing Director of Cahit Trading & Contracting LLC, he leads the company's operations and strategic growth within Oman's construction sector.
                </p>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Education</p>
                    <p className="text-sm text-slate-700">Bachelor of Civil Engineering — University of Middle East Technical</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">License</p>
                    <p className="text-sm text-slate-700">Registered Civil Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="card-leader-pasha">
              <div className="relative h-64 bg-slate-900 cursor-pointer group flex items-center justify-center" onMouseEnter={() => handleVideoHover("pasha", true)} onMouseLeave={() => handleVideoHover("pasha", false)}>
                <video ref={(el) => { if (el) videoRefs.current["pasha"] = el; }} className="w-[85%] h-[85%] object-contain" loop muted>
                  <source src={pashaVideoSrc} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded">Hover to Watch</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">Pasha Hüseyin Ari</h3>
                <p className="text-sky-600 font-semibold text-sm mb-4">General Coordinator</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Pasha Hüseyin Ari holds a Master's degree in Environmental Engineering from Istanbul Technical University and brings over 15 years of experience in environmental and infrastructure-related sectors.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  His expertise includes water treatment systems, desalination plants, soil improvement projects, marine construction and Oil & Gas infrastructure works.
                </p>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Education</p>
                    <p className="text-sm text-slate-700">MSc of Environmental Engineering — Istanbul Technical University</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">License</p>
                    <p className="text-sm text-slate-700">Registered Environmental Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-0" data-testid="section-commitment">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-sky-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Best Quality</h3>
              <p className="text-slate-600 text-sm">We maintain the highest engineering and construction standards in every project.</p>
            </div>
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition">
              <Clock className="w-12 h-12 text-sky-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">On-Time Delivery</h3>
              <p className="text-slate-600 text-sm">We respect project timelines and deliver reliable execution without compromising quality.</p>
            </div>
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition">
              <Award className="w-12 h-12 text-sky-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Experience</h3>
              <p className="text-slate-600 text-sm">Our experienced professionals ensure efficient project delivery and operational excellence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-0" data-testid="section-clients">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Trusted by Leading Organizations</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {importedLogos.map((logo, idx) => (
              <div key={idx} className="flex items-center justify-center h-24 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all group cursor-pointer p-4">
                <img src={logo.logo} alt={logo.name} className="h-14 max-w-[120px] object-contain transition-all duration-300" data-testid={`img-about-logo-${idx}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ChatBotWidget />
    </div>
  );
}
