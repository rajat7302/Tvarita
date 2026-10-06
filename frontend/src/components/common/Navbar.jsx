import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Compass, Edit3, LogOut, LogIn, Ticket, Users } from 'lucide-react';
import EditProfileModal from '../forms/EditProfileModal';
import ImageLightbox from './ImageLightbox';

export default function Navbar() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-amber-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <Link to="/explore" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#E65100] text-white rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
              T
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-bold tracking-tight text-gray-900 truncate block">Tvarita</span>
              <span className="hidden sm:block text-[10px] text-amber-800 tracking-wider font-semibold uppercase -mt-1 truncate">
                Arts Collective
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            <Link
              to="/explore"
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-[#E65100] bg-amber-50 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-200 transition flex-shrink-0 whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> Explore
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                <Link
                  to={`/profile/${user._id || user.id}`}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 max-w-[10rem]"
                >
                  {user.profilePhotoUrl && (
                    <ImageLightbox
                      src={user.profilePhotoUrl}
                      alt={`${user.name} profile photo`}
                      showExpandIcon={false}
                      className="h-6 w-6 shrink-0 rounded-full overflow-hidden"
                      imageClassName="h-full w-full rounded-full object-cover"
                    />
                  )}
                  <span className="truncate">{user.name}</span>
                </Link>

                <Link to="/tickets" className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 sm:px-3" title="My Tickets">
                  <Ticket className="h-3.5 w-3.5" /> Tickets
                </Link>
                <Link to="/friends" className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 sm:px-3" title="Friends and Chat">
                  <Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">Friends</span>
                </Link>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold bg-amber-100 text-[#E65100] hover:bg-amber-200 rounded-lg transition flex-shrink-0 whitespace-nowrap"
                >
                  <Edit3 className="w-3.5 h-3.5 flex-shrink-0" /> <span className="sm:hidden">Edit</span><span className="hidden sm:inline">Edit Profile</span>
                </button>

                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 transition flex-shrink-0"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-semibold bg-[#E65100] text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-[#D84315] transition shadow-sm flex-shrink-0"
              >
                <LogIn className="w-4 h-4 flex-shrink-0" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUpdateSuccess={(updatedUser) => {
            updateUser(updatedUser);
          }}
        />
      )}
    </>
  );
}