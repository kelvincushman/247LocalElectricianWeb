import {
  Phone,
  MessageCircle,
  FileCheck,
  Bell,
  Lightbulb,
  Plug,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  Building2,
  Users,
  Percent,
  Award,
  Star,
  ChevronRight,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  pricingTiers,
  landlordServices,
  calculatePrice,
  formatPrice,
  coverageAreas,
  trustBadges,
  landlordTestimonials
} from "@/data/landlordServices";

const PropertyManagers = () => {
  // Map trust badge icons
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "shield-check": return Shield;
      case "clock": return Clock;
      case "file-check": return FileCheck;
      case "shield": return Shield;
      case "award": return Award;
      default: return CheckCircle;
    }
  };

  // Benefits for property professionals
  const benefits = [
    {
      title: "Volume Discounts",
      description: "Up to 25% off for contract clients with 20+ properties",
      icon: Percent
    },
    {
      title: "Priority Booking",
      description: "Dedicated scheduling for trade partners and contract clients",
      icon: Clock
    },
    {
      title: "Same-Day Certificates",
      description: "Digital certificates emailed within hours of inspection",
      icon: FileCheck
    },
    {
      title: "Account Management",
      description: "Dedicated contact for portfolios of 20+ properties",
      icon: Users
    },
    {
      title: "Flexible Scheduling",
      description: "Evening and weekend slots available for tenant access",
      icon: Clock
    },
    {
      title: "Multi-Property Bookings",
      description: "Book multiple properties in one call, one invoice",
      icon: Building2
    },
  ];

  // Calculate example pricing for comparison table
  const examplePricing = [
    { service: "EICR (2-3 bed)", basePrice: 150 },
    { service: "Fire Alarm Service", basePrice: 85 },
    { service: "Emergency Light Test", basePrice: 75 },
    { service: "PAT Testing (20 items)", basePrice: 50 },
    { service: "Smoke/CO Compliance", basePrice: 180 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Electrical Services for Landlords & Property Managers | 247Electrician | Black Country & Birmingham</title>
        <meta
          name="description"
          content="EICR certificates, fire alarm testing, emergency lighting, PAT testing for landlords and property managers. Volume discounts up to 25% off. Same-day certificates. Covering Wolverhampton, Birmingham, Walsall, Dudley & West Midlands."
        />
        <link rel="canonical" href="https://247electrician.uk/landlords" />
        <meta property="og:title" content="Electrical Services for Landlords & Property Managers | 247Electrician" />
        <meta property="og:description" content="Compliance made simple. Trade rates for property professionals. EICR, fire alarms, emergency lighting, PAT testing. Up to 25% volume discounts." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://247electrician.uk/landlords" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">For Property Professionals</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Electrical Services for<br />
                <span className="text-emergency">Landlords & Property Managers</span>
              </h1>
              <p className="text-xl md:text-2xl mb-4 opacity-95">
                Compliance Made Simple. Trade Rates. Priority Service.
              </p>
              <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
                From single lets to large portfolios — we help property professionals stay compliant with transparent pricing and fast turnaround.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <a href="tel:01902943929">
                  <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                    <Phone className="mr-2 h-6 w-6" />
                    Call for Trade Rates
                  </Button>
                </a>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-xl px-8 py-6 font-bold">
                    <MessageCircle className="mr-2 h-6 w-6" />
                    Request Quote
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4">
                {trustBadges.map((badge, index) => {
                  const Icon = getBadgeIcon(badge.icon);
                  return (
                    <div key={index} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold text-sm">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Volume Discount Tiers */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Volume Discounts That Reward Loyalty
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The more properties you manage, the more you save. Our tiered pricing rewards ongoing partnerships.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`text-center h-full ${tier.name === 'contract' ? 'border-2 border-emergency ring-2 ring-emergency/20' : 'border-2 border-primary/20'}`}>
                    {tier.name === 'contract' && (
                      <div className="bg-emergency text-emergency-foreground text-sm font-bold py-2">
                        BEST VALUE
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className={`text-5xl font-black ${tier.name === 'contract' ? 'text-emergency' : 'text-primary'}`}>
                        {tier.discount > 0 ? `${tier.discount}%` : 'Standard'}
                      </div>
                      <CardTitle className="text-xl font-bold">{tier.label}</CardTitle>
                      <p className="text-muted-foreground text-sm">{tier.properties} properties</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{tier.description}</p>
                      {tier.discount > 0 && (
                        <p className="font-semibold text-primary">
                          Save {tier.discount}% on all services
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pricing Comparison Table */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6 text-foreground">Example Pricing Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-4 font-bold">Service</th>
                      <th className="text-center p-4 font-bold">Standard</th>
                      <th className="text-center p-4 font-bold">Trade (15% off)</th>
                      <th className="text-center p-4 font-bold bg-emergency">Contract (25% off)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examplePricing.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                        <td className="p-4 font-medium">{item.service}</td>
                        <td className="text-center p-4">{formatPrice(item.basePrice)}</td>
                        <td className="text-center p-4 text-primary font-semibold">
                          {formatPrice(calculatePrice(item.basePrice, 'trade'))}
                        </td>
                        <td className="text-center p-4 text-emergency font-bold bg-emergency/5">
                          {formatPrice(calculatePrice(item.basePrice, 'contract'))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                * Prices shown are examples. Final pricing depends on property size and requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Compliance Services for Property Professionals
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                All the electrical testing and certification you need to keep your rental properties compliant.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {landlordServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/landlords/${service.slug}`} className="block h-full">
                      <Card className="h-full border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all group">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-primary group-hover:text-primary/80">
                                {service.shortTitle}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">{service.frequency}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {service.heroIntro.substring(0, 120)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary">
                              From {formatPrice(service.pricing[0].standard)}
                            </span>
                            <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                              Learn More <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Why Property Professionals Choose Us
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                We understand the unique needs of landlords, letting agents, and property managers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                      <p className="opacity-80 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Trusted by Property Professionals
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it — here's what our trade clients say.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {landlordTestimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-emergency text-emergency" />
                        ))}
                      </div>
                      <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-bold text-primary">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Areas */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                Covering the Black Country, Birmingham & Beyond
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fast, local electrical services for property professionals across the West Midlands.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-8">
              {coverageAreas.map((area) => (
                <Link
                  key={area.slug}
                  to={`/areas/${area.slug}`}
                  className="inline-flex items-center gap-2 bg-background hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full font-semibold transition-colors border border-primary/20"
                >
                  <MapPin className="h-4 w-4" />
                  {area.name}
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to="/service-areas">
                <Button variant="outline" size="lg" className="font-bold">
                  View Full Coverage Map
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Become a Trade Partner?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Contact us today to discuss your portfolio requirements and unlock your trade discount.
            </p>
            <a href="tel:01902943929" className="inline-block mb-6">
              <p className="text-5xl md:text-6xl font-black hover:scale-105 transition-transform">
                01902 943 929
              </p>
            </a>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  Call Now
                </Button>
              </a>
              <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-6 font-bold">
                  <MessageCircle className="mr-2 h-6 w-6" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-xl px-8 py-6 font-bold">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Electrical Testing Services for Landlords",
            "provider": {
              "@type": "LocalBusiness",
              "name": "247Electrician",
              "telephone": "01902943929",
              "url": "https://247electrician.uk",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bilston",
                "addressRegion": "West Midlands",
                "addressCountry": "GB"
              }
            },
            "areaServed": coverageAreas.map(area => area.name),
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Landlord Electrical Services",
              "itemListElement": landlordServices.map(service => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": service.title
                }
              }))
            }
          })}
        </script>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyManagers;
