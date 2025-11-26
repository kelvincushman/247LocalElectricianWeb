import { Phone, Zap, Shield, Clock, CheckCircle, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  const services = [
    { title: "Emergency Callouts", icon: Zap, accent: "emergency", description: "24/7 rapid response for electrical emergencies" },
    { title: "Fault Finding & Repairs", icon: CheckCircle, accent: "primary", description: "Professional diagnosis and repairs" },
    { title: "Fuse Board Upgrades", icon: Shield, accent: "emergency", description: "Modern consumer unit installations" },
    { title: "Full & Partial Rewiring", icon: Zap, accent: "primary", description: "Complete rewiring solutions" },
    { title: "Lighting Installation", icon: Zap, accent: "emergency", description: "Indoor and outdoor lighting" },
    { title: "Socket Installation", icon: CheckCircle, accent: "primary", description: "Additional power points" },
    { title: "EV Charger Installation", icon: Zap, accent: "emergency", description: "Home charging solutions" },
    { title: "EICR Certificates", icon: Shield, accent: "primary", description: "Landlord safety inspections" },
  ];

  const whyChooseUs = [
    { title: "NICEIC Approved & Fully Insured", icon: Shield },
    { title: "Based in Bilston - Local & Fast", icon: MapPin },
    { title: "30-90 Minute Emergency Response", icon: Clock },
    { title: "Competitive Fixed Prices", icon: CheckCircle },
    { title: "No Hidden Call-Out Charges", icon: CheckCircle },
    { title: "5-Star Customer Reviews", icon: Star },
  ];

  const reviews = [
    { name: "John M.", location: "Wolverhampton", text: "Excellent service! Arrived within 45 minutes and fixed our power outage quickly.", rating: 5 },
    { name: "Sarah T.", location: "Walsall", text: "Professional and reliable. Great price for a full rewire.", rating: 5 },
    { name: "Mike R.", location: "Dudley", text: "Very impressed with the fuse board upgrade. Clean work and explained everything.", rating: 5 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Your Trusted Local Electrician in Bilston & West Midlands
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-95 font-semibold">
                24/7 Emergency Callouts | NICEIC Approved | Same-Day Service Available
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a href="tel:01234567890">
                  <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                    <Phone className="mr-2 h-6 w-6" />
                    EMERGENCY CALLOUT
                  </Button>
                </a>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-background text-primary border-2 border-background hover:bg-background/90 text-xl px-8 py-6 font-bold">
                    Request Quote
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>NICEIC Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>15+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>Local Response</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Our Electrical Services
            </h2>
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
                      <h3 className={`text-xl font-bold mb-2 ${isEmergency ? 'text-emergency' : 'text-primary'}`}>
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12">
              Why Choose 247LocalElectrician?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-10 w-10" />
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
            <h2 className="text-4xl font-black mb-6 text-foreground">
              Proudly Serving Bilston & the West Midlands
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Fast, local electrical services covering a 15-mile radius from our Bilston base including 
              Wolverhampton, Walsall, Dudley, West Bromwich, and surrounding areas.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["Bilston", "Wolverhampton", "Walsall", "Dudley", "West Bromwich", "Birmingham", "Tipton", "Wednesbury"].map((area) => (
                <span key={area} className="bg-muted text-foreground px-4 py-2 rounded-full font-semibold">
                  {area}
                </span>
              ))}
            </div>
            <Link to="/service-areas">
              <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold">
                View Full Coverage Area
              </Button>
            </Link>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
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
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Need an Electrician? We're Ready to Help
            </h2>
            <a href="tel:01234567890" className="inline-block">
              <p className="text-5xl md:text-6xl font-black mb-8 hover:scale-105 transition-transform">
                01234 567 890
              </p>
            </a>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01234567890">
                <Button size="lg" variant="outline" className="bg-background text-emergency border-2 border-background hover:bg-background/90 text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  CALL NOW
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
