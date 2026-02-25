import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Tag, User, ArrowLeft, Phone, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface BlogPostType {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post and recent posts in parallel
        const [postRes, recentRes] = await Promise.all([
          fetch(`${API_URL}/blog/posts/${slug}`),
          fetch(`${API_URL}/blog/posts?status=published`),
        ]);

        if (!postRes.ok) {
          if (postRes.status === 404) {
            setNotFound(true);
          }
          throw new Error('Post not found');
        }

        const postData = await postRes.json();
        setPost(postData);

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          const filtered = Array.isArray(recentData)
            ? recentData.filter((p: BlogPostType) => p.slug !== slug).slice(0, 3)
            : [];
          setRecentPosts(filtered);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      setIsLoading(true);
      setNotFound(false);
      fetchData();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Post Not Found | 247Electrician Blog</title>
        </Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl font-black text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{post.title} | 247Electrician Blog</title>
        <meta name="description" content={post.excerpt || `Read ${post.title} on 247Electrician blog.`} />
        <link rel="canonical" href={`https://247electrician.uk/blog/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog", href: "/blog" },
                  { label: post.title },
                ]}
                className="mb-4"
              />
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 mb-4">
                {post.category_name && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {post.category_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at || post.created_at)}
                </span>
                {post.author_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author_name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Featured Image */}
                  {post.featured_image && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-8">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Content */}
                  <article
                    className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '') }}
                  />

                  {/* Share */}
                  <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-bold text-foreground">Share this article:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: post.title,
                              url: window.location.href,
                            });
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Back Link */}
                  <div className="mt-8">
                    <Link to="/blog">
                      <Button variant="outline" className="font-bold">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  {/* CTA Card */}
                  <Card className="border-2 border-emergency mb-8 sticky top-24">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-black text-foreground mb-4">Need Help?</h3>
                      <p className="text-muted-foreground mb-6">
                        Our qualified electricians are ready to help with any electrical issue.
                      </p>
                      <div className="space-y-3">
                        <a href="tel:01902943929" className="block">
                          <Button className="w-full bg-emergency hover:bg-emergency/90 font-bold">
                            <Phone className="mr-2 h-4 w-4" />
                            Call Us
                          </Button>
                        </a>
                        <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer" className="block">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Posts */}
                  {recentPosts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-foreground mb-4">Related Articles</h3>
                      <div className="space-y-4">
                        {recentPosts.map((recentPost) => (
                          <Link key={recentPost.id} to={`/blog/${recentPost.slug}`} className="block">
                            <Card className="hover:border-primary transition-colors">
                              <CardContent className="p-4">
                                <h4 className="font-bold text-primary text-sm leading-tight hover:underline">
                                  {recentPost.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(recentPost.published_at || recentPost.created_at)}
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-black mb-4">Have Questions About Your Electrics?</h2>
            <p className="text-lg mb-6 opacity-90">Get expert advice from our qualified electricians</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="w-full sm:w-auto bg-background text-primary hover:bg-background/90 font-bold">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold">
                  Request Callback
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
