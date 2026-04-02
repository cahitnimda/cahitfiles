import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BlogListPage() {
  const query = useQuery({
    queryKey: ["/api/blog-posts"],
  });
  const posts = Array.isArray(query.data) ? query.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="bg-[#0A3D6B] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-sky-200 transition" data-testid="link-home">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-lg font-bold" data-testid="text-blog-header">Cahit Blog</h1>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2" data-testid="text-blog-title">Blog & Insights</h2>
        <p className="text-slate-600 mb-8">Latest news, projects, and industry expertise from Cahit Trading & Contracting</p>
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No published posts yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} data-testid={`blog-card-${post.id}`}>
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer group h-full">
                  {post.featuredImage && (
                    <img src={post.featuredImage} alt={post.titleEn} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      {post.category && (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {post.category}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition mb-2">{post.titleEn}</h3>
                    {post.excerptEn && <p className="text-sm text-slate-600 line-clamp-3">{post.excerptEn}</p>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const [, navigate] = useLocation();
  const query = useQuery({
    queryKey: ["/api/blog-posts", slug],
  });

  if (query.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" /></div>;
  }

  const post = query.data as any;
  if (!post || query.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500">Post not found</p>
        <Link href="/blog" className="text-sky-600 hover:text-sky-700 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-[#0A3D6B] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-white hover:text-sky-200 transition" data-testid="link-blog-list">
            <ArrowLeft className="w-4 h-4" /> All Posts
          </Link>
          <Link href="/" className="text-sm text-sky-200 hover:text-white transition" data-testid="link-home-detail">Home</Link>
        </div>
      </nav>
      {post.featuredImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.featuredImage} alt={post.titleEn} className="w-full h-full object-cover" data-testid="img-featured" />
        </div>
      )}
      <article className="max-w-4xl mx-auto px-6 py-10" data-testid="blog-article">
        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full font-medium">{post.category}</span>
          )}
          <span className="text-sm text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" data-testid="text-post-title">{post.titleEn}</h1>
        {post.excerptEn && <p className="text-lg text-slate-600 mb-8 border-l-4 border-sky-400 pl-4 italic">{post.excerptEn}</p>}
        <div className="prose prose-slate max-w-none" data-testid="text-post-content">
          {post.contentEn.split("\n").map((para: string, i: number) => {
            if (para.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{para.slice(2)}</h1>;
            if (para.startsWith("## ")) return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{para.slice(3)}</h2>;
            if (para.startsWith("### ")) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{para.slice(4)}</h3>;
            if (para.trim() === "") return <br key={i} />;
            return <p key={i} className="text-slate-700 leading-relaxed mb-4">{para}</p>;
          })}
        </div>
        {post.titleAr && (
          <div className="mt-12 pt-8 border-t border-slate-200" dir="rtl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{post.titleAr}</h2>
            {post.contentAr && (
              <div className="prose prose-slate max-w-none">
                {post.contentAr.split("\n").map((para: string, i: number) => (
                  <p key={i} className="text-slate-700 leading-relaxed mb-4">{para}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
