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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E65100] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Tvarita</span>
              <span className="block text-[10px] text-amber-800 tracking-wider font-semibold uppercase -mt-1">
                Arts Collective
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/explore" 
              className="flex items-center gap-1.5 text-sm font-semibold text-[#E65100] bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 transition"
            >
              <Compass className="w-4 h-4" /> Explore
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {user.name}
                </span>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-100 text-[#E65100] hover:bg-amber-200 rounded-lg transition"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>

                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-gray-500 hover:text-red-600 transition"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-semibold bg-[#E65100] text-white px-4 py-2 rounded-xl hover:bg-[#D84315] transition shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Sign In
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