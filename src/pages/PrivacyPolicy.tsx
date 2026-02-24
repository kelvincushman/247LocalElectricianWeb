import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Privacy Policy | 247Electrician</title>
        <meta name="description" content="Privacy Policy for 247Electrician. Learn how we collect, use, and protect your personal data." />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
            <p className="text-lg opacity-90">Last updated: December 2024</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none text-foreground">
              <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
              <p className="mb-6 text-muted-foreground">
                This Privacy Policy explains how ANP Electrical Services Ltd ("we", "our", "us"), trading as 247Electrician,
                collects, uses, and protects your personal information when you use our website and services. This website
                is operated by Aigentis Ltd on behalf of ANP Electrical Services Ltd.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
              <p className="mb-4 text-muted-foreground">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><strong>Contact Information:</strong> Name, email address, phone number, and postal address</li>
                <li><strong>Service Information:</strong> Details about your electrical service requirements</li>
                <li><strong>Property Information:</strong> Address and details about your property relevant to electrical work</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and browsing patterns</li>
                <li><strong>Communication Records:</strong> Records of correspondence with us</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="mb-4 text-muted-foreground">We use your personal information to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Provide electrical services you have requested</li>
                <li>Respond to enquiries and provide quotes</li>
                <li>Schedule appointments and service visits</li>
                <li>Process payments and maintain financial records</li>
                <li>Send service reminders and safety notifications</li>
                <li>Improve our website and services</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">4. Legal Basis for Processing</h2>
              <p className="mb-6 text-muted-foreground">
                We process your personal data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><strong>Contract:</strong> To fulfil our contractual obligations to you</li>
                <li><strong>Legitimate Interests:</strong> To operate and improve our business</li>
                <li><strong>Legal Obligation:</strong> To comply with UK electrical safety regulations</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for marketing communications</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">5. Data Sharing</h2>
              <p className="mb-6 text-muted-foreground">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Our registered body (NAPIT) for certification purposes</li>
                <li>Local authority building control for Part P notifications</li>
                <li>Our insurers when required for claims</li>
                <li>IT service providers who help us operate our website</li>
                <li>Legal authorities when required by law</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">6. Data Retention</h2>
              <p className="mb-6 text-muted-foreground">
                We retain your personal data for as long as necessary to fulfil the purposes for which it was collected.
                Electrical certificates and installation records are retained for a minimum of 6 years in accordance
                with UK regulations. Financial records are kept for 7 years as required by HMRC.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">7. Your Rights</h2>
              <p className="mb-4 text-muted-foreground">Under UK GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">8. Cookies</h2>
              <p className="mb-6 text-muted-foreground">
                Our website uses cookies to improve your browsing experience. These include essential cookies for
                website functionality and analytics cookies to help us understand how visitors use our site. You can
                control cookie settings through your browser.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">9. Security</h2>
              <p className="mb-6 text-muted-foreground">
                We implement appropriate technical and organisational measures to protect your personal data against
                unauthorised access, alteration, disclosure, or destruction. Our website uses SSL encryption to
                secure data transmission.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">10. Contact Us</h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground"><strong>ANP Electrical Services Ltd</strong></p>
                <p className="text-muted-foreground">Trading as: 247Electrician</p>
                <p className="text-muted-foreground">Email: privacy@247electrician.uk</p>
                <p className="text-muted-foreground">Phone: 01902 943 929</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">11. Complaints</h2>
              <p className="mb-6 text-muted-foreground">
                If you are not satisfied with our response to any privacy concern, you have the right to lodge a
                complaint with the Information Commissioner's Office (ICO) at{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  ico.org.uk
                </a>
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">12. Changes to This Policy</h2>
              <p className="mb-6 text-muted-foreground">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with
                an updated revision date. We encourage you to review this policy periodically.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
