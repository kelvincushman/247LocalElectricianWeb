import { Phone, Zap, Shield, Clock, CheckCircle, Star, MapPin, MessageCircle, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AISparky from "@/components/AISparky";
import { Link } from "react-router-dom";

const Index = () => {
  const services = [
    { title: "Electric Showers", icon: Zap, accent: "primary", description: "Professional installation & upgrades" },
    { title: "Cooker & Hob Installation", icon: CheckCircle, accent: "primary", description: "Safe connection of cooking appliances" },
    { title: "Fault Finding", icon: Zap, accent: "emergency", description: "Expert diagnosis & repairs" },
    { title: "Consumer Unit Upgrades", icon: Shield, accent: "emergency", description: "Modern fuse board installations" },
    { title: "Kitchen & Bathroom Rewires", icon: Zap, accent: "primary", description: "Partial rewiring solutions" },
    { title: "EV Car Chargers", icon: Zap, accent: "emergency", description: "Home charging installations" },
    { title: "Electrical Testing & EICRs", icon: Shield, accent: "primary", description: "Safety inspections & certificates" },
    { title: "Landlord Certificates", icon: CheckCircle, accent: "emergency", description: "Compliance documentation" },
  ];

  const whyChooseUs = [
    { title: "Over 65 Years' Combined Experience", icon: Award },
    { title: "Gold Card JIB Electricians", icon: Shield },
    { title: "Enhanced DBS-Checked", icon: CheckCircle },
    { title: "Based in Bilston - Local & Fast", icon: MapPin },
    { title: "Specialists in Small Domestic Jobs", icon: Zap },
    { title: "Fully Compliant with BS 7671", icon: Shield },
  ];

  const reviews = [
    { name: "John M.", location: "Wolverhampton", text: "Kelvin arrived within an hour and sorted our tripping circuits. Very knowledgeable and explained everything clearly.", rating: 5 },
    { name: "Sarah T.", location: "Walsall", text: "Andy did a fantastic job on our kitchen rewire. Clean, professional work at a fair price.", rating: 5 },
    { name: "Mike R.", location: "Dudley", text: "Excellent service for our consumer unit upgrade. Both electricians are clearly very experienced.", rating: 5 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Your Trusted Local Electricians in Bilston & West Midlands
                </h1>
                <p className="text-xl md:text-2xl mb-6 opacity-95 font-semibold">
                  Over 65 years' combined experience. Gold Card JIB Electricians. BS 7671 compliant.
                </p>
                <p className="text-lg mb-8 opacity-90">
                  Kelvin & Andy provide safe, reliable and affordable electrical services. No call centres. No hassle. Just honest, qualified electricians.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <a href="tel:01234567890">
                    <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold w-full sm:w-auto">
                      <Phone className="mr-2 h-6 w-6" />
                      CALL 24/7
                    </Button>
                  </a>
                  <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-6 font-bold w-full sm:w-auto">
                      <MessageCircle className="mr-2 h-6 w-6" />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-bold">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                    <Shield className="h-4 w-4" />
                    <span>Gold Card JIB</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    <span>DBS Checked</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                    <Star className="h-4 w-4" />
                    <span>65+ Years Experience</span>
                  </div>
                </div>
              </div>

              {/* AI Sparky Tool */}
              <div className="lg:pl-8">
                <AISparky />
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team Teaser */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex -space-x-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl border-4 border-background">K</div>
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-black text-2xl border-4 border-background">A</div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">Meet Kelvin & Andy</h2>
                <p className="text-muted-foreground mb-3">Two local electricians with over 65 years' combined experience, bringing professional electrical services back to Bilston and the Black Country.</p>
                <Link to="/about">
                  <Button variant="outline" className="font-bold">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4 text-foreground">
              Our Most Popular Services
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              All services carried out in full compliance with BS 7671:2018+A2:2022 regulations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isEmergency = service.accent === "emergency";
                return (
                  <Card key={index} className={`border-2 hover:shadow-lg transition-all ${isEmergency ? 'border-emergency hover:border-emergency' : 'border-primary hover:border-primary'}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isEmergency ? 'bg-emergency/10' : 'bg-primary/10'}`}>
                        <Icon className={`h-8 w-8 ${isEmergency ? 'text-emergency' : 'text-primary'}`} />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${isEmergency ? 'text-emergency' : 'text-primary'}`}>
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link to="/services">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              Why Choose 24/7 Local Electrician?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-bold">{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Area Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
              Proudly Serving Bilston & the West Midlands
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We operate within a 15-mile radius of Bilston, covering the Black Country, Birmingham and surrounding areas.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["Bilston", "Wolverhampton", "Walsall", "Dudley", "West Bromwich", "Birmingham", "Tipton", "Wednesbury", "Cannock", "Lichfield"].map((area) => (
                <span key={area} className="bg-muted text-foreground px-4 py-2 rounded-full font-semibold text-sm">
                  {area}
                </span>
              ))}
            </div>
            <Link to="/service-areas">
              <Button size="lg" variant="outline" className="font-bold border-2">
                View Full Coverage Area
              </Button>
            </Link>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-foreground">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.map((review, index) => (
                <Card key={index} className="bg-background">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-emergency text-emergency" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">"{review.text}"</p>
                    <div className="font-bold text-primary">
                      {review.name} <span className="text-muted-foreground font-normal">- {review.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Need an Electrician? We're Ready to Help
            </h2>
            <p className="text-xl mb-8 opacity-90">24/7 emergency support available</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01234567890">
                <Button size="lg" variant="outline" className="bg-background text-emergency border-2 border-background hover:bg-background/90 text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  CALL NOW
                </Button>
              </a>
              <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 text-xl px-8 py-6 font-bold">
                  <MessageCircle className="mr-2 h-6 w-6" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-emergency-foreground border-2 border-emergency-foreground hover:bg-emergency-foreground/10 text-xl px-8 py-6 font-bold">
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

export default Index;
