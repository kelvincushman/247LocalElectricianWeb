import {
  Phone,
  MessageCircle,
  CheckCircle,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  Shield,
  FileCheck,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  type LandlordService,
  pricingTiers,
  calculatePrice,
  formatPrice,
  coverageAreas,
  getRelatedServices,
  trustBadges
} from "@/data/landlordServices";

interface LandlordServiceTemplateProps {
  service: LandlordService;
}

const LandlordServiceTemplate = ({ service }: LandlordServiceTemplateProps) => {
  const relatedServices = getRelatedServices(service.relatedServices);
  const Icon = service.icon;

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

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{service.metaTitle}</title>
        <meta name="description" content={service.metaDescription} />
        <link rel="canonical" href={`https://247electrician.uk/landlords/${service.slug}`} />
        <meta property="og:title" content={service.metaTitle} />
        <meta property="og:description" content={service.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://247electrician.uk/landlords/${service.slug}`} />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-muted py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/landlords" className="hover:text-primary">Landlords</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{service.shortTitle}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">Landlord Services</p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black">{service.title}</h1>
                </div>
              </div>
              <p className="text-lg md:text-xl opacity-95 mb-8 max-w-3xl">
                {service.heroIntro}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="tel:01902943929">
                  <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-lg px-6 py-5 font-bold">
                    <Phone className="mr-2 h-5 w-5" />
                    Call for Trade Rates
                  </Button>
                </a>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-6 py-5 font-bold">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Request Quote
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                {trustBadges.slice(0, 4).map((badge, index) => {
                  const BadgeIcon = getBadgeIcon(badge.icon);
                  return (
                    <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                      <BadgeIcon className="h-4 w-4" />
                      <span className="font-medium">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8">
                What's Included
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {service.whatsIncluded.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
                  Transparent Pricing
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Volume discounts for trade partners and contract clients. The more properties you manage, the more you save.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-background rounded-xl overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-4 font-bold">Service</th>
                      {pricingTiers.map((tier) => (
                        <th key={tier.name} className={`text-center p-4 font-bold ${tier.name === 'contract' ? 'bg-emergency' : ''}`}>
                          <div>{tier.label}</div>
                          <div className="text-xs font-normal opacity-80">
                            {tier.properties} properties
                            {tier.discount > 0 && ` (${tier.discount}% off)`}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {service.pricing.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                        <td className="p-4">
                          <div className="font-medium">{item.item}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                          {item.unit && (
                            <div className="text-xs text-muted-foreground">{item.unit}</div>
                          )}
                        </td>
                        {pricingTiers.map((tier) => (
                          <td
                            key={tier.name}
                            className={`text-center p-4 font-semibold ${tier.name === 'contract' ? 'bg-emergency/5 text-emergency' : 'text-primary'}`}
                          >
                            {formatPrice(calculatePrice(item.standard, tier.name))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                * All prices exclude VAT. Contact us for bespoke quotes on large portfolios.
              </p>
            </div>
          </div>
        </section>

        {/* Legal Requirements */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Shield className="h-10 w-10" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">Legal Requirements</h2>
                  <p className="opacity-80">Stay compliant and avoid penalties</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {service.legalRequirements.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-3 bg-white/10 p-4 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{requirement}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg">
                <p className="font-semibold text-lg">
                  <Clock className="h-5 w-5 inline mr-2" />
                  Testing Frequency: {service.frequency}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8 text-center">
                How It Works
              </h2>

              <div className="relative">
                {/* Timeline line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

                <div className="space-y-8">
                  {service.process.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex flex-col md:flex-row items-center gap-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                        <Card className="border-2 border-primary/20">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-xl z-10">
                        {step.step}
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {service.faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="border-2 border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-primary">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8 text-center">
                  Related Services
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {relatedServices.map((related, index) => {
                    const RelatedIcon = related.icon;
                    return (
                      <motion.div
                        key={related.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link to={`/landlords/${related.slug}`} className="block h-full">
                          <Card className="h-full border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all group">
                            <CardContent className="p-6 text-center">
                              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                <RelatedIcon className="h-7 w-7 text-primary" />
                              </div>
                              <h3 className="font-bold text-primary mb-2">{related.shortTitle}</h3>
                              <p className="text-sm text-muted-foreground">
                                From {formatPrice(related.pricing[0].standard)}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Coverage Areas */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Serving Landlords Across the West Midlands
              </h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {coverageAreas.map((area) => (
                  <Link
                    key={area.slug}
                    to={`/areas/${area.slug}`}
                    className="inline-flex items-center gap-1 bg-background hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded-full text-sm font-medium transition-colors border border-primary/20"
                  >
                    <MapPin className="h-3 w-3" />
                    {area.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Book Your {service.shortTitle}?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Call now for trade rates or request a quote for your property portfolio.
            </p>
            <a href="tel:01902943929" className="inline-block mb-6">
              <p className="text-4xl md:text-5xl font-black hover:scale-105 transition-transform">
                01902 943 929
              </p>
            </a>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 text-lg px-6 py-5 font-bold">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </a>
              <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-5 font-bold">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/landlords">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-6 py-5 font-bold">
                  View All Services
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
            "serviceType": service.title,
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
            "offers": service.pricing.map(price => ({
              "@type": "Offer",
              "name": price.item,
              "price": price.standard,
              "priceCurrency": "GBP"
            }))
          })}
        </script>
      </main>

      <Footer />
    </div>
  );
};

export default LandlordServiceTemplate;
