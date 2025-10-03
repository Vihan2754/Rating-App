import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function UserDashboard() {
  const { user, logout, updatePassword } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    fetchStores();
  }, [search, sortConfig]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sortConfig.key) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }
      const response = await api.get(`/api/stores?${params}`);
      // Defensive: ensure response.data is an array
      setStores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch stores error:', error);
      showMessage('error', 'Failed to fetch stores');
      setStores([]); // Reset to empty array on error
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

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRating(store.userRating || 0);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/ratings', {
        storeId: selectedStore._id,
        rating
      });
      showMessage('success', 'Rating submitted successfully');
      setShowRatingModal(false);
      fetchStores();
    } catch (error) {
      console.error('Submit rating error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to submit rating');
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

  const StarRating = ({ value, onChange, readOnly = false }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange && onChange(star)}
            className={`text-3xl ${star <= value ? 'text-yellow-500' : 'text-gray-300'} ${!readOnly && 'hover:text-yellow-400 cursor-pointer'}`}
            disabled={readOnly}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">User Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base">Welcome, {user?.name}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setShowPasswordModal(true)} className="flex-1 sm:flex-none bg-green-500 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-green-700 transition-colors">
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">All Stores</h2>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by store name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Stores Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                    Store Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('averageRating')}>
                    Overall Rating {sortConfig.key === 'averageRating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 text-left">Your Rating</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{store.name}</td>
                    <td className="px-4 py-3">{store.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-xl">★</span>
                        <span className="font-semibold">{store.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({store.totalRatings} ratings)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {store.userRating ? (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                          ★ {store.userRating}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not rated</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openRatingModal(store)}
                        className={`px-4 py-2 rounded text-white ${
                          store.userRating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {store.userRating ? 'Modify Rating' : 'Submit Rating'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stores.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No stores found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {selectedStore.userRating ? 'Modify Rating' : 'Submit Rating'}
            </h3>
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">{selectedStore.name}</p>
              <p className="text-gray-600 text-sm mb-4">{selectedStore.address}</p>
            </div>
            
            <form onSubmit={handleSubmitRating}>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3">Your Rating</label>
                <div className="flex justify-center">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <p className="text-center text-gray-600 mt-2">
                  {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rating === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {selectedStore.userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all"
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

export default UserDashboard;