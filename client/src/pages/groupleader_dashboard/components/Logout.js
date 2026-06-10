import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useAuth } from "../../AuthContext";

const Logout = (props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loader, setloader] = useState(false);

  const signingOut = async (event) => {
    setloader(true);
    event.preventDefault();
    event.stopPropagation();

    setTimeout(() => logout(), 500);

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <>
      <button
        className={`${
          props.isOpen ? "px-4" : "px-2 "
        } flex items-center justify-start gap-2 text-base hover:bg-[rgba(112,127,221,0.1)] hover:text-[#23436d] text-black font-semibold w-full text-center py-2 rounded-lg`}
        onClick={(event) => signingOut(event)}
      >
        <BiLogOut size={20} />
        <span className={`${props.isOpen ? "block" : "hidden"}`}>Log Out</span>
      </button>
      {loader && (
        <>
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 opacity-75 z-50">
            <div className="w-[50%] bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
              <div className="bg-gray-600 w-[45%] h-2.5 rounded-full dark:bg-gray-300 animate-move"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Logout;
