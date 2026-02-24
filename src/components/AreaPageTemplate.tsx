import { Helmet } from "react-helmet-async";
import { MapPin, Phone, MessageCircle, CheckCircle, Shield, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import AreaMap from "@/components/AreaMap";

interface NearbyArea {
  slug: string;
  name: string;
}

interface AreaPageTemplateProps {
  areaName: string;
  metaTitle: string;
  metaDescription: string;
  coordinates: { lat: number; lng: number };
  region: string;
  postcode: string;
  mainContent: React.ReactNode;
  nearbyAreas: NearbyArea[];
}

const AreaPageTemplate = ({
  areaName,
  metaTitle,
  metaDescription,
  coordinates,
  region,
  postcode,
  mainContent,
  nearbyAreas,
}: AreaPageTemplateProps) => {
  const services = [
    { title: "Emergency Callouts", href: "/services/emergency-callouts", description: "24/7 rapid response" },
    { title: "Fuse Board Upgrades", href: "/services/fuse-board-upgrades", description: "Modern consumer units" },
    { title: "EICR Certificates", href: "/services/eicr-certificates", description: "Electrical safety testing" },
    { title: "Rewiring", href: "/services/rewiring", description: "Full & partial rewires" },
    { title: "EV Charger Installation", href: "/services/ev-charger-installation", description: "Home charging points" },
    { title: "Ventilation & Fans", href: "/services/ventilation-installation", description: "Damp & mould prevention" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://247electrician.uk/areas/${areaName.toLowerCase().replace(/\s+/g, "-")}`} />
      </Helmet>

      <Header />
      <Breadcrumbs
        items={[{ name: "Service Areas", href: "/service-areas" }]}
        currentPage={areaName}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="h-8 w-8" />
                <span className="text-lg font-semibold opacity-90">{region}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                Electrician in {areaName}
              </h1>
              <p className="text-xl opacity-90 mb-2">
                24/7 Emergency & Domestic Electrical Services
              </p>
              <p className="text-lg opacity-80 mb-8">
                Covering {postcode} and surrounding areas
              </p>

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

        {/* Trust Badges */}
        <section className="py-6 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-semibold">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>NAPIT Approved</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Fast Response to {areaName}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5 text-green-600" />
                <span>BS 7671 Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                Our Coverage in {areaName}
              </h2>
              <AreaMap coordinates={coordinates} areaName={areaName} radius={3000} />
              <p className="text-center text-muted-foreground mt-4">
                We provide fast electrical services throughout {areaName} and the surrounding {postcode} area
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {mainContent}
            </div>
          </div>
        </section>

        {/* Services in Area */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-8 text-foreground">
              Electrical Services in {areaName}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {services.map((service) => (
                <Link key={service.href} to={service.href}>
                  <Card className="border-2 border-primary hover:border-emergency transition-colors h-full">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-primary mb-1">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/services">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Local */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-8">
              Why Choose a Local {areaName} Electrician?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Fast Response</h3>
                  <p className="opacity-90">
                    Based locally, we can reach {areaName} quickly for emergencies and scheduled work
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Local Knowledge</h3>
                  <p className="opacity-90">
                    We understand the properties and electrical systems typical in {areaName}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Trusted Locally</h3>
                  <p className="opacity-90">
                    We've served customers across {region} for years with excellent reviews
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Nearby Areas */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              We Also Cover Nearby Areas
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {nearbyAreas.map((area) => (
                <Link
                  key={area.slug}
                  to={`/areas/${area.slug}`}
                  className="bg-muted hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full font-semibold transition-colors"
                >
                  {area.name}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/service-areas" className="text-primary hover:underline font-semibold">
                View all service areas →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Need an Electrician in {areaName}?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Call us now for a free quote or emergency callout
            </p>
            <a href="tel:01902943929" className="inline-block">
              <p className="text-4xl md:text-5xl font-black mb-8 hover:scale-105 transition-transform">
                01902 943 929
              </p>
            </a>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 font-bold text-lg px-8 py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
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

export default AreaPageTemplate;
