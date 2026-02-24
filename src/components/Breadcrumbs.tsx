import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name?: string;
  label?: string; // Support both name and label for backwards compatibility
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
  className?: string;
}

const Breadcrumbs = ({ items = [], currentPage, className }: BreadcrumbsProps) => {
  const location = useLocation();
  const fullPath = `https://247electrician.uk${location.pathname}`;

  // Normalize items to use 'name' (support both 'name' and 'label')
  const normalizedItems = items.map(item => ({
    name: item.name || item.label || '',
    href: item.href
  }));

  // Determine the current page name - either from prop or last item without href
  const lastItemWithoutHref = normalizedItems.find(item => !item.href);
  const currentPageName = currentPage || (lastItemWithoutHref?.name) || '';

  // Filter out items without href for the middle breadcrumbs
  const middleItems = normalizedItems.filter(item => item.href);

  // Build the breadcrumb list for schema (Google-compliant format)
  const schemaItems = [
    { name: "Home", url: "https://247electrician.uk/" },
    ...middleItems.map(item => ({
      name: item.name,
      url: `https://247electrician.uk${item.href}`
    })),
    { name: currentPageName, url: fullPath }
  ].filter(item => item.name); // Remove items with empty names

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": schemaItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebPage",
        "@id": item.url,
        "name": item.name
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <nav aria-label="Breadcrumb" className={`bg-muted border-b border-border ${className || ''}`}>
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center flex-wrap gap-1 text-sm">
            <li className="flex items-center">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">Home</span>
              </Link>
            </li>
            {middleItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                <Link
                  to={item.href || '/'}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {currentPageName && (
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                <span className="text-foreground font-medium" aria-current="page">
                  {currentPageName}
                </span>
              </li>
            )}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
