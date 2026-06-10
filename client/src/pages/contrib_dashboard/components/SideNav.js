import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LOGO from '../../assets/logo.png';
import Logout from './Logout';
import { FaUsers, FaChartBar, FaShoppingCart, FaClipboardList, FaBullhorn } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { MdInsertChartOutlined, MdOutlineGroups, MdOutlineShoppingCart } from 'react-icons/md';
import { IoBagHandleOutline } from 'react-icons/io5';
import { LiaPaperPlaneSolid } from 'react-icons/lia';
import { IoMdFootball } from 'react-icons/io';
import { TbInvoice } from 'react-icons/tb';

const SideNav = () => {
  const menus = [
    {
      name: 'Dashboard',
      link: '/contrib_dashboard',
      icon: <MdInsertChartOutlined />
    },
    {
      name: 'Groups',
      link: '/contrib_dashboard/groups',
      icon: <MdOutlineGroups />
    },
    {
      name: 'Campaigne Hub',
      link: '/contrib_dashboard/campaigns',
      icon: <LiaPaperPlaneSolid />
    },
    {
      name: 'Store',
      link: '/contrib_dashboard/buy_new_license',
      icon: <IoBagHandleOutline />
    },
    {
      name: 'Cart',
      link: '/contrib_dashboard/mycart',
      icon: <MdOutlineShoppingCart />
    },
    {
      name: 'Invoice',
      link: '/contrib_dashboard/invoices',
      icon: <TbInvoice />
    },
    {
      name: 'Knowledgebase',
      link: '/contrib_dashboard/knwoledge',
      icon: <IoMdFootball />
    }
  ];

  const [open, setOpen] = useState(true);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    // <section className="flex">
    //   <div
    //     className={` bg-white min-h-screen shadow-md w-[260px] duration-500 text-black px-2 lg:px-4 py-1 sm:py-2 md:py-2 lg:py-4 xl:py-6 2xl:py-6`}
    //   >
    //     <div className="py-3 flex bg-white justify-center items-center">
    //       <img
    //         className="cursor-pointer"
    //         src={LOGO}
    //         alt=""
    //       />
    //     </div>

    //     <div className="mt-4 flex flex-col gap-4 relative">
    //       {menus?.map((menu, i) => (
    //         <Link
    //           to={menu?.link}
    //           key={i}
    //           className={`group flex items-center text-base gap-2 font-poppins py-2 pl-2 pr-4 ${location.pathname === menu?.link ? "bg-[rgba(112,127,221,0.1) text-[#ffffff] bg-[#23436d] rounded-md" : "text-black"} hover:bg-[rgba(112,127,221,0.1)] hover:text-black rounded-md`}
    //         >
    //           <h2
    //             style={{
    //               transitionDelay: `${i + 2}00ms`,
    //               fontWeight: "bold",
    //             }}
    //             className={`whitespace-pre duration-200`}
    //           >
    //             {menu?.name}
    //           </h2>
    //         </Link>
    //       ))}
    //       <Logout isOpen={open} />
    //     </div>
    //   </div>
    // </section>
    <motion.section initial={{ x: -260 }} animate={{ x: 0 }} transition={{ duration: 0.5 }} className="flex">
      <div
        className={`bg-white min-h-screen shadow-lg duration-300 text-black px-4 py-6 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-3 flex bg-white justify-center items-center cursor-pointer"
          onClick={toggleSidebar}
        >
          <img className={`transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-32'}`} src={LOGO} alt="Logo" />
        </motion.div>

        <nav className="mt-8 flex flex-col gap-2 flex-grow">
          {menus.map((menu, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Link
                to={menu.link}
                className={`group flex items-center text-base gap-3 font-poppins py-3 
                  ${isCollapsed ? 'px-2 justify-center' : 'px-4'} 
                  rounded-md transition-all duration-200
                  ${
                    location.pathname === menu.link
                      ? 'bg-[#23436d] text-white'
                      : 'text-black hover:bg-[rgba(112,127,221,0.1)] hover:text-[#23436d]'
                  }`}
                title={isCollapsed ? menu.name : ''}
              >
                <span className={`text-xl ${isCollapsed ? 'mx-auto' : ''}`}>{menu.icon}</span>
                {!isCollapsed && <span className="font-medium">{menu.name}</span>}
              </Link>
            </motion.div>
          ))}
        </nav>

        <Logout isOpen={!isCollapsed} />
      </div>
    </motion.section>
  );
};

export default SideNav;
