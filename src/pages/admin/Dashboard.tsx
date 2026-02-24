import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Image, FileText, FolderOpen, TrendingUp, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Stats {
  galleryItems: number;
  blogPosts: number;
  galleryCategories: number;
  blogCategories: number;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [galleryItems, blogPosts, galleryCategories, blogCategories] = await Promise.all([
          fetch(`${API_URL}/gallery/items`).then(r => r.json()),
          fetch(`${API_URL}/blog/posts`).then(r => r.json()),
          fetch(`${API_URL}/gallery/categories`).then(r => r.json()),
          fetch(`${API_URL}/blog/categories`).then(r => r.json()),
        ]);

        setStats({
          galleryItems: Array.isArray(galleryItems) ? galleryItems.length : 0,
          blogPosts: Array.isArray(blogPosts) ? blogPosts.length : 0,
          galleryCategories: Array.isArray(galleryCategories) ? galleryCategories.length : 0,
          blogCategories: Array.isArray(blogCategories) ? blogCategories.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ galleryItems: 0, blogPosts: 0, galleryCategories: 0, blogCategories: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Gallery Items', value: stats?.galleryItems || 0, icon: Image, color: 'bg-blue-500', link: '/admin/gallery' },
    { label: 'Blog Posts', value: stats?.blogPosts || 0, icon: FileText, color: 'bg-green-500', link: '/admin/blog' },
    { label: 'Gallery Categories', value: stats?.galleryCategories || 0, icon: FolderOpen, color: 'bg-purple-500', link: '/admin/gallery' },
    { label: 'Blog Categories', value: stats?.blogCategories || 0, icon: FolderOpen, color: 'bg-orange-500', link: '/admin/blog' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.display_name || 'Admin'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your gallery and blog content from here.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <Link
                key={stat.label}
                to={stat.link}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/admin/gallery"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Gallery Item</p>
                  <p className="text-sm text-gray-500">Upload images or videos</p>
                </div>
              </Link>
              <Link
                to="/admin/blog"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Write Blog Post</p>
                  <p className="text-sm text-gray-500">Create a new article</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
