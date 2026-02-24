import { Phone, AlertTriangle, Clock, Shield, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Emergency = () => {
  const emergencies = [
    "Complete power failure",
    "Burning smells from outlets/wiring",
    "Sparking or arcing",
    "Exposed or damaged wiring",
    "Tripping fuse boards",
    "Electric shocks",
    "Smoke from electrical items",
    "Flickering lights throughout property"
  ];

  const responseSteps = [
    { title: "Call Us Immediately", description: "Contact us 24/7 on our emergency line", icon: Phone },
    { title: "Stay Safe", description: "Turn off power at the main switch if safe to do so", icon: Shield },
    { title: "We Dispatch", description: "Nearest qualified electrician dispatched to you", icon: Zap },
    { title: "30-90 Minute Arrival", description: "Fast response to your location", icon: Clock },
    { title: "On-Site Diagnosis", description: "Professional assessment of the issue", icon: AlertTriangle },
    { title: "Fixed-Price Repair", description: "Transparent pricing and immediate repair", icon: Shield }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>24/7 Emergency Electrician | Black Country & Birmingham | 247Electrician</title>
        <meta name="description" content="24/7 emergency electrician serving Black Country, Birmingham, Walsall & Cannock. 30-90 minute response. Power failures, sparking, tripping fuses. Call now!" />
        <link rel="canonical" href="https://247electrician.uk/emergency" />
      </Helmet>
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-emergency text-emergency-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              24/7 Emergency Electrician Service
            </h1>
            <p className="text-2xl md:text-3xl mb-8 font-semibold">
              Available Right Now Across the West Midlands
            </p>
            <a href="tel:01902943929" className="inline-block">
              <p className="text-6xl md:text-7xl font-black mb-8 hover:scale-105 transition-transform">
                01902 943 929
              </p>
            </a>
            <div className="flex items-center justify-center gap-2 text-xl font-bold">
              <Clock className="h-6 w-6" />
              <span>Average Response Time: 30-90 Minutes</span>
            </div>
          </div>
        </section>

        {/* When to Call Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              When to Call an Emergency Electrician
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {emergencies.map((emergency, index) => (
                <Card key={index} className="border-2 border-emergency">
                  <CardContent className="p-6 flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-emergency flex-shrink-0 mt-1" />
                    <p className="font-bold text-foreground">{emergency}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  CALL EMERGENCY LINE NOW
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Response Process Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Our Emergency Response Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {responseSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <Card className="bg-background border-2 border-primary h-full">
                      <CardContent className="p-6">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-emergency text-emergency-foreground rounded-full flex items-center justify-center text-2xl font-black">
                          {index + 1}
                        </div>
                        <div className="flex flex-col items-center text-center mt-4">
                          <Icon className="h-12 w-12 text-primary mb-4" />
                          <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Emergency Pricing Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Transparent Emergency Pricing
            </h2>
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="text-lg font-bold text-foreground">Standard Emergency Call-Out</span>
                      <span className="text-2xl font-black text-primary">£85</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="text-lg font-bold text-foreground">Evening/Weekend Call-Out</span>
                      <span className="text-2xl font-black text-primary">£110</span>
                    </div>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>No hidden fees - call-out includes first hour of work</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Fixed prices agreed before work starts</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Multiple payment methods accepted</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12">
              Safety While You Wait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-background text-foreground">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">DO:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Turn off power at the main switch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Unplug affected appliances</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Keep children and pets away</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Ventilate if there's a burning smell</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background text-foreground">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-emergency">DON'T:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emergency">✗</span>
                      <span>Touch exposed wiring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emergency">✗</span>
                      <span>Use water near electrical issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emergency">✗</span>
                      <span>Attempt DIY electrical repairs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emergency">✗</span>
                      <span>Ignore burning smells</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-emergency text-emergency-foreground">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">EVACUATE IF:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>You see flames or heavy smoke</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>Strong burning smell persists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>You feel unsafe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="font-bold">Call 999 first, then us</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Electrical Emergency? Call Now
            </h2>
            <a href="tel:01902943929" className="inline-block">
              <p className="text-6xl md:text-7xl font-black mb-8 hover:scale-105 transition-transform">
                01902 943 929
              </p>
            </a>
            <p className="text-2xl font-bold">
              24 Hours a Day, 7 Days a Week, 365 Days a Year
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Emergency;
