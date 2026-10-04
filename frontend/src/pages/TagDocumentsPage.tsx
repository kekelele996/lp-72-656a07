import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tagsApi } from '../lib/api';
import { Document } from '../types';

const TagDocumentsPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (tag) {
      fetchDocuments();
    }
  }, [tag]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await tagsApi.getDocumentsByTag(tag!);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch documents by tag:', error);
    } finally {
      setLoading(false);
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            #{tag}
          </span>
          <h1 className="text-2xl font-bold text-gray-800">
            标签文档
          </h1>
        </div>
        <p className="text-gray-500 mt-2">
          共 {documents.length} 个文档
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无文档</h3>
          <p className="text-gray-500">该标签下还没有文档</p>
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
                    <h3 className="font-semibold text-gray-800 truncate max-w-[180px]">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      v{doc.version}
                    </p>
                  </div>
                </div>
              </div>

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

export default TagDocumentsPage;
