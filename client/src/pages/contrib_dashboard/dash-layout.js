import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import SideNav from "./components/SideNav";
import StickyTitle from "./components/StickyTitle";

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 opacity-75 z-50">
      <div className="w-[50%] bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
        <div className="bg-gray-600 w-[45%] h-2.5 rounded-full dark:bg-gray-300 animate-move"></div>
      </div>
    </div>
  );
};

const DashLayout = () => {
  const { currentUser, loading, userRole } = useAuth();
  const [fancyloader, setfancyloader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setfancyloader(false);
    }, 2000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {currentUser && userRole === "contributor" ? (
        <>
          <div>
            <div className="fixed left-0 right-0 top-0 bottom-0 flex">
              <div className=" z-[1000]">
                <SideNav />
              </div>
              <div className="w-full overflow-x-auto">
                <div className="min-w-full p-10 mt-10 bg-[#f5f7f9] z-[800]">
                  <div className="z-[900]">
                    {" "}
                    {/* Ensures the sticky title stays on top */}
                    <StickyTitle />
                  </div>
                  {fancyloader ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="70vh"
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Outlet />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
};

export default DashLayout;
