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
  FileText,
  Upload,
  Loader2,
  FolderPlus,
  Eye,
  EyeOff,
  Calendar,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
  Code,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Simple WYSIWYG toolbar component
const WYSIWYGEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onImageUpload: () => Promise<string | null>;
}> = ({ value, onChange, onImageUpload }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertTag = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertTag('<strong>', '</strong>'), title: 'Bold' },
    { icon: Italic, action: () => insertTag('<em>', '</em>'), title: 'Italic' },
    { icon: Heading1, action: () => insertTag('<h2>', '</h2>'), title: 'Heading 2' },
    { icon: Heading2, action: () => insertTag('<h3>', '</h3>'), title: 'Heading 3' },
    { icon: Quote, action: () => insertTag('<blockquote>', '</blockquote>'), title: 'Quote' },
    { icon: List, action: () => insertTag('<ul>\n<li>', '</li>\n</ul>'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertTag('<ol>\n<li>', '</li>\n</ol>'), title: 'Numbered List' },
    { icon: LinkIcon, action: () => insertTag('<a href="">', '</a>'), title: 'Link' },
    { icon: Code, action: () => insertTag('<code>', '</code>'), title: 'Code' },
    {
      icon: ImageIcon,
      action: async () => {
        const url = await onImageUpload();
        if (url) {
          insertTag(`<img src="${url}" alt="`, '" class="rounded-lg max-w-full" />');
        }
      },
      title: 'Image'
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[400px] p-4 font-mono text-sm resize-y focus:outline-none"
        placeholder="Write your blog post content here... You can use HTML tags for formatting."
      />
    </div>
  );
};

const BlogAdmin: React.FC = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Post form state
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
    published_at: '',
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
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'post' | 'category'; id: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let postsUrl = `${API_URL}/blog/posts`;
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (params.toString()) postsUrl += `?${params}`;

      const [categoriesRes, postsRes] = await Promise.all([
        fetch(`${API_URL}/blog/categories`),
        fetch(postsUrl),
      ]);

      const categoriesData = await categoriesRes.json();
      const postsData = await postsRes.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(`${API_URL}/upload?type=blog`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();
          if (data.success) {
            resolve(data.url);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Upload error:', error);
          resolve(null);
        } finally {
          setIsUploading(false);
        }
      };
      input.click();
    });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload?type=blog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setPostForm(prev => ({ ...prev, featured_image: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePost = async () => {
    try {
      const url = editingPost
        ? `${API_URL}/blog/posts/${editingPost.id}`
        : `${API_URL}/blog/posts`;

      const payload = {
        ...postForm,
        published_at: postForm.status === 'published' && !postForm.published_at
          ? new Date().toISOString()
          : postForm.published_at || null,
      };

      const response = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsPostDialogOpen(false);
        setEditingPost(null);
        resetPostForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory
        ? `${API_URL}/blog/categories/${editingCategory.id}`
        : `${API_URL}/blog/categories`;

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
      const url = deleteTarget.type === 'post'
        ? `${API_URL}/blog/posts/${deleteTarget.id}`
        : `${API_URL}/blog/categories/${deleteTarget.id}`;

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

  const resetPostForm = () => {
    setPostForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category_id: '',
      status: 'draft',
      is_featured: false,
      published_at: '',
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

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      category_id: post.category_id || '',
      status: post.status,
      is_featured: post.is_featured,
      published_at: post.published_at || '',
    });
    setIsPostDialogOpen(true);
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

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600">Create and manage blog posts</p>
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

          <Dialog open={isPostDialogOpen} onOpenChange={(open) => {
            setIsPostDialogOpen(open);
            if (!open) {
              setEditingPost(null);
              resetPostForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={postForm.title}
                      onChange={(e) => {
                        setPostForm(prev => ({
                          ...prev,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        }));
                      }}
                      placeholder="Post title"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={postForm.slug}
                      onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="post-slug"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={postForm.category_id}
                      onValueChange={(value) => setPostForm(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={postForm.status}
                      onValueChange={(value: 'draft' | 'published') => setPostForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={postForm.featured_image}
                      onChange={(e) => setPostForm(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="Image URL or upload"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                      />
                      <Button type="button" variant="outline" asChild disabled={isUploading}>
                        <span>
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </span>
                      </Button>
                    </label>
                  </div>
                  {postForm.featured_image && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={postForm.featured_image}
                        alt="Featured"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="A short summary of the post..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <WYSIWYGEditor
                    value={postForm.content}
                    onChange={(value) => setPostForm(prev => ({ ...prev, content: value }))}
                    onImageUpload={handleImageUpload}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={postForm.is_featured}
                      onChange={(e) => setPostForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_featured">Featured Post</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSavePost}
                    className="flex-1"
                    disabled={!postForm.title || !postForm.slug}
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                  {postForm.status === 'draft' && (
                    <Button
                      onClick={() => {
                        setPostForm(prev => ({ ...prev, status: 'published' }));
                        setTimeout(handleSavePost, 100);
                      }}
                      variant="outline"
                      disabled={!postForm.title || !postForm.slug}
                    >
                      Save & Publish
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1">
                <button
                  onClick={() => openEditCategory(cat)}
                  className="p-1 hover:bg-gray-100 rounded text-xs text-gray-500 hover:text-gray-700"
                >
                  <Edit className="w-3 h-3" />
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
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-500 mb-4">Create your first blog post to get started.</p>
          <Button onClick={() => setIsPostDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.status}
                    </span>
                    {post.is_featured && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditPost(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget({ type: 'post', id: post.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteTarget?.type === 'post' ? ' blog post' : ' category'}.
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

export default BlogAdmin;
