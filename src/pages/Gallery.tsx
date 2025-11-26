import { Phone, MessageCircle, Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Gallery = () => {
  // Placeholder gallery items - replace with actual images
  const galleryItems = [
    {
      id: 1,
      title: "Consumer Unit Upgrade",
      description: "Modern 18-way consumer unit with RCD protection installed in Wolverhampton",
      category: "Consumer Units",
    },
    {
      id: 2,
      title: "Kitchen Rewire",
      description: "Complete kitchen electrical installation including new circuits for appliances",
      category: "Rewiring",
    },
    {
      id: 3,
      title: "EV Charger Installation",
      description: "7kW home EV charging point installed in Bilston",
      category: "EV Charging",
    },
    {
      id: 4,
      title: "Bathroom Electrics",
      description: "IP-rated downlights and extractor fan installation",
      category: "Bathrooms",
    },
    {
      id: 5,
      title: "Electric Shower Install",
      description: "9.5kW electric shower installation with dedicated circuit",
      category: "Showers",
    },
    {
      id: 6,
      title: "Outdoor Lighting",
      description: "Garden lighting installation with weatherproof fittings",
      category: "Lighting",
    },
    {
      id: 7,
      title: "Fuse Board Replacement",
      description: "Old rewirable fuse board upgraded to modern RCBO board",
      category: "Consumer Units",
    },
    {
      id: 8,
      title: "Cooker Connection",
      description: "New electric oven and hob installation with isolator switch",
      category: "Appliances",
    },
    {
      id: 9,
      title: "Smoke Alarm Circuit",
      description: "Interlinked smoke and heat detector installation",
      category: "Safety",
    },
  ];

  const categories = [...new Set(galleryItems.map(item => item.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <Camera className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-black mb-6">Our Work Gallery</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Browse examples of our electrical work across the West Midlands. All work completed to BS 7671 standards.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm font-bold text-muted-foreground mr-2">Categories:</span>
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

        {/* Gallery Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {galleryItems.map((item) => (
                <Card key={item.id} className="border-2 hover:border-primary transition-colors overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                    <Image className="h-16 w-16 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">View Details</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-foreground mt-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Coming Soon Note */}
            <div className="text-center mt-12 p-8 bg-muted rounded-lg max-w-2xl mx-auto">
              <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">More Photos Coming Soon</h3>
              <p className="text-muted-foreground">
                We're constantly adding new examples of our work. Check back soon for more photos of completed projects across the West Midlands.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Want Similar Work Done?</h2>
            <p className="text-xl mb-8 opacity-90">Contact us for a free quote on your electrical project</p>
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

export default Gallery;
