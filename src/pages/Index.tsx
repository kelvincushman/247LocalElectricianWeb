import { Phone, Zap, Shield, Clock, CheckCircle, Star, MapPin, AlertTriangle, Sun, Flame, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  const services = [
    { title: "Emergency Callouts", icon: Zap, accent: "emergency", description: "24/7 rapid response for electrical emergencies", image: "/images/emergency-callouts.jpg", href: "/services/emergency-callouts" },
    { title: "Fault Finding & Repairs", icon: CheckCircle, accent: "primary", description: "Professional diagnosis and repairs", image: "/images/fault-finding.jpg", href: "/services/fault-finding-and-repairs" },
    { title: "Fuse Board Upgrades", icon: Shield, accent: "emergency", description: "Modern consumer unit installations", image: "/images/fuse-board.jpg", href: "/services/fuse-board-upgrades" },
    { title: "Full & Partial Rewiring", icon: Zap, accent: "primary", description: "Complete rewiring solutions", image: "/images/rewiring.jpg", href: "/services/rewiring" },
    { title: "Lighting Installation", icon: Zap, accent: "emergency", description: "Indoor and outdoor lighting", image: "/images/lighting.jpg", href: "/services/lighting-installation" },
    { title: "Socket Installation", icon: CheckCircle, accent: "primary", description: "Additional power points", image: "/images/sockets.jpg", href: "/services/socket-installation" },
    { title: "EV Charger Installation", icon: Zap, accent: "emergency", description: "Home charging solutions", image: "/images/ev-charger.jpg", href: "/services/ev-charger-installation" },
    { title: "EICR Certificates", icon: Shield, accent: "primary", description: "Landlord safety inspections", image: "/images/eicr.jpg", href: "/services/eicr-certificates" },
    { title: "Solar Installation", icon: Sun, accent: "emergency", description: "Solar panel systems & battery storage", image: "/images/solar.jpg", href: "/services/solar-installation" },
    { title: "Heat Source Installation", icon: Flame, accent: "primary", description: "Heat pumps & electrical heating", image: "/images/heat-source.jpg", href: "/services/heat-source-installation" },
  ];

  const whyChooseUs = [
    { title: "NAPIT Approved & Fully Insured", icon: Shield },
    { title: "Covering the Black Country & Birmingham", icon: MapPin },
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
      <Helmet>
        <title>247Electrician | Emergency Electrician Black Country, Birmingham & Walsall | 24/7</title>
        <meta name="description" content="NAPIT approved local electrician serving Black Country, Birmingham, Walsall & Cannock. 24/7 emergency callouts, rewiring, EICR certificates, EV chargers, solar installation. Fast response, competitive prices." />
        <link rel="canonical" href="https://247electrician.uk/" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
          {/* Background Image - WebP with JPEG fallback */}
          <picture className="absolute inset-0">
            <source srcSet="/images/Hero1.webp" type="image/webp" />
            <img
              src="/images/Hero1.jpeg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Overlay for fade effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/55 via-primary/55 to-secondary/55"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-black mb-6 leading-tight">
                <span className="text-4xl md:text-6xl block">Your Trusted Local Electricians</span>
                <span className="text-2xl md:text-3xl block mt-2">in Black Country, Birmingham Central & North, Walsall & Cannock</span>
              </h1>
              <p className="text-xl md:text-2xl mb-2 opacity-95 font-semibold">
                24-7 Emergency Callouts | NAPIT Approved | Same-Day Service Available
              </p>
              <p className="text-lg md:text-xl mb-6 opacity-90 font-medium italic">
                We Do the Small Jobs Others Hate.
              </p>

              {/* Card Payments & Accreditations */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold opacity-90">Card Payments:</span>
                  <div className="bg-white rounded-lg px-3 py-1.5 shadow-lg">
                    <img
                      src="/images/popular-payment_.jpg"
                      alt="We accept Visa, Mastercard, Apple Pay, Google Pay"
                      width={120}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold opacity-90">Accredited:</span>
                  <div className="bg-white rounded-lg px-2 py-1.5 shadow-lg">
                    <img
                      src="/images/napit.svg"
                      alt="NAPIT Approved"
                      width={80}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </div>
                  <div className="bg-white rounded-lg px-2 py-1.5 shadow-lg">
                    <img
                      src="/images/trustmark.svg"
                      alt="TrustMark Registered"
                      width={80}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a href="tel:01902943929">
                  <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    247 EMERGENCY CALLOUT
                  </Button>
                </a>
                <a href="tel:01902943929">
                  <Button size="lg" variant="outline" className="bg-background text-primary border-2 border-background hover:bg-background/90 text-xl px-8 py-6 font-bold">
                    <Phone className="mr-2 h-6 w-6" />
                    Speak to Electrician
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>NAPIT Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span>65+ Years Combined Experience</span>
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>1hr Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>CRB Checked</span>
                </div>
              </div>

              {/* Video Section with Glow Effect and Float Animation */}
              <div className="mt-12 flex justify-center">
                <div className="relative float-animation">
                  {/* White Glow Effect */}
                  <motion.div
                    className="absolute -inset-4 rounded-2xl bg-white opacity-60 blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Video Container - 16:9 aspect ratio (reduced 30%) */}
                  <div className="relative w-[63vw] max-w-4xl aspect-video bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster="/images/video-poster.jpg"
                    >
                      <source src="/videos/intro.mp4" type="video/mp4" />
                    </video>
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
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
                          <p className="text-muted-foreground">
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

        {/* Why Choose Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12">
              Why Choose 247Electrician?
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
              Proudly Serving the Black Country, Birmingham & Beyond
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Fast, local electrical services covering Black Country, Birmingham Central & North, Walsall, Cannock and surrounding areas.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["Birmingham", "Wolverhampton", "Walsall", "Cannock", "Dudley", "West Bromwich", "Tipton", "Wednesbury"].map((area) => (
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
            <a href="tel:01902943929" className="inline-block">
              <p className="text-5xl md:text-6xl font-black mb-8 hover:scale-105 transition-transform">
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
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-background text-background hover:bg-background/10 text-xl px-8 py-6 font-bold">
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
