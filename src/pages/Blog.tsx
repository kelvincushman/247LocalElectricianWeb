import { Calendar, Tag, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { blogPosts, getAllCategories } from "@/data/blogPosts";

const Blog = () => {
  const categories = getAllCategories();
  const sortedPosts = [...blogPosts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">Electrical Advice & Tips</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Expert guidance on electrical safety, regulations, and home improvements from qualified electricians
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm font-bold text-muted-foreground mr-2">Filter by:</span>
              {categories.map((category) => (
                <span
                  key={category}
                  className="bg-background text-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sortedPosts.map((post) => (
                <Card key={post.id} className="border-2 hover:border-primary transition-colors flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Tag className="h-4 w-4" />
                      <span>{post.category}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <CardTitle className="text-primary leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <CardDescription className="text-base flex-grow">
                      {post.excerpt}
                    </CardDescription>
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Need Help With Your Electrics?</h2>
            <p className="text-xl mb-8 opacity-90">Our qualified electricians are ready to help</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01234567890">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 font-bold text-lg px-8 py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </Button>
              </a>
              <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6">
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
