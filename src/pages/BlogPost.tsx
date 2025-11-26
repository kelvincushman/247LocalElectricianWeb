import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Tag, ArrowLeft, Phone, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPostBySlug, getRecentPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const recentPosts = getRecentPosts(3).filter(p => p.slug !== slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
              <div className="flex items-center gap-4 text-sm opacity-80 mb-4">
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.date)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-black prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {post.content.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('## ')) {
                          return (
                            <h2 key={index} className="text-2xl font-black text-foreground mt-8 mb-4">
                              {paragraph.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (paragraph.startsWith('- ')) {
                          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                          return (
                            <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                              {items.map((item, i) => (
                                <li key={i}>{item.replace('- ', '')}</li>
                              ))}
                            </ul>
                          );
                        }
                        if (paragraph.match(/^\d+\./)) {
                          const items = paragraph.split('\n').filter(line => line.match(/^\d+\./));
                          return (
                            <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                              {items.map((item, i) => (
                                <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                              ))}
                            </ol>
                          );
                        }
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return (
                            <p key={index} className="font-bold text-foreground my-4 p-4 bg-muted rounded-lg">
                              {paragraph.replace(/\*\*/g, '')}
                            </p>
                          );
                        }
                        return (
                          <p key={index} className="my-4">
                            {paragraph.split('**').map((part, i) =>
                              i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </article>

                  {/* Share */}
                  <div className="mt-12 pt-8 border-t">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">Share this article:</span>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
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
                        <a href="tel:01234567890" className="block">
                          <Button className="w-full bg-emergency hover:bg-emergency/90 font-bold">
                            <Phone className="mr-2 h-4 w-4" />
                            Call Us
                          </Button>
                        </a>
                        <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer" className="block">
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
                                  {formatDate(recentPost.date)}
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
            <p className="text-lg mb-6 opacity-90">Get expert advice from Kelvin & Andy</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01234567890">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 font-bold">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-bold">
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
