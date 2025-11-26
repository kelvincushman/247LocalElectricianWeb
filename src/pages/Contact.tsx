import { Phone, Mail, MapPin, Clock, MessageCircle, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AISparky from "@/components/AISparky";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Get In Touch
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Available 24/7 for emergencies. Contact Kelvin & Andy directly — no call centres.
            </p>
          </div>
        </section>

        {/* Quick Contact Options */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-black text-center mb-8 text-foreground">Choose How to Reach Us</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* AI Sparky */}
              <Card className="border-2 border-primary hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-primary mb-2">AI Sparky</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Free electrical fault diagnosis. Get instant help identifying your issue.
                  </p>
                  <Link to="/#ai-sparky">
                    <Button className="w-full bg-primary hover:bg-primary/90 font-bold">
                      <Zap className="mr-2 h-4 w-4" />
                      Try AI Sparky Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className="border-2 border-green-600 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-600/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-green-600 mb-2">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Quick questions? Send us a message and get a fast response.
                  </p>
                  <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Us
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Call */}
              <Card className="border-2 border-emergency hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-emergency/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-emergency" />
                  </div>
                  <h3 className="font-bold text-xl text-emergency mb-2">Call Us 24/7</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Speak directly to Kelvin or Andy. Emergency callouts available.
                  </p>
                  <a href="tel:01234567890">
                    <Button className="w-full bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-foreground mb-6">
                  Contact Information
                </h2>

                <Card className="border-2 border-emergency">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emergency/10 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6 text-emergency" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Phone (24/7 Emergency)</h3>
                        <a href="tel:01234567890" className="text-2xl font-black text-emergency hover:text-emergency/80">
                          01234 567 890
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available 24 hours a day, 7 days a week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-600">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">WhatsApp</h3>
                        <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-green-600 hover:text-green-700">
                          Message Us
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quick responses during business hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Email</h3>
                        <a href="mailto:info@247localelectrician.co.uk" className="text-lg font-bold text-primary hover:text-primary/80">
                          info@247localelectrician.co.uk
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          We respond within 2 hours during business hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Location</h3>
                        <p className="text-muted-foreground">
                          Bilston, West Midlands
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Serving a 15-mile radius
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Business Hours</h3>
                        <div className="space-y-1 text-muted-foreground text-sm">
                          <p><span className="font-semibold text-foreground">Mon - Fri:</span> 8:00 AM - 6:00 PM</p>
                          <p><span className="font-semibold text-foreground">Saturday:</span> 9:00 AM - 5:00 PM</p>
                          <p><span className="font-semibold text-foreground">Sunday:</span> Emergency only</p>
                          <p className="font-bold text-emergency mt-2">24/7 Emergency Callouts</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div>
                <Card className="border-2 border-primary">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black mb-6 text-foreground">
                      Request a Callback
                    </h2>
                    <form className="space-y-5">
                      <div>
                        <Label htmlFor="name" className="text-foreground font-bold">Name *</Label>
                        <Input id="name" placeholder="Your full name" className="mt-2" required />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-foreground font-bold">Phone *</Label>
                        <Input id="phone" type="tel" placeholder="Your phone number" className="mt-2" required />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-foreground font-bold">Email</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" className="mt-2" />
                      </div>

                      <div>
                        <Label htmlFor="service" className="text-foreground font-bold">Service Required</Label>
                        <select id="service" className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground">
                          <option>Emergency Callout</option>
                          <option>Fault Finding</option>
                          <option>Electric Shower Installation</option>
                          <option>Consumer Unit Upgrade</option>
                          <option>Kitchen/Bathroom Rewire</option>
                          <option>EICR / Landlord Certificate</option>
                          <option>EV Charger Installation</option>
                          <option>Cooker/Hob Installation</option>
                          <option>General Enquiry</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-foreground font-bold">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Please describe your electrical requirements..."
                          className="mt-2 min-h-24"
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold text-lg py-6">
                        Send Message
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        For emergencies, please call us directly on{" "}
                        <a href="tel:01234567890" className="text-emergency font-bold hover:underline">
                          01234 567 890
                        </a>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* AI Sparky Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-foreground mb-4">Try AI Sparky</h2>
                <p className="text-muted-foreground">
                  Not sure what's wrong? Our free diagnostic tool can help identify your electrical issue.
                </p>
              </div>
              <AISparky />
            </div>
          </div>
        </section>

        {/* Response Promise */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-6">Our Response Time Promise</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-5xl font-black mb-2">30-90</div>
                <div className="text-lg font-bold">Minutes</div>
                <p className="opacity-80 text-sm mt-1">Emergency response time</p>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">2</div>
                <div className="text-lg font-bold">Hours</div>
                <p className="opacity-80 text-sm mt-1">Typical enquiry response</p>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">24/7</div>
                <div className="text-lg font-bold">Available</div>
                <p className="opacity-80 text-sm mt-1">For emergencies</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
