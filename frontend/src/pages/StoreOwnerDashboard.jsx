import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function StoreOwnerDashboard() {
  const { user, logout, updatePassword } = useContext(AuthContext);
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user?.storeId) {
      fetchStoreRatings();
    }
  }, [user]);

  const fetchStoreRatings = async () => {
    try {
      const response = await api.get(`/api/stores/${user.storeId}/ratings`);
      setStoreData({
        averageRating: response.data.averageRating,
        totalRatings: response.data.totalRatings
      });
      setRatings(Array.isArray(response.data.ratings) ? response.data.ratings : []);
    } catch (error) {
      console.error('Fetch store ratings error:', error);
      showMessage('error', 'Failed to fetch store ratings');
      setRatings([]);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      <nav className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Store Owner Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base">Welcome, {user?.name}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setShowPasswordModal(true)} className="flex-1 sm:flex-none bg-purple-500 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-purple-700 transition-colors">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-lg mb-2">Average Rating</h3>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold text-yellow-500">★</span>
              <span className="text-4xl font-bold text-purple-600">
                {storeData?.averageRating?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-lg mb-2">Total Ratings</h3>
            <p className="text-4xl font-bold text-purple-600">{storeData?.totalRatings || 0}</p>
          </div>
        </div>

        {/* Ratings List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">User Ratings</h2>

          {ratings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">User Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Rating</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr key={rating._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{rating.userId.name}</td>
                      <td className="px-4 py-3">{rating.userId.email}</td>
                      <td className="px-4 py-3">{rating.userId.address}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-xl">★</span>
                          <span className="font-semibold text-lg">{rating.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">No ratings yet</p>
              <p className="text-gray-400 text-sm mt-2">Users will be able to rate your store soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50 bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
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

export default StoreOwnerDashboard;