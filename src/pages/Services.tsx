import { Phone, MessageCircle, Zap, Shield, CheckCircle, Plug, Lightbulb, Car, FileCheck, Wrench, Home, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Services = () => {
  const serviceCategories = [
    {
      title: "Electrical Installations",
      icon: Plug,
      color: "primary",
      services: [
        "Electric shower installation",
        "Cooker & oven installation",
        "Hob installation",
        "Kitchen rewiring (partial)",
        "Bathroom rewiring (partial)",
        "Extractor fans",
        "Indoor & outdoor lighting",
      ],
    },
    {
      title: "Small Jobs & Call-Outs",
      icon: Wrench,
      color: "emergency",
      services: [
        "Socket replacements",
        "Switches, dimmers, pull cords",
        "Plug top changes",
        "Light fitting replacements",
        "Power loss investigation",
        "Tripping circuits",
        "Emergency call-outs",
      ],
    },
    {
      title: "Testing & Compliance",
      icon: FileCheck,
      color: "primary",
      services: [
        "Consumer unit (fuse board) upgrades",
        "EICRs (Electrical Installation Condition Reports)",
        "Electrical testing",
        "RCD/RCBO upgrades",
        "Landlord electrical certificates",
        "Smoke & heat alarm circuits",
      ],
    },
    {
      title: "Specialist Services",
      icon: Sun,
      color: "secondary",
      services: [
        "EV car charger installation",
        "Solar PV installation (Andy)",
        "Heating system electrics (Kelvin)",
        "Earth bonding upgrades",
      ],
    },
  ];

  const popularServices = [
    {
      title: "Electric Showers",
      description: "Professional installation and upgrades for all shower types. We ensure correct cable sizing, RCD protection, and safe bonding.",
      icon: Zap,
    },
    {
      title: "Consumer Unit Upgrades",
      description: "Modern fuse board installations with RCD/RCBO protection. Essential for older properties and adding new circuits.",
      icon: Shield,
    },
    {
      title: "EICRs & Landlord Certificates",
      description: "Comprehensive electrical safety reports for homeowners and landlords. Legal requirement for rental properties.",
      icon: FileCheck,
    },
    {
      title: "EV Charger Installation",
      description: "Home charging point installation compliant with BS 7671 and IET Code of Practice. Future-proof your home.",
      icon: Car,
    },
    {
      title: "Fault Finding",
      description: "Expert diagnosis of electrical problems including tripping circuits, power loss, and flickering lights.",
      icon: Wrench,
    },
    {
      title: "Kitchen & Bathroom Rewires",
      description: "Partial rewiring for renovations. Safe, compliant wiring for wet areas and high-load appliances.",
      icon: Home,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">Our Electrical Services</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90 mb-4">
              All services carried out in full compliance with <strong>BS 7671:2018+A2:2022</strong> regulations
            </p>
            <p className="text-lg opacity-80">
              From small repairs to complete installations — we handle it all
            </p>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-4 text-foreground">Most Requested Services</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              These are the services our customers ask for most. All work includes full certification.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {popularServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="border-2 hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-primary">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Full Service List */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12 text-foreground">Complete Service List</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {serviceCategories.map((category, index) => {
                const Icon = category.icon;
                const isEmergency = category.color === "emergency";
                const isSecondary = category.color === "secondary";
                const colorClass = isEmergency ? "text-emergency" : isSecondary ? "text-secondary" : "text-primary";
                const bgClass = isEmergency ? "bg-emergency/10" : isSecondary ? "bg-secondary/10" : "bg-primary/10";
                const borderClass = isEmergency ? "border-emergency" : isSecondary ? "border-secondary" : "border-primary";

                return (
                  <Card key={index} className={`border-2 ${borderClass}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${colorClass}`} />
                        </div>
                        <CardTitle className={colorClass}>{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.services.map((service, serviceIndex) => (
                          <li key={serviceIndex} className="flex items-center gap-2 text-foreground">
                            <CheckCircle className={`h-4 w-4 ${colorClass} flex-shrink-0`} />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* BS 7671 Compliance */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Shield className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl font-black mb-6">BS 7671:2018+A2:2022 Compliant</h2>
              <p className="text-lg opacity-90 mb-8">
                All our work is carried out to the latest IET Wiring Regulations. This ensures your installation is safe, legal, and properly certified. We provide full documentation for all notifiable work.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold">
                  Gold Card JIB Electricians
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold">
                  Full Certification
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold">
                  Insured Work
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Sparky CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-4 text-foreground">Not Sure What You Need?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use our free AI Sparky diagnostic tool to help identify your electrical issue and get guidance on the best solution.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Try AI Sparky Free
              </Button>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">Contact us for a free quote or emergency callout</p>
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

export default Services;
