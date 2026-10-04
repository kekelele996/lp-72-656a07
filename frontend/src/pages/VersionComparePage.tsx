import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { versionsApi } from '../lib/api';

const VersionComparePage = () => {
  const { id, version1, version2 } = useParams<{
    id: string;
    version1: string;
    version2: string;
  }>();
  const [diff, setDiff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (version1 && version2) {
      fetchDiff();
    }
  }, [version1, version2]);

  const fetchDiff = async () => {
    setLoading(true);
    try {
      const response = await versionsApi.compare(version1!, version2!);
      setDiff(response.data);
    } catch (error) {
      console.error('Failed to fetch version diff:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = () => {
    if (!diff?.contentDiff) return null;

    return diff.contentDiff.map((part: any, index: number) => {
      if (part.added) {
        return (
          <span key={index} className="bg-green-100 text-green-800 px-1">
            {part.value}
          </span>
        );
      }
      if (part.removed) {
        return (
          <span key={index} className="bg-red-100 text-red-800 line-through px-1">
            {part.value}
          </span>
        );
      }
      return <span key={index}>{part.value}</span>;
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/document/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回文档
        </button>
        <h1 className="text-2xl font-bold text-gray-800">版本对比</h1>
      </div>

      {diff && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm font-medium text-red-800 mb-1">
                旧版本: v{diff.version1?.versionNumber}
              </div>
              <div className="text-xs text-red-600">
                {diff.version1?.createdAt && new Date(diff.version1.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-1">
                新版本: v{diff.version2?.versionNumber}
              </div>
              <div className="text-xs text-green-600">
                {diff.version2?.createdAt && new Date(diff.version2.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-700 mb-4">内容差异</h3>
            <div className="prose max-w-none whitespace-pre-wrap">
              {renderDiff()}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-100 border border-red-200 rounded"></span>
              <span className="text-sm text-gray-600">删除</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-100 border border-green-200 rounded"></span>
              <span className="text-sm text-gray-600">添加</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionComparePage;
