import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, X, Anchor, Building2, Mountain, Droplets, Wrench, Shield, Clock, Award } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { clientLogos as importedLogos } from "@/lib/logos";
import ProgressiveFunnelPanel, { useProgressiveFunnel } from "@/components/LeadQualificationFunnel";
import ChatBotWidget from "@/components/ChatBotWidget";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import tahirVideoSrc from "@assets/Tahir_Sneyurt_intro__1773101636079.mp4";
import pashaVideoSrc from "@assets/Padhs_Huseyin_into__1773101636077.mp4";

const aboutRollingImages = [
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg", alt: "Road construction with heavy rollers" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GjfldJYeoGyqGIMR.jpeg", alt: "Asphalt paving with Vogele machine" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/mejIiORMfOESXWxO.jpeg", alt: "Road line marking operations" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/jdGZtMFCClzefYrV.png", alt: "Underground pipe installation" },
];

function AboutRollingImages() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % aboutRollingImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden shadow-xl" data-testid="about-rolling-images">
      {aboutRollingImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeIndex ? "opacity-100" : "opacity-0"}`}
        >
          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [counters, setCounters] = useState({ years: 0, projects: 0, satisfaction: 0 });
  const [counters2, setCounters2] = useState({ years: 0, projects: 0, percent: 0 });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasScrolled2, setHasScrolled2] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const funnel = useProgressiveFunnel();

  useEffect(() => {
    if (!hasScrolled) return;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCounters({
        years: Math.floor(15 * progress),
        projects: Math.floor(50 * progress),
        satisfaction: Math.floor(100 * progress),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [hasScrolled]);

  useEffect(() => {
    if (!hasScrolled2) return;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCounters2({
        years: Math.floor(15 * progress),
        projects: Math.floor(50 * progress),
        percent: Math.floor(100 * progress),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [hasScrolled2]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 300) setHasScrolled(true);
      const statsSection = document.getElementById("stats-section");
      if (!hasScrolled2 && statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) setHasScrolled2(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled, hasScrolled2]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFunnelModal) setShowFunnelModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFunnelModal]);

  const handleVideoHover = (key: string, isHovering: boolean, keepPlaying = false) => {
    const video = videoRefs.current[key];
    if (video) {
      if (isHovering) {
        video.muted = false;
        video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
      } else {
        video.muted = true;
        if (!keepPlaying) {
          video.pause();
          video.currentTime = 0;
        }
      }
    }
  };

  const services = [
    { id: "marine", name: "Marine & Coastal Construction", icon: Anchor, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EGRSgZmJXJSrWKJY.png", description: "Design and construction of marine infrastructure including breakwaters, quay walls, revetments, dredging, and coastal protection systems." },
    { id: "infrastructure", name: "Infrastructure Development", icon: Building2, images: ["https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg", "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GjfldJYeoGyqGIMR.jpeg", "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GORAtqFGJlEPryhc.jpeg", "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/mejIiORMfOESXWxO.jpeg"], description: "Civil infrastructure development including utilities, industrial facilities, and integrated project delivery solutions." },
    { id: "earthworks", name: "Earthworks", icon: Mountain, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/hMZPCXiHvRhErvHk.gif", description: "Bulk excavation, grading, compaction, and large-scale site preparation using modern heavy equipment." },
    { id: "dewatering", name: "Dewatering & Shoring", icon: Droplets, image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/NHQbvhqluSlDGrrN.png", description: "Advanced groundwater control systems and structural support solutions ensuring safe and stable construction environments." },
    { id: "mep", name: "MEP Works", icon: Wrench, images: ["https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/qZRtUjMizSFySgTf.png", "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/QHXkfNaKCsHdvVIH.jpeg", "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/ZSgHztstBUeAueGA.jpeg"], description: "Mechanical, electrical and plumbing systems supporting industrial facilities, infrastructure and utility projects." },
  ];

  const marineCapabilities = [
    "Sea Harbors", "Breakwaters and Groynes", "Coastal Protection Systems", "Rock Armour Installation",
    "Geotextile Protection", "Beach Reclamation", "Dredging", "Underwater Excavation",
    "Boat Ramps and Pontoons", "Quay Wall Construction",
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      <Navbar onGetQuoteClick={funnel.suppressFunnel} onGetQuoteSubmit={funnel.suppressFunnel} />

      <section className="relative min-h-screen flex items-center overflow-hidden" onMouseMove={funnel.handleHeroMouseMove} onMouseLeave={() => { funnel.handleHeroMouseLeave(); handleVideoHover("hero", false, true); }} onMouseEnter={() => handleVideoHover("hero", true, true)} data-testid="section-hero">
        <video ref={(el) => { if (el) videoRefs.current["hero"] = el; }} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/FtuVECRYiIRERWQB.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,100,140,0.85)] via-[rgba(20,130,170,0.70)] to-[rgba(60,180,220,0.30)] z-10"></div>
        <div className="relative z-20 w-full h-full flex items-center">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6 drop-shadow-lg" data-testid="text-hero-title">
                CAHIT CONTRACTING
                <br />
                <span className="text-cyan-200">A Solid Ground</span>
                <br />
                For Your Project
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-10 font-light drop-shadow-md max-w-2xl" data-testid="text-hero-subtitle">
                Marine & Coastal Construction Experts
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/services">
                  <Button size="lg" className="bg-white text-sky-700 hover:bg-cyan-50 font-bold text-sm px-6 py-3 shadow-lg w-full sm:w-auto" data-testid="button-hero-consultation">
                    Schedule Consultation <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" className="bg-cyan-300/20 border-2 border-white text-white hover:bg-white/20 font-bold text-sm px-6 py-3 backdrop-blur-sm shadow-lg w-full sm:w-auto" data-testid="button-hero-portfolio">
                    View Portfolio
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-6 md:pt-8 border-t border-white/30">
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md" data-testid="text-counter-years">{counters.years}+</div>
                  <div className="text-xs sm:text-sm text-white/80 font-light">Years Experience</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md" data-testid="text-counter-projects">{counters.projects}+</div>
                  <div className="text-xs sm:text-sm text-white/80 font-light">Projects Completed</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md" data-testid="text-counter-satisfaction">{counters.satisfaction}%</div>
                  <div className="text-xs sm:text-sm text-white/80 font-light">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {funnel.heroVisible && (
          <ProgressiveFunnelPanel currentSection="hero" onStepComplete={funnel.handleStepComplete} globalStep={funnel.globalStep} mouseActive={funnel.heroVisible} onPanelInteract={funnel.markPanelInteracting} onPanelFocus={funnel.markPanelFocused} onDismiss={funnel.dismissPanel} />
        )}
      </section>

      <section className="py-14 bg-white overflow-hidden" data-testid="section-logos">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-3" data-testid="text-logos-title">Trusted by Leading Organizations</h2>
          <p className="text-center text-slate-700 max-w-3xl mx-auto mb-10 text-base leading-relaxed">
            Cahit Trading & Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
            <div className="flex animate-marquee gap-12 items-center">
              {[...importedLogos, ...importedLogos].map((logo, idx) => (
                <div key={idx} className="flex-shrink-0 flex items-center justify-center h-20 w-[160px] bg-white rounded-xl border border-slate-200 p-2 hover:border-sky-300 hover:shadow-lg transition-all group cursor-pointer">
                  <img src={logo.logo} alt={logo.name} className="h-16 max-w-[150px] object-contain transition-all duration-300 opacity-80 group-hover:opacity-100" data-testid={`img-logo-${idx}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about-section" className="py-20 bg-white relative" onMouseMove={funnel.handleAboutMouseMove} onMouseLeave={funnel.handleAboutMouseLeave} data-testid="section-about">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative" onMouseEnter={() => handleVideoHover("about", true)} onMouseLeave={() => handleVideoHover("about", false)}>
              <video ref={(el) => { if (el) videoRefs.current["about"] = el; }} className="w-full rounded-2xl shadow-xl cursor-pointer" loop>
                <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/AtcBFtPQatxcgPuw.mp4" type="video/mp4" />
              </video>
              <AboutRollingImages />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6" data-testid="text-about-title">Engineering the Foundations of Tomorrow</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cahit Trading & Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded by Tahir Şenyurt, the company has developed into a trusted contractor delivering complex projects across marine construction, infrastructure development, earthworks, and industrial services.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Through a combination of engineering expertise, operational excellence, and strong client partnerships, Cahit contributes to the development of critical infrastructure across Oman.
              </p>
              <Link href="/about">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold" data-testid="button-discover-company">
                  Discover Our Company <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {funnel.aboutVisible && (
          <ProgressiveFunnelPanel currentSection="about" onStepComplete={funnel.handleStepComplete} globalStep={funnel.globalStep} mouseActive={funnel.aboutVisible} onPanelInteract={funnel.markPanelInteracting} onPanelFocus={funnel.markPanelFocused} onDismiss={funnel.dismissPanel} />
        )}
      </section>

      <section id="services-section" className="py-20 relative overflow-hidden border-0" onMouseEnter={() => handleVideoHover("services", true, true)} onMouseLeave={() => handleVideoHover("services", false, true)} data-testid="section-expertise">
        <video ref={(el) => { if (el) videoRefs.current["services"] = el; }} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/FtuVECRYiIRERWQB.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/75 via-gray-700/70 to-gray-800/75"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-expertise-title">Our Services</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Our diverse expertise allows us to support complex infrastructure projects across multiple sectors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow border-0 bg-white/60 backdrop-blur-sm" data-testid={`card-service-${service.id}`}>
                <div className="relative h-64 overflow-hidden bg-slate-200">
                  <img src={"images" in service && service.images ? service.images[0] : service.image} alt={service.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600 mb-4 text-sm">{service.description}</p>
                  <Link href="/services" className="text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-2 text-sm">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services">
              <Button className="bg-white text-sky-600 hover:bg-sky-50 font-semibold" data-testid="button-view-all-services">
                View All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-28 overflow-hidden" onMouseEnter={() => handleVideoHover("marine", true, true)} onMouseLeave={() => handleVideoHover("marine", false, true)} data-testid="section-marine">
        <video ref={(el) => { if (el) videoRefs.current["marine"] = el; }} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/FtuVECRYiIRERWQB.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-800/50 via-sky-700/45 to-sky-800/50"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">Specialists in Marine & Coastal Infrastructure</h2>
            <p className="text-lg text-sky-100 leading-relaxed max-w-3xl mx-auto">
              Cahit Trading & Contracting LLC is recognized for its expertise in the construction of marine and coastal infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {marineCapabilities.map((cap, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition border border-white/20">
                <Anchor className="w-6 h-6 mx-auto mb-2 text-cyan-300" />
                <p className="text-sm font-medium">{cap}</p>
              </div>
            ))}
          </div>
          <p className="text-sky-200/70 text-center mt-8 max-w-2xl mx-auto text-sm">
            Through advanced engineering practices and experienced teams, we deliver durable infrastructure designed for challenging marine environments.
          </p>
        </div>
      </section>

      <section id="stats-section" className="py-16 bg-white" data-testid="section-stats">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Delivering Infrastructure Excellence</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600">{counters2.years}+</div>
              <p className="text-slate-600 text-sm mt-2">Years Industry Leadership Experience</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600">{counters2.projects}+</div>
              <p className="text-slate-600 text-sm mt-2">Major Infrastructure Projects Delivered</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600">{counters2.percent}%</div>
              <p className="text-slate-600 text-sm mt-2">Operations Across Oman</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600">#1</div>
              <p className="text-slate-600 text-sm mt-2">Marine & Infrastructure Specialists</p>
            </div>
          </div>
        </div>
      </section>

      <section id="projects-section" className="py-20 bg-white relative" onMouseMove={funnel.handleProjectsMouseMove} onMouseLeave={funnel.handleProjectsMouseLeave} data-testid="section-projects">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4" data-testid="text-projects-title">Selected Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow" data-testid="card-project-seaport">
              <div className="relative aspect-square overflow-hidden bg-slate-200">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/ScxGkCDjPFNOhvON.png" alt="Seaport Infrastructure" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Seaport Infrastructure</h3>
                <p className="text-sky-600 text-sm font-medium mb-2">Muscat, Oman</p>
                <p className="text-slate-600 text-sm">Quay wall construction and breakwater installation</p>
              </div>
            </div>
            <div className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow" data-testid="card-project-coastal">
              <div className="relative aspect-square overflow-hidden bg-slate-200">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/zrgzKMxwmxJkeDsu.jpg" alt="Coastal Protection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Coastal Protection Systems</h3>
                <p className="text-sky-600 text-sm font-medium mb-2">Salalah, Oman</p>
                <p className="text-slate-600 text-sm">Rock armour installation and coastal defense</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/projects">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold" data-testid="button-explore-projects">
                Explore All Projects <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        {funnel.projectsVisible && (
          <ProgressiveFunnelPanel currentSection="projects" onStepComplete={funnel.handleStepComplete} globalStep={funnel.globalStep} mouseActive={funnel.projectsVisible} onPanelInteract={funnel.markPanelInteracting} onPanelFocus={funnel.markPanelFocused} onDismiss={funnel.dismissPanel} />
        )}
      </section>

      <section className="py-20 bg-white" data-testid="section-leadership">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-testid="text-leadership-title">Leadership</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet the professionals behind Cahit Trading & Contracting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100" data-testid="card-testimonial-tahir">
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

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100" data-testid="card-testimonial-pasha">
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

      <section className="py-16 bg-white" data-testid="section-commitment">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">Our Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 rounded-2xl mb-6 group-hover:bg-sky-100 transition-colors group-hover:scale-110 transform duration-300">
                <Shield className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Best Quality</h3>
              <p className="text-slate-600 text-sm leading-relaxed">We maintain the highest engineering and construction standards in every project.</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 rounded-2xl mb-6 group-hover:bg-sky-100 transition-colors group-hover:scale-110 transform duration-300">
                <Clock className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">On-Time Delivery</h3>
              <p className="text-slate-600 text-sm leading-relaxed">We respect project timelines and deliver reliable execution without compromising quality.</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 rounded-2xl mb-6 group-hover:bg-sky-100 transition-colors group-hover:scale-110 transform duration-300">
                <Award className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Experience</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Our experienced professionals ensure efficient project delivery and operational excellence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-500 to-sky-600" data-testid="section-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6" data-testid="text-cta-title">Let's Build Your Next Project</h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Whether planning marine infrastructure, coastal protection, or large-scale civil works, our team is ready to support your project with reliable expertise and professional execution.
          </p>
          <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 font-semibold" data-testid="button-cta-contact">
            Contact Our Team <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {showFunnelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="modal-funnel" onClick={(e) => { if (e.target === e.currentTarget) setShowFunnelModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Get a Free Consultation</h2>
              <button onClick={() => setShowFunnelModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-6 h-6" /></button>
            </div>
            <ProgressiveFunnelPanel currentSection={funnel.globalStep === 1 ? "hero" : funnel.globalStep === 2 ? "about" : "projects"} onStepComplete={funnel.handleStepComplete} globalStep={funnel.globalStep} mouseActive={true} onPanelInteract={funnel.markPanelInteracting} onPanelFocus={funnel.markPanelFocused} onDismiss={() => setShowFunnelModal(false)} inline />
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-6 z-40 md:hidden">
        <Button size="lg" className="bg-sky-600 text-white hover:bg-sky-700 shadow-xl rounded-full px-6 py-4 font-semibold" onClick={() => setShowFunnelModal(true)} data-testid="button-mobile-cta">
          Get Quote <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      <Footer />
      <ChatBotWidget />
    </div>
  );
}
