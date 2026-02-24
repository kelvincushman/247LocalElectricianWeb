import { Phone, MessageCircle, Zap, Shield, CheckCircle, Plug, Lightbulb, Car, FileCheck, Wrench, Home, Sun, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Services = () => {
  const allServices = [
    { title: "Residential Electrician", href: "/services/residential-electrician", description: "All domestic electrical services", icon: Home, color: "primary" },
    { title: "24 Hour Electrician", href: "/services/24-hour-electrician", description: "Open now – day or night", icon: Zap, color: "emergency" },
    { title: "Registered Electrician", href: "/services/registered-electrician", description: "NAPIT approved & certified", icon: Shield, color: "primary" },
    { title: "Emergency Callouts", href: "/services/emergency-callouts", description: "24/7 rapid response for electrical emergencies", icon: Zap, color: "emergency" },
    { title: "Fault Finding & Repairs", href: "/services/fault-finding-and-repairs", description: "Professional diagnosis and repairs", icon: Wrench, color: "primary" },
    { title: "Fuse Board Upgrades", href: "/services/fuse-board-upgrades", description: "Modern consumer unit installations", icon: Shield, color: "emergency" },
    { title: "Full & Partial Rewiring", href: "/services/rewiring", description: "Complete rewiring solutions", icon: Home, color: "primary" },
    { title: "Lighting Installation", href: "/services/lighting-installation", description: "Indoor and outdoor lighting", icon: Lightbulb, color: "primary" },
    { title: "Socket Installation", href: "/services/socket-installation", description: "Additional power points", icon: Plug, color: "primary" },
    { title: "EV Charger Installation", href: "/services/ev-charger-installation", description: "Home charging solutions", icon: Car, color: "emergency" },
    { title: "EICR Certificates", href: "/services/eicr-certificates", description: "Electrical safety inspections", icon: FileCheck, color: "primary" },
    { title: "Solar Installation", href: "/services/solar-installation", description: "Solar panel systems & battery storage", icon: Sun, color: "emergency" },
    { title: "Heat Source Installation", href: "/services/heat-source-installation", description: "Heat pumps & electrical heating", icon: Zap, color: "primary" },
    { title: "Electric Shower Installation", href: "/services/electric-shower-installation", description: "Professional shower installations", icon: Zap, color: "primary" },
    { title: "Cooker Installation", href: "/services/cooker-installation", description: "Electric cooker & hob installations", icon: Zap, color: "primary" },
    { title: "Emergency Lighting Installation", href: "/services/emergency-lighting-installation", description: "Safety lighting for commercial properties", icon: Lightbulb, color: "emergency" },
    { title: "Emergency Lighting Testing", href: "/services/emergency-lighting-testing", description: "Compliance testing and certification", icon: FileCheck, color: "emergency" },
    { title: "Electrical Design", href: "/services/electrical-design", description: "Planning and design services", icon: FileCheck, color: "primary" },
    { title: "Landlord Certificates", href: "/services/landlord-certificates", description: "EICR for rental properties", icon: FileCheck, color: "primary" },
    { title: "HMO Electrical Testing", href: "/services/hmo-electrical-testing", description: "Compliance for HMO properties", icon: FileCheck, color: "primary" },
    { title: "Security Lighting", href: "/services/security-lighting", description: "External security lighting", icon: Shield, color: "emergency" },
    { title: "Mood Lighting", href: "/services/mood-lighting", description: "Ambient and feature lighting", icon: Lightbulb, color: "primary" },
    { title: "Smoke Alarm Installation", href: "/services/smoke-alarm-installation", description: "Fire detection systems", icon: Shield, color: "emergency" },
    { title: "Ventilation & Fans", href: "/services/ventilation-installation", description: "Extractor fans & PIV systems", icon: Wind, color: "primary" },
  ];

  const popularServices = [
    {
      title: "Electric Showers",
      description: "Professional installation and upgrades for all shower types. We ensure correct cable sizing, RCD protection, and safe bonding.",
      icon: Zap,
      href: "/services/electric-shower-installation",
      image: "/images/electric-shower.jpg",
      accent: "primary",
    },
    {
      title: "Consumer Unit Upgrades",
      description: "Modern fuse board installations with RCD/RCBO protection. Essential for older properties and adding new circuits.",
      icon: Shield,
      href: "/services/fuse-board-upgrades",
      image: "/images/fuse-board.jpg",
      accent: "emergency",
    },
    {
      title: "EICRs & Landlord Certificates",
      description: "Comprehensive electrical safety reports for homeowners and landlords. Legal requirement for rental properties.",
      icon: FileCheck,
      href: "/services/eicr-certificates",
      image: "/images/eicr.jpg",
      accent: "primary",
    },
    {
      title: "EV Charger Installation",
      description: "Home charging point installation compliant with BS 7671 and IET Code of Practice. Future-proof your home.",
      icon: Car,
      href: "/services/ev-charger-installation",
      image: "/images/ev-charger.jpg",
      accent: "emergency",
    },
    {
      title: "Fault Finding",
      description: "Expert diagnosis of electrical problems including tripping circuits, power loss, and flickering lights.",
      icon: Wrench,
      href: "/services/fault-finding-and-repairs",
      image: "/images/fault-finding.jpg",
      accent: "primary",
    },
    {
      title: "Kitchen & Bathroom Rewires",
      description: "Partial rewiring for renovations. Safe, compliant wiring for wet areas and high-load appliances.",
      icon: Home,
      href: "/services/rewiring",
      image: "/images/rewiring.jpg",
      accent: "emergency",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Electrical Services | 247Electrician | Black Country & Birmingham</title>
        <meta name="description" content="Full range of electrical services: emergency callouts, rewiring, EICR certificates, EV chargers, solar installation, fuse board upgrades. BS 7671 compliant. NAPIT approved." />
        <link rel="canonical" href="https://247electrician.uk/services" />
      </Helmet>
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
                const isEmergency = service.accent === "emergency";
                return (
                  <Link key={index} to={service.href} className="block h-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="h-full"
                    >
                      <Card className={`border-2 hover:shadow-xl transition-shadow overflow-hidden h-full ${isEmergency ? 'border-emergency' : 'border-primary'}`}>
                        <motion.div
                          className="aspect-video relative overflow-hidden group"
                          initial="rest"
                          whileHover="hover"
                          animate="rest"
                        >
                          {/* Icon background (visible by default) */}
                          <div className={`absolute inset-0 flex items-center justify-center ${isEmergency ? 'bg-emergency/10' : 'bg-primary/10'}`}>
                            <motion.div
                              variants={{
                                rest: { scale: 1, rotate: 0 },
                                hover: { scale: 1.1, rotate: 5 }
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <Icon className={`h-20 w-20 ${isEmergency ? 'text-emergency' : 'text-primary'} opacity-60`} />
                            </motion.div>
                          </div>

                          {/* Image with wipe-up animation on hover */}
                          <motion.div
                            className="absolute inset-0"
                            variants={{
                              rest: { y: "100%" },
                              hover: { y: 0 }
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          >
                            <img
                              src={service.image}
                              alt={service.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            {/* Subtle overlay on image */}
                            <div className={`absolute inset-0 ${isEmergency ? 'bg-emergency/20' : 'bg-primary/20'}`} />
                          </motion.div>
                        </motion.div>

                        <CardContent className="p-6 text-center">
                          <motion.div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${isEmergency ? 'bg-emergency/10' : 'bg-primary/10'}`}
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Icon className={`h-6 w-6 ${isEmergency ? 'text-emergency' : 'text-primary'}`} />
                          </motion.div>
                          <h3 className={`text-xl font-bold mb-2 ${isEmergency ? 'text-emergency' : 'text-primary'}`}>
                            {service.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {service.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Services Grid */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12 text-foreground">All Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {allServices.map((service, index) => {
                const Icon = service.icon;
                const isEmergency = service.color === "emergency";
                const colorClass = isEmergency ? "text-emergency" : "text-primary";
                const borderClass = isEmergency ? "border-emergency hover:border-emergency" : "border-primary hover:border-primary";
                const bgClass = isEmergency ? "bg-emergency/10" : "bg-primary/10";

                return (
                  <Link key={index} to={service.href}>
                    <Card className={`border-2 ${borderClass} transition-colors h-full hover:shadow-lg`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${colorClass}`} />
                          </div>
                          <div>
                            <h3 className={`font-bold ${colorClass}`}>{service.title}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
              <a href="tel:01902943929">
                <Button size="lg" className="bg-background text-emergency hover:bg-background/90 font-bold text-lg px-8 py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
