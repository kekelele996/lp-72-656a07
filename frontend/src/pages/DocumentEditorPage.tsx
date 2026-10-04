import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi, versionsApi, commentsApi, foldersApi } from '../lib/api';
import { Document, Version, Comment, Folder } from '../types';
import TipTapEditor from '../components/editor/TipTapEditor';
import { useAuthStore } from '../store/authStore';
import Toast from '../components/common/Toast';

const DocumentEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isOwner = user && document && document.createdBy?.id === user.id;

  useEffect(() => {
    if (id) {
      fetchDocument();
      fetchVersions();
      fetchComments();
      fetchFolders();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentsApi.getById(id!);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await versionsApi.getByDocumentId(id!);
      setVersions(response.data);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getByDocumentId(id!);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await foldersApi.getAll();
      setFolders(response.data);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    
    setSaving(true);
    try {
      await documentsApi.update(id!, {
        title: document.title,
        content: document.content,
      });
      await fetchDocument();
      await fetchVersions();
      setToast({ message: '保存成功', type: 'success' });
    } catch (error) {
      console.error('Failed to save document:', error);
      setToast({ message: '保存失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文档吗？')) return;

    try {
      await documentsApi.delete(id!);
      navigate('/trash');
    } catch (error) {
      console.error('Failed to delete document:', error);
      setToast({ message: '删除失败', type: 'error' });
    }
  };

  const handleVisibilityChange = async (visibility: 'private' | 'public') => {
    if (!document) return;
    
    try {
      await documentsApi.update(id!, { visibility });
      setDocument({ ...document, visibility });
      setToast({ message: '权限已更新', type: 'success' });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      setToast({ message: '更新失败', type: 'error' });
    }
  };

  const handleFolderChange = async (folderId: string) => {
    if (!document) return;
    
    try {
      await documentsApi.move(id!, folderId === 'null' ? null : folderId);
      await fetchDocument();
      setToast({ message: '已移动到新位置', type: 'success' });
    } catch (error) {
      console.error('Failed to move document:', error);
      setToast({ message: '移动失败', type: 'error' });
    }
  };

  const handleTagAdd = async (tag: string) => {
    if (!document || !tag.trim()) return;
    if (document.tags.includes(tag.trim())) return;
    
    const newTags = [...document.tags, tag.trim()];
    try {
      await documentsApi.update(id!, { tags: newTags });
      setDocument({ ...document, tags: newTags });
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleTagRemove = async (tag: string) => {
    if (!document) return;
    
    const newTags = document.tags.filter((t) => t !== tag);
    try {
      await documentsApi.update(id!, { tags: newTags });
      setDocument({ ...document, tags: newTags });
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('确定要回滚到这个版本吗？当前内容将被保存为新版本。')) return;

    try {
      await documentsApi.rollback(id!, versionId);
      await fetchDocument();
      await fetchVersions();
      setShowVersions(false);
      setToast({ message: '已回滚到指定版本', type: 'success' });
    } catch (error) {
      console.error('Failed to rollback:', error);
      setToast({ message: '回滚失败', type: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await commentsApi.create(id!, { content: newComment.trim() });
      setNewComment('');
      await fetchComments();
      setToast({ message: '评论已添加', type: 'success' });
    } catch (error) {
      console.error('Failed to add comment:', error);
      setToast({ message: '评论失败', type: 'error' });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const [tagInput, setTagInput] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">文档不存在</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <input
            type="text"
            value={document.title}
            onChange={(e) => setDocument({ ...document, title: e.target.value })}
            className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1 max-w-xl"
            placeholder="文档标题"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${
              showVersions ? 'bg-gray-100' : ''
            }`}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-700">v{document.version}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${
              showComments ? 'bg-gray-100' : ''
            }`}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm text-gray-700">{comments.length}</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                showSettings ? 'bg-gray-100' : ''
              }`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>保存</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <TipTapEditor
              content={document.content}
              onChange={(content) => setDocument({ ...document, content })}
            />
          </div>
        </div>

        {showVersions && (
          <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">历史版本</h3>
              <p className="text-sm text-gray-500 mt-1">共 {versions.length} 个版本</p>
            </div>
            <div className="divide-y divide-gray-100">
              {versions.map((version) => (
                <div key={version._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      v{version.versionNumber}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRollback(version._id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        回滚
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {version.changeLog || '未填写变更说明'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(version.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        )}

        {showComments && (
          <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">评论</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="添加评论..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">暂无评论</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                        {comment.createdBy?.displayName?.charAt(0) || comment.createdBy?.username?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-800">
                            {comment.createdBy?.displayName || comment.createdBy?.username}
                          </span>
                          {user?.id === comment.createdBy?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              删除
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        {showSettings && (
          <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">文档设置</h3>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可见性
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={document.visibility === 'private'}
                      onChange={() => handleVisibilityChange('private')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">私有（仅您和授权用户可见）</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={document.visibility === 'public'}
                      onChange={() => handleVisibilityChange('public')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">公开（所有人可见）</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属文件夹
                </label>
                <select
                  value={document.folderId || 'null'}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="null">根目录</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTagAdd(tagInput);
                        setTagInput('');
                      }
                    }}
                    placeholder="添加标签"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      handleTagAdd(tagInput);
                      setTagInput('');
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DocumentEditorPage;
