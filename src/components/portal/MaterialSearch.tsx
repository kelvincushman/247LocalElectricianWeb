import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Sparkles,
  Search,
  Plus,
  ExternalLink,
  ShoppingCart,
  AlertCircle,
  Package,
  Check,
} from 'lucide-react';

interface MaterialResult {
  search_term: string;
  product_name: string;
  price: number;
  supplier: string;
  product_url: string;
  sku: string;
  in_stock: boolean;
  cached?: boolean;
  cache_age_hours?: number;
}

interface QuoteItem {
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
}

interface MaterialSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: QuoteItem[]) => void;
}

export default function MaterialSearch({ isOpen, onClose, onAddItems }: MaterialSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MaterialResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Record<number, number>>({}); // Quantity per result index
  const [error, setError] = useState<string | null>(null);
  const [markupPercentage, setMarkupPercentage] = useState(20); // Default 20%

  // Fetch markup percentage from settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/portal/settings', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.material_markup_percentage) {
            setMarkupPercentage(parseFloat(data.material_markup_percentage) || 20);
          }
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    };
    fetchSettings();
  }, []);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setSelectedResults(new Set());
    setQuantities({});

    // Parse materials - split by newlines
    const materials = searchInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (materials.length === 0) {
      setError('Please enter at least one material to search for');
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch('/api/portal/materials/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ materials }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search for materials');
      }

      setResults(data.results || []);

      // Auto-select all results by default and set quantity to 1
      if (data.results && data.results.length > 0) {
        setSelectedResults(new Set(data.results.map((_: MaterialResult, i: number) => i)));
        // Initialize all quantities to 1
        const initialQuantities: Record<number, number> = {};
        data.results.forEach((_: MaterialResult, i: number) => {
          initialQuantities[i] = 1;
        });
        setQuantities(initialQuantities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleResult = (index: number) => {
    setSelectedResults((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [index]: Math.max(1, quantity), // Minimum quantity of 1
    }));
  };

  const handleAddToQuote = () => {
    const itemsToAdd: QuoteItem[] = [];

    selectedResults.forEach((index) => {
      const result = results[index];
      if (result) {
        const productName = result.product_name || 'Unknown Product';
        const supplier = result.supplier || 'Unknown';
        const sku = result.sku || 'N/A';
        const costPrice = typeof result.price === 'number' ? result.price : 0;
        // Apply markup for customer-facing price
        const salePrice = costPrice * (1 + markupPercentage / 100);
        const quantity = quantities[index] || 1;

        itemsToAdd.push({
          description: `${productName} (${supplier} - ${sku})`,
          quantity: quantity.toString(),
          unit: 'each',
          unit_price: salePrice.toFixed(2),
        });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchInput('');
    setResults([]);
    setSelectedResults(new Set());
    setQuantities({});
    setError(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Material Price Search
          </DialogTitle>
          <DialogDescription>
            Enter material descriptions (one per line) and AI will find prices from Screwfix
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="materials">Materials to search</Label>
            <Textarea
              id="materials"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter materials, one per line:
10mm Twin & Earth cable 50m
18th Edition Consumer Unit 10 way
Schneider RCBO 32A Type B
LED Downlight IP65 fire rated"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Tip: Be specific with brands and specifications for best results
            </p>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchInput.trim()}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching Screwfix & Toolstation...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search for Prices
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </h3>
                <span className="text-sm text-slate-500">
                  {selectedResults.size} selected
                </span>
              </div>

              {results.map((result, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedResults.has(index)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleResult(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedResults.has(index)}
                        onCheckedChange={() => toggleResult(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500 truncate">
                            Searched: "{result.search_term || 'Unknown'}"
                          </span>
                          {result.cached && (
                            <Badge variant="secondary" className="text-xs">
                              Cached {result.cache_age_hours}h ago
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-slate-900 line-clamp-2">
                          {result.product_name || 'Unknown Product'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={
                              result.supplier?.toLowerCase() === 'screwfix'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }
                          >
                            {result.supplier || 'Unknown'}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            SKU: {result.sku || 'N/A'}
                          </span>
                          {result.in_stock ? (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                              Out of Stock
                            </Badge>
                          )}
                          {result.product_url && (
                            <a
                              href={result.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Quantity selector */}
                        <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                          <Label className="text-xs text-slate-500 mb-1">Qty</Label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                              onClick={() => updateQuantity(index, (quantities[index] || 1) - 1)}
                            >
                              -
                            </button>
                            <Input
                              type="number"
                              min="1"
                              value={quantities[index] || 1}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-12 h-6 text-center text-sm p-0"
                            />
                            <button
                              type="button"
                              className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                              onClick={() => updateQuantity(index, (quantities[index] || 1) + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {/* Price display */}
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-500 line-through">
                            Cost: {formatPrice(typeof result.price === 'number' ? result.price : 0)}
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice((typeof result.price === 'number' ? result.price : 0) * (1 + markupPercentage / 100))}
                          </span>
                          <p className="text-xs text-slate-500">+{markupPercentage}% markup (exc VAT)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state after search */}
          {!isSearching && results.length === 0 && searchInput && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">
                Click "Search for Prices" to find material costs
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToQuote}
            disabled={selectedResults.size === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add {selectedResults.size} Item{selectedResults.size !== 1 ? 's' : ''} to Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
