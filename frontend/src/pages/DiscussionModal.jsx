import React from 'react';
import { MessageSquare, X, Loader2, Heart, ImageIcon, LinkIcon } from 'lucide-react';
import { ReplyItem } from './ReplyItem';

export const DiscussionModal = ({
  activeDiscussionShow,
  onClose,
  comments,
  loadingComments,
  sortBy,
  setSortBy,
  sortedComments,
  user,
  setComments,
  handleLikeReview,
  handlePostReply,
  handlePostComment,
  commentPhoto,
  setCommentPhoto,
  isUrlMode,
  setIsUrlMode,
  imageUrlInput,
  setImageUrlInput,
  handleFileUpload,
  newCommentText,
  setNewCommentText,
  submittingComment
}) => {
  if (!activeDiscussionShow) return null;

  const currentUserId = user?._id || user?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-amber-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-amber-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">
                Discussion: {activeDiscussionShow.title}
              </h3>
              <p className="text-xs text-gray-500">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'} in this thread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
              <span className="px-2 text-gray-400 font-semibold text-[11px]">Sort:</span>
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'oldest', label: 'Oldest' },
                { id: 'popular', label: 'Most Popular' },
              ].map((sort) => (
                <button
                  key={sort.id}
                  type="button"
                  onClick={() => setSortBy(sort.id)}
                  className={`px-3 py-1 rounded-lg transition ${
                    sortBy === sort.id
                      ? 'bg-amber-900 text-white shadow-sm'
                      : 'hover:bg-amber-50 text-gray-700'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>

            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-amber-100/50 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Discussion List Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {loadingComments ? (
            <div className="flex items-center justify-center py-16 text-amber-800 gap-2 text-xs font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading discussion thread...
            </div>
          ) : sortedComments.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-400 font-medium space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p>No comments yet. Start the conversation or attach a photo!</p>
            </div>
          ) : (
            sortedComments.map((item) => {
              const reviewId = item._id || item.id;
              const isLiked = item.likes?.includes(currentUserId);

              return (
                <div 
                  key={reviewId} 
                  className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100/80 space-y-3 transition hover:border-amber-200"
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {(item.userName || item.author || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900">{item.userName || item.author || 'User'}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : (item.time || '')}
                    </span>
                  </div>

                  {item.comment && <p className="text-sm text-gray-800 leading-relaxed pl-9">{item.comment}</p>}

                  {(item.imageUrl || item.photo) && (
                    <div className="pl-9 pt-1">
                      <img 
                        src={item.imageUrl || item.photo} 
                        alt="Discussion Attachment" 
                        className="w-full max-h-72 object-cover rounded-xl border border-gray-200" 
                      />
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pl-9 flex items-center gap-6 text-xs text-gray-500 font-semibold pt-1">
                    <button 
                      onClick={() => handleLikeReview(reviewId)}
                      className={`flex items-center gap-1.5 transition ${isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{item.likes?.length || 0} Likes</span>
                    </button>

                    <button 
                      onClick={() => {
                        setComments(prev => prev.map(c => (c._id || c.id) === reviewId ? { ...c, showReplyBox: !c.showReplyBox } : c));
                      }}
                      className="hover:text-amber-900 transition flex items-center gap-1"
                    >
                      Reply ({item.replies?.length || 0})
                    </button>
                  </div>

                  {/* Inline Reply Input Box */}
                  {item.showReplyBox && (
                    <div className="pl-9 pt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={item.replyText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComments(prev => prev.map(c => (c._id || c.id) === reviewId ? { ...c, replyText: val } : c));
                        }}
                        className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E65100]"
                      />
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Image URL (optional)"
                          value={item.replyPhoto || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setComments(prev => prev.map(c => (c._id || c.id) === reviewId ? { ...c, replyPhoto: val } : c));
                          }}
                          className="flex-1 text-xs px-3 py-1.5 bg-gray-50 border border-amber-200 rounded-xl focus:outline-none"
                        />
                        <button
                          onClick={async () => {
                            await handlePostReply(reviewId, null, item.replyText, item.replyPhoto);
                            setComments(prev => prev.map(c => (c._id || c.id) === reviewId ? { ...c, replyText: '', replyPhoto: '', showReplyBox: false } : c));
                          }}
                          className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Nested Replies */}
                  {item.replies && item.replies.map(rep => (
                    <ReplyItem 
                      key={rep._id || rep.id} 
                      reply={rep} 
                      reviewId={reviewId} 
                      onLike={handleLikeReview} 
                      onReplySubmit={handlePostReply} 
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handlePostComment} className="p-4 bg-white border-t border-amber-100 flex-shrink-0 space-y-3">
          {commentPhoto && (
            <div className="relative inline-block pl-2">
              <img src={commentPhoto} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-amber-200 shadow-sm" />
              <button 
                type="button"
                onClick={() => setCommentPhoto(null)} 
                className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {isUrlMode && (
            <input
              type="url"
              placeholder="Paste Image URL (https://...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="w-full text-xs px-4 py-2.5 border border-amber-200 rounded-xl bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            />
          )}

          <div className="flex items-center gap-2">
            <label className="cursor-pointer p-3 bg-amber-50 text-amber-900 rounded-xl hover:bg-amber-100 transition border border-amber-200" title="Upload Image File">
              <ImageIcon className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              type="button"
              onClick={() => setIsUrlMode(!isUrlMode)}
              className={`p-3 rounded-xl border transition ${
                isUrlMode 
                  ? 'bg-amber-100 border-amber-300 text-[#E65100]' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              title="Toggle Image URL Input"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <input 
              type="text" 
              placeholder="Ask a question or share a thought..." 
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 text-sm px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50"
            />

            <button 
              type="submit"
              disabled={submittingComment || (!newCommentText.trim() && !commentPhoto && !imageUrlInput.trim())}
              className="px-6 py-3 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
            >
              {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};