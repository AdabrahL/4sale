import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/manage-users.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function getPhotoUrl(photo) {
  if (!photo) return '/img/default-avatar.png';
  if (photo.startsWith('http')) return photo;
  return `${backendUrl}/storage/${photo}`;
}

export default function ManageUsers() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    agents: 0,
    regular: 0
  });
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/users');
      const fetchedUsers = response.data.users || response.data;
      setUsers(fetchedUsers);
      
      // Calculate stats
      const total = fetchedUsers.length;
      const admins = fetchedUsers.filter(u => u.is_admin).length;
      const agents = fetchedUsers.filter(u => u.is_agent && !u.is_admin).length;
      const regular = total - admins - agents;
      
      setStats({ total, admins, agents, regular });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      let is_admin = false;
      let is_agent = false;

      if (newRole === 'admin') {
        is_admin = true;
        is_agent = false;
      } else if (newRole === 'agent') {
        is_admin = false;
        is_agent = true;
      } else {
        // regular user
        is_admin = false;
        is_agent = false;
      }

      await axiosInstance.put(`/admin/users/${userId}/role`, {
        is_admin,
        is_agent
      });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'admin' && u.is_admin) ||
      (filterRole === 'agent' && u.is_agent && !u.is_admin) ||
      (filterRole === 'regular' && !u.is_agent && !u.is_admin);
    
    const matchesSearch = searchQuery === '' ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  const getUserRole = (user) => {
    if (user.is_admin) return 'admin';
    if (user.is_agent) return 'agent';
    return 'user';
  };

  const getRoleBadgeClass = (user) => {
    if (user.is_admin) return 'badge-admin';
    if (user.is_agent) return 'badge-agent';
    return 'badge-user';
  };

  const getRoleLabel = (user) => {
    if (user.is_admin) return 'Admin';
    if (user.is_agent) return 'Agent';
    return 'User';
  };

  if (!user?.is_admin) {
    return (
      <div className="manage-users-container">
        <div className="access-denied">
          <i className="fa fa-ban"></i>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mu-header"
      >
        <h1><i className="fa fa-users"></i> Manage Users</h1>
        <p className="mu-subtitle">Manage user accounts, assign roles, and control permissions</p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mu-info-banner"
      >
        <i className="fa fa-info-circle"></i>
        <div>
          <strong>Admin Privileges:</strong> You can promote users to agents or admins, and delete user accounts. 
          Note: You cannot modify your own role or delete your own account.
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mu-stats-grid"
      >
        <div className="mu-stat-card">
          <div className="mu-stat-icon total">
            <i className="fa fa-users"></i>
          </div>
          <div className="mu-stat-info">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="mu-stat-card">
          <div className="mu-stat-icon admin">
            <i className="fa fa-shield"></i>
          </div>
          <div className="mu-stat-info">
            <h3>{stats.admins}</h3>
            <p>Admins</p>
          </div>
        </div>
        <div className="mu-stat-card">
          <div className="mu-stat-icon agent">
            <i className="fa fa-user-tie"></i>
          </div>
          <div className="mu-stat-info">
            <h3>{stats.agents}</h3>
            <p>Agents</p>
          </div>
        </div>
        <div className="mu-stat-card">
          <div className="mu-stat-icon regular">
            <i className="fa fa-user"></i>
          </div>
          <div className="mu-stat-info">
            <h3>{stats.regular}</h3>
            <p>Regular Users</p>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mu-controls"
      >
        <div className="mu-filters">
          <button
            className={`mu-filter-btn ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            All Users
          </button>
          <button
            className={`mu-filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
            onClick={() => setFilterRole('admin')}
          >
            Admins
          </button>
          <button
            className={`mu-filter-btn ${filterRole === 'agent' ? 'active' : ''}`}
            onClick={() => setFilterRole('agent')}
          >
            Agents
          </button>
          <button
            className={`mu-filter-btn ${filterRole === 'regular' ? 'active' : ''}`}
            onClick={() => setFilterRole('regular')}
          >
            Regular
          </button>
        </div>
        <div className="mu-search">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mu-table-container"
      >
        {loading ? (
          <div className="mu-loading">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="mu-empty">
            <i className="fa fa-users"></i>
            <p>No users found</p>
          </div>
        ) : (
          <table className="mu-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={u.id === user.id ? 'current-user' : ''}
                >
                  <td>
                    <div className="mu-user-info">
                      <img
                        src={getPhotoUrl(u.photo)}
                        alt={u.name}
                        className="mu-user-avatar"
                        onError={(e) => e.target.src = '/img/default-avatar.png'}
                      />
                      <span>
                        {u.name}
                        {u.id === user.id && <span style={{ color: '#0c5904', marginLeft: '8px', fontSize: '12px' }}>(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`mu-role-badge ${getRoleBadgeClass(u)}`}>
                      {getRoleLabel(u)}
                    </span>
                  </td>
                  <td>{u.phone || '-'}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="mu-actions">
                      <select
                        className="mu-role-select"
                        value={getUserRole(u)}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id}
                      >
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="mu-action-btn delete"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        title={u.id === user.id ? "Cannot delete yourself" : "Delete user"}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
