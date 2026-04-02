import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Clock, User, Mail, Phone, X } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

type FunnelStep = 1 | 2 | 3 | 4;

interface ProgressiveFunnelProps {
  currentSection: string;
  onStepComplete: (completedStep: number, scrollTarget?: string) => void;
  globalStep: FunnelStep;
  mouseActive: boolean;
  onPanelInteract?: (section: string, interacting: boolean) => void;
  onPanelFocus?: (section: string, focused: boolean) => void;
  onDismiss?: (section: string) => void;
  inline?: boolean;
}

const SelectOption = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    data-testid={`option-${label.toLowerCase().replace(/\s+/g, '-')}`}
    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
      selected
        ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
        : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50"
    }`}
  >
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-sky-500 bg-sky-500" : "border-slate-300"
      }`}
    >
      {selected && <Check className="w-3 h-3 text-white" />}
    </div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const ProgressBar = ({ step }: { step: FunnelStep }) => {
  const progress = step === 4 ? 100 : ((step - 1) / 3) * 100;
  return (
    <div className="mb-5">
      <div className="flex justify-between gap-1 text-xs text-slate-500 mb-2">
        <span className={step >= 1 ? "text-sky-600 font-semibold" : ""}>Step 1: Needs</span>
        <span className={step >= 2 ? "text-sky-600 font-semibold" : ""}>Step 2: Scope</span>
        <span className={step >= 3 ? "text-sky-600 font-semibold" : ""}>Step 3: Details</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export function useProgressiveFunnel() {
  const [globalStep, setGlobalStep] = useState<FunnelStep>(1);
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({});
  const [heroVisible, setHeroVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [expertiseVisible, setExpertiseVisible] = useState(false);
  const [projectsVisible, setProjectsVisible] = useState(false);
  const [suppressed, setSuppressed] = useState(false);

  const ref = useRef({
    globalStep: 1 as FunnelStep,
    stepCompleted: {} as Record<number, boolean>,
    dismissed: { hero: false, about: false, expertise: false, projects: false } as Record<string, boolean>,
    inactivityTimeouts: {} as Record<string, ReturnType<typeof setTimeout> | null>,
    inputFocused: { hero: false, about: false, expertise: false, projects: false } as Record<string, boolean>,
    lastActivity: {} as Record<string, number>,
    suppressed: false,
  });

  const clearInactivityTimeout = useCallback((section: string) => {
    const timeout = ref.current.inactivityTimeouts[section];
    if (timeout) {
      clearTimeout(timeout);
      ref.current.inactivityTimeouts[section] = null;
    }
  }, []);

  const startInactivityTimeout = useCallback((section: string) => {
    clearInactivityTimeout(section);
    if (ref.current.inputFocused[section]) return;

    ref.current.inactivityTimeouts[section] = setTimeout(() => {
      if (!ref.current.inputFocused[section]) {
        if (section === "hero") setHeroVisible(false);
        if (section === "about") setAboutVisible(false);
        if (section === "expertise") setExpertiseVisible(false);
        if (section === "projects") setProjectsVisible(false);
      }
    }, 30000);
  }, [clearInactivityTimeout]);

  const handleStepComplete = useCallback((completedStep: number, scrollTarget?: string) => {
    ref.current.stepCompleted[completedStep] = true;
    setStepCompleted({ ...ref.current.stepCompleted });

    const nextStep = Math.min(completedStep + 1, 4) as FunnelStep;
    ref.current.globalStep = nextStep;
    setGlobalStep(nextStep);

    if (completedStep === 1) {
      setHeroVisible(false);
    } else if (completedStep === 2) {
      setAboutVisible(false);
    } else if (completedStep === 3) {
      setProjectsVisible(false);
    }

    if (scrollTarget) {
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, []);

  const suppressFunnel = useCallback(() => {
    ref.current.suppressed = true;
    setSuppressed(true);
    setHeroVisible(false);
    setAboutVisible(false);
    setExpertiseVisible(false);
    setProjectsVisible(false);
  }, []);

  const sectionForStep = useCallback((step: FunnelStep): string | null => {
    if (step === 1) return "hero";
    if (step === 2) return "about";
    if (step === 3) return "projects";
    return null;
  }, []);

  const showPanelForSection = useCallback((section: string) => {
    if (ref.current.suppressed) return;
    if (ref.current.dismissed[section]) return;
    const currentSection = sectionForStep(ref.current.globalStep);
    if (currentSection !== section) return;

    ref.current.lastActivity[section] = Date.now();
    clearInactivityTimeout(section);

    if (section === "hero") setHeroVisible(true);
    if (section === "about") setAboutVisible(true);
    if (section === "expertise") setExpertiseVisible(true);
    if (section === "projects") setProjectsVisible(true);
  }, [sectionForStep, clearInactivityTimeout]);

  const handleHeroMouseMove = useCallback(() => {
    showPanelForSection("hero");
    startInactivityTimeout("hero");
  }, [showPanelForSection, startInactivityTimeout]);

  const handleHeroMouseLeave = useCallback(() => {
    startInactivityTimeout("hero");
  }, [startInactivityTimeout]);

  const handleAboutMouseMove = useCallback(() => {
    showPanelForSection("about");
    startInactivityTimeout("about");
  }, [showPanelForSection, startInactivityTimeout]);

  const handleAboutMouseLeave = useCallback(() => {
    startInactivityTimeout("about");
  }, [startInactivityTimeout]);

  const handleExpertiseMouseMove = useCallback(() => {
    showPanelForSection("expertise");
    startInactivityTimeout("expertise");
  }, [showPanelForSection, startInactivityTimeout]);

  const handleExpertiseMouseLeave = useCallback(() => {
    startInactivityTimeout("expertise");
  }, [startInactivityTimeout]);

  const handleProjectsMouseMove = useCallback(() => {
    showPanelForSection("projects");
    startInactivityTimeout("projects");
  }, [showPanelForSection, startInactivityTimeout]);

  const handleProjectsMouseLeave = useCallback(() => {
    startInactivityTimeout("projects");
  }, [startInactivityTimeout]);

  const markPanelInteracting = useCallback((section: string, interacting: boolean) => {
    if (interacting) {
      ref.current.lastActivity[section] = Date.now();
      clearInactivityTimeout(section);
    } else {
      startInactivityTimeout(section);
    }
  }, [clearInactivityTimeout, startInactivityTimeout]);

  const markPanelFocused = useCallback((section: string, focused: boolean) => {
    ref.current.inputFocused[section] = focused;
    if (focused) {
      clearInactivityTimeout(section);
    } else {
      startInactivityTimeout(section);
    }
  }, [clearInactivityTimeout, startInactivityTimeout]);

  const dismissPanel = useCallback((section: string) => {
    ref.current.dismissed[section] = true;
    clearInactivityTimeout(section);
    if (section === "hero") setHeroVisible(false);
    if (section === "about") setAboutVisible(false);
    if (section === "expertise") setExpertiseVisible(false);
    if (section === "projects") setProjectsVisible(false);
  }, [clearInactivityTimeout]);

  return {
    globalStep,
    stepCompleted,
    heroVisible,
    aboutVisible,
    expertiseVisible,
    projectsVisible,
    suppressed,
    handleStepComplete,
    handleHeroMouseMove,
    handleHeroMouseLeave,
    handleAboutMouseMove,
    handleAboutMouseLeave,
    handleExpertiseMouseMove,
    handleExpertiseMouseLeave,
    handleProjectsMouseMove,
    handleProjectsMouseLeave,
    markPanelInteracting,
    markPanelFocused,
    dismissPanel,
    suppressFunnel,
  };
}

export default function ProgressiveFunnelPanel({
  currentSection,
  onStepComplete,
  globalStep,
  mouseActive,
  onPanelInteract,
  onPanelFocus,
  onDismiss,
  inline = false,
}: ProgressiveFunnelProps) {
  const [projectType, setProjectType] = useState("");
  const [projectGoal, setProjectGoal] = useState("");
  const [projectTimeline, setProjectTimeline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [role, setRole] = useState("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [customTime, setCustomTime] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleFocusIn = () => onPanelFocus?.(currentSection, true);
    const handleFocusOut = (e: FocusEvent) => {
      if (!panel.contains(e.relatedTarget as Node)) {
        onPanelFocus?.(currentSection, false);
      }
    };

    panel.addEventListener("focusin", handleFocusIn);
    panel.addEventListener("focusout", handleFocusOut);
    return () => {
      panel.removeEventListener("focusin", handleFocusIn);
      panel.removeEventListener("focusout", handleFocusOut);
    };
  }, [currentSection, onPanelFocus]);

  const stepForSection: Record<string, number> = {
    hero: 1,
    about: 2,
    projects: 3,
  };

  const sectionStep = inline ? globalStep : (stepForSection[currentSection] || 1);
  if (!inline) {
    if (globalStep > sectionStep) return null;
    if (globalStep < sectionStep) return null;
  }

  const stepHeaders: Record<number, { title: string; subtitle: string }> = {
    1: { title: "Let's Understand Your Needs", subtitle: "This helps us direct you to the right service" },
    2: { title: "Tell Us About Your Scope", subtitle: "Help us understand your project requirements" },
    3: { title: "Complete Your Details", subtitle: "Your information for a personalized consultation" },
  };

  const currentHeader = stepHeaders[globalStep] || stepHeaders[1];

  if (globalStep === 4) {
    return (
      <div ref={panelRef} className={inline ? "w-full" : "absolute right-4 top-1/2 -translate-y-1/2 z-30 w-full max-w-md animate-in slide-in-from-right-5 duration-300 hidden md:block"} data-testid="funnel-panel-complete">
        <div className={inline ? "text-center py-8" : "bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"}>
          {!inline && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-white font-bold text-lg">Request Received</h3>
              <p className="text-green-100 text-sm">We'll be in touch soon</p>
            </div>
          )}
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
            <p className="text-slate-600">We've received your inquiry. Our team will contact you shortly to schedule your free consultation.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStep1Submit = () => {
    if (projectType && projectGoal) {
      onStepComplete(1, "about-section");
    }
  };

  const handleStep2Submit = () => {
    if (projectTimeline && budgetRange) {
      onStepComplete(2, "services-section");
    }
  };

  const handleStep3Submit = async () => {
    if (role && decisionMaker && name && email && phone) {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceType: projectType,
            projectScope: `Goal: ${projectGoal}, Timeline: ${projectTimeline}, Budget: ${budgetRange}, Location: ${projectLocation}, Role: ${role}, Decision Maker: ${decisionMaker}`,
            name,
            email,
            phone,
            message: preferredTime ? `Preferred consultation time: ${preferredTime}${customTime ? ` (${customTime})` : ""}` : customTime || undefined,
          }),
        });
      } catch {}
      onStepComplete(3, "projects-section");
    }
  };

  const projectTypeOptions = [
    "Marine Construction",
    "Coastal Protection",
    "Seaport Infrastructure",
    "Earthworks",
    "MEP Works",
  ];

  const goalOptions = [
    "Strengthen coastal protection",
    "Expand port capacity",
    "Infrastructure development",
    "Other",
  ];

  const timelineOptions = [
    "Immediate (< 3 months)",
    "Short-term (3-6 months)",
    "Medium-term (6-12 months)",
    "Long-term (12+ months)",
  ];

  const budgetOptions = [
    "Under $500K",
    "$500K - $2M",
    "$2M - $10M",
    "$10M+",
  ];

  const timeSlots = ["Morning", "Afternoon", "Evening"];

  if (!mouseActive) return null;

  return (
    <div
      ref={panelRef}
      className={inline ? "w-full" : "absolute right-4 top-1/2 -translate-y-1/2 z-30 w-full max-w-md animate-in slide-in-from-right-5 duration-300 hidden md:block"}
      onMouseEnter={() => onPanelInteract?.(currentSection, true)}
      onMouseLeave={() => onPanelInteract?.(currentSection, false)}
      data-testid={`funnel-panel-${currentSection}`}
    >
      <div className={inline ? "relative" : "bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[80vh] flex flex-col"}>
        {!inline && (
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4 flex items-start justify-between flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg">{currentHeader.title}</h3>
              <p className="text-sky-100 text-sm">{currentHeader.subtitle}</p>
            </div>
            <button
              onClick={() => onDismiss?.(currentSection)}
              className="text-white/70 hover:text-white transition p-1 flex-shrink-0"
              data-testid="button-close-funnel"
              aria-label="Close"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={inline ? "" : "p-6 overflow-y-auto"}>
        <ProgressBar step={globalStep} />

        {sectionStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">What type of project are you planning?</h3>
              <p className="text-sm text-slate-500 mb-4">This helps us direct you to the right service.</p>
            </div>
            <div className="space-y-2">
              {projectTypeOptions.map((option) => (
                <SelectOption
                  key={option}
                  label={option}
                  selected={projectType === option}
                  onClick={() => setProjectType(option)}
                />
              ))}
            </div>

            <div className="pt-2">
              <h3 className="text-base font-bold text-slate-900 mb-1">What is the primary goal of your project?</h3>
              <div className="space-y-2 mt-3">
                {goalOptions.map((option) => (
                  <SelectOption
                    key={option}
                    label={option}
                    selected={projectGoal === option}
                    onClick={() => setProjectGoal(option)}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleStep1Submit}
              disabled={!projectType || !projectGoal}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-funnel-step1-next"
            >
              Submit <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {sectionStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Project Details</h3>
              <p className="text-sm text-slate-500 mb-4">Help us understand your project scope</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Project Timeline</label>
              <div className="space-y-2">
                {timelineOptions.map((option) => (
                  <SelectOption
                    key={option}
                    label={option}
                    selected={projectTimeline === option}
                    onClick={() => setProjectTimeline(option)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Budget Range</label>
              <div className="space-y-2">
                {budgetOptions.map((option) => (
                  <SelectOption
                    key={option}
                    label={option}
                    selected={budgetRange === option}
                    onClick={() => setBudgetRange(option)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Project Location</label>
              <input
                type="text"
                placeholder="e.g., Muscat, Oman"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                data-testid="input-project-location"
              />
            </div>

            <Button
              onClick={handleStep2Submit}
              disabled={!projectTimeline || !budgetRange}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-funnel-step2-next"
            >
              Submit <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {sectionStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Almost There!</h3>
              <p className="text-sm text-slate-500 mb-4">Your details for a personalized consultation</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Your Role</label>
              <div className="space-y-2">
                {["Project Owner", "Engineer / Consultant", "Procurement / Contract Manager", "Other"].map((option) => (
                  <SelectOption
                    key={option}
                    label={option}
                    selected={role === option}
                    onClick={() => setRole(option)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Are you the decision maker?</label>
              <div className="flex flex-wrap gap-2">
                {["Yes", "No", "Part of a team"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setDecisionMaker(option)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      decisionMaker === option
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-600 hover:border-sky-300"
                    }`}
                    data-testid={`button-decision-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white"
                    data-testid="input-funnel-name"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white"
                    data-testid="input-funnel-email"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white"
                    data-testid="input-funnel-phone"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Best time for your free 20-min consultation?
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setPreferredTime(slot)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                      preferredTime === slot
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-600 hover:border-sky-300"
                    }`}
                    data-testid={`button-time-${slot.toLowerCase()}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {slot}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or provide a preferred time and day"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                data-testid="input-custom-time"
              />
            </div>

            <Button
              onClick={handleStep3Submit}
              disabled={!role || !decisionMaker || !name || !email || !phone}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-funnel-submit"
            >
              Submit <Check className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
