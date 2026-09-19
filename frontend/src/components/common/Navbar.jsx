import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Compass, Edit3, LogOut, LogIn } from 'lucide-react';
import EditProfileModal from '../forms/EditProfileModal';

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
              className="flex items-center gap-1.5 text-sm font-semibold text-[#E65100] bg-amber-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-200 transition flex-shrink-0"
              title="Explore"
            >
              <Compass className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Explore</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                <span className="hidden md:inline text-sm font-medium text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 max-w-[8rem] truncate">
                  {user.name}
                </span>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold bg-amber-100 text-[#E65100] hover:bg-amber-200 rounded-lg transition flex-shrink-0"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5 flex-shrink-0" /> <span className="hidden sm:inline">Edit Profile</span>
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