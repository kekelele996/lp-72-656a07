import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { documentsApi } from '../lib/api';
import { Document } from '../types';

const HomePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const folderId = searchParams.get('folder');

  useEffect(() => {
    fetchDocuments();
  }, [folderId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentsApi.getAll(folderId);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await documentsApi.create({
        title: '未命名文档',
        content: '',
        folderId: folderId || undefined,
      });
      navigate(`/document/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {folderId ? '文件夹内容' : '全部文档'}
          </h1>
          <p className="text-gray-500 mt-1">
            共 {documents.length} 个文档
          </p>
        </div>
        <button
          onClick={handleCreateDocument}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建文档
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无文档</h3>
          <p className="text-gray-500 mb-6">点击上方按钮创建您的第一个文档</p>
          <button
            onClick={handleCreateDocument}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建文档
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => navigate(`/document/${doc._id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate max-w-[200px]">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      v{doc.version}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  doc.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {doc.visibility === 'public' ? '公开' : '私有'}
                </span>
              </div>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {doc.createdBy?.displayName || doc.createdBy?.username}
                </span>
                <span>
                  {formatDate(doc.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
