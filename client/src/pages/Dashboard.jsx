import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-darker text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark/50 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Welcome, <span className="text-primary font-semibold">{user?.username}</span>!
            </p>
            <p className="text-gray-400">Email: {user?.email}</p>
            
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;