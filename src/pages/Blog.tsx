import { useState, useEffect } from "react";
import { Calendar, Tag, ArrowRight, Phone, MessageCircle, FileText, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
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

const Blog = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let postsUrl = `${API_URL}/blog/posts?status=published`;
        if (selectedCategory !== 'all') {
          postsUrl += `&category=${selectedCategory}`;
        }

        const [categoriesRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/blog/categories`),
          fetch(postsUrl),
        ]);

        if (!categoriesRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch blog data');
        }

        const categoriesData = await categoriesRes.json();
        const postsData = await postsRes.json();

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setHasError(false);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Blog | Electrical Tips & Advice | 247Electrician Black Country & Birmingham</title>
        <meta name="description" content="Electrical tips, safety advice and industry news from 247Electrician. Learn about EICR requirements, EV charging, energy saving and more from qualified electricians." />
        <link rel="canonical" href="https://247electrician.uk/blog" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog" },
              ]}
              className="mb-4"
            />
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">Electrical Advice & Tips</h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
                Expert guidance on electrical safety, regulations, and home improvements from qualified electricians
              </p>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-6 bg-muted border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
              <span className="text-sm font-bold text-muted-foreground mr-2 hidden sm:inline">Filter:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-primary/10'
                }`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-primary/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : hasError || posts.length === 0 ? (
              <div className="text-center py-16 bg-muted/50 rounded-xl max-w-2xl mx-auto">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {hasError ? 'Blog Loading...' : 'Blog Posts Coming Soon'}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasError
                    ? 'We\'re updating our blog. Please check back shortly.'
                    : 'We\'re currently writing new articles. Check back soon for electrical tips and advice.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                {posts.map((post) => (
                  <Card key={post.id} className="border-2 hover:border-primary transition-colors flex flex-col overflow-hidden">
                    {post.featured_image && (
                      <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </Link>
                    )}
                    <CardHeader className={post.featured_image ? 'pt-4' : ''}>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {post.category_name && (
                          <>
                            <Tag className="h-4 w-4" />
                            <span>{post.category_name}</span>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <CardTitle className="text-primary leading-tight">
                        <Link to={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      {post.excerpt && (
                        <CardDescription className="text-base flex-grow">
                          {post.excerpt}
                        </CardDescription>
                      )}
                      <Link to={`/blog/${post.slug}`} className="mt-4 inline-block">
                        <Button variant="outline" className="font-bold">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6">Need Help With Your Electrics?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">Our qualified electricians are ready to help</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="w-full sm:w-auto bg-background text-emergency hover:bg-background/90 font-bold text-lg px-8 py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </Button>
              </a>
              <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
