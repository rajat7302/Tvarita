import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/common/Navbar';
import SearchBar from '../components/common/SearchBar';
import ArtFormCard from '../components/cards/ArtFormCard';
import IndiaMap from '../components/map/IndiaMap';
import RequestArtFormModal from '../components/forms/RequestArtFormModal';
import CreateShowModal from '../components/CreateShowModal';
import GuestGateModal from '../components/common/GuestGateModal';
import { getArtForms } from '../services/artFormService';
import { getShows } from '../services/showService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { 
  PlusCircle, 
  Calendar, 
  Filter, 
  MapPin, 
  Ticket, 
  CheckCircle, 
  MessageSquare, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Heart, 
  Link as LinkIcon 
} from 'lucide-react';

const extractImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object') return img.url || img.secure_url || img.path || null;
  return null;
};

const extractTickets = (showData) => {
  if (!showData) return 100;
  const keys = ['availableTickets', 'ticketsLeft', 'tickets', 'capacity', 'totalTickets', 'ticketCount', 'maxCapacity'];
  for (let key of keys) {
    if (showData[key] !== undefined && showData[key] !== null) {
      const num = Number(showData[key]);
      if (!isNaN(num)) return num;
    }
  }
  return 100;
};

// Recursive Component for Nested Replies
function ReplyItem({ reply, reviewId, onLike, onReplySubmit, currentUserId }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyPhoto, setReplyPhoto] = useState('');

  const replyId = reply._id || reply.id;
  const isLiked = reply.likes?.includes(currentUserId);

  const handleSendReply = async () => {
    if (!replyText.trim() && !replyPhoto) return;
    await onReplySubmit(reviewId, replyId, replyText, replyPhoto);
    setReplyText('');
    setReplyPhoto('');
    setShowReplyInput(false);
  };

  return (
    <div className="ml-6 pl-4 border-l-2 border-amber-200/60 space-y-2 mt-3">
      <div className="bg-[#FFFDF9] p-3 rounded-xl border border-amber-100/70 shadow-sm space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-emerald-800">{reply.userName || reply.author || 'User'}</span>
          <span className="text-[10px] text-gray-400">
            {reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        
        <p className="text-sm text-gray-800">{reply.comment}</p>
        
        {reply.imageUrl && (
          <img src={reply.imageUrl} alt="Reply attachment" className="w-full max-h-48 object-cover rounded-lg border border-gray-200 mt-2" />
        )}

        <div className="flex items-center gap-4 pt-1 text-xs text-gray-500 font-semibold">
          <button 
            onClick={() => onLike(reviewId, replyId)}
            className={`flex items-center gap-1 transition ${isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} /> 
            <span>{reply.likes?.length || 0}</span>
          </button>

          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="hover:text-amber-900 transition"
          >
            Reply
          </button>
        </div>
      </div>

      {showReplyInput && (
        <div className="space-y-2 pt-1 pl-2">
          <input
            type="text"
            placeholder={`Reply to ${reply.userName || 'user'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E65100]"
          />
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={replyPhoto}
              onChange={(e) => setReplyPhoto(e.target.value)}
              className="flex-1 text-[11px] px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg focus:outline-none"
            />
            <button 
              onClick={handleSendReply}
              className="px-3 py-1 bg-emerald-700 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-800 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {reply.replies && reply.replies.map(subReply => (
        <ReplyItem 
          key={subReply._id || subReply.id} 
          reply={subReply} 
          reviewId={reviewId} 
          onLike={onLike} 
          onReplySubmit={onReplySubmit} 
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { isGuest, user } = useContext(AuthContext);

  const [artForms, setArtForms] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUnderrepresentedOnly, setShowUnderrepresentedOnly] = useState(false);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCreateShowModalOpen, setIsCreateShowModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  // Patron / Donation Modal States
  const [isPatronModalOpen, setIsPatronModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('500');
  const [donationSuccess, setDonationSuccess] = useState(null);
  const [selectedPatronShow, setSelectedPatronShow] = useState(null);

  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  
  // Discussion Modal State & Sorting
  const [activeDiscussionShow, setActiveDiscussionShow] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchArtForms();
    fetchShowsList();
  }, []);

  useEffect(() => {
    if (activeDiscussionShow) {
      const showId = activeDiscussionShow._id || activeDiscussionShow.id;
      setLoadingComments(true);
      api.get(`/shows/${showId}/reviews`)
        .then((res) => {
          const data = res.data?.reviews || res.data?.data || res.data;
          setComments(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error('Failed to load discussion comments:', err);
          setComments([]);
        })
        .finally(() => setLoadingComments(false));
    } else {
      setComments([]);
      setNewCommentText('');
      setCommentPhoto(null);
      setImageUrlInput('');
      setIsUrlMode(false);
      setSortBy('newest');
    }
  }, [activeDiscussionShow]);

  const fetchArtForms = async () => {
    setLoading(true);
    try {
      const response = await getArtForms({});
      const data = response?.data?.artForms || response?.data?.data || response?.data || response;
      setArtForms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch art forms:', err);
      setArtForms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowsList = async () => {
    setLoadingShows(true);
    try {
      const response = await getShows();
      const data = response?.data?.shows || response?.data?.data || response?.data || response;
      setShows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch shows:', err);
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleBookTicket = async (show) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }

    const showId = show._id || show.id;
    setBookingLoadingId(showId);
    try {
      await api.post(`/shows/${showId}/book`, { ticketsCount: 1 });
      setPaymentSuccessData(show);
      fetchShowsList();
      setTimeout(() => setPaymentSuccessData(null), 3000);
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Failed to book ticket.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleOpenPatron = (show = null) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }
    setSelectedPatronShow(show);
    setIsPatronModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostComment = async (e) => {
    if (e) e.preventDefault();
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }

    const finalPhoto = commentPhoto || (imageUrlInput.trim() ? imageUrlInput.trim() : null);
    if (!newCommentText.trim() && !finalPhoto) return;

    const showId = activeDiscussionShow._id || activeDiscussionShow.id;
    setSubmittingComment(true);

    try {
      const res = await api.post(`/shows/${showId}/reviews`, {
        comment: newCommentText,
        imageUrl: finalPhoto || undefined
      });

      const savedReview = res.data?.review || res.data?.data || res.data;
      setComments((prev) => [savedReview, ...prev]);
      setNewCommentText('');
      setCommentPhoto(null);
      setImageUrlInput('');
    } catch (err) {
      console.error('Error posting discussion comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Saved backend sync for Liking reviews and nested replies
  const handleLikeReview = async (reviewId, replyId = null) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }
    try {
      const endpoint = replyId 
        ? `/shows/reviews/${reviewId}/replies/${replyId}/like`
        : `/shows/reviews/${reviewId}/like`;

      const res = await api.put(endpoint);
      const updatedReview = res.data?.review || res.data?.data || res.data;
      
      if (updatedReview) {
        setComments(prev => prev.map(c => ((c._id || c.id) === reviewId ? updatedReview : c)));
      }
    } catch (err) {
      console.error('Failed to sync like with backend:', err);
      alert(err.response?.data?.message || 'Failed to save like to server.');
    }
  };

  // Saved backend sync for Posting Replies
  const handlePostReply = async (reviewId, parentReplyId = null, replyText, replyPhoto) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }
    if (!replyText?.trim() && !replyPhoto) return;

    try {
      const res = await api.post(`/shows/reviews/${reviewId}/replies`, {
        comment: replyText,
        imageUrl: replyPhoto || '',
        parentReplyId: parentReplyId || null
      });

      const updatedReview = res.data?.review || res.data?.data || res.data;
      if (updatedReview) {
        setComments(prev => prev.map(c => ((c._id || c.id) === reviewId ? updatedReview : c)));
      }
    } catch (err) {
      console.error('Failed to post reply to server:', err);
      alert(err.response?.data?.message || 'Failed to save reply.');
    }
  };

  const handleDonationSubmit = (e) => {
    e.preventDefault();
    if (!donationAmount || Number(donationAmount) <= 0) return;
    setDonationSuccess(donationAmount);
  };

  const safeArtForms = Array.isArray(artForms) ? artForms : [];
  const safeShows = Array.isArray(shows) ? shows : [];

  const activeStateFilter = (selectedState && !['india', 'all', 'national', 'null', 'undefined'].includes(String(selectedState).toLowerCase().trim())) 
    ? String(selectedState).toLowerCase().trim() 
    : null;

  const filteredArtForms = safeArtForms.filter((item) => {
    if (!item) return false;
    
    const searchTerm = (search || '').toLowerCase().trim();
    
    const searchableText = [
      item.name, 
      item.artFormName, 
      item.title, 
      item.state, 
      item.region, 
      item.location, 
      item.description, 
      item.about, 
      item.category,
      item.artFormCategory,
      item.type
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const catTarget = selectedCategory.toLowerCase();
      const itemCat = [
        item.category,
        item.artFormCategory,
        item.type,
        item.name,
        item.artFormName,
        item.title
      ].filter(Boolean).join(' ').toLowerCase();
      
      matchesCategory = itemCat.includes(catTarget);
    }

    const isLesserKnown = Boolean(item.isUnderrepresented || item.underrepresented || item.isLesserKnown || item.type === 'Lesser-Known');
    const matchesUnderrepresented = !showUnderrepresentedOnly || isLesserKnown;

    let matchesState = true;
    if (activeStateFilter) {
      const itemState = [item.state, item.region, item.location].filter(Boolean).join(' ').toLowerCase();
      matchesState = itemState.includes(activeStateFilter) || activeStateFilter.includes(itemState);
    }

    return matchesSearch && matchesCategory && matchesUnderrepresented && matchesState;
  });

  const filteredShows = safeShows.filter((show) => {
    if (!show) return false;
    const searchTerm = (search || '').toLowerCase().trim();
    
    const searchableText = [
      show.title,
      show.artFormName,
      show.description,
      show.venue,
      show.location,
      show.category,
      show.artFormCategory
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const catTarget = selectedCategory.toLowerCase();
      matchesCategory = searchableText.includes(catTarget);
    }

    let matchesState = true;
    if (activeStateFilter) {
      matchesState = searchableText.includes(activeStateFilter);
    }

    return matchesSearch && matchesCategory && matchesState;
  });

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || b.time || 0) - new Date(a.createdAt || a.time || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || a.time || 0) - new Date(b.createdAt || b.time || 0);
    }
    if (sortBy === 'popular') {
      const likesA = (a.likes?.length || 0) + (a.replies?.length || 0);
      const likesB = (b.likes?.length || 0) + (b.replies?.length || 0);
      return likesB - likesA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16 relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Explore Cultural Arts</h1>
            <p className="text-xs text-gray-500 mt-1">
              Discover traditional Indian performance arts and regional crafts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenPatron(null)}
              className="flex items-center gap-2 bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-800 transition shadow-sm"
            >
              <Heart className="w-4 h-4 fill-white" /> Become a Patron
            </button>

            <button
              onClick={() => isGuest ? setIsGateOpen(true) : setIsCreateShowModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-800 transition shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Post Upcoming Show
            </button>

            <button
              onClick={() => isGuest ? setIsGateOpen(true) : setIsRequestModalOpen(true)}
              className="flex items-center gap-2 bg-[#E65100] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D84315] transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Propose Missing Art Form
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <SearchBar value={search} onChange={(val) => setSearch(typeof val === 'string' ? val : val?.target?.value || '')} />

          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <Filter className="w-4 h-4 text-amber-800 flex-shrink-0" />
              {['All', 'Dance', 'Music', 'Theatre', 'Craft'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-900 text-white'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {activeStateFilter && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 hover:bg-amber-200 transition"
                >
                  <span className="capitalize">State: {selectedState}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnderrepresentedOnly}
                  onChange={(e) => setShowUnderrepresentedOnly(e.target.checked)}
                  className="rounded accent-[#E65100]"
                />
                Show Lesser-Known Forms Only
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <IndiaMap onSelectState={setSelectedState} selectedState={selectedState} />
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-16 text-amber-800 font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading Art Forms...
              </div>
            ) : filteredArtForms.length === 0 ? (
              <div className="bg-amber-50/50 p-8 rounded-2xl text-center border border-amber-100 space-y-3">
                <p className="text-gray-600 font-semibold">No art forms match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedState(null);
                    setSelectedCategory('All');
                    setShowUnderrepresentedOnly(false);
                  }}
                  className="inline-block px-4 py-2 bg-[#E65100] text-white text-xs font-bold rounded-xl hover:bg-[#D84315] transition shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArtForms.map((artForm, index) => (
                  <ArtFormCard key={artForm._id || artForm.id || index} artForm={artForm} />
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" /> Upcoming Live Shows
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {filteredShows.length} {filteredShows.length === 1 ? 'Show' : 'Shows'} Scheduled
            </span>
          </div>

          {loadingShows ? (
            <div className="text-center py-6 text-xs text-amber-800 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading upcoming shows...
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="p-6 bg-amber-50/40 rounded-xl text-center border border-amber-100 text-xs text-gray-600">
              No live shows match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShows.map((show, idx) => {
                if (!show) return null;
                const showImage = extractImageUrl(show.imageUrl) || extractImageUrl(show.image) || extractImageUrl(show.bannerUrl) || extractImageUrl(show.banner);
                const availableTickets = extractTickets(show);
                const isSoldOut = availableTickets <= 0;
                const showId = show._id || show.id || `show-${idx}`;

                return (
                  <div
                    key={showId}
                    className="p-4 bg-[#FFFDF9] rounded-xl border border-amber-200/70 shadow-sm flex flex-col justify-between transition hover:shadow-md"
                  >
                    <div>
                      {showImage ? (
                        <img 
                          src={showImage} 
                          alt={show.title || 'Show Image'} 
                          className="w-full h-36 object-cover rounded-lg mb-3 border border-amber-100"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-36 bg-amber-50 rounded-lg mb-3 border border-amber-100 flex items-center justify-center text-amber-800 text-xs font-medium">
                          No Image Available
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[10px] uppercase tracking-wider">
                          {show.artFormName || show.category || 'Performance'}
                        </span>
                        <span className="font-extrabold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {show.ticketPrice || show.price ? `₹${show.ticketPrice || show.price}` : 'Free'}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{show.title || 'Untitled Show'}</h3>
                      {show.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{show.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-100 space-y-3">
                      <div className="text-[11px] text-gray-500 flex justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-800" />
                            <span className="truncate max-w-[120px]">{show.venue || show.location || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-800" />
                            <span>
                              {show.date ? new Date(show.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-amber-800" />
                            <span>{availableTickets} left</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPatron(show)}
                          className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition border border-rose-200 flex items-center justify-center shrink-0"
                          title="Become a Patron / Support Artist"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>

                        <button
                          onClick={() => setActiveDiscussionShow(show)}
                          className="flex-1 px-2.5 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold rounded-xl text-xs transition border border-amber-200 flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Discuss
                        </button>

                        <button
                          onClick={() => handleBookTicket(show)}
                          disabled={isSoldOut || bookingLoadingId === showId}
                          className="flex-1 px-2.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition shadow-sm"
                        >
                          {isSoldOut ? 'Sold Out' : bookingLoadingId === showId ? 'Wait...' : 'Book Ticket'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Payment Confirmation Modal */}
      {paymentSuccessData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Successful!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your ticket for <span className="font-bold text-gray-900">{paymentSuccessData.title}</span> has been confirmed.
            </p>
            <button 
              onClick={() => setPaymentSuccessData(null)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Patron / Donation Modal */}
      {isPatronModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-amber-100 overflow-hidden">
            <button 
              onClick={() => { setIsPatronModalOpen(false); setDonationSuccess(null); setSelectedPatronShow(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 rounded-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {donationSuccess ? (
              <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Thank You, Patron!</h2>
                <p className="text-sm text-gray-600">
                  Your generous donation of <span className="font-bold text-emerald-700">₹{donationSuccess}</span> {selectedPatronShow ? `for "${selectedPatronShow.title}"` : ''} has been received. You are directly supporting traditional Indian performers!
                </p>
                <button
                  onClick={() => { setIsPatronModalOpen(false); setDonationSuccess(null); setSelectedPatronShow(null); }}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonationSubmit} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-100 rounded-2xl">
                    <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Support Cultural Artisans</h2>
                    <p className="text-xs text-gray-500">
                      {selectedPatronShow ? `Support performative arts for "${selectedPatronShow.title}"` : 'Contribute to the revival of regional Indian art forms.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Select Donation Amount (₹)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['200', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          donationAmount === amt 
                            ? 'bg-rose-700 text-white border-rose-700' 
                            : 'bg-amber-50/50 text-amber-950 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Or Custom Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount in ₹"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" /> Complete Donation
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Discussion Modal */}
      {activeDiscussionShow && (
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
                  onClick={() => setActiveDiscussionShow(null)} 
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
                  const currentUserId = user?._id || user?.id;
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

                      {/* Action Bar: Likes & Reply Toggle */}
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
      )}

      {/* Action Modals */}
      <RequestArtFormModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={fetchArtForms}
      />
      <CreateShowModal
        isOpen={isCreateShowModalOpen}
        onClose={() => setIsCreateShowModalOpen(false)}
        onSuccess={fetchShowsList}
      />
      <GuestGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        actionName="book, donate, or post a show"
      />
    </div>
  );
}