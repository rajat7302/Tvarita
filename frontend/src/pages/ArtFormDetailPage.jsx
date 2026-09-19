import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ArtistCard from '../components/cards/ArtistCard';
import ShowCard from '../components/cards/ShowCard';
import StoryCard from '../components/cards/StoryCard';
import ExperienceCard from '../components/cards/ExperienceCard';
import PostStoryModal from '../components/forms/PostStoryModal';
import BookingModal from '../components/forms/BookingModal';
import ReviewModal from '../components/forms/ReviewModal';
import GuestGateModal from '../components/common/GuestGateModal';
import CommunityDiscussionModal from '../components/common/CommunityDiscussionModal';
import { 
  getArtFormById, 
  getShowsByArtForm, 
  getPostsByArtForm, 
  getExperiencesByArtForm 
} from '../services/artFormService';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, BookOpen, Plus, HeartHandshake } from 'lucide-react';

export default function ArtFormDetailPage() {
  const { id } = useParams();
  const { isGuest } = useContext(AuthContext);

  const [artForm, setArtForm] = useState(null);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [gateAction, setGateAction] = useState('');
  const [discussionTarget, setDiscussionTarget] = useState(null);

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    setLoading(true);
    try {
      const artData = await getArtFormById(id);
      setArtForm(artData);

      const [showsData, postsData, expData] = await Promise.all([
        getShowsByArtForm(id),
        getPostsByArtForm(id),
        getExperiencesByArtForm(id)
      ]);

      setShows(showsData);
      setPosts(postsData);
      setExperiences(expData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProtectedAction = (actionName, callback) => {
    if (isGuest) {
      setGateAction(actionName);
      setIsGateOpen(true);
    } else {
      callback();
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center font-semibold">Loading Page...</div>;
  if (!artForm) return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center font-semibold">Art Form Not Found</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16">
      <Navbar />

      {/* Banner */}
      <div className="relative h-80 bg-amber-900 text-white overflow-hidden">
        <img 
          src={artForm.images?.[0] || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80'} 
          alt={artForm.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <span className="bg-[#E65100] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {artForm.category}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-2 mb-2">{artForm.name}</h1>
            <div className="flex items-center gap-4 text-sm font-medium text-amber-200">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-amber-400" /> {artForm.state} ({artForm.region})</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Section */}
        <div className="lg:col-span-2 space-y-10">
          {/* Overview */}
          <section className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">About the Art Form</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{artForm.description}</p>
            {artForm.historicalContext && (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">Historical Context</h4>
                <p className="text-xs text-gray-700">{artForm.historicalContext}</p>
              </div>
            )}
          </section>

          {/* Upcoming Shows */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E65100]" /> Upcoming Performances & Workshops
              </h2>
            </div>

            {shows.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center border border-amber-100 text-xs text-gray-500">
                No active showcases listed for this art form currently.
              </div>
            ) : (
              <div className="space-y-3">
                {shows.map(show => (
                  <ShowCard 
                    key={show._id} 
                    show={show} 
                    onBook={(s) => handleProtectedAction('book ticket passes', () => { setSelectedShow(s); setIsBookingModalOpen(true); })} 
                  />
                ))}
              </div>
            )}
          </section>

          {/* Community Stories */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E65100]" /> Cultural Stories & Research
              </h2>
              <button
                onClick={() => handleProtectedAction('post a story', () => setIsStoryModalOpen(true))}
                className="flex items-center gap-1.5 text-xs font-bold text-[#E65100] hover:underline"
              >
                <Plus className="w-4 h-4" /> Share Story
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center border border-amber-100 text-xs text-gray-500">
                No research stories posted yet. Be the first to document details!
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <StoryCard key={post._id} post={post} onDiscuss={(item) => handleProtectedAction('join the discussion', () => setDiscussionTarget({ type: 'post', item }))} />
                ))}
              </div>
            )}
          </section>

          {/* Attendee Experiences */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#E65100]" /> Attendee Experience Reflections
              </h2>
              <button
                onClick={() => handleProtectedAction('submit an experience reflection', () => setIsReviewModalOpen(true))}
                className="flex items-center gap-1.5 text-xs font-bold text-[#E65100] hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Reflection
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center border border-amber-100 text-xs text-gray-500">
                No attendee reflections submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.map(exp => (
                  <ExperienceCard key={exp._id} experience={exp} onDiscuss={(item) => handleProtectedAction('join the discussion', () => setDiscussionTarget({ type: 'experience', item }))} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar - Artists */}
        <div className="space-y-6">
          <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Notable Practitioners</h3>
            {artForm.artists && artForm.artists.length > 0 ? (
              <div className="space-y-3">
                {artForm.artists.map(artist => (
                  <ArtistCard key={artist._id} artist={artist} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Practitioner profiles updating soon.</p>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <PostStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} artFormId={id} onPostAdded={fetchDetailData} />
      <BookingModal show={selectedShow} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} artFormId={id} onReviewAdded={fetchDetailData} />
      <GuestGateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} actionName={gateAction} />
      <CommunityDiscussionModal
        isOpen={Boolean(discussionTarget)}
        onClose={() => setDiscussionTarget(null)}
        targetType={discussionTarget?.type}
        targetId={discussionTarget?.item?._id}
        title={discussionTarget?.item?.title || 'Attendee reflection'}
        isGuest={isGuest}
        onGuest={() => {
          setDiscussionTarget(null);
          setGateAction('join the discussion');
          setIsGateOpen(true);
        }}
      />
    </div>
  );
}