import { Clock, AlertTriangle, Wrench, Zap, Shield, Sun, Car, FileCheck, Lightbulb, Plug, Flame, Wind, Phone } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const RateCard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Rate Card | Electrician Prices & Callout Fees | 247Electrician</title>
        <meta name="description" content="Transparent electrician prices for Black Country, Birmingham, Walsall & Cannock. Standard callout from £79.99, emergency rates, and fixed prices for all electrical services. No hidden charges." />
        <link rel="canonical" href="https://247electrician.uk/rate-card" />
      </Helmet>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Our Rate Card</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Transparent, competitive pricing with no hidden charges. All prices include labour — materials charged separately at cost.
            </p>
          </div>
        </section>

        {/* Callout Rates */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-4 text-foreground">Callout Rates</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our callout rates cover the first hour of labour. Additional time is charged at the applicable hourly rate. Materials are charged separately at cost.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Standard Rate */}
              <Card className="border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-bold">
                  MOST POPULAR
                </div>
                <CardHeader className="pt-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Standard Rate</CardTitle>
                  </div>
                  <p className="text-center text-muted-foreground text-sm">Mon–Fri, 8am–5pm</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-black text-primary mb-2">£79.99</div>
                  <p className="text-muted-foreground mb-4">First hour (minimum charge)</p>
                  <ul className="text-sm text-left space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Non-emergency work
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Scheduled appointments
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Additional hours at £45/hr
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Evening/Weekend Rate */}
              <Card className="border-2 border-emergency">
                <CardHeader>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-6 w-6 text-emergency" />
                    <CardTitle className="text-xl">Emergency Rate</CardTitle>
                  </div>
                  <p className="text-center text-muted-foreground text-sm">5pm–10pm, 7 days</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-black text-emergency mb-2">£120</div>
                  <p className="text-muted-foreground mb-4">First hour</p>
                  <ul className="text-sm text-left space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Emergency callouts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Evenings & weekends
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Additional hours at £60/hr
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Night Rate */}
              <Card className="border-2 border-emergency bg-emergency/5">
                <CardHeader>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-6 w-6 text-emergency" />
                    <CardTitle className="text-xl">Night Rate</CardTitle>
                  </div>
                  <p className="text-center text-muted-foreground text-sm">10pm–7am, 7 days</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-black text-emergency mb-2">£150</div>
                  <p className="text-muted-foreground mb-4">First hour</p>
                  <ul className="text-sm text-left space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Urgent night callouts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Rapid response
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      Additional hours at £75/hr
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Fixed Price Services */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-4 text-foreground">Fixed Price Services</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Many common jobs can be quoted at a fixed price. Prices shown are labour only — materials at cost. Final price depends on specific requirements.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Sockets & Switches */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Plug className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Sockets & Switches</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>Replace socket/switch (like-for-like)</span>
                      <span className="font-bold">£45–£65</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Add new single socket</span>
                      <span className="font-bold">£90–£130</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Add new double socket</span>
                      <span className="font-bold">£100–£150</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Move existing socket</span>
                      <span className="font-bold">£80–£120</span>
                    </li>
                    <li className="flex justify-between">
                      <span>USB socket installation</span>
                      <span className="font-bold">£55–£85</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Outdoor socket (IP66)</span>
                      <span className="font-bold">£120–£180</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Lighting */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Lighting</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>Replace light fitting (like-for-like)</span>
                      <span className="font-bold">£45–£75</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Install new ceiling light</span>
                      <span className="font-bold">£80–£120</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Install dimmer switch</span>
                      <span className="font-bold">£55–£85</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Outdoor/security light</span>
                      <span className="font-bold">£90–£150</span>
                    </li>
                    <li className="flex justify-between">
                      <span>LED downlight (per light)</span>
                      <span className="font-bold">£45–£70</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Garden lighting circuit</span>
                      <span className="font-bold">£250–£450</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Consumer Units */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emergency" />
                    <CardTitle className="text-lg">Consumer Units</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>Replace fuse board (like-for-like)</span>
                      <span className="font-bold">£350–£500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Upgrade to RCBO board</span>
                      <span className="font-bold">£450–£650</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Add new circuit</span>
                      <span className="font-bold">£150–£250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Replace single MCB/RCD</span>
                      <span className="font-bold">£60–£100</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Surge protection device</span>
                      <span className="font-bold">£120–£180</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Testing & Certification */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Testing & Certificates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>EICR (1–2 bed flat)</span>
                      <span className="font-bold">£120–£160</span>
                    </li>
                    <li className="flex justify-between">
                      <span>EICR (3 bed house)</span>
                      <span className="font-bold">£150–£200</span>
                    </li>
                    <li className="flex justify-between">
                      <span>EICR (4–5 bed house)</span>
                      <span className="font-bold">£180–£250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>PAT testing (per item)</span>
                      <span className="font-bold">£2–£4</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Emergency lighting test</span>
                      <span className="font-bold">£80–£150</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Minor works certificate</span>
                      <span className="font-bold">Included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Appliance Installation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Appliance Installation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>Electric cooker connection</span>
                      <span className="font-bold">£80–£120</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Electric hob installation</span>
                      <span className="font-bold">£90–£140</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Electric shower installation</span>
                      <span className="font-bold">£180–£280</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Extractor fan installation</span>
                      <span className="font-bold">£100–£180</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Immersion heater</span>
                      <span className="font-bold">£120–£200</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Towel rail installation</span>
                      <span className="font-bold">£80–£130</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Safety Devices */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Safety & Ventilation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span>Smoke alarm (mains)</span>
                      <span className="font-bold">£65–£95</span>
                    </li>
                    <li className="flex justify-between">
                      <span>CO detector (mains)</span>
                      <span className="font-bold">£70–£100</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Heat detector</span>
                      <span className="font-bold">£65–£95</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Interlinked system (3 units)</span>
                      <span className="font-bold">£200–£300</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Bathroom extractor fan</span>
                      <span className="font-bold">£100–£180</span>
                    </li>
                    <li className="flex justify-between">
                      <span>PIV system installation</span>
                      <span className="font-bold">£400–£600</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Larger Projects */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-4 text-foreground">Larger Projects</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              These projects vary significantly based on property size, access, and specific requirements. Contact us for a free, no-obligation quote.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <Car className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>EV Charger Installation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">£750–£1,200</div>
                  <p className="text-sm text-muted-foreground">Includes supply, installation, and certification. Grant funding may apply.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Zap className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>Full House Rewire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">£3,000–£7,500</div>
                  <p className="text-sm text-muted-foreground">Depends on property size. Includes new consumer unit and certification.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Sun className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>Solar PV Installation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">£5,000–£12,000</div>
                  <p className="text-sm text-muted-foreground">3–12 panel systems. Battery storage additional. MCS certified.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Flame className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>Heat Pump Electrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">£800–£1,500</div>
                  <p className="text-sm text-muted-foreground">Electrical supply and connections for ASHP. Supply upgrade if required.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-center mb-8 text-foreground">Important Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        All labour charges
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        Testing and verification
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        Electrical certificates where required
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        Waste removal from site
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        Free quotes for larger jobs
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        NAPIT-registered work
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Charges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Materials charged at cost (receipts provided)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Additional hours beyond first hour
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Specialist access equipment if needed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Building Regulations notification (£30–£50)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Parking permits if required
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Congestion charges if applicable
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-primary">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> All prices shown are guide prices and may vary based on specific job requirements, access difficulties, and location. A fixed quote will be provided before any work begins. Prices are exclusive of VAT where applicable. We reserve the right to adjust prices for complex or unusual installations. All work is guaranteed and carried out to BS 7671:2018+A2:2022 standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Need a Quote?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Contact us for a free, no-obligation quote. We're happy to discuss your requirements and provide a fixed price before starting any work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01902943929">
                <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  Call Now
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-background text-background hover:bg-background/10 text-xl px-8 py-6 font-bold">
                  Request Quote
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

export default RateCard;
