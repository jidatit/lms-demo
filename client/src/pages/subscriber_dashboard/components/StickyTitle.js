import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

function StickyTitle() {
  const { currentUser, logout, userRoles, selectUserRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signingOut = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setTimeout(() => logout(), 500);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleRoleSwitch = (role) => {
    console.log('role', role);
    selectUserRole(role); // Update the current role in AuthContext
    navigate(`/${role}_dashboard`); // Navigate to the selected role's dashboard
  };

  return (
    <>
      <div className="flex-grow fixed top-0 right-0 left-0 z-[900] text-gray-800 no">
        <header className="flex items-center h-20 px-6 sm:px-10 bg-white no">
          <div className="flex flex-shrink-0 items-center ml-auto">
            <div className="flex items-center justify-center">
              <button>
                {userRoles && userRoles.length > 1 && (
                  <div className="flex space-x-2 mt-1">
                    {userRoles
                      .filter((roleObj) => roleObj.role !== currentUser.role)
                      .map((roleObj, index) => (
                        <button
                          key={index}
                          onClick={() => handleRoleSwitch(roleObj.role)}
                          className="bg-[#299aa1] px-5 text-md text-white my-4 py-2 rounded-full flex items-start "
                        >
                          Switch to {roleObj.role} dashboard
                        </button>
                      ))}
                  </div>
                )}
              </button>
            </div>
            <button className="inline-flex items-center p-2 hover:bg-gray-100 focus:bg-gray-100 rounded-lg">
              <span className="sr-only">User Menu</span>

              <div className="hidden md:flex md:flex-col md:items-end md:leading-tight">
                {currentUser ? (
                  <>{currentUser.email && <span className="text-lg font-semibold text-gray-600">Hi {currentUser?.lastName}!</span>}</>
                ) : (
                  <div className="bg-white flex flex-col justify-center items-center rounded-lg w-[150px] shadow-md pt-1 pb-1 animate-pulse">
                    <div className="w-[100%] h-4 bg-gray-300 rounded"></div>
                  </div>
                )}
              </div>
            </button>

            <div className="border-l pl-3 ml-3 space-x-1 no">
              <button
                onClick={(event) => signingOut(event)}
                className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100 focus:text-gray-600 rounded-full"
              >
                <span className="sr-only">Log out</span>
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}

export default StickyTitle;
