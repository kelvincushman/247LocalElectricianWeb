import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Edit,
  Image,
  Video,
  Upload,
  Loader2,
  FolderPlus,
  X,
  GripVertical,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  span: string;
  display_order: number;
  is_featured: boolean;
}

const spanOptions = [
  { value: 'md:col-span-1 md:row-span-2', label: 'Small (1x2)' },
  { value: 'md:col-span-2 md:row-span-2', label: 'Medium (2x2)' },
  { value: 'md:col-span-2 md:row-span-3', label: 'Large (2x3)' },
  { value: 'md:col-span-1 md:row-span-3', label: 'Tall (1x3)' },
  { value: 'md:col-span-2 md:row-span-4', label: 'Extra Large (2x4)' },
];

const GalleryAdmin: React.FC = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Item form state
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    type: 'image' as 'image' | 'video',
    url: '',
    thumbnail_url: '',
    category_id: '',
    span: 'md:col-span-1 md:row-span-2',
    display_order: 0,
    is_featured: false,
  });

  // Category form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'item' | 'category'; id: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch(`${API_URL}/gallery/categories`),
        fetch(`${API_URL}/gallery/items${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`),
      ]);

      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'thumbnail_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload?type=gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setItemForm(prev => ({ ...prev, [field]: data.url }));
        // Auto-detect type
        if (field === 'url') {
          const isVideo = file.type.startsWith('video/');
          setItemForm(prev => ({ ...prev, type: isVideo ? 'video' : 'image' }));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async () => {
    try {
      const url = editingItem
        ? `${API_URL}/gallery/items/${editingItem.id}`
        : `${API_URL}/gallery/items`;

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemForm),
      });

      if (response.ok) {
        setIsItemDialogOpen(false);
        setEditingItem(null);
        resetItemForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory
        ? `${API_URL}/gallery/categories/${editingCategory.id}`
        : `${API_URL}/gallery/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const url = deleteTarget.type === 'item'
        ? `${API_URL}/gallery/items/${deleteTarget.id}`
        : `${API_URL}/gallery/categories/${deleteTarget.id}`;

      await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const resetItemForm = () => {
    setItemForm({
      title: '',
      description: '',
      type: 'image',
      url: '',
      thumbnail_url: '',
      category_id: '',
      span: 'md:col-span-1 md:row-span-2',
      display_order: 0,
      is_featured: false,
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      display_order: 0,
    });
  };

  const openEditItem = (item: GalleryItem) => {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      description: item.description || '',
      type: item.type,
      url: item.url,
      thumbnail_url: item.thumbnail_url || '',
      category_id: item.category_id || '',
      span: item.span,
      display_order: item.display_order,
      is_featured: item.is_featured,
    });
    setIsItemDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      display_order: category.display_order,
    });
    setIsCategoryDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Manager</h1>
          <p className="text-gray-600">Manage your gallery images and videos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
            setIsCategoryDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetCategoryForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => {
                      setCategoryForm(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }));
                    }}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <Button onClick={handleSaveCategory} className="w-full">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isItemDialogOpen} onOpenChange={(open) => {
            setIsItemDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              resetItemForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={itemForm.title}
                      onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Item title"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={itemForm.category_id}
                      onValueChange={(value) => setItemForm(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.slug !== 'all-work').map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Item description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={itemForm.type}
                      onValueChange={(value: 'image' | 'video') => setItemForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select
                      value={itemForm.span}
                      onValueChange={(value) => setItemForm(prev => ({ ...prev, span: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {spanOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Media File</Label>
                  <div className="flex gap-2">
                    <Input
                      value={itemForm.url}
                      onChange={(e) => setItemForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="File URL or upload"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, 'url')}
                      />
                      <Button type="button" variant="outline" asChild disabled={isUploading}>
                        <span>
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </span>
                      </Button>
                    </label>
                  </div>
                  {itemForm.url && (
                    <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                      {itemForm.type === 'video' ? (
                        <video src={itemForm.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={itemForm.url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Thumbnail (for videos)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={itemForm.thumbnail_url}
                      onChange={(e) => setItemForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      placeholder="Thumbnail URL or upload"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'thumbnail_url')}
                      />
                      <Button type="button" variant="outline" asChild disabled={isUploading}>
                        <span>
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={itemForm.display_order}
                      onChange={(e) => setItemForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={itemForm.is_featured}
                      onChange={(e) => setItemForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_featured">Featured Item</Label>
                  </div>
                </div>

                <Button onClick={handleSaveItem} className="w-full" disabled={!itemForm.title || !itemForm.url}>
                  {editingItem ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.filter(c => c.slug !== 'all-work').map((cat) => (
            <div key={cat.id} className="flex items-center gap-1">
              <Button
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </Button>
              <button
                onClick={() => openEditCategory(cat)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="w-3 h-3 text-gray-500" />
              </button>
              <button
                onClick={() => setDeleteTarget({ type: 'category', id: cat.id })}
                className="p-1 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items yet</h3>
          <p className="text-gray-500 mb-4">Add your first image or video to get started.</p>
          <Button onClick={() => setIsItemDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl shadow-sm overflow-hidden aspect-square"
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Video
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditItem(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget({ type: 'item', id: item.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">{item.title}</p>
                {item.category_name && (
                  <p className="text-white/70 text-xs">{item.category_name}</p>
                )}
              </div>

              {item.is_featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteTarget?.type === 'item' ? ' gallery item' : ' category'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GalleryAdmin;
