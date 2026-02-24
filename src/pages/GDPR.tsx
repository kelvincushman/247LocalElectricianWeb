import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const GDPR = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>GDPR Compliance | 247Electrician</title>
        <meta name="description" content="GDPR compliance information for 247Electrician. Learn about your data protection rights under UK GDPR." />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-black mb-4">GDPR Compliance</h1>
            <p className="text-lg opacity-90">Your Data Protection Rights</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none text-foreground">
              <h2 className="text-2xl font-bold text-primary mb-4">Overview</h2>
              <p className="mb-6 text-muted-foreground">
                ANP Electrical Services Ltd, trading as 247Electrician, is committed to protecting your personal
                data and complying with the UK General Data Protection Regulation (UK GDPR) and the Data Protection
                Act 2018. This page explains your rights and how we handle your data. This website is operated
                by Aigentis Ltd on behalf of ANP Electrical Services Ltd.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">Data Controllers</h2>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground mb-2"><strong>Primary Data Controller:</strong></p>
                <p className="text-muted-foreground">ANP Electrical Services Ltd</p>
                <p className="text-muted-foreground">Trading as: 247Electrician</p>
                <p className="text-muted-foreground">Email: privacy@247electrician.uk</p>
                <p className="text-muted-foreground mt-4"><strong>Website Operator (Data Processor):</strong></p>
                <p className="text-muted-foreground">Aigentis Ltd</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">Your Rights Under UK GDPR</h2>
              <p className="mb-4 text-muted-foreground">
                Under the UK GDPR, you have the following rights regarding your personal data:
              </p>

              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Be Informed</h3>
                  <p className="text-muted-foreground">
                    You have the right to know how we collect and use your personal data. See our{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for full details.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right of Access (Subject Access Request)</h3>
                  <p className="text-muted-foreground">
                    You can request a copy of all personal data we hold about you. We will respond within one month
                    of receiving your request.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Rectification</h3>
                  <p className="text-muted-foreground">
                    If your personal data is inaccurate or incomplete, you have the right to have it corrected.
                    Contact us to update your information.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Erasure (Right to Be Forgotten)</h3>
                  <p className="text-muted-foreground">
                    You can request deletion of your personal data in certain circumstances. Note that we must retain
                    some data for legal compliance (e.g., electrical certificates, financial records).
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Restrict Processing</h3>
                  <p className="text-muted-foreground">
                    You can request that we limit how we use your data while we verify its accuracy or consider
                    an objection.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Data Portability</h3>
                  <p className="text-muted-foreground">
                    You can request your data in a structured, machine-readable format to transfer to another
                    service provider.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Right to Object</h3>
                  <p className="text-muted-foreground">
                    You can object to processing based on legitimate interests or for direct marketing purposes.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-bold text-foreground">Rights Related to Automated Decision-Making</h3>
                  <p className="text-muted-foreground">
                    We do not make any automated decisions about you that have significant effects.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">Data We Collect for Electrical Services</h2>
              <p className="mb-4 text-muted-foreground">
                When you use our <Link to="/services" className="text-primary hover:underline">electrical services</Link>,
                we collect the following data:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>Contact details (name, phone, email, address)</li>
                <li>Property information relevant to electrical work</li>
                <li>Service history and records of work completed</li>
                <li>Electrical certificates (<Link to="/services/eicr-certificates" className="text-primary hover:underline">EICRs</Link>,
                    installation certificates)</li>
                <li>Payment and billing information</li>
                <li>Communication records</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">Lawful Basis for Processing</h2>
              <table className="w-full mb-6 border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left text-foreground">Purpose</th>
                    <th className="border border-border p-3 text-left text-foreground">Lawful Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 text-muted-foreground">Providing electrical services</td>
                    <td className="border border-border p-3 text-muted-foreground">Contract</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 text-muted-foreground">Issuing electrical certificates</td>
                    <td className="border border-border p-3 text-muted-foreground">Legal Obligation</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 text-muted-foreground">Service reminders</td>
                    <td className="border border-border p-3 text-muted-foreground">Legitimate Interest</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 text-muted-foreground">Marketing communications</td>
                    <td className="border border-border p-3 text-muted-foreground">Consent</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 text-muted-foreground">Financial records</td>
                    <td className="border border-border p-3 text-muted-foreground">Legal Obligation</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-2xl font-bold text-primary mb-4">Data Retention Periods</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><strong>Electrical certificates:</strong> 6 years minimum (as per industry regulations)</li>
                <li><strong>Financial records:</strong> 7 years (HMRC requirement)</li>
                <li><strong>General enquiries:</strong> 2 years from last contact</li>
                <li><strong>Marketing preferences:</strong> Until you withdraw consent</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">Third-Party Data Sharing</h2>
              <p className="mb-4 text-muted-foreground">We may share your data with:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li><strong>NAPIT:</strong> For Part P building regulation compliance and certification</li>
                <li><strong>Local Authority Building Control:</strong> For notifiable work notifications</li>
                <li><strong>Insurers:</strong> In the event of a claim</li>
                <li><strong>Aigentis Ltd:</strong> Website hosting and IT services</li>
              </ul>
              <p className="mb-6 text-muted-foreground">
                We do not sell your data or transfer it outside the UK/EEA without appropriate safeguards.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">How to Exercise Your Rights</h2>
              <p className="mb-4 text-muted-foreground">
                To exercise any of your GDPR rights, please contact us using one of the following methods:
              </p>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground"><strong>Email:</strong> privacy@247electrician.uk</p>
                <p className="text-foreground"><strong>Phone:</strong> 01902 943 929</p>
                <p className="text-foreground"><strong>Post:</strong> Data Protection, ANP Electrical Services Ltd</p>
              </div>
              <p className="mb-6 text-muted-foreground">
                Please provide enough information to identify yourself and specify which right you wish to exercise.
                We may ask for proof of identity before processing your request.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">Response Times</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>We will respond to all requests within <strong>one month</strong></li>
                <li>Complex requests may take up to <strong>three months</strong> (we will inform you)</li>
                <li>Requests are free unless manifestly unfounded or excessive</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">Complaints</h2>
              <p className="mb-6 text-muted-foreground">
                If you believe we have not handled your data correctly or have not responded appropriately to a
                request, you have the right to complain to the UK's data protection authority:
              </p>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <p className="text-foreground"><strong>Information Commissioner's Office (ICO)</strong></p>
                <p className="text-muted-foreground">Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></p>
                <p className="text-muted-foreground">Helpline: 0303 123 1113</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">Security Measures</h2>
              <p className="mb-6 text-muted-foreground">
                We implement appropriate technical and organisational measures to protect your data, including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure password-protected systems</li>
                <li>Regular security updates and monitoring</li>
                <li>Staff training on data protection</li>
                <li>Limited access on a need-to-know basis</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">Updates to This Page</h2>
              <p className="mb-6 text-muted-foreground">
                This GDPR information page was last updated in December 2024. We review our data protection
                practices regularly and will update this page as necessary.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GDPR;
