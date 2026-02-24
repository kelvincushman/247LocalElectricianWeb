import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import ChatWidget from "./components/ChatWidget";
import { AuthProvider } from "./contexts/AuthContext";
import { PortalAuthProvider } from "./contexts/PortalAuthContext";

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Core pages (eagerly loaded for fast initial experience)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazily loaded pages
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Emergency = lazy(() => import("./pages/Emergency"));
const ServiceAreas = lazy(() => import("./pages/ServiceAreas"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const RateCard = lazy(() => import("./pages/RateCard"));

// Service Pages (lazily loaded)
const EmergencyCallouts = lazy(() => import("./pages/services/EmergencyCallouts"));
const FaultFinding = lazy(() => import("./pages/services/FaultFinding"));
const FuseBoardUpgrades = lazy(() => import("./pages/services/FuseBoardUpgrades"));
const Rewiring = lazy(() => import("./pages/services/Rewiring"));
const LightingInstallation = lazy(() => import("./pages/services/LightingInstallation"));
const SocketInstallation = lazy(() => import("./pages/services/SocketInstallation"));
const EVChargerInstallation = lazy(() => import("./pages/services/EVChargerInstallation"));
const EICRCertificates = lazy(() => import("./pages/services/EICRCertificates"));
const SolarInstallation = lazy(() => import("./pages/services/SolarInstallation"));
const HeatSourceInstallation = lazy(() => import("./pages/services/HeatSourceInstallation"));
const ElectricShowerInstallation = lazy(() => import("./pages/services/ElectricShowerInstallation"));
const CookerInstallation = lazy(() => import("./pages/services/CookerInstallation"));
const EmergencyLightingInstallation = lazy(() => import("./pages/services/EmergencyLightingInstallation"));
const EmergencyLightingTesting = lazy(() => import("./pages/services/EmergencyLightingTesting"));
const ElectricalDesign = lazy(() => import("./pages/services/ElectricalDesign"));
const LandlordCertificates = lazy(() => import("./pages/services/LandlordCertificates"));
const HMOElectricalTesting = lazy(() => import("./pages/services/HMOElectricalTesting"));
const SecurityLighting = lazy(() => import("./pages/services/SecurityLighting"));
const MoodLighting = lazy(() => import("./pages/services/MoodLighting"));
const SmokeAlarmInstallation = lazy(() => import("./pages/services/SmokeAlarmInstallation"));
const VentilationInstallation = lazy(() => import("./pages/services/VentilationInstallation"));
const ContractWork = lazy(() => import("./pages/services/ContractWork"));
const ResidentialElectrician = lazy(() => import("./pages/services/ResidentialElectrician"));
const TwentyFourHourElectrician = lazy(() => import("./pages/services/TwentyFourHourElectrician"));
const RegisteredElectrician = lazy(() => import("./pages/services/RegisteredElectrician"));

// Landlord Service Pages (lazily loaded)
const PropertyManagers = lazy(() => import("./pages/PropertyManagers"));
const EICRLandlords = lazy(() => import("./pages/services/landlords/EICRLandlords"));
const FireAlarmTestingLandlords = lazy(() => import("./pages/services/landlords/FireAlarmTesting"));
const EmergencyLightingTestingLandlords = lazy(() => import("./pages/services/landlords/EmergencyLightingTesting"));
const PATTestingLandlords = lazy(() => import("./pages/services/landlords/PATTesting"));
const SmokeCoDetectors = lazy(() => import("./pages/services/landlords/SmokeCoDetectors"));

// Legal Pages (lazily loaded)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const GDPR = lazy(() => import("./pages/GDPR"));

// Admin Pages (lazily loaded)
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const GalleryAdmin = lazy(() => import("./pages/admin/GalleryAdmin"));
const BlogAdmin = lazy(() => import("./pages/admin/BlogAdmin"));

// Portal Pages (lazily loaded)
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalLayout = lazy(() => import("./pages/portal/PortalLayout"));
const PortalDashboard = lazy(() => import("./pages/portal/Dashboard"));

// Portal - Customer Pages
const CustomerList = lazy(() => import("./pages/portal/customers/CustomerList"));
const CustomerDetail = lazy(() => import("./pages/portal/customers/CustomerDetail"));
const CustomerForm = lazy(() => import("./pages/portal/customers/CustomerForm"));

// Portal - Company Pages
const CompanyList = lazy(() => import("./pages/portal/companies/CompanyList"));
const CompanyDetail = lazy(() => import("./pages/portal/companies/CompanyDetail"));
const CompanyForm = lazy(() => import("./pages/portal/companies/CompanyForm"));

// Portal - Property Pages
const PropertyList = lazy(() => import("./pages/portal/properties/PropertyList"));
const PropertyDetail = lazy(() => import("./pages/portal/properties/PropertyDetail"));
const PropertyForm = lazy(() => import("./pages/portal/properties/PropertyForm"));

// Portal - Job Pages
const JobList = lazy(() => import("./pages/portal/jobs/JobList"));
const JobDetail = lazy(() => import("./pages/portal/jobs/JobDetail"));
const JobForm = lazy(() => import("./pages/portal/jobs/JobForm"));

// Portal - Quote Pages
const QuoteList = lazy(() => import("./pages/portal/quotes/QuoteList"));
const QuoteDetail = lazy(() => import("./pages/portal/quotes/QuoteDetail"));
const QuoteForm = lazy(() => import("./pages/portal/quotes/QuoteForm"));

// Portal - Invoice Pages
const InvoiceList = lazy(() => import("./pages/portal/invoices/InvoiceList"));
const InvoiceDetail = lazy(() => import("./pages/portal/invoices/InvoiceDetail"));
const InvoiceForm = lazy(() => import("./pages/portal/invoices/InvoiceForm"));
const PaymentSuccess = lazy(() => import("./pages/portal/invoices/PaymentSuccess"));

// Portal - Calendar
const CalendarView = lazy(() => import("./pages/portal/calendar/CalendarView"));

// Portal - Settings
const PortalSettings = lazy(() => import("./pages/portal/settings/Settings"));

// Portal - User Management
const UserList = lazy(() => import("./pages/portal/users/UserList"));

// Portal - Document Management
const DocumentList = lazy(() => import("./pages/portal/documents/DocumentList"));

// Portal - Chatbot Management
const ChatbotConversationList = lazy(() => import("./pages/portal/chatbot/ConversationList"));
const ChatbotConversationDetail = lazy(() => import("./pages/portal/chatbot/ConversationDetail"));
const ChatbotLeadsList = lazy(() => import("./pages/portal/chatbot/LeadsList"));

// Portal - Business Customer Pages
const BusinessDashboard = lazy(() => import("./pages/portal/business/BusinessDashboard"));
const MyProperties = lazy(() => import("./pages/portal/business/MyProperties"));
const MyJobs = lazy(() => import("./pages/portal/business/MyJobs"));
const MyJobDetail = lazy(() => import("./pages/portal/business/MyJobDetail"));
const MyDocuments = lazy(() => import("./pages/portal/business/MyDocuments"));

// Portal - Certificate Pages (Staff)
const CertificateList = lazy(() => import("./pages/portal/certificates/CertificateList"));
const CertificateCreate = lazy(() => import("./pages/portal/certificates/CertificateCreate"));
const CertificateEditor = lazy(() => import("./pages/portal/certificates/CertificateEditor"));
const CertificateView = lazy(() => import("./pages/portal/certificates/CertificateView"));

// Portal - QS Approval Pages
const QSPendingList = lazy(() => import("./pages/portal/qs/QSPendingList"));
const QSReviewCertificate = lazy(() => import("./pages/portal/qs/QSReviewCertificate"));

// Portal - Customer Certificate Pages
const CustomerCertificates = lazy(() => import("./pages/portal/my-certificates/CustomerCertificates"));
const CustomerCertificateView = lazy(() => import("./pages/portal/my-certificates/CustomerCertificateView"));
const RequestCertificate = lazy(() => import("./pages/portal/my-certificates/RequestCertificate"));

// Portal - Certificate Settings Pages
const NotificationSettings = lazy(() => import("./pages/portal/settings/NotificationSettings"));
const TestInstruments = lazy(() => import("./pages/portal/settings/TestInstruments"));
const EngineerProfile = lazy(() => import("./pages/portal/settings/EngineerProfile"));

// Area Pages - loaded via index export file (all areas share AreaPage component)
import {
  BilstonArea,
  WolverhamptonArea,
  WednesburyArea,
  WillenhallArea,
  WalsallArea,
  WestBromwichArea,
  OldburyArea,
  TiptonArea,
  DudleyArea,
  StourbridgeArea,
  HalesowenArea,
  GreatBarrArea,
  BirminghamArea,
  CannockArea,
  LichfieldArea,
  TelfordArea,
  TettenhallArea,
  BushburyArea,
  WednesfieldArea,
  PennArea,
  BloxwichArea,
  AldridgeArea,
  BrownhillsArea,
  PelsallArea,
  RushallArea,
  SmethwickArea,
  RowleyRegisArea,
  CradleyHeathArea,
  BearwoodArea,
  SedgleyArea,
  BrierleyHillArea,
  KingswinfordArea,
  CoseleyArea,
  HandsworthArea,
  ErdingtonArea,
  HarborneArea,
  PerryBarrArea,
  WombourneArea,
  CodsallArea,
  EssingtonArea,
  CovenArea,
  AlbrightonArea,
  BridgnorthArea,
} from "./pages/areas";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <CookieConsent />
            <ChatWidget />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/service-areas" element={<ServiceAreas />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/rate-card" element={<RateCard />} />

              {/* Service Pages */}
              <Route path="/services/emergency-callouts" element={<EmergencyCallouts />} />
              <Route path="/services/fault-finding-and-repairs" element={<FaultFinding />} />
              <Route path="/services/fuse-board-upgrades" element={<FuseBoardUpgrades />} />
              <Route path="/services/rewiring" element={<Rewiring />} />
              <Route path="/services/lighting-installation" element={<LightingInstallation />} />
              <Route path="/services/socket-installation" element={<SocketInstallation />} />
              <Route path="/services/ev-charger-installation" element={<EVChargerInstallation />} />
              <Route path="/services/eicr-certificates" element={<EICRCertificates />} />
              <Route path="/services/solar-installation" element={<SolarInstallation />} />
              <Route path="/services/heat-source-installation" element={<HeatSourceInstallation />} />
              <Route path="/services/electric-shower-installation" element={<ElectricShowerInstallation />} />
              <Route path="/services/cooker-installation" element={<CookerInstallation />} />
              <Route path="/services/emergency-lighting-installation" element={<EmergencyLightingInstallation />} />
              <Route path="/services/emergency-lighting-testing" element={<EmergencyLightingTesting />} />
              <Route path="/services/electrical-design" element={<ElectricalDesign />} />
              <Route path="/services/landlord-certificates" element={<LandlordCertificates />} />
              <Route path="/services/hmo-electrical-testing" element={<HMOElectricalTesting />} />
              <Route path="/services/security-lighting" element={<SecurityLighting />} />
              <Route path="/services/mood-lighting" element={<MoodLighting />} />
              <Route path="/services/smoke-alarm-installation" element={<SmokeAlarmInstallation />} />
              <Route path="/services/ventilation-installation" element={<VentilationInstallation />} />
              <Route path="/services/contract-work" element={<ContractWork />} />
              <Route path="/services/residential-electrician" element={<ResidentialElectrician />} />
              <Route path="/services/24-hour-electrician" element={<TwentyFourHourElectrician />} />
              <Route path="/services/registered-electrician" element={<RegisteredElectrician />} />

              {/* Landlord Service Pages */}
              <Route path="/landlords" element={<PropertyManagers />} />
              <Route path="/landlords/eicr-certificates" element={<EICRLandlords />} />
              <Route path="/landlords/fire-alarm-testing" element={<FireAlarmTestingLandlords />} />
              <Route path="/landlords/emergency-lighting-testing" element={<EmergencyLightingTestingLandlords />} />
              <Route path="/landlords/pat-testing" element={<PATTestingLandlords />} />
              <Route path="/landlords/smoke-co-detectors" element={<SmokeCoDetectors />} />

              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/gdpr" element={<GDPR />} />

              {/* Area Pages - Primary Towns */}
              <Route path="/areas/bilston" element={<BilstonArea />} />
              <Route path="/areas/wolverhampton" element={<WolverhamptonArea />} />
              <Route path="/areas/wednesbury" element={<WednesburyArea />} />
              <Route path="/areas/willenhall" element={<WillenhallArea />} />
              <Route path="/areas/walsall" element={<WalsallArea />} />
              <Route path="/areas/west-bromwich" element={<WestBromwichArea />} />
              <Route path="/areas/oldbury" element={<OldburyArea />} />
              <Route path="/areas/tipton" element={<TiptonArea />} />
              <Route path="/areas/dudley" element={<DudleyArea />} />
              <Route path="/areas/stourbridge" element={<StourbridgeArea />} />
              <Route path="/areas/halesowen" element={<HalesowenArea />} />
              <Route path="/areas/great-barr" element={<GreatBarrArea />} />
              <Route path="/areas/birmingham" element={<BirminghamArea />} />
              <Route path="/areas/cannock" element={<CannockArea />} />
              <Route path="/areas/lichfield" element={<LichfieldArea />} />
              <Route path="/areas/telford" element={<TelfordArea />} />

              {/* Area Pages - Wolverhampton Sub-Areas */}
              <Route path="/areas/tettenhall" element={<TettenhallArea />} />
              <Route path="/areas/bushbury" element={<BushburyArea />} />
              <Route path="/areas/wednesfield" element={<WednesfieldArea />} />
              <Route path="/areas/penn" element={<PennArea />} />

              {/* Area Pages - Walsall Sub-Areas */}
              <Route path="/areas/bloxwich" element={<BloxwichArea />} />
              <Route path="/areas/aldridge" element={<AldridgeArea />} />
              <Route path="/areas/brownhills" element={<BrownhillsArea />} />
              <Route path="/areas/pelsall" element={<PelsallArea />} />
              <Route path="/areas/rushall" element={<RushallArea />} />

              {/* Area Pages - Sandwell Sub-Areas */}
              <Route path="/areas/smethwick" element={<SmethwickArea />} />
              <Route path="/areas/rowley-regis" element={<RowleyRegisArea />} />
              <Route path="/areas/cradley-heath" element={<CradleyHeathArea />} />
              <Route path="/areas/bearwood" element={<BearwoodArea />} />

              {/* Area Pages - Dudley Sub-Areas */}
              <Route path="/areas/sedgley" element={<SedgleyArea />} />
              <Route path="/areas/brierley-hill" element={<BrierleyHillArea />} />
              <Route path="/areas/kingswinford" element={<KingswinfordArea />} />
              <Route path="/areas/coseley" element={<CoseleyArea />} />

              {/* Area Pages - Birmingham Sub-Areas */}
              <Route path="/areas/handsworth" element={<HandsworthArea />} />
              <Route path="/areas/erdington" element={<ErdingtonArea />} />
              <Route path="/areas/harborne" element={<HarborneArea />} />
              <Route path="/areas/perry-barr" element={<PerryBarrArea />} />

              {/* Area Pages - South Staffordshire Sub-Areas */}
              <Route path="/areas/wombourne" element={<WombourneArea />} />
              <Route path="/areas/codsall" element={<CodsallArea />} />
              <Route path="/areas/essington" element={<EssingtonArea />} />
              <Route path="/areas/coven" element={<CovenArea />} />

              {/* Area Pages - Shropshire Sub-Areas */}
              <Route path="/areas/albrighton" element={<AlbrightonArea />} />
              <Route path="/areas/bridgnorth" element={<BridgnorthArea />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="gallery" element={<GalleryAdmin />} />
                <Route path="blog" element={<BlogAdmin />} />
              </Route>

              {/* Portal Routes - wrapped with PortalAuthProvider */}
              <Route path="/portal/login" element={
                <PortalAuthProvider>
                  <PortalLogin />
                </PortalAuthProvider>
              } />
              <Route path="/portal/payment-success" element={
                <PortalAuthProvider>
                  <PaymentSuccess />
                </PortalAuthProvider>
              } />
              <Route path="/portal" element={
                <PortalAuthProvider>
                  <PortalLayout />
                </PortalAuthProvider>
              }>
                <Route index element={<PortalDashboard />} />

                {/* Customer Routes */}
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/new" element={<CustomerForm />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="customers/:id/edit" element={<CustomerForm />} />

                {/* Company Routes */}
                <Route path="companies" element={<CompanyList />} />
                <Route path="companies/new" element={<CompanyForm />} />
                <Route path="companies/:id" element={<CompanyDetail />} />
                <Route path="companies/:id/edit" element={<CompanyForm />} />

                {/* Property Routes */}
                <Route path="properties" element={<PropertyList />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="properties/:id/edit" element={<PropertyForm />} />

                {/* Job Routes */}
                <Route path="jobs" element={<JobList />} />
                <Route path="jobs/new" element={<JobForm />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="jobs/:id/edit" element={<JobForm />} />

                {/* Quote Routes */}
                <Route path="quotes" element={<QuoteList />} />
                <Route path="quotes/new" element={<QuoteForm />} />
                <Route path="quotes/:id" element={<QuoteDetail />} />
                <Route path="quotes/:id/edit" element={<QuoteForm />} />

                {/* Invoice Routes */}
                <Route path="invoices" element={<InvoiceList />} />
                <Route path="invoices/new" element={<InvoiceForm />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="invoices/:id/edit" element={<InvoiceForm />} />

                {/* Calendar */}
                <Route path="calendar" element={<CalendarView />} />

                {/* Settings */}
                <Route path="settings" element={<PortalSettings />} />

                {/* User Management */}
                <Route path="users" element={<UserList />} />

                {/* Document Management */}
                <Route path="documents" element={<DocumentList />} />

                {/* Chatbot Management */}
                <Route path="chatbot/conversations" element={<ChatbotConversationList />} />
                <Route path="chatbot/conversations/:id" element={<ChatbotConversationDetail />} />
                <Route path="chatbot/leads" element={<ChatbotLeadsList />} />

                {/* Business Customer Routes */}
                <Route path="my-properties" element={<MyProperties />} />
                <Route path="my-properties/:id" element={<MyProperties />} />
                <Route path="my-jobs" element={<MyJobs />} />
                <Route path="my-jobs/:id" element={<MyJobDetail />} />
                <Route path="my-documents" element={<MyDocuments />} />

                {/* Certificate Routes (Staff) */}
                <Route path="certificates" element={<CertificateList />} />
                <Route path="certificates/new" element={<CertificateCreate />} />
                <Route path="certificates/:id" element={<CertificateView />} />
                <Route path="certificates/:id/edit" element={<CertificateEditor />} />

                {/* QS Approval Routes */}
                <Route path="qs" element={<QSPendingList />} />
                <Route path="qs/review/:id" element={<QSReviewCertificate />} />

                {/* Customer Certificate Routes */}
                <Route path="my-certificates" element={<CustomerCertificates />} />
                <Route path="my-certificates/request" element={<RequestCertificate />} />
                <Route path="my-certificates/:id" element={<CustomerCertificateView />} />

                {/* Certificate Settings Routes */}
                <Route path="settings/notifications" element={<NotificationSettings />} />
                <Route path="settings/instruments" element={<TestInstruments />} />
                <Route path="settings/engineer-profile" element={<EngineerProfile />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
