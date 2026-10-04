import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi } from '../lib/api';
import { SearchResult } from '../types';

const SearchResultsPage = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await searchApi.search(query);
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getSnippet = (content: string, query: string) => {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '');
    }
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 100);
    const snippet = content.substring(start, end);
    return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          搜索结果
        </h1>
        <p className="text-gray-500 mt-1">
          "{query}" 共找到 {results.length} 个结果
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">未找到相关文档</h3>
          <p className="text-gray-500">请尝试其他关键词</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => navigate(`/document/${result.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                  {highlightText(result.title, query)}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  result.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {result.visibility === 'public' ? '公开' : '私有'}
                </span>
              </div>

              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(getSnippet(result.content, query), query)}
              </p>

              {result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {result.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {result.createdBy?.displayName || result.createdBy?.username}
                </span>
                <span>
                  {new Date(result.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
