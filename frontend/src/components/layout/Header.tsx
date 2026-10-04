import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">📚 知识库</h1>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
          </div>
          <span className="text-gray-700">{user?.displayName || user?.username}</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-semibold text-gray-800">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
