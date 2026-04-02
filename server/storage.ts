import { adminUsers, chatMessages, leads, blogPosts, siteContent } from "@shared/schema";
import type { AdminUser, InsertAdminUser, ChatMessage, InsertChatMessage, Lead, InsertLead, BlogPost, InsertBlogPost, SiteContent, InsertSiteContent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminById(id: number): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser & { isFirstAdmin?: boolean }): Promise<AdminUser>;
  getAllAdmins(): Promise<AdminUser[]>;
  approveAdmin(id: number): Promise<void>;
  getAdminCount(): Promise<number>;

  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  getChatsBySession(sessionId: string): Promise<ChatMessage[]>;
  getAllChatSessions(): Promise<{ sessionId: string; messageCount: number; lastMessage: Date }[]>;
  getChatSessionCount(): Promise<number>;
  getChatContactCount(): Promise<number>;

  createLead(lead: InsertLead): Promise<Lead>;
  getAllLeads(): Promise<Lead[]>;
  markLeadRead(id: number): Promise<void>;
  getLeadCount(): Promise<number>;
  getUnreadLeadCount(): Promise<number>;

  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostsByStatus(status: string): Promise<BlogPost[]>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;
  getBlogPostCount(): Promise<number>;

  getSiteContent(sectionKey: string, language: string): Promise<SiteContent | undefined>;
  upsertSiteContent(sectionKey: string, language: string, contentJson: string): Promise<SiteContent>;
  getAllSiteContent(): Promise<SiteContent[]>;
  getContentSectionCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }

  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async createAdmin(admin: InsertAdminUser & { isFirstAdmin?: boolean }): Promise<AdminUser> {
    const cnt = await this.getAdminCount();
    const isFirst = cnt === 0;
    const [created] = await db.insert(adminUsers).values({
      ...admin,
      isApproved: isFirst,
      isFirstAdmin: isFirst,
    }).returning();
    return created;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return db.select().from(adminUsers);
  }

  async approveAdmin(id: number): Promise<void> {
    await db.update(adminUsers).set({ isApproved: true }).where(eq(adminUsers.id, id));
  }

  async getAdminCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(adminUsers);
    return result?.count ?? 0;
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(msg).returning();
    return created;
  }

  async getChatsBySession(sessionId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }

  async getAllChatSessions(): Promise<{ sessionId: string; messageCount: number; lastMessage: Date }[]> {
    const all = await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
    const sessions = new Map<string, { count: number; last: Date }>();
    for (const msg of all) {
      const existing = sessions.get(msg.sessionId);
      if (existing) {
        existing.count++;
        if (msg.createdAt > existing.last) existing.last = msg.createdAt;
      } else {
        sessions.set(msg.sessionId, { count: 1, last: msg.createdAt });
      }
    }
    return Array.from(sessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      messageCount: data.count,
      lastMessage: data.last,
    }));
  }

  async getChatSessionCount(): Promise<number> {
    const sessions = await this.getAllChatSessions();
    return sessions.length;
  }

  async getChatContactCount(): Promise<number> {
    const sessions = await this.getAllChatSessions();
    return sessions.filter(s => s.messageCount > 2).length;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async markLeadRead(id: number): Promise<void> {
    await db.update(leads).set({ isRead: true }).where(eq(leads.id, id));
  }

  async getLeadCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(leads);
    return result?.count ?? 0;
  }

  async getUnreadLeadCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(leads).where(eq(leads.isRead, false));
    return result?.count ?? 0;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostsByStatus(status: string): Promise<BlogPost[]> {
    return db.select().from(blogPosts).where(eq(blogPosts.status, status)).orderBy(desc(blogPosts.createdAt));
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db.update(blogPosts).set({ ...data, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogPostCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(blogPosts);
    return result?.count ?? 0;
  }

  async getSiteContent(sectionKey: string, language: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(
      and(eq(siteContent.sectionKey, sectionKey), eq(siteContent.language, language))
    );
    return content;
  }

  async upsertSiteContent(sectionKey: string, language: string, contentJson: string): Promise<SiteContent> {
    const existing = await this.getSiteContent(sectionKey, language);
    if (existing) {
      const [updated] = await db.update(siteContent).set({ contentJson, updatedAt: new Date() }).where(eq(siteContent.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(siteContent).values({ sectionKey, language, contentJson }).returning();
    return created;
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return db.select().from(siteContent);
  }

  async getContentSectionCount(): Promise<number> {
    const all = await this.getAllSiteContent();
    const uniqueSections = new Set(all.map(c => c.sectionKey));
    return uniqueSections.size;
  }
}

export const storage = new DatabaseStorage();
