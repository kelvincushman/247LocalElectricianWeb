import { Phone, MessageCircle, CheckCircle, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LucideIcon } from "lucide-react";

interface RelatedService {
  title: string;
  href: string;
  description: string;
}

interface ServicePageProps {
  title: string;
  slug?: string; // URL slug for canonical - if not provided, auto-generated from title
  metaTitle: string;
  metaDescription: string;
  heroIcon: LucideIcon;
  intro: string;
  benefits: string[];
  mainContent: React.ReactNode;
  standards: string[];
  relatedServices: RelatedService[];
  afterContent?: React.ReactNode;
}

const ServicePageTemplate = ({
  title,
  slug,
  metaTitle,
  metaDescription,
  heroIcon: HeroIcon,
  intro,
  benefits,
  mainContent,
  standards,
  relatedServices,
  afterContent,
}: ServicePageProps) => {
  // Use provided slug or auto-generate from title
  const urlSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{metaTitle} | 247Electrician</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${metaTitle} | 247Electrician`} />
        <meta property="og:description" content={metaDescription} />
        <link rel="canonical" href={`https://247electrician.uk/services/${urlSlug}`} />
      </Helmet>

      <Header />
      <Breadcrumbs
        items={[{ name: "Services", href: "/services" }]}
        currentPage={title}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <HeroIcon className="h-10 w-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6">{title}</h1>
              <p className="text-xl opacity-90 mb-8">{intro}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:01902943929">
                  <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold text-lg px-8 py-6">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </Button>
                </a>
                <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {mainContent}
            </div>
          </div>
        </section>

        {/* British Standards Compliance */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-4">Compliance & Standards</h2>
              <p className="opacity-90 mb-6">All our work complies with the following British Standards:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {standards.map((standard, index) => (
                  <span key={index} className="bg-white/10 px-4 py-2 rounded-full font-bold text-sm">
                    {standard}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* After Content (FAQs, etc.) */}
        {afterContent}

        {/* Related Services */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-8 text-foreground">Related Services</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedServices.map((service, index) => (
                <Link key={index} to={service.href}>
                  <Card className="h-full border-2 hover:border-primary transition-colors group">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-emergency transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <span className="text-primary font-semibold flex items-center gap-1 group-hover:text-emergency transition-colors">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us today for a free, no-obligation quote
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 font-bold text-lg px-8 py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  01902 943 929
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6">
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

export default ServicePageTemplate;
