import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function AdminDashboard() {
  const { user, logout, updatePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user',
    storeName: '', storeEmail: '', storeAddress: ''
  });

  const [storeForm, setStoreForm] = useState({
    name: '', email: '', address: '',
    ownerName: '', ownerEmail: '', ownerPassword: '', ownerAddress: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'stores') fetchStores();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, filters, sortConfig]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/users/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
      showMessage('error', 'Failed to fetch stats');
    }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      if (sortConfig.key) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }
      const response = await api.get(`/api/stores?${params}`);
      setStores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch stores error:', error);
      showMessage('error', 'Failed to fetch stores');
      setStores([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      if (filters.role) params.append('role', filters.role);
      if (sortConfig.key) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }
      const response = await api.get(`/api/users?${params}`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch users error:', error);
      showMessage('error', 'Failed to fetch users');
      setUsers([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (userForm.name.length < 20 || userForm.name.length > 60) {
      showMessage('error', 'Name must be 20-60 characters');
      return;
    }
    
    if (userForm.password.length < 8 || userForm.password.length > 16) {
      showMessage('error', 'Password must be 8-16 characters');
      return;
    }
    
    if (!/[A-Z]/.test(userForm.password)) {
      showMessage('error', 'Password must contain at least one uppercase letter');
      return;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(userForm.password)) {
      showMessage('error', 'Password must contain at least one special character');
      return;
    }
    
    if (userForm.address.length > 400) {
      showMessage('error', 'Address cannot exceed 400 characters');
      return;
    }
    
    if (userForm.role === 'storeOwner') {
      if (userForm.storeName.length < 20 || userForm.storeName.length > 60) {
        showMessage('error', 'Store name must be 20-60 characters');
        return;
      }
      if (userForm.storeAddress.length > 400) {
        showMessage('error', 'Store address cannot exceed 400 characters');
        return;
      }
    }
    
    try {
      await api.post('/api/users', userForm);
      showMessage('success', 'User added successfully');
      setShowAddUserModal(false);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user', storeName: '', storeEmail: '', storeAddress: '' });
      fetchUsers();
    } catch (error) {
      console.error('Add user error:', error);
      console.error('Response data:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        showMessage('error', errorMessages);
      } else {
        showMessage('error', error.response?.data?.message || 'Failed to add user');
      }
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (storeForm.name.length < 20 || storeForm.name.length > 60) {
      showMessage('error', 'Store name must be 20-60 characters');
      return;
    }
    
    if (storeForm.address.length > 400) {
      showMessage('error', 'Store address cannot exceed 400 characters');
      return;
    }
    
    if (storeForm.ownerName.length < 20 || storeForm.ownerName.length > 60) {
      showMessage('error', 'Owner name must be 20-60 characters');
      return;
    }
    
    if (storeForm.ownerPassword.length < 8 || storeForm.ownerPassword.length > 16) {
      showMessage('error', 'Owner password must be 8-16 characters');
      return;
    }
    
    if (!/[A-Z]/.test(storeForm.ownerPassword)) {
      showMessage('error', 'Owner password must contain at least one uppercase letter');
      return;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(storeForm.ownerPassword)) {
      showMessage('error', 'Owner password must contain at least one special character');
      return;
    }
    
    if (storeForm.ownerAddress.length > 400) {
      showMessage('error', 'Owner address cannot exceed 400 characters');
      return;
    }
    
    try {
      await api.post('/api/stores', storeForm);
      showMessage('success', 'Store added successfully');
      setShowAddStoreModal(false);
      setStoreForm({ name: '', email: '', address: '', ownerName: '', ownerEmail: '', ownerPassword: '', ownerAddress: '' });
      fetchStores();
    } catch (error) {
      console.error('Add store error:', error);
      console.error('Response data:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        showMessage('error', errorMessages);
      } else {
        showMessage('error', error.response?.data?.message || 'Failed to add store');
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage('success', 'Password updated successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base">Welcome, {user?.name}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setShowPasswordModal(true)} className="flex-1 sm:flex-none bg-blue-500 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-blue-700 transition-colors">
                Change Password
              </button>
              <button onClick={logout} className="flex-1 sm:flex-none bg-red-500 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Message Alert */}
      {message.text && (
        <div className={`container mx-4 sm:mx-auto mt-4 p-4 rounded-lg shadow-md text-sm sm:text-base ${message.type === 'success' ? 'bg-green-100 text-green-700 border-l-4 border-green-500' : 'bg-red-100 text-red-700 border-l-4 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="container mx-auto p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors ${activeTab === 'stores' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Stores
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Users
          </button>
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 text-lg mb-2">Total Users</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 text-lg mb-2">Total Stores</h3>
              <p className="text-4xl font-bold text-green-600">{stats.totalStores}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 text-lg mb-2">Total Ratings</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.totalRatings}</p>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Stores</h2>
              <button
                onClick={() => setShowAddStoreModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Store
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Filter by name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Filter by address"
                value={filters.address}
                onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                className="px-3 py-2 border rounded"
              />
            </div>

            {/* Stores Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('email')}>
                      Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('averageRating')}>
                      Rating {sortConfig.key === 'averageRating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{store.name}</td>
                      <td className="px-4 py-3">{store.email}</td>
                      <td className="px-4 py-3">{store.address}</td>
                      <td className="px-4 py-3">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⭐ {store.averageRating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Users</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add User
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Filter by name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Filter by address"
                value={filters.address}
                onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="storeOwner">Store Owner</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('email')}>
                      Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('role')}>
                      Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left">Store Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((usr) => (
                    <tr key={usr._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{usr.name}</td>
                      <td className="px-4 py-3">{usr.email}</td>
                      <td className="px-4 py-3">{usr.address}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          usr.role === 'admin' ? 'bg-red-100 text-red-800' :
                          usr.role === 'storeOwner' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {usr.storeId ? `⭐ ${usr.storeId.averageRating?.toFixed(1) || 0}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Add User</h3>
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    minLength={20}
                    maxLength={60}
                    required
                  />
                  <p className="text-xs text-gray-500">20-60 characters (current: {userForm.name.length})</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Password *</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    minLength={8}
                    maxLength={16}
                    required
                  />
                  <p className="text-xs text-gray-500">8-16 chars, 1 uppercase, 1 special (!@#$%^&*)</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="storeOwner">Store Owner</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Address *</label>
                  <textarea
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                    maxLength={400}
                    required
                  />
                  <p className="text-xs text-gray-500">Max 400 characters (current: {userForm.address.length})</p>
                </div>

                {userForm.role === 'storeOwner' && (
                  <>
                    <div className="md:col-span-2">
                      <h4 className="font-bold text-lg mt-2 mb-2">Store Details</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Store Name *</label>
                      <input
                        type="text"
                        value={userForm.storeName}
                        onChange={(e) => setUserForm({ ...userForm, storeName: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        minLength={20}
                        maxLength={60}
                        required={userForm.role === 'storeOwner'}
                      />
                      <p className="text-xs text-gray-500">20-60 characters (current: {userForm.storeName.length})</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Store Email *</label>
                      <input
                        type="email"
                        value={userForm.storeEmail}
                        onChange={(e) => setUserForm({ ...userForm, storeEmail: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required={userForm.role === 'storeOwner'}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-1">Store Address *</label>
                      <textarea
                        value={userForm.storeAddress}
                        onChange={(e) => setUserForm({ ...userForm, storeAddress: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        rows="2"
                        maxLength={400}
                        required={userForm.role === 'storeOwner'}
                      />
                      <p className="text-xs text-gray-500">Max 400 characters (current: {userForm.storeAddress.length})</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Add Store</h3>
            <form onSubmit={handleAddStore}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h4 className="font-bold text-lg mb-2">Store Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Store Name *</label>
                  <input
                    type="text"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    minLength={20}
                    maxLength={60}
                    required
                  />
                  <p className="text-xs text-gray-500">20-60 characters (current: {storeForm.name.length})</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Store Email *</label>
                  <input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Store Address *</label>
                  <textarea
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                    maxLength={400}
                    required
                  />
                  <p className="text-xs text-gray-500">Max 400 characters (current: {storeForm.address.length})</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-bold text-lg mt-4 mb-2">Owner Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={storeForm.ownerName}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    minLength={20}
                    maxLength={60}
                    required
                  />
                  <p className="text-xs text-gray-500">20-60 characters (current: {storeForm.ownerName.length})</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Owner Email *</label>
                  <input
                    type="email"
                    value={storeForm.ownerEmail}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Owner Password *</label>
                  <input
                    type="password"
                    value={storeForm.ownerPassword}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    minLength={8}
                    maxLength={16}
                    required
                  />
                  <p className="text-xs text-gray-500">8-16 chars, 1 uppercase, 1 special (!@#$%^&*)</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Owner Address *</label>
                  <textarea
                    value={storeForm.ownerAddress}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                    maxLength={400}
                    required
                  />
                  <p className="text-xs text-gray-500">Max 400 characters (current: {storeForm.ownerAddress.length})</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-500 mt-2">Update your account security credentials</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  minLength={8}
                  maxLength={16}
                  required
                />
                <div className="mt-2 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-gray-600">8-16 characters, 1 uppercase letter, 1 special character (!@#$%^&*)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;