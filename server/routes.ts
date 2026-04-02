import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import bcrypt from "bcrypt";
import { insertAdminUserSchema, insertLeadSchema, insertBlogPostSchema } from "@shared/schema";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";

const MemoryStoreSession = MemoryStore(session);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime", "application/pdf"];
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function requireAdmin(req: any, res: any, next: any) {
  const adminId = req.session?.adminId;
  if (!adminId) return res.status(401).json({ message: "Not authenticated" });
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const isProduction = process.env.NODE_ENV === "production";
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({ checkPeriod: 86400000 }),
      cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadsDir));

  app.post("/api/admin/register", async (req, res) => {
    try {
      const parsed = insertAdminUserSchema.parse(req.body);
      const existing = await storage.getAdminByEmail(parsed.email);
      if (existing) return res.status(400).json({ message: "Email already registered" });
      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const admin = await storage.createAdmin({ ...parsed, password: hashedPassword });
      if (admin.isApproved) {
        (req.session as any).adminId = admin.id;
        return res.json({ message: "Admin account created and approved (first admin)", admin: { id: admin.id, email: admin.email, username: admin.username, isApproved: true } });
      }
      res.json({ message: "Registration submitted. Awaiting approval.", admin: { id: admin.id, email: admin.email, username: admin.username, isApproved: false } });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Invalid registration data" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password required" });
      const admin = await storage.getAdminByEmail(email);
      if (!admin) return res.status(401).json({ message: "Invalid credentials" });
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      if (!admin.isApproved) return res.status(403).json({ message: "Account pending approval" });
      (req.session as any).adminId = admin.id;
      res.json({ admin: { id: admin.id, email: admin.email, username: admin.username } });
    } catch (e: any) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/me", async (req, res) => {
    const adminId = (req.session as any)?.adminId;
    if (!adminId) return res.status(401).json({ message: "Not authenticated" });
    const admin = await storage.getAdminById(adminId);
    if (!admin) return res.status(401).json({ message: "Not authenticated" });
    res.json({ id: admin.id, email: admin.email, username: admin.username });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => res.json({ message: "Logged out" }));
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const admins = await storage.getAllAdmins();
    res.json(admins.map(a => ({ id: a.id, email: a.email, username: a.username, isApproved: a.isApproved, isFirstAdmin: a.isFirstAdmin })));
  });

  app.post("/api/admin/approve/:id", requireAdmin, async (req, res) => {
    const currentAdmin = await storage.getAdminById((req.session as any).adminId);
    if (!currentAdmin?.isApproved) return res.status(403).json({ message: "Not authorized" });
    await storage.approveAdmin(parseInt(req.params.id));
    res.json({ message: "Admin approved" });
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    const [blogPostCount, leadCount, unreadLeadCount, chatSessionCount, chatContactCount, contentSectionCount] = await Promise.all([
      storage.getBlogPostCount(),
      storage.getLeadCount(),
      storage.getUnreadLeadCount(),
      storage.getChatSessionCount(),
      storage.getChatContactCount(),
      storage.getContentSectionCount(),
    ]);
    res.json({ blogPostCount, leadCount, unreadLeadCount, chatSessionCount, chatContactCount, contentSectionCount });
  });

  app.post("/api/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size });
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const parsed = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(parsed);
      res.json(lead);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Invalid data" });
    }
  });

  app.get("/api/admin/leads", requireAdmin, async (_req, res) => {
    const allLeads = await storage.getAllLeads();
    res.json(allLeads);
  });

  app.post("/api/admin/leads/:id/read", requireAdmin, async (req, res) => {
    await storage.markLeadRead(parseInt(req.params.id));
    res.json({ message: "Marked as read" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      if (!sessionId || !message) return res.status(400).json({ message: "sessionId and message required" });
      await storage.createChatMessage({ sessionId, role: "user", content: message });
      const reply = await generateChatReply(message, sessionId, storage);
      const botMsg = await storage.createChatMessage({ sessionId, role: "assistant", content: reply });
      res.json({ reply: botMsg.content });
    } catch (e: any) {
      res.status(500).json({ message: "Chat failed" });
    }
  });

  app.get("/api/admin/chats", requireAdmin, async (_req, res) => {
    const sessions = await storage.getAllChatSessions();
    res.json(sessions);
  });

  app.get("/api/admin/chats/:sessionId", requireAdmin, async (req, res) => {
    const messages = await storage.getChatsBySession(req.params.sessionId);
    res.json(messages);
  });

  app.get("/api/admin/blog-posts", requireAdmin, async (req, res) => {
    const status = req.query.status as string | undefined;
    const posts = status ? await storage.getBlogPostsByStatus(status) : await storage.getAllBlogPosts();
    res.json(posts);
  });

  app.get("/api/admin/blog-posts/:id", requireAdmin, async (req, res) => {
    const post = await storage.getBlogPostById(parseInt(req.params.id));
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post("/api/admin/blog-posts", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(parsed);
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Invalid blog post data" });
    }
  });

  app.patch("/api/admin/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["titleEn", "titleAr", "slug", "category", "excerptEn", "excerptAr", "contentEn", "contentAr", "status", "featuredImage"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      if (sanitized.status && !["draft", "published", "archived"].includes(sanitized.status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      const post = await storage.updateBlogPost(parseInt(req.params.id), sanitized);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Update failed" });
    }
  });

  app.delete("/api/admin/blog-posts/:id", requireAdmin, async (req, res) => {
    await storage.deleteBlogPost(parseInt(req.params.id));
    res.json({ message: "Deleted" });
  });

  app.get("/api/blog-posts", async (_req, res) => {
    const posts = await storage.getBlogPostsByStatus("published");
    res.json(posts);
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || post.status !== "published") return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.get("/api/admin/site-content/:sectionKey", requireAdmin, async (req, res) => {
    const language = (req.query.language as string) || "en";
    const content = await storage.getSiteContent(req.params.sectionKey, language);
    res.json(content || { sectionKey: req.params.sectionKey, language, contentJson: "{}" });
  });

  app.put("/api/admin/site-content/:sectionKey", requireAdmin, async (req, res) => {
    const language = req.body.language || "en";
    const content = await storage.upsertSiteContent(req.params.sectionKey, language, JSON.stringify(req.body.content || {}));
    res.json(content);
  });

  app.get("/api/admin/site-content", requireAdmin, async (_req, res) => {
    const all = await storage.getAllSiteContent();
    res.json(all);
  });

  app.post("/api/admin/ai/generate-article", requireAdmin, async (req, res) => {
    try {
      const { topic, language = "en" } = req.body;
      if (!topic) return res.status(400).json({ message: "Topic required" });
      const systemPrompt = language === "ar"
        ? "أنت كاتب محتوى محترف لشركة كاهيت للتجارة والمقاولات ذ.م.م، متخصصة في البناء البحري والبنية التحتية في عمان. اكتب باللغة العربية."
        : "You are a professional content writer for Cahit Trading & Contracting LLC, a marine construction and infrastructure company in Oman. Write detailed, professional blog articles.";
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write a detailed blog article about: ${topic}. Include a compelling title, introduction, 3-4 main sections with subheadings, and a conclusion. Format with markdown.` },
        ],
        max_tokens: 4096,
      });
      res.json({ content: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "AI generation failed: " + (e.message || "") });
    }
  });

  app.post("/api/admin/ai/generate-excerpt", requireAdmin, async (req, res) => {
    try {
      const { content, language = "en" } = req.body;
      if (!content) return res.status(400).json({ message: "Content required" });
      const prompt = language === "ar"
        ? `اكتب ملخصاً مقنعاً من 2-3 جمل للمقال التالي:\n\n${content.slice(0, 3000)}`
        : `Write a compelling 2-3 sentence excerpt/summary for the following article:\n\n${content.slice(0, 3000)}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      });
      res.json({ excerpt: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "AI generation failed" });
    }
  });

  app.post("/api/admin/ai/improve-content", requireAdmin, async (req, res) => {
    try {
      const { content, language = "en" } = req.body;
      if (!content) return res.status(400).json({ message: "Content required" });
      const prompt = language === "ar"
        ? `حسّن وعزّز المحتوى التالي. اجعله أكثر احترافية وإقناعاً مع الحفاظ على الرسالة الأصلية:\n\n${content}`
        : `Improve and enhance the following content. Make it more professional, engaging, and well-structured while keeping the original message:\n\n${content}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      });
      res.json({ content: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "AI improvement failed" });
    }
  });

  app.post("/api/admin/ai/translate", requireAdmin, async (req, res) => {
    try {
      const { content, from = "en", to = "ar" } = req.body;
      if (!content) return res.status(400).json({ message: "Content required" });
      const fromLang = from === "ar" ? "Arabic" : "English";
      const toLang = to === "ar" ? "Arabic" : "English";
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `You are a professional translator. Translate from ${fromLang} to ${toLang}. Maintain formatting and markdown structure.` },
          { role: "user", content },
        ],
        max_tokens: 4096,
      });
      res.json({ translation: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post("/api/admin/ai/optimize-seo", requireAdmin, async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!content) return res.status(400).json({ message: "Content required" });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an SEO expert. Analyze the content and provide optimization suggestions." },
          { role: "user", content: `Analyze this blog post and provide SEO suggestions:\n\nTitle: ${title || "Untitled"}\n\nContent:\n${content.slice(0, 3000)}\n\nProvide:\n1. Optimized title suggestion\n2. Meta description (160 chars)\n3. 5-7 focus keywords\n4. Content improvement suggestions\n5. Readability score (1-10)` },
        ],
        max_tokens: 1000,
      });
      res.json({ suggestions: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "SEO optimization failed" });
    }
  });

  app.post("/api/admin/ai/suggest-titles", requireAdmin, async (req, res) => {
    try {
      const { content, topic } = req.body;
      const input = content ? content.slice(0, 2000) : topic;
      if (!input) return res.status(400).json({ message: "Content or topic required" });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional content strategist for a construction/infrastructure company." },
          { role: "user", content: `Suggest 5 compelling blog post titles for the following content/topic:\n\n${input}\n\nReturn just the titles, numbered 1-5.` },
        ],
        max_tokens: 300,
      });
      res.json({ titles: response.choices[0]?.message?.content || "" });
    } catch (e: any) {
      res.status(500).json({ message: "Title suggestion failed" });
    }
  });

  return httpServer;
}

const COMPANY_KNOWLEDGE = `You are the AI assistant for Cahit Trading & Contracting LLC (CTC). Answer questions based on this company knowledge:

ABOUT THE COMPANY:
- Cahit Trading & Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.
- Founded by Tahir Şenyurt, the company has developed into a trusted contractor delivering complex projects across marine construction, infrastructure development, earthworks, and industrial services.
- Through a combination of engineering expertise, operational excellence, and strong client partnerships, Cahit contributes to the development of critical infrastructure across Oman.
- 15+ years of experience, 50+ major projects completed, 98% client satisfaction rate.

LEADERSHIP:
- Tahir Şenyurt — Managing Director. Civil Engineer with over 25 years of experience in the construction and contracting industry. He has successfully led numerous projects including marine infrastructure, road construction, industrial facilities and residential developments across Turkey and the GCC. Education: Bachelor of Civil Engineering — University of Middle East Technical. License: Registered Civil Engineer.
- Pasha Hüseyin Ari — General Coordinator. Holds a Master's degree in Environmental Engineering from Istanbul Technical University. 15+ years of experience in environmental and infrastructure-related sectors. Education: MSc of Environmental Engineering — Istanbul Technical University. License: Registered Environmental Engineer.

SERVICES:
1. Marine & Coastal Construction — Design and construction of marine infrastructure including breakwaters, quay walls, revetments, dredging, and coastal protection systems.
2. Infrastructure Development — Civil infrastructure development including roads, utilities, industrial facilities, and integrated project delivery solutions.
3. Earthworks & Grading — Land preparation, cut and fill operations, and site grading for large-scale development projects.
4. Dewatering & Shoring — Groundwater management and temporary earth support systems for safe below-grade construction.
5. MEP Works — Mechanical, electrical, and plumbing installations for commercial, industrial, and infrastructure projects.

PROJECTS:
- Seaport Infrastructure projects in Muscat, Oman — quay wall construction and breakwater installation.
- Coastal Protection Systems in Salalah, Oman — rock armour installation and coastal defense.
- Road construction, asphalt paving, underground pipe installation across Oman.
- Work with government authorities, developers, and industrial organizations.

CONTACT INFORMATION:
- Phone: +968 2411 2406 Ext 101
- Mobile/WhatsApp: +968 9096 6562
- Email: ctc@cahitcontracting.com
- Address: Khaleej Tower, 6th Floor, No. 603, Ghala, Muscat, Sultanate of Oman

CORE VALUES:
- Safety First: Comprehensive safety protocols and training programs
- Excellence: Committed to delivering the highest quality in every project
- Innovation: Adopting advanced construction technologies and methods

Be helpful, professional, and concise. If asked something outside your knowledge, suggest contacting the company directly. Always be friendly and encourage the visitor to learn more or get in touch.`;

async function generateChatReply(message: string, sessionId: string, storage: any): Promise<string> {
  try {
    const history = await storage.getChatsBySession(sessionId);
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: COMPANY_KNOWLEDGE },
    ];
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
    }
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again or contact us at ctc@cahitcontracting.com.";
  } catch (e) {
    console.error("Chat AI error:", e);
    return "I'm experiencing a temporary issue. Please try again or contact us directly at ctc@cahitcontracting.com or +968 9096 6562.";
  }
}
