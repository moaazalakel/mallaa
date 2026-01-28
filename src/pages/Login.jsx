import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersStorage } from '../data/storage';
import { ROLES } from '../data/constants';
import { IoClose } from 'react-icons/io5';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const users = usersStorage.getAll();
  const demoAccounts = users.map((u) => ({
    username: u.username,
    password: u.password,
    role: u.role,
    governorate: u.governorateId || 'جميع المحافظات',
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = login(username, password);
    if (result.success) {
      // Redirect based on role
      if (result.user.role === ROLES.SPECIALIST) {
        navigate('/portal/specialist/dashboard');
      } else if (result.user.role === ROLES.SUPERVISOR || result.user.role === ROLES.SECTION_HEAD) {
        navigate('/portal/supervisor/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  const fillDemoAccount = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#211551] via-[#3b2e79] to-[#211551] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
          {/* Close Button */}
          <Link
            to="/"
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-[#211551] hover:bg-gray-100 rounded-full transition-colors"
            title="العودة للرئيسية"
          >
            <IoClose size={24} />
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#211551] mb-2">منصة الملاءة</h1>
            <p className="text-gray-600">تسجيل الدخول</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#211551] text-white py-3 rounded-lg font-semibold hover:bg-[#3b2e79] transition-colors"
            >
              تسجيل الدخول
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full text-sm text-[#211551] font-medium hover:underline mb-4"
            >
              {showDemoAccounts ? 'إخفاء' : 'عرض'} حسابات تجريبية
            </button>

            {showDemoAccounts && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">انقر على حساب لتعبئة البيانات:</p>
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemoAccount(account.username, account.password)}
                    className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                  >
                    <div className="font-medium text-[#211551]">{account.username}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {account.role} - {account.governorate}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">كلمة المرور: {account.password}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-white/80 text-sm mt-4">
          نظام تجريبي - للعرض فقط
        </p>
      </div>
    </div>
  );
};

export default Login;
