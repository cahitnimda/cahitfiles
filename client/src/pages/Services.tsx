import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBotWidget from "@/components/ChatBotWidget";
import servicesGifPath from "@assets/Services__1773095450245.gif";

export default function Services() {
  const services = [
    {
      id: "marine",
      name: "Marine & Coastal Construction",
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/eErINryfjAMBHdEq.png",
      description: "Cahit Trading & Contracting LLC provides specialized marine construction services including:",
      details: ["Sea Harbors", "Breakwaters", "Groynes", "Revetments"],
    },
    {
      id: "infrastructure",
      name: "Infrastructure Development",
      images: [
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GjfldJYeoGyqGIMR.jpeg",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/GORAtqFGJlEPryhc.jpeg",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/mejIiORMfOESXWxO.jpeg",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/jdGZtMFCClzefYrV.png",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/KwvgeYAlpTuNmOVB.png",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/dSXvJZPDnnYBewLl.png",
      ],
      description: "Infrastructure projects today require innovative engineering solutions and advanced construction techniques. Cahit delivers infrastructure solutions including utilities, roads and industrial facilities.",
    },
    {
      id: "earthworks",
      name: "Earthworks",
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/hMZPCXiHvRhErvHk.gif",
      description: "We provide comprehensive earthworks services including excavation, grading, leveling and compaction for infrastructure projects and construction sites.",
    },
    {
      id: "dewatering",
      name: "Dewatering & Shoring",
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/eErINryfjAMBHdEq.png",
      description: "We design and implement advanced groundwater control systems including:",
      details: ["Wellpoint systems", "Deep wells", "Sheet piling", "Soldier walls"],
    },
    {
      id: "mep",
      name: "MEP Works",
      images: [
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/qZRtUjMizSFySgTf.png",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/QHXkfNaKCsHdvVIH.jpeg",
        "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/ZSgHztstBUeAueGA.jpeg",
      ],
      description: "Our MEP services include:",
      details: ["Water & Wastewater Treatment", "Pumping Stations", "Industrial Piping", "Irrigation Systems"],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative h-[180px] overflow-hidden" data-testid="section-services-hero">
        <img
          src={servicesGifPath}
          alt="Services"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E6BA8]/85 to-[#0A5C92]/75"></div>
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-2xl md:text-3xl font-bold italic text-white" data-testid="text-services-heading">Our Services</h1>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-2xl">
              Our diverse expertise allows us to support complex infrastructure projects across multiple sectors.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="section-services-list">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow" data-testid={`service-${service.id}`}>
                <div className="relative h-56 overflow-hidden">
                  <img src={"images" in service && service.images ? service.images[0] : service.image} alt={service.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{service.description}</p>
                  {"details" in service && service.details && (
                    <ul className="space-y-2">
                      {service.details.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                          <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-500 to-sky-600" data-testid="section-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Let's Build Your Next Project</h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Whether planning marine infrastructure, coastal protection, or large-scale civil works, our team is ready to support your project with reliable expertise and professional execution.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 font-semibold" data-testid="button-cta-contact">
              Contact Our Team <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <ChatBotWidget />
    </div>
  );
}
