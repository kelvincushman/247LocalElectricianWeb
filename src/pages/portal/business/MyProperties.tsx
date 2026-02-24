import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Home,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
} from 'lucide-react';

interface Property {
  id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  property_type: string | null;
  customer_name: string | null;
  job_count: number;
  created_at: string;
}

export default function MyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchProperties();
  }, [page, searchTerm]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/portal/my/properties?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Home className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
            <p className="text-slate-500">Properties managed by your company</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by address or postcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No properties found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Jobs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium">{property.address_line1}</p>
                            {property.address_line2 && (
                              <p className="text-sm text-slate-500">{property.address_line2}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{property.city}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{property.postcode}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">
                          {property.property_type?.replace('_', ' ') || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Briefcase className="h-3 w-3" />
                          {property.job_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/portal/my-properties/${property.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} properties
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
