import { Shield, CheckCircle, Award, MapPin, Phone, MessageCircle, Zap, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  const kelvinCredentials = [
    "Gold Card JIB electrician status",
    "Enhanced DBS clearance",
    "Inspection & Testing qualification",
    "Heating installer qualification",
  ];

  const andyCredentials = [
    "Gold Card JIB electrician status",
    "Enhanced DBS clearance",
    "Inspection & Testing qualification",
    "Solar PV installer certification",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About Us | Kelvin & Andy | 247Electrician Black Country & Birmingham</title>
        <meta name="description" content="Meet Kelvin & Andy - Gold Card JIB electricians with 65+ years combined experience. NAPIT approved, fully insured. Serving Black Country, Birmingham, Walsall & Cannock." />
        <link rel="canonical" href="https://247electrician.uk/about" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Your Local Electricians — Kelvin & Andy
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              With over <strong>65 YEARS</strong> of combined experience, we bring industry-leading electrical knowledge directly to your home.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Kelvin */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2 border-primary overflow-hidden h-full">
                  <motion.div
                    className="relative overflow-hidden"
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                  >
                    {/* Default blue background with profile */}
                    <div className="bg-primary text-primary-foreground p-8 text-center relative z-10">
                      <motion.div
                        className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/30"
                        variants={{
                          rest: { scale: 1 },
                          hover: { scale: 1.05 }
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src="/images/kelvin-profile.jpg"
                          alt="Kelvin Lee"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<span class="text-5xl font-black flex items-center justify-center h-full bg-white/20">K</span>';
                          }}
                        />
                      </motion.div>
                      <h2 className="text-2xl font-black">Kelvin Lee</h2>
                      <p className="text-sm opacity-90">(Kelvin Cushman)</p>
                    </div>

                    {/* Full image wipe-up on hover */}
                    <motion.div
                      className="absolute inset-0 z-20"
                      variants={{
                        rest: { y: "100%" },
                        hover: { y: 0 }
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="relative w-full h-full">
                        <img
                          src="/images/kelvin-full.jpg"
                          alt="Kelvin Lee"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-primary/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <h2 className="text-2xl font-black">Kelvin Lee</h2>
                          <p className="text-sm opacity-90">(Kelvin Cushman)</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Kelvin began his electrical career as an apprentice more than 30 years ago. He has worked across domestic, commercial, and industrial sectors nationwide, specialising in installations, testing, fault finding and kitchen/bathroom electrics.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Kelvin now focuses on providing a dependable, local service rooted in professionalism, communication, and safety.
                  </p>
                  <h3 className="font-bold text-primary mb-3">Credentials:</h3>
                  <ul className="space-y-2">
                    {kelvinCredentials.map((credential, index) => (
                      <li key={index} className="flex items-center gap-2 text-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        {credential}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Specialises in: Installations, Testing, Fault Finding, Kitchen/Bathroom Electrics, Heating Systems
                    </p>
                  </div>
                </CardContent>
                </Card>
              </motion.div>

              {/* Andy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-secondary overflow-hidden h-full">
                  <motion.div
                    className="relative overflow-hidden"
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                  >
                    {/* Default secondary background with profile */}
                    <div className="bg-secondary text-secondary-foreground p-8 text-center relative z-10">
                      <motion.div
                        className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/30"
                        variants={{
                          rest: { scale: 1 },
                          hover: { scale: 1.05 }
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src="/images/andy-profile.jpg"
                          alt="Andy Purcell"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<span class="text-5xl font-black flex items-center justify-center h-full bg-white/20">A</span>';
                          }}
                        />
                      </motion.div>
                      <h2 className="text-2xl font-black">Andy Purcell</h2>
                      <p className="text-sm opacity-90">35+ Years Experience</p>
                    </div>

                    {/* Full image wipe-up on hover */}
                    <motion.div
                      className="absolute inset-0 z-20"
                      variants={{
                        rest: { y: "100%" },
                        hover: { y: 0 }
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="relative w-full h-full">
                        <img
                          src="/images/andy-full.jpg"
                          alt="Andy Purcell"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-secondary/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <h2 className="text-2xl font-black">Andy Purcell</h2>
                          <p className="text-sm opacity-90">35+ Years Experience</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6">
                      With over 35 years of experience, Andy has worked across the UK on a huge range of electrical systems. Known for precision and reliability, his background includes domestic rewires, testing, fault-finding and renewable energy installation.
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Andy specialises in solar, rewires, consumer units, and domestic upgrades.
                    </p>
                    <h3 className="font-bold text-secondary mb-3">Credentials:</h3>
                    <ul className="space-y-2">
                      {andyCredentials.map((credential, index) => (
                        <li key={index} className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                          {credential}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sun className="h-4 w-4 text-secondary" />
                        Specialises in: Solar PV, Rewires, Consumer Units, Domestic Upgrades
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-black text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                After years of national work, we chose to bring our expertise back home — providing high-quality, affordable, and safe electrical services across Bilston and the Black Country.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We focus on <strong className="text-foreground">smaller domestic electrical jobs</strong> that other companies overlook, keeping our service fast, personal, and reliable.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">Gold Card JIB</span>
                </div>
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">65+ Years Combined</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">No Call Centres</h3>
                <p className="opacity-90">You speak directly to Kelvin or Andy. No middlemen, no hassle.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Truly Local</h3>
                <p className="opacity-90">Based in Bilston, we know the area and respond fast.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">BS 7671 Compliant</h3>
                <p className="opacity-90">All work meets the latest 2022 regulations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Ready to Work With Us?</h2>
            <p className="text-xl mb-8 opacity-90">Get in touch for a free quote or emergency callout</p>
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

export default About;
