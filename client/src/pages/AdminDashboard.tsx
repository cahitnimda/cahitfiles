import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard, FileText, PenSquare, MessageSquare, Users, LogOut,
  ArrowLeft, Plus, Search, Eye, Trash2, Edit2, ChevronDown, ChevronUp,
  Check, X, Upload, Loader2, Sparkles, Languages, BookOpen, Lightbulb,
  Globe, Type, ExternalLink, RefreshCw, Maximize2, Minimize2
} from "lucide-react";

type Tab = "dashboard" | "site-content" | "blog-posts" | "leads" | "chat-history";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [, navigate] = useLocation();

  const adminQuery = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (adminQuery.isError) navigate("/");
  }, [adminQuery.isError, navigate]);

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => navigate("/"),
  });

  if (adminQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A3D6B]" />
      </div>
    );
  }

  if (!adminQuery.data) return null;

  const sidebarItems: { key: Tab; icon: any; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "site-content", icon: Globe, label: "Site Content" },
    { key: "blog-posts", icon: PenSquare, label: "Blog Posts" },
    { key: "leads", icon: FileText, label: "Lead Submissions" },
    { key: "chat-history", icon: MessageSquare, label: "Chat History" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      <aside className="w-60 bg-[#0A3D6B] text-white flex flex-col fixed h-full z-10" data-testid="admin-sidebar">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png"
            alt="Cahit"
            className="h-8 w-auto"
          />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-sky-500 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              data-testid={`tab-${item.key}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-white">{adminQuery.data.username || "Cahit Admin"}</p>
          <div className="mt-3 space-y-1">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2 text-sm text-white/70 hover:text-white transition py-1"
              data-testid="button-back-site"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
            </button>
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-full flex items-center gap-2 text-sm text-red-300 hover:text-red-200 transition py-1"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">
        <div className="p-8">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "site-content" && <SiteContentTab />}
          {activeTab === "blog-posts" && <BlogPostsTab />}
          {activeTab === "leads" && <LeadsTab />}
          {activeTab === "chat-history" && <ChatHistoryTab />}
        </div>
      </main>
    </div>
  );
}

function DashboardTab() {
  const statsQuery = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => { const r = await fetch("/api/admin/stats", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });
  const leadsQuery = useQuery({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => { const r = await fetch("/api/admin/leads", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });
  const blogQuery = useQuery({
    queryKey: ["/api/admin/blog-posts"],
    queryFn: async () => { const r = await fetch("/api/admin/blog-posts", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });

  const stats = statsQuery.data || {};
  const recentLeads = Array.isArray(leadsQuery.data) ? leadsQuery.data.slice(0, 5) : [];
  const recentPosts = Array.isArray(blogQuery.data) ? blogQuery.data.slice(0, 5) : [];

  const statCards = [
    { label: "Blog Posts", value: stats.blogPostCount || 0, icon: PenSquare, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Total Leads", value: stats.leadCount || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Unread Leads", value: stats.unreadLeadCount || 0, icon: FileText, color: "text-red-500", bg: "bg-red-50" },
    { label: "Chat Conversations", value: stats.chatSessionCount || 0, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Contacts from Chat", value: stats.chatContactCount || 0, icon: Check, color: "text-green-600", bg: "bg-green-50" },
    { label: "Content Sections", value: stats.contentSectionCount || 0, icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6" data-testid="text-dashboard-title">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} className="p-5 bg-white border-0 shadow-sm hover:shadow-md transition" data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.name || "Anonymous"}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${lead.isRead ? "bg-slate-100 text-slate-500" : "bg-sky-100 text-sky-700"}`}>
                    {lead.isRead ? "Read" : "New"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Blog Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{post.titleEn}</p>
                    <p className="text-xs text-slate-500">{post.category || "Uncategorized"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === "published" ? "bg-green-100 text-green-700" :
                      post.status === "draft" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>{post.status}</span>
                    <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SiteContentTab() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sections = [
    { key: "hero", label: "Hero Section" },
    { key: "expertise", label: "Our Expertise" },
    { key: "projects", label: "Featured Projects" },
    { key: "testimonials", label: "Client Testimonials" },
    { key: "cta", label: "Call to Action" },
    { key: "footer", label: "Footer" },
  ];

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Site Content</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 text-sm font-medium transition ${language === "en" ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              data-testid="button-lang-en"
            >English</button>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-4 py-2 text-sm font-medium transition ${language === "ar" ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              data-testid="button-lang-ar"
            >Arabic</button>
          </div>
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={showPreview ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}
            data-testid="button-toggle-preview"
          >
            <Eye className="w-4 h-4 mr-1" /> {showPreview ? "Hide Preview" : "Live Preview"}
          </Button>
        </div>
      </div>

      <div className={`flex gap-6 ${showPreview ? "" : ""}`}>
        <div className={showPreview ? "w-1/2" : "w-full"}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SiteContentSection
                key={section.key}
                sectionKey={section.key}
                label={section.label}
                language={language}
                isOpen={openSection === section.key}
                onToggle={() => setOpenSection(openSection === section.key ? null : section.key)}
                onSave={refreshPreview}
              />
            ))}
          </div>
        </div>

        {showPreview && (
          <div className={`${previewFullscreen ? "fixed inset-0 z-50 bg-white" : "w-1/2"}`}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Live Preview</span>
                <div className="flex items-center gap-2">
                  <button onClick={refreshPreview} className="text-slate-400 hover:text-slate-600 transition" data-testid="button-refresh-preview">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPreviewFullscreen(!previewFullscreen)} className="text-slate-400 hover:text-slate-600 transition">
                    {previewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  {previewFullscreen && (
                    <button onClick={() => setPreviewFullscreen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <iframe
                ref={iframeRef}
                src="/"
                className="flex-1 w-full"
                style={{ minHeight: previewFullscreen ? "calc(100vh - 40px)" : "600px" }}
                data-testid="iframe-preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SiteContentSection({ sectionKey, label, language, isOpen, onToggle, onSave }: {
  sectionKey: string; label: string; language: string; isOpen: boolean; onToggle: () => void; onSave: () => void;
}) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const query = useQuery({
    queryKey: ["/api/admin/site-content", sectionKey, language],
    queryFn: async () => {
      const r = await fetch(`/api/admin/site-content/${sectionKey}?language=${language}`, { credentials: "include" });
      if (!r.ok) throw new Error();
      return r.json();
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (query.data?.contentJson) {
      try { setContent(JSON.parse(query.data.contentJson)); } catch { setContent({}); }
    }
  }, [query.data]);

  const fieldsBySection: Record<string, { key: string; label: string; type: "text" | "textarea" | "upload" }[]> = {
    hero: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "badgeText", label: "Badge Text", type: "text" },
      { key: "videoUrl", label: "Background Video", type: "upload" },
    ],
    expertise: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    projects: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    testimonials: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    cta: [
      { key: "title", label: "Heading", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
    ],
    footer: [
      { key: "companyDescription", label: "Company Description", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  };

  const fields = fieldsBySection[sectionKey] || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest("PUT", `/api/admin/site-content/${sectionKey}`, { language, content });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave();
    } catch {}
    setSaving(false);
  };

  const handleFileUpload = async (fieldKey: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContent(prev => ({ ...prev, [fieldKey]: data.url }));
    } catch {}
  };

  const configured = query.data?.contentJson && query.data.contentJson !== "{}";

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden" data-testid={`section-${sectionKey}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{label}</p>
            <p className="text-xs text-slate-400">{configured ? "Configured" : "Not configured"}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <>
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                  {field.type === "upload" ? (
                    <div className="space-y-2">
                      {content[field.key] && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          File uploaded: {content[field.key]}
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg cursor-pointer hover:bg-sky-100 transition text-sm font-medium w-fit">
                        <Upload className="w-4 h-4" />
                        Upload File
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,video/*"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(field.key, f); }}
                          data-testid={`upload-${sectionKey}-${field.key}`}
                        />
                      </label>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={content[field.key] || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-y min-h-[80px]"
                      dir={language === "ar" ? "rtl" : "ltr"}
                      data-testid={`input-${sectionKey}-${field.key}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[field.key] || ""}
                      onChange={(e) => setContent(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      dir={language === "ar" ? "rtl" : "ltr"}
                      data-testid={`input-${sectionKey}-${field.key}`}
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white" data-testid={`button-save-${sectionKey}`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : saved ? <Check className="w-4 h-4 mr-1" /> : null}
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function BlogPostsTab() {
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingPost, setEditingPost] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (view === "editor") {
    return (
      <BlogPostEditor
        post={editingPost}
        onBack={() => { setView("list"); setEditingPost(null); }}
      />
    );
  }

  return (
    <BlogPostList
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      onEdit={(post: any) => { setEditingPost(post); setView("editor"); }}
      onNew={() => { setEditingPost(null); setView("editor"); }}
    />
  );
}

function BlogPostList({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, onEdit, onNew }: any) {
  const query = useQuery({
    queryKey: ["/api/admin/blog-posts"],
    queryFn: async () => { const r = await fetch("/api/admin/blog-posts", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/blog-posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] }),
  });

  const posts = Array.isArray(query.data)
    ? query.data.filter((p: any) => {
        const matchSearch = !searchQuery || p.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
        <Button onClick={onNew} className="bg-sky-500 hover:bg-sky-600 text-white" data-testid="button-new-post">
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title or category..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            data-testid="input-search-posts"
          />
        </div>
        <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${
                statusFilter === s ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
              data-testid={`filter-${s}`}
            >{s === "all" ? "All" : s}</button>
          ))}
        </div>
      </div>

      <Card className="bg-white border-0 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No blog posts found</td></tr>
            ) : (
              posts.map((post: any) => (
                <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition" data-testid={`post-row-${post.id}`}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{post.titleEn}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      post.status === "published" ? "bg-green-100 text-green-700" :
                      post.status === "draft" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>{post.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{post.category || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === "published" && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-sky-600 transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => onEdit(post)} className="p-1.5 text-slate-400 hover:text-sky-600 transition" data-testid={`button-edit-${post.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }} className="p-1.5 text-slate-400 hover:text-red-600 transition" data-testid={`button-delete-${post.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BlogPostEditor({ post, onBack }: { post: any; onBack: () => void }) {
  const isEditing = !!post;
  const [titleEn, setTitleEn] = useState(post?.titleEn || "");
  const [titleAr, setTitleAr] = useState(post?.titleAr || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [category, setCategory] = useState(post?.category || "");
  const [excerptEn, setExcerptEn] = useState(post?.excerptEn || "");
  const [excerptAr, setExcerptAr] = useState(post?.excerptAr || "");
  const [contentEn, setContentEn] = useState(post?.contentEn || "");
  const [contentAr, setContentAr] = useState(post?.contentAr || "");
  const [status, setStatus] = useState(post?.status || "draft");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isEditing && titleEn && !post) {
      setSlug(titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [titleEn, isEditing, post]);

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSave = async () => {
    if (!titleEn.trim() || !contentEn.trim()) return;
    setSaving(true);
    try {
      const data = { titleEn, titleAr: titleAr || null, slug: slug || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"), category: category || null, excerptEn: excerptEn || null, excerptAr: excerptAr || null, contentEn, contentAr: contentAr || null, status, featuredImage: featuredImage || null };
      if (isEditing) {
        await apiRequest("PATCH", `/api/admin/blog-posts/${post.id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/blog-posts", data);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      onBack();
    } catch (e: any) {
      alert("Save failed: " + (e.message || "Unknown error"));
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFeaturedImage(data.url);
    } catch {}
  };

  const aiActions = [
    { key: "write", icon: BookOpen, label: "AI Blog Writer", desc: "Research, write, generate images & publish", color: "text-pink-600", new: true },
    { key: "generate", icon: PenSquare, label: "Generate Article", desc: "Create a full blog post from a topic" },
    { key: "seo", icon: Search, label: "Optimize SEO", desc: "Analyze content and generate SEO metadata" },
    { key: "translate", icon: Languages, label: "Translate", desc: "Translate between English and Arabic" },
    { key: "excerpt", icon: FileText, label: "Generate Excerpt", desc: "Create a compelling summary" },
    { key: "improve", icon: Sparkles, label: "Improve Content", desc: "Polish, expand, or enhance content" },
    { key: "titles", icon: Type, label: "Suggest Titles", desc: "Generate title alternatives" },
  ];

  const handleAIAction = async (action: string) => {
    setAiLoading(true);
    try {
      let res;
      switch (action) {
        case "write":
        case "generate": {
          const topic = prompt("Enter a topic for the article:");
          if (!topic) { setAiLoading(false); return; }
          res = await fetch("/api/admin/ai/generate-article", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const genData = await res.json();
          setContentEn(genData.content);
          break;
        }
        case "seo":
          res = await fetch("/api/admin/ai/optimize-seo", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: titleEn, content: contentEn }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const seoData = await res.json();
          alert(seoData.suggestions);
          break;
        case "translate":
          if (!contentEn) { alert("Write English content first"); setAiLoading(false); return; }
          res = await fetch("/api/admin/ai/translate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: contentEn, from: "en", to: "ar" }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const transData = await res.json();
          setContentAr(transData.translation);
          if (titleEn && !titleAr) {
            const titleRes = await fetch("/api/admin/ai/translate", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: titleEn, from: "en", to: "ar" }), credentials: "include",
            });
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              setTitleAr(titleData.translation);
            }
          }
          break;
        case "excerpt":
          if (!contentEn) { alert("Write content first"); setAiLoading(false); return; }
          res = await fetch("/api/admin/ai/generate-excerpt", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: contentEn }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const excData = await res.json();
          setExcerptEn(excData.excerpt);
          break;
        case "improve":
          if (!contentEn) { alert("Write content first"); setAiLoading(false); return; }
          res = await fetch("/api/admin/ai/improve-content", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: contentEn }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const impData = await res.json();
          setContentEn(impData.content);
          break;
        case "titles":
          res = await fetch("/api/admin/ai/suggest-titles", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: contentEn, topic: titleEn }), credentials: "include",
          });
          if (!res.ok) throw new Error();
          const titData = await res.json();
          alert(titData.titles);
          break;
      }
    } catch (e: any) {
      alert("AI action failed. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Blog Post" : "New Blog Post"}</h1>
        <div className="flex items-center gap-3">
          <Button
            variant={showAI ? "default" : "outline"}
            onClick={() => setShowAI(!showAI)}
            className={showAI ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
            data-testid="button-ai-assistant"
          >
            <Sparkles className="w-4 h-4 mr-1" /> AI Assistant
          </Button>
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition" data-testid="button-back-list">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className={showAI ? "flex-1" : "w-full"}>
          <Card className="bg-white border-0 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English) *</label>
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" data-testid="input-title-en" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Arabic)</label>
                <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" dir="rtl" data-testid="input-title-ar" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug * <span className="text-green-500 text-xs font-normal">Auto-generate</span>
                </label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" data-testid="input-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Marine, Infrastructure, etc." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" data-testid="input-category" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt (English)</label>
                <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-y min-h-[80px]" data-testid="input-excerpt-en" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt (Arabic)</label>
                <textarea value={excerptAr} onChange={(e) => setExcerptAr(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-y min-h-[80px]" dir="rtl" data-testid="input-excerpt-ar" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content (English) * <span className="text-slate-400 text-xs font-normal">{wordCount(contentEn)} words</span>
              </label>
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Write your blog post content here... (Markdown supported)"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-y min-h-[200px] font-mono"
                data-testid="input-content-en"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content (Arabic) <span className="text-slate-400 text-xs font-normal">{wordCount(contentAr)} words</span>
              </label>
              <textarea
                value={contentAr}
                onChange={(e) => setContentAr(e.target.value)}
                placeholder="اكتب محتوى المدونة هنا..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-y min-h-[200px] font-mono"
                dir="rtl"
                data-testid="input-content-ar"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Featured Image</label>
                {featuredImage && (
                  <div className="mb-2 relative">
                    <img src={featuredImage} alt="Featured" className="w-full h-32 object-cover rounded-lg" />
                    <button onClick={() => setFeaturedImage("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg cursor-pointer hover:bg-sky-100 transition text-sm font-medium w-fit">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} data-testid="upload-featured-image" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white" data-testid="select-status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <Button onClick={handleSave} disabled={saving || !titleEn.trim() || !contentEn.trim()} className="bg-sky-500 hover:bg-sky-600 text-white" data-testid="button-save-post">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {isEditing ? "Update Post" : "Create Post"}
              </Button>
              <Button variant="outline" onClick={onBack} data-testid="button-cancel-post">Cancel</Button>
            </div>
          </Card>
        </div>

        {showAI && (
          <div className="w-80 shrink-0">
            <Card className="bg-gradient-to-b from-purple-700 to-purple-800 p-4 mb-3 text-white rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">AI Blog Assistant</h3>
              </div>
              <p className="text-purple-200 text-xs">Powered by AI</p>
            </Card>
            <Card className="bg-white border-0 shadow-sm p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Choose an Action</p>
              <div className="space-y-1">
                {aiActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleAIAction(action.key)}
                    disabled={aiLoading}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 transition text-left group disabled:opacity-50"
                    data-testid={`ai-action-${action.key}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 ${action.color || "text-slate-600"}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-slate-900">{action.label}</p>
                        {action.new && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold">NEW</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{action.desc}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-300 rotate-[-90deg]" />
                  </button>
                ))}
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 px-3 py-3 mt-2 bg-purple-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-purple-700">AI is working...</span>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadsTab() {
  const query = useQuery({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => { const r = await fetch("/api/admin/leads", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });
  const markRead = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/leads/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Lead Submissions</h1>
      {query.isLoading && <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}
      {Array.isArray(query.data) && query.data.length === 0 && (
        <Card className="bg-white border-0 shadow-sm p-10 text-center"><p className="text-slate-400">No leads yet</p></Card>
      )}
      <div className="space-y-3">
        {Array.isArray(query.data) && query.data.map((lead: any) => (
          <Card key={lead.id} className={`bg-white border-0 shadow-sm p-5 ${!lead.isRead ? "border-l-4 border-l-sky-500" : ""}`} data-testid={`lead-${lead.id}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{lead.name || "Anonymous"}</p>
                  {!lead.isRead && <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">New</span>}
                </div>
                <p className="text-sm text-slate-600">{lead.email}</p>
                {lead.phone && <p className="text-sm text-slate-500">{lead.phone}</p>}
                {lead.serviceType && <p className="text-xs text-sky-600 font-medium">Service: {lead.serviceType}</p>}
                {lead.projectScope && <p className="text-xs text-slate-500">Scope: {lead.projectScope}</p>}
                {lead.message && <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg">{lead.message}</p>}
                <p className="text-xs text-slate-400 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
              </div>
              {!lead.isRead && (
                <Button variant="outline" size="sm" onClick={() => markRead.mutate(lead.id)} data-testid={`button-mark-read-${lead.id}`}>
                  <Eye className="w-4 h-4 mr-1" /> Mark Read
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChatHistoryTab() {
  const [openSession, setOpenSession] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["/api/admin/chats"],
    queryFn: async () => { const r = await fetch("/api/admin/chats", { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Chat History</h1>
      {query.isLoading && <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}
      {Array.isArray(query.data) && query.data.length === 0 && (
        <Card className="bg-white border-0 shadow-sm p-10 text-center"><p className="text-slate-400">No chat sessions yet</p></Card>
      )}
      <div className="space-y-2">
        {Array.isArray(query.data) && query.data.map((session: any) => (
          <div key={session.sessionId}>
            <Card
              className="bg-white border-0 shadow-sm p-4 cursor-pointer hover:bg-slate-50/50 transition"
              onClick={() => setOpenSession(openSession === session.sessionId ? null : session.sessionId)}
              data-testid={`chat-session-${session.sessionId}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Session: {session.sessionId.slice(0, 24)}...</p>
                    <p className="text-xs text-slate-500">{session.messageCount} messages • {new Date(session.lastMessage).toLocaleString()}</p>
                  </div>
                </div>
                {openSession === session.sessionId ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </Card>
            {openSession === session.sessionId && <ChatSessionMessages sessionId={session.sessionId} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatSessionMessages({ sessionId }: { sessionId: string }) {
  const query = useQuery({
    queryKey: ["/api/admin/chats", sessionId],
    queryFn: async () => { const r = await fetch(`/api/admin/chats/${sessionId}`, { credentials: "include" }); if (!r.ok) throw new Error(); return r.json(); },
  });

  if (query.isLoading) return <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="bg-slate-50 rounded-b-xl p-4 space-y-2 border border-t-0 border-slate-200 -mt-1 mb-1">
      {Array.isArray(query.data) && query.data.map((msg: any, i: number) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[75%] px-4 py-2.5 rounded-xl text-sm ${
            msg.role === "user"
              ? "bg-sky-500 text-white rounded-br-sm"
              : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
          }`}>
            <p className={`text-[10px] mb-1 ${msg.role === "user" ? "text-sky-200" : "text-slate-400"}`}>
              {msg.role === "user" ? "User" : "Bot"} • {new Date(msg.createdAt).toLocaleTimeString()}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
