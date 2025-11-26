import { MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ServiceAreas = () => {
  const primaryAreas = [
    "Bilston", "Wolverhampton", "Wednesbury", "Willenhall", "Walsall", 
    "West Bromwich", "Oldbury", "Tipton", "Dudley", "Stourbridge", 
    "Halesowen", "Great Barr", "Birmingham", "Cannock", "Lichfield", "Telford"
  ];

  const detailedAreas = [
    {
      region: "Wolverhampton Areas",
      areas: ["Bradley", "Ettingshall", "Moseley Village", "Stow Heath", "Parkfields", "Penn", "Penn Fields", "Compton", "Tettenhall", "Tettenhall Wood", "Finchfield", "Bushbury", "Low Hill", "Fallings Park", "Oxley", "Whitmore Reans", "Wednesfield"]
    },
    {
      region: "Walsall Areas",
      areas: ["Bloxwich", "Leamore", "Birchills", "Caldmore", "Palfrey", "Paddock", "Shelfield", "Rushall", "Aldridge", "Brownhills", "Great Wyrley", "Cheslyn Hay", "Pelsall"]
    },
    {
      region: "Sandwell Areas",
      areas: ["Great Bridge", "Ocker Hill", "Gospel Oak", "Friar Park", "Charlemont", "Hateley Heath", "Greets Green", "Bearwood", "Smethwick", "Langley", "Tividale", "Rowley Regis", "Cradley Heath", "Old Hill", "Blackheath"]
    },
    {
      region: "Dudley Areas",
      areas: ["Coseley", "Upper Gornal", "Lower Gornal", "Gornal Wood", "Sedgley", "Woodsetton", "Netherton", "Kingswinford", "Pensnett", "Wordsley", "Quarry Bank", "Brierley Hill", "Amblecote"]
    },
    {
      region: "Birmingham Areas",
      areas: ["Handsworth", "Handsworth Wood", "Lozells", "Perry Barr", "Aston", "Witton", "Newtown", "Edgbaston", "Harborne", "Quinton", "Bartley Green", "Selly Oak", "Northfield", "Erdington", "Kingstanding", "Great Barr"]
    },
    {
      region: "South Staffordshire",
      areas: ["Codsall", "Bilbrook", "Wombourne", "Himley", "Swindon", "Featherstone", "Essington", "Shareshill", "Coven", "Four Ashes", "Brewood"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <MapPin className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Local Electrician Covering Bilston & the West Midlands
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto font-semibold">
              Fast, reliable electrical services within a 15-mile radius of our Bilston base
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              As a trusted local electrician based in Bilston, West Midlands, <span className="font-bold text-foreground">247LocalElectrician</span> (operated by ANP Electrical Ltd) 
              proudly provides reliable electrical services across a 15-mile radius. Whether you need emergency callouts, fault finding, rewiring, 
              EV charging, or EICR certificates, we're close by and ready to help.
            </p>
            <div className="flex items-center gap-3 text-primary font-bold text-xl">
              <Clock className="h-6 w-6" />
              <span>Average Response Time: 30-90 Minutes</span>
            </div>
          </div>
        </section>

        {/* Primary Coverage */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Primary Coverage - Towns & Cities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
              {primaryAreas.map((area, index) => (
                <div key={index} className="bg-background border-2 border-primary rounded-lg p-4 text-center hover:bg-primary hover:text-primary-foreground transition-all font-bold">
                  {area}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Coverage */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Detailed Local Coverage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {detailedAreas.map((section, index) => (
                <Card key={index} className="border-2 border-primary">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4 text-primary">{section.region}</h3>
                    <div className="flex flex-wrap gap-2">
                      {section.areas.map((area, areaIndex) => (
                        <span key={areaIndex} className="bg-muted text-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Description */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-black mb-6">
              Your Local Electrician Serving the West Midlands
            </h2>
            <p className="text-lg leading-relaxed">
              We are a reliable local electrician covering <span className="font-bold">Bilston and the surrounding West Midlands</span>, 
              including Wolverhampton, Walsall, Dudley, West Bromwich, Tipton, Stourbridge, Halesowen and parts of Birmingham. 
              With fast response times and professional service, we provide all electrical work including emergency callouts, 
              fault finding, rewiring, lighting, consumer unit upgrades, EV chargers and EICR certificates. 
              If you're searching for a trusted electrician near you, we're here to help.
            </p>
          </div>
        </section>

        {/* Coverage Checker CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-black mb-8 text-foreground">
              Not Sure If We Cover Your Area?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We serve properties within a 15-mile radius of Bilston. Give us a call and we'll confirm our response time to your location.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01234567890">
                <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground text-xl px-8 py-6 font-bold">
                  <Phone className="mr-2 h-6 w-6" />
                  Call to Check
                </Button>
              </a>
              <a href="https://wa.me/441234567890?text=Hi%2C%20do%20you%20cover%20my%20area%3F" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-6 font-bold">
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Ask on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Why Local Matters */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 text-foreground">
              Why Choose a Local Electrician?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 border-primary">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Faster Response</h3>
                  <p className="text-muted-foreground">
                    Being based locally means we can reach you in 30-90 minutes for emergencies
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Local Knowledge</h3>
                  <p className="text-muted-foreground">
                    We know the area, understand local properties, and are part of your community
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary">
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Always Available</h3>
                  <p className="text-muted-foreground">
                    24/7 emergency support with a genuine local team who care about your satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-emergency text-emergency-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Find Your Local Electrician - Call Today!
            </h2>
            <a href="tel:01234567890" className="inline-block">
              <p className="text-6xl md:text-7xl font-black mb-6 hover:scale-105 transition-transform">
                01234 567 890
              </p>
            </a>
            <p className="text-2xl font-bold">
              Covering 15 Miles from Bilston | 24/7 Emergency Service
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceAreas;
