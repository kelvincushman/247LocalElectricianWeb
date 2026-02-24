import { useState, useEffect } from "react";
import { Phone, MessageCircle, Camera, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveBentoGallery, { MediaItemType } from "@/components/ui/interactive-bento-gallery";
import Breadcrumbs from "@/components/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  span: string;
  is_featured: boolean;
}

const Gallery = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/gallery/categories`),
          fetch(`${API_URL}/gallery/items${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`),
        ]);

        if (!categoriesRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch gallery data');
        }

        const categoriesData = await categoriesRes.json();
        const itemsData = await itemsRes.json();

        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((c: Category) => c.slug !== 'all-work') : []);
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setHasError(false);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Convert database items to InteractiveBentoGallery format
  const mediaItems: MediaItemType[] = items.map((item, index) => ({
    id: index + 1,
    type: item.type,
    title: item.title,
    desc: item.description || '',
    url: item.url,
    span: item.span || 'md:col-span-1 md:row-span-2',
    category: item.category_name,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Gallery | Our Electrical Work | 247Electrician Black Country & Birmingham</title>
        <meta name="description" content="View examples of our electrical work: consumer unit upgrades, rewiring, EV charger installations, lighting and more. Professional results across Black Country & Birmingham." />
        <link rel="canonical" href="https://247electrician.uk/gallery" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Gallery" },
              ]}
              className="mb-4"
            />
            <div className="text-center">
              <Camera className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">Our Work Gallery</h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
                Browse examples of our electrical work across the West Midlands. All work completed to BS 7671 standards.
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
                All Work
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

        {/* Gallery Content */}
        <section className="py-8 md:py-12 bg-background">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : hasError || items.length === 0 ? (
            <div className="container mx-auto px-4">
              <div className="text-center py-16 bg-muted/50 rounded-xl max-w-2xl mx-auto">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {hasError ? 'Gallery Loading...' : 'Gallery Coming Soon'}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasError
                    ? 'We\'re updating our gallery with new photos. Please check back shortly.'
                    : 'We\'re currently adding photos of our work. Check back soon for examples of completed projects.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <InteractiveBentoGallery
              mediaItems={mediaItems}
              title=""
              description=""
            />
          )}
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6">Want Similar Work Done?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">Contact us for a free quote on your electrical project</p>
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

export default Gallery;
