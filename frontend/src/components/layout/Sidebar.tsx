import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { foldersApi, tagsApi, documentsApi } from '../../lib/api';
import { Folder } from '../../types';

const Sidebar = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFolders = async () => {
    try {
      const response = await foldersApi.getTree();
      setFolders(response.data);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data.tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchFolders(), fetchTags()]).finally(() => setLoading(false));
  }, []);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await foldersApi.create({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolderInput(false);
      await fetchFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await documentsApi.create({ title: '未命名文档', content: '' });
      navigate(`/document/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const renderFolderTree = (folderList: Folder[], level: number = 0) => {
    return folderList.map((folder) => {
      const hasChildren = folder.children && folder.children.length > 0;
      const isExpanded = expandedFolders.has(folder._id || folder.id);

      return (
        <div key={folder._id || folder.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg ml-${level * 4}`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleFolder(folder._id || folder.id);
              }
              navigate(`/?folder=${folder._id || folder.id}`);
            }}
          >
            {hasChildren && (
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {!hasChildren && <div className="w-4" />}
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="text-gray-700 truncate">{folder.name}</span>
          </div>
          {hasChildren && isExpanded && renderFolderTree(folder.children!, level + 1)}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={handleCreateDocument}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建文档
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">快速访问</h3>
          </div>
          <ul className="space-y-1">
            <li
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                location.pathname === '/' && !location.search.includes('folder')
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              全部文档
            </li>
            <li
              onClick={() => navigate('/trash')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                location.pathname === '/trash'
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              回收站
            </li>
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">文件夹</h3>
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {showNewFolderInput && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="文件夹名称"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
              >
                取消
              </button>
            </div>
          )}
          
          <div className="space-y-1">
            {folders.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-2">暂无文件夹</p>
            ) : (
              renderFolderTree(folders)
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/tag/${encodeURIComponent(tag)}`)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    location.pathname === `/tag/${tag}`
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
