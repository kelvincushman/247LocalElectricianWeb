import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Terms of Service | 247Electrician</title>
        <meta name="description" content="Terms of Service for 247Electrician. Read our terms and conditions for electrical services in the Black Country and Birmingham." />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
            <p className="text-lg opacity-90">Last updated: December 2024</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none text-foreground">
              <h2 className="text-2xl font-bold text-primary mb-4">1. Company Information</h2>
              <p className="mb-6 text-muted-foreground">
                These Terms of Service govern your use of the 247Electrician website and the electrical services
                provided by ANP Electrical Services Ltd ("the Company", "we", "our", "us"). This website is
                operated by Aigentis Ltd on behalf of ANP Electrical Services Ltd.
              </p>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground"><strong>Service Provider:</strong> ANP Electrical Services Ltd</p>
                <p className="text-muted-foreground">Trading as: 247Electrician</p>
                <p className="text-muted-foreground"><strong>Website Operator:</strong> Aigentis Ltd</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">2. Services</h2>
              <p className="mb-4 text-muted-foreground">
                We provide professional electrical services across the Black Country, Birmingham, Walsall, Cannock,
                and surrounding areas, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><Link to="/services/emergency-callouts" className="text-primary hover:underline">24/7 Emergency Callouts</Link></li>
                <li><Link to="/services/fault-finding-and-repairs" className="text-primary hover:underline">Fault Finding and Repairs</Link></li>
                <li><Link to="/services/fuse-board-upgrades" className="text-primary hover:underline">Fuse Board (Consumer Unit) Upgrades</Link></li>
                <li><Link to="/services/rewiring" className="text-primary hover:underline">Full and Partial Rewiring</Link></li>
                <li><Link to="/services/eicr-certificates" className="text-primary hover:underline">EICR Electrical Safety Certificates</Link></li>
                <li><Link to="/services/ev-charger-installation" className="text-primary hover:underline">EV Charger Installation</Link></li>
                <li><Link to="/services/solar-installation" className="text-primary hover:underline">Solar Panel Installation</Link></li>
                <li><Link to="/services/lighting-installation" className="text-primary hover:underline">Lighting Installation</Link></li>
                <li><Link to="/services/smoke-alarm-installation" className="text-primary hover:underline">Smoke and Heat Alarm Installation</Link></li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">3. Qualifications and Standards</h2>
              <p className="mb-6 text-muted-foreground">
                All electrical work is carried out by qualified electricians holding Gold Card JIB status. We are
                registered with NAPIT (National Association of Professional Inspectors and Testers) and all work
                is completed in accordance with <strong>BS 7671:2018+A2:2022</strong> (IET Wiring Regulations) and
                Part P of the Building Regulations.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">4. Quotations and Pricing</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>All quotations are provided free of charge and without obligation</li>
                <li>Quotations remain valid for 30 days unless otherwise stated</li>
                <li>Prices are exclusive of VAT unless otherwise stated</li>
                <li>Additional work discovered during the job will be discussed and agreed before proceeding</li>
                <li><Link to="/services/emergency-callouts" className="text-primary hover:underline">Emergency callouts</Link> may incur additional charges outside standard hours</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">5. Payment Terms</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Payment is due upon completion of work unless otherwise agreed</li>
                <li>We accept cash, bank transfer, and card payments</li>
                <li>For larger projects, staged payments may be required</li>
                <li>Late payments may incur interest at 8% above the Bank of England base rate</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">6. Certification and Compliance</h2>
              <p className="mb-6 text-muted-foreground">
                Upon completion of notifiable electrical work, you will receive appropriate certification including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><strong>Electrical Installation Certificate (EIC)</strong> for new installations</li>
                <li><strong>Minor Electrical Installation Works Certificate (MEIWC)</strong> for minor works</li>
                <li><strong><Link to="/services/eicr-certificates" className="text-primary hover:underline">Electrical Installation Condition Report (EICR)</Link></strong> for inspections</li>
                <li>Building Control notification via NAPIT for Part P compliance</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">7. Warranties and Guarantees</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>All workmanship is guaranteed for 12 months from completion</li>
                <li>Materials carry manufacturer warranties as applicable</li>
                <li>NAPIT-backed guarantee available for qualifying work</li>
                <li>Warranties do not cover damage caused by misuse, third-party interference, or acts of nature</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">8. Cancellation Policy</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Appointments may be rescheduled with 24 hours' notice at no charge</li>
                <li>Cancellations within 24 hours may incur a call-out charge</li>
                <li>For contracts signed at your property, you have 14 days to cancel under the Consumer Contracts Regulations 2013</li>
                <li>This cancellation right does not apply to emergency work or work that has already begun</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">9. Access and Preparation</h2>
              <p className="mb-6 text-muted-foreground">
                To enable us to carry out work efficiently and safely:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Please ensure clear access to all electrical installations</li>
                <li>Inform us of any known hazards (asbestos, structural issues, etc.)</li>
                <li>Pets should be secured during work</li>
                <li>We may need to turn off electrical supply during certain works</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">10. Insurance</h2>
              <p className="mb-6 text-muted-foreground">
                ANP Electrical Services Ltd holds comprehensive public liability insurance and professional
                indemnity insurance. Certificates are available upon request.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">11. Website Use</h2>
              <p className="mb-6 text-muted-foreground">
                The 247Electrician website is provided for informational purposes. While we strive to keep content
                accurate and up-to-date, we make no warranties about the completeness or accuracy of website content.
                The website operator, Aigentis Ltd, maintains and hosts this website on behalf of ANP Electrical Services Ltd.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">12. Limitation of Liability</h2>
              <p className="mb-6 text-muted-foreground">
                Our liability for any claim arising from our services shall be limited to the value of the contract.
                We are not liable for any indirect, consequential, or special damages. This does not affect your
                statutory rights as a consumer.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">13. Complaints Procedure</h2>
              <p className="mb-4 text-muted-foreground">
                If you are not satisfied with our service, please contact us directly to resolve the issue. If we
                cannot reach a resolution, you may refer the matter to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>NAPIT Consumer Resolution Service</li>
                <li>Citizens Advice Consumer Service</li>
                <li>Trading Standards</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">14. Governing Law</h2>
              <p className="mb-6 text-muted-foreground">
                These Terms of Service are governed by English law. Any disputes shall be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">15. Contact</h2>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground"><strong>ANP Electrical Services Ltd</strong></p>
                <p className="text-muted-foreground">Trading as: 247Electrician</p>
                <p className="text-muted-foreground">Email: info@247electrician.uk</p>
                <p className="text-muted-foreground">Phone: 01902 943 929</p>
                <p className="text-muted-foreground mt-4"><strong>Website Operator:</strong> Aigentis Ltd</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
