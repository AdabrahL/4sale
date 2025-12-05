import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/my-blogs.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

export default function MyBlogs() {
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    blogs: 0,
    books: 0
  });
  const [filterType, setFilterType] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      // Fetch all blogs (baseURL already includes /api)
      const response = await axiosInstance.get('/blogs');
      
      let fetchedBlogs = response.data;
      
      // Handle different response structures
      if (response.data.blogs) {
        fetchedBlogs = response.data.blogs;
      } else if (response.data.data) {
        fetchedBlogs = response.data.data;
      }
      
      const blogsArray = Array.isArray(fetchedBlogs) ? fetchedBlogs : [];
      
      // Show all blogs without filtering
      setBlogs(blogsArray);
      
      // Calculate stats
      const total = blogsArray.length;
      const blogsCount = blogsArray.filter(b => b.type === 'blog').length;
      const booksCount = blogsArray.filter(b => b.type === 'book').length;
      
      setStats({ total, blogs: blogsCount, books: booksCount });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      console.error('Error details:', error.response?.data);
      showError('Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    
    try {
      setDeleting(true);
      await axiosInstance.delete(`/blogs/${selectedBlog.id}`);
      showSuccess(`${selectedBlog.type === 'blog' ? 'Blog' : 'Book'} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedBlog(null);
      fetchMyBlogs();
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedBlog(null);
  };

  const filteredBlogs = blogs.filter(blog => {
    if (filterType === 'all') return true;
    return blog.type === filterType;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/img/default-blog.jpg';
    return imagePath.startsWith('http') ? imagePath : `${backendUrl}/storage/${imagePath}`;
  };

  return (
    <div className="my-blogs-container">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-stats-grid"
      >
        <div className="mb-stat-card">
          <div className="mb-stat-icon total">
            <i className="fa fa-newspaper"></i>
          </div>
          <div className="mb-stat-info">
            <h3>{stats.total}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="mb-stat-card">
          <div className="mb-stat-icon blogs">
            <i className="fa fa-blog"></i>
          </div>
          <div className="mb-stat-info">
            <h3>{stats.blogs}</h3>
            <p>Blogs</p>
          </div>
        </div>
        <div className="mb-stat-card">
          <div className="mb-stat-icon books">
            <i className="fa fa-book"></i>
          </div>
          <div className="mb-stat-info">
            <h3>{stats.books}</h3>
            <p>Books</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-filters"
      >
        <button
          className={`mb-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Posts
        </button>
        <button
          className={`mb-filter-btn ${filterType === 'blog' ? 'active' : ''}`}
          onClick={() => setFilterType('blog')}
        >
          Blogs Only
        </button>
        <button
          className={`mb-filter-btn ${filterType === 'book' ? 'active' : ''}`}
          onClick={() => setFilterType('book')}
        >
          Books Only
        </button>
      </motion.div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="mb-loading">
          <i className="fa fa-spinner fa-spin"></i>
          <p>Loading your posts...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="mb-empty">
          <i className="fa fa-newspaper"></i>
          <h3>No {filterType === 'all' ? 'posts' : filterType === 'blog' ? 'blogs' : 'books'} yet</h3>
          <p>Start sharing knowledge by creating your first {filterType === 'all' ? 'post' : filterType}!</p>
          <Link to="/blog/post" className="mb-create-btn">
            <i className="fa fa-plus"></i> Create Post
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-grid"
        >
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-card"
            >
              <div className="mb-card-image">
                <img src={getImageUrl(blog.image)} alt={blog.title} />
                <div className="mb-card-type">
                  <i className={`fa fa-${blog.type === 'blog' ? 'blog' : 'book'}`}></i>
                  {blog.type === 'blog' ? 'Blog' : 'Book'}
                </div>
              </div>
              
              <div className="mb-card-content">
                <h3 className="mb-card-title">{blog.title}</h3>
                {blog.excerpt && <p className="mb-card-excerpt">{blog.excerpt}</p>}
                
                {blog.type === 'book' && blog.author && (
                  <div className="mb-card-author">
                    <i className="fa fa-user"></i> {blog.author}
                  </div>
                )}

                <div className="mb-card-meta">
                  <span><i className="fa fa-eye"></i> {blog.views || 0} views</span>
                  <span><i className="fa fa-calendar"></i> {new Date(blog.created_at).toLocaleDateString()}</span>
                </div>

                <div className="mb-card-actions">
                  <Link to={`/blog/${blog.id}`} className="mb-action-btn view">
                    <i className="fa fa-eye"></i> View
                  </Link>
                  <Link to={`/blog/edit/${blog.id}`} className="mb-action-btn edit">
                    <i className="fa fa-edit"></i> Edit
                  </Link>
                  <button 
                    className="mb-action-btn delete"
                    onClick={() => openDeleteModal(blog)}
                  >
                    <i className="fa fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-modal-overlay"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-modal-header">
                <h3>Confirm Delete</h3>
                <button className="mb-modal-close" onClick={closeDeleteModal}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              
              <div className="mb-modal-body">
                <div className="mb-modal-icon delete">
                  <i className="fa fa-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete this {selectedBlog?.type}?</p>
                <p className="mb-modal-title">"{selectedBlog?.title}"</p>
                <p className="mb-modal-warning">This action cannot be undone.</p>
              </div>

              <div className="mb-modal-footer">
                <button 
                  className="mb-modal-btn cancel" 
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="mb-modal-btn confirm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-trash"></i> Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
