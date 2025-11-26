import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto font-semibold">
              Available 24/7 for emergencies or contact us to discuss your electrical needs
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black mb-8 text-foreground">
                    Contact Information
                  </h2>
                  
                  <Card className="border-2 border-emergency mb-6">
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
                            Available 24 hours a day, 7 days a week for emergencies
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2 text-foreground">Email</h3>
                          <a href="mailto:info@247localelectrician.co.uk" className="text-xl font-bold text-primary hover:text-primary/80">
                            info@247localelectrician.co.uk
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            We typically respond within 2 hours during business hours
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2 text-foreground">Address</h3>
                          <p className="text-muted-foreground">
                            ANP Electrical Ltd<br />
                            Bilston, West Midlands
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Serving a 15-mile radius from Bilston
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
                          <div className="space-y-1 text-muted-foreground">
                            <p><span className="font-semibold text-foreground">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
                            <p><span className="font-semibold text-foreground">Saturday:</span> 9:00 AM - 5:00 PM</p>
                            <p><span className="font-semibold text-foreground">Sunday:</span> Closed (Emergency only)</p>
                            <p className="font-bold text-emergency mt-2">24/7 Emergency Callouts Available</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card className="border-2 border-primary">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black mb-6 text-foreground">
                      Request a Callback
                    </h2>
                    <form className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="text-foreground font-bold">Name *</Label>
                        <Input id="name" placeholder="Your full name" className="mt-2" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-foreground font-bold">Email *</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" className="mt-2" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="text-foreground font-bold">Phone *</Label>
                        <Input id="phone" type="tel" placeholder="Your phone number" className="mt-2" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="service" className="text-foreground font-bold">Service Required</Label>
                        <select id="service" className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground">
                          <option>Emergency Callout</option>
                          <option>Fault Finding</option>
                          <option>Rewiring</option>
                          <option>Fuse Board Upgrade</option>
                          <option>EICR Certificate</option>
                          <option>EV Charger Installation</option>
                          <option>Lighting Installation</option>
                          <option>Socket Installation</option>
                          <option>General Enquiry</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="time" className="text-foreground font-bold">Preferred Contact Time</Label>
                        <select id="time" className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground">
                          <option>Morning (8AM - 12PM)</option>
                          <option>Afternoon (12PM - 5PM)</option>
                          <option>Evening (5PM - 8PM)</option>
                          <option>Any Time</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="message" className="text-foreground font-bold">Message *</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Please describe your electrical requirements..." 
                          className="mt-2 min-h-32"
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

        {/* Map Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-8 text-foreground">
              Our Service Area
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              We cover a 15-mile radius from our Bilston base, serving Wolverhampton, Walsall, Dudley, 
              West Bromwich, and surrounding areas across the West Midlands.
            </p>
            <div className="max-w-4xl mx-auto bg-background border-2 border-primary rounded-lg p-8 text-center">
              <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground">
                Map visualization of service coverage area
              </p>
              <p className="text-muted-foreground mt-2">
                15-mile radius from Bilston, West Midlands
              </p>
            </div>
          </div>
        </section>

        {/* Response Guarantee */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-black mb-6">
              Our Response Time Promise
            </h2>
            <p className="text-2xl mb-8 max-w-3xl mx-auto">
              We typically respond to enquiries within <span className="font-black">2 hours during business hours</span>.
              For emergencies, we aim to be on-site within <span className="font-black">30-90 minutes</span>.
            </p>
            <a href="tel:01234567890">
              <Button size="lg" variant="outline" className="bg-background text-primary border-2 border-background hover:bg-background/90 text-xl px-8 py-6 font-bold">
                <Phone className="mr-2 h-6 w-6" />
                CALL NOW
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
