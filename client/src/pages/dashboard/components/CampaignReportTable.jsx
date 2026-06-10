import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import CloseIcon from "@mui/icons-material/Close";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  GoPhishAccountAPIKey,
  GoPhishLocalURL,
  GoPhishPublicURL,
} from "../../utils/constants";
import axiosInstance from "../../utils/axiosConfig";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { useAuth } from "../../AuthContext";
import CampaignAnalyticsDialog from "./CampaignAnalyticsDialog";
import { CiSearch } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import { Tooltip } from "@mui/material";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "auto",
  maxHeight: "80vh",
};

const styleLaunchCampaign = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 2,
  overflow: "auto",
  maxHeight: "80vh",
};

const CampaignReportTable = ({ SelectedGroupName }) => {
  const { currentUser } = useAuth();

  const [campaignData, setCampaignData] = useState([]);
  const [campaignDataById, setCampaignDataById] = useState([]);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(5);
  const [campaignId, setCampaignId] = useState();
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [openLaunchCampaign, setOpenLaunchCampaign] = useState(false);
  const [GroupLeadersData, setGroupLeadersData] = useState([]);
  const [openAnalytics, setopenAnalytics] = useState(false);
  const [CampaignAnalyticsStats, setCampaignAnalyticsStats] = useState(null);
  const [AllGroups, setAllGroups] = useState([]);
  // const [SelectedGroupName, setSelectedGroupName] = useState("");
  // const [isGroupOpen, setIsGroupOpen] = useState(false);
  // const [searchGroupTerm, setSearchGroupTerm] = useState("");

  // const fetchAllGroups = async () => {
  //   try {
  //     const resp = await axiosInstance.get(`/groups/all`);
  //     setAllGroups(resp.data.groups);
  //   } catch (error) {
  //     console.log("Error fetching all groups!");
  //   }
  // };

  // useEffect(() => {
  //   fetchAllGroups();
  // }, [currentUser]);

  const handleOpenAnalytics = (stats) => {
    setopenAnalytics(true);
    setCampaignAnalyticsStats(stats);
  };

  const handleCloseAnalytics = () => {
    setopenAnalytics(false);
    setCampaignAnalyticsStats(null);
  };

  const handleRowPerPageChange = (event) => {
    setRowPerPage(event.target.value);
  };

  const handleOpenViewDetails = (id) => () => {
    setOpenViewDetails(true);
    console.log("ID : ", id);
    getCampaignById(id);
  };

  const handleCloseViewDetails = () => {
    setOpenViewDetails(false);
  };

  const handleOpenLaunchCampaign = (id) => () => {
    setOpenLaunchCampaign(true);
    console.log("ID : ", id);
    setCampaignId(id);
  };

  const handleLaunchLaunchCampaign = () => {
    const apiKey = GoPhishAccountAPIKey;
    fetch(`${GoPhishLocalURL}/api/campaigns/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(formDataLaunchCampaign),
    })
      .then((response) => response.json())
      .then((data) => {
        handleCloseLaunchCampaign();
      })
      .catch((error) => {
        console.error("Error creating campaign:", error);
      });
  };

  const handleCloseLaunchCampaign = () => {
    setFormDataLaunchCampaign({
      name: "",
      template: { name: "" },
      url: "",
      page: { name: "" },
      smtp: { name: "" },
      launch_date: null,
      send_by_date: null,
      groups: [],
    });
    setOpenLaunchCampaign(false);
  };

  useEffect(() => {
    setRowsToShow(campaignData.slice(0, rowPerPage));
  }, [campaignData, rowPerPage]);

  const totalPage = useMemo(
    () => Math.ceil(campaignData.length / rowPerPage),
    [campaignData.length, rowPerPage]
  );

  const generatePaginationLinks = () => {
    const paginationLinks = [];
    const ellipsis = "...";

    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) {
        paginationLinks.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          paginationLinks.push(i);
        }
        paginationLinks.push(ellipsis);
        paginationLinks.push(totalPage);
      } else if (currentPage >= totalPage - 3) {
        paginationLinks.push(1);
        paginationLinks.push(ellipsis);
        for (let i = totalPage - 4; i <= totalPage; i++) {
          paginationLinks.push(i);
        }
      } else {
        paginationLinks.push(1);
        paginationLinks.push(ellipsis);

        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          paginationLinks.push(i);
        }

        paginationLinks.push(ellipsis);
        paginationLinks.push(totalPage);
      }
    }
    return paginationLinks;
  };

  const getCampaignDataSummary = async (groupName) => {
    try {
      const response = await fetch(
        `${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // // Filter campaigns to include only those matching the group name and containing any email
      // const userCampaigns = data.campaigns.map((campaign) => {
      //   // Regex patterns to match email and groups in the campaign name
      //   const emailPattern = /, email: [^,]+/;
      //   const groupsPattern = /, groups: .*/;

      //   // Clean campaign name by removing both the email and groups part
      //   const cleanedName = campaign.name
      //     .replace(emailPattern, "") // Remove the email part
      //     .replace(groupsPattern, "") // Remove the groups part
      //     .trim();

      //   // Return a new object with the cleaned name, preserving other properties
      //   return {
      //     ...campaign,
      //     name: cleanedName,
      //   };
      // });

      let filteredCampaigns = data.campaigns;
      if (groupName) {
        const groupsPattern = new RegExp(`groups: ${groupName}`);
        filteredCampaigns = data.campaigns.filter((campaign) =>
          groupsPattern.test(campaign.name)
        );
      }

      filteredCampaigns.forEach((campaign) => {
        // Remove email and groups from the campaign name
        const emailPattern = /, email: [^,]+/;
        const groupsPattern = /, groups: .*/;

        campaign.name = campaign.name
          .replace(emailPattern, "")
          .replace(groupsPattern, "")
          .trim();
      });

      // Update the state with the cleaned campaigns
      setCampaignData(filteredCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data summary:", error);
    }
  };

  const getCampaignById = async (id) => {
    const apiKey = GoPhishAccountAPIKey;
    try {
      const response = await axios.get(
        `${GoPhishPublicURL}/api/campaigns/${id}/?api_key=${apiKey}`
      );

      const campaign = response.data;

      // Regex pattern to remove the user's email
      const emailPattern = /, email: [^,]+/;

      // Regex pattern to match the 'groups' part in the campaign name
      const groupsPattern = /, groups: .*/;

      // Remove the email and groups parts from the campaign name for display
      campaign.name = campaign.name
        .replace(emailPattern, "") // Remove any email portion
        .replace(groupsPattern, "") // Remove the groups portion
        .trim();

      setCampaignDataById(campaign);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    getCampaignDataSummary();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Emails Send" || status === "Completed") {
      return { color: "green" };
    } else if (status === "Queued") {
      return { color: "gold" };
    } else if (status === "In progress") {
      return { color: "blue" };
    } else {
      return { color: "black" };
    }
  };

  const nextPage = () => {
    const startIndex = rowPerPage * (currentPage + 1);
    const endIndex = startIndex + rowPerPage;
    const newArray = campaignData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };

  const changePage = (value) => {
    const startIndex = value * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = campaignData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };

  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = campaignData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };

  const [formDataLaunchCampaign, setFormDataLaunchCampaign] = useState({
    name: "",
    template: { name: "" },
    url: "",
    page: { name: "" },
    smtp: { name: "" },
    launch_date: null,
    send_by_date: null,
    groups: [],
  });

  const handleInputChangeLaunchCampaign = (e) => {
    const { name, value } = e.target;
    setFormDataLaunchCampaign({
      ...formDataLaunchCampaign,
      [name]: value,
    });
  };

  const handleDateChangeLaunchCampaign = (date) => {
    setFormDataLaunchCampaign({
      ...formDataLaunchCampaign,
      launch_date: date,
    });
  };

  // const filteredGroups = AllGroups.filter((group) =>
  //   group.name.toLowerCase().includes(searchGroupTerm.toLowerCase())
  // );

  // const handleGroupChange = (group) => {
  //   setSelectedGroupName(group.name);

  //   setIsGroupOpen(false);
  //   getCampaignDataSummary(group.name);
  // };

  // const handleGroupClear = () => {
  //   setSelectedGroupName(null);
  //   getCampaignDataSummary();
  // };
  useEffect(() => {
    getCampaignDataSummary(SelectedGroupName);
  }, [SelectedGroupName]);
  return (
    <>
      {/* <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full h-16 flex flex-row justify-end items-center rounded-t-lg text-white font-semibold text-base gap-4 pt-3 pl-10 pr-10 bg-[#e1ecf0]"></div>
      </div> */}
      {/* <div className={`fixed my-4 top-[27.3rem] left-[19rem]`}>
        <div className="relative">
          <div className="flex items-center">
            <button
              className="bg-white border border-gray-300 rounded-full px-3 py-2 text-left font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsGroupOpen(!isGroupOpen)}
            >
              {SelectedGroupName || "Select Group"}
              <FaChevronDown className="inline-block ml-2 h-4 w-4 text-gray-400" />
            </button>
            {SelectedGroupName && (
              <button
                className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={handleGroupClear}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          {isGroupOpen && (
            <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search groups..."
                    value={searchGroupTerm}
                    onChange={(e) => setSearchGroupTerm(e.target.value)}
                  />
                </div>
              </div>
              <ul className="max-h-48 overflow-auto">
                {filteredGroups.map((group) => (
                  <li
                    key={group.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleGroupChange(group);
                      setIsGroupOpen(false);
                    }}
                  >
                    {group.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div> */}

      <div className="h-full bg-white flex items-center justify-center py-4  pt-0! rounded-lg shadow-lg mt-[1rem]">
        <div className="w-full px-2">
          <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2 ">
            <table className="table-auto overflow-scroll md:overflow-auto w-full text-left font-inter border ">
              <thead className="rounded-lg text-base text-white font-semibold w-full border-t-2 border-gray-300 pt-6 pb-6">
                <tr>
                  <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                    Name
                  </th>
                  <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                    Created Date
                  </th>
                  <th className="py-3 px-5 sm:text-base text-center font-bold whitespace-nowrap">
                    <Tooltip title="Mail Sent" placement="top">
                      <MailOutlineIcon sx={{ color: "green" }} />
                    </Tooltip>
                  </th>
                  <th className="py-3 px-5 sm:text-base text-center font-bold whitespace-nowrap">
                    <Tooltip title="Email Opened" placement="top">
                      <DraftsOutlinedIcon sx={{ color: "yellow" }} />
                    </Tooltip>
                  </th>
                  <th className="py-3 px-5 sm:text-base text-center font-bold whitespace-nowrap">
                    <Tooltip title="Clicked Ads" placement="top">
                      <AdsClickIcon sx={{ color: "orange" }} />
                    </Tooltip>
                  </th>
                  <th className="py-3 px-5 sm:text-base text-center font-bold whitespace-nowrap">
                    <Tooltip title="Errors" placement="top">
                      <GppMaybeIcon sx={{ color: "#8B0020" }} />
                    </Tooltip>
                  </th>

                  <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                    Report
                  </th>
                </tr>
              </thead>

              <tbody>
                {rowsToShow &&
                  rowsToShow?.map((data, index) => (
                    <tr
                      className={`${
                        index % 2 == 0 ? "bg-white" : "bg-[#222E3A]/[6%]"
                      }`}
                      style={{
                        borderRadius: "0px !important",
                      }}
                      key={index}
                    >
                      <td
                        className={`py-2 px-3 font-normal text-base ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.name ? <div> - </div> : <div>{data.name}</div>}
                      </td>
                      <td
                        className={`py-2 px-3 font-normal text-base ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.created_date ? (
                          <div> - </div>
                        ) : (
                          <div>{data.created_date}</div>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 font-normal text-center text-base ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.stats.sent ? (
                          <div> - </div>
                        ) : (
                          <div>{data.stats.sent}</div>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 text-base text-center font-normal ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.stats.opened ? (
                          <div> - </div>
                        ) : (
                          <div>{data.stats.opened}</div>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 text-base text-center font-normal ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.stats.clicked ? (
                          <div> - </div>
                        ) : (
                          <div>{data.stats.clicked}</div>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 text-base text-center font-normal ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {!data?.stats.error ? (
                          <div> - </div>
                        ) : (
                          <div>{data.stats.error}</div>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 text-base font-semibold ${
                          index === 0
                            ? "border-t-2 border-gray-300"
                            : index === rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                        style={getStatusStyle(data?.status)}
                      >
                        {!data?.status ? "-" : data.status}
                      </td>
                      <td
                        className={`py-2 px-3 text-base  font-normal ${
                          index == 0
                            ? "border-t-2 border-gray-300"
                            : index == rowsToShow?.length
                            ? "border-y"
                            : "border-t"
                        } whitespace-nowrap`}
                      >
                        {/* <button
                          onClick={handleOpenViewDetails(data?.id)}
                          className="bg-[#23436d] rounded-3xl text-white py-1 px-4"
                        >
                          View Details
                        </button> */}
                        <button
                          onClick={() => handleOpenAnalytics(data?.stats)}
                          className="bg-[#23436d] rounded-3xl text-white  py-1 px-4"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="w-full flex justify-center sm:justify-between xl:flex-row flex-col gap-10 mt-12 lg:mt-8 px-0 lg:px-4 xl:px-4 items-center">
            <div className="text-base text-center">
              Showing
              <span className="font-bold bg-[#e1ecf0]  text-[#23436d] mx-2 p-2 text-center !rounded-lg inline-block min-w-[40px]">
                {currentPage === 0 ? 1 : currentPage * rowPerPage + 1}
              </span>
              to{" "}
              <span className="font-bold bg-[#e1ecf0]  text-[#23436d] mx-2 p-2 text-center !rounded-lg inline-block min-w-[40px]">
                {currentPage === totalPage - 1
                  ? campaignData?.length
                  : (currentPage + 1) * rowPerPage}
              </span>{" "}
              of{" "}
              <span className="font-bold bg-[#e1ecf0]  text-[#23436d] mx-2 p-2 text-center !rounded-lg inline-block min-w-[40px]">
                {campaignData?.length}
              </span>{" "}
              entries
            </div>

            <div className="flex flex-row justify-center items-center gap-4">
              <div> Rows Per Page </div>
              <Box sx={{ width: 200 }}>
                <FormControl fullWidth>
                  <Select
                    id="rows-per-page"
                    value={rowPerPage}
                    onChange={handleRowPerPageChange}
                    sx={{
                      height: 40,
                      backgroundColor: "#e1ecf0",
                      color: "#23436d",
                      borderRadius: "8px",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      ".MuiSelect-icon": {
                        color: "white",
                      },
                      "& .MuiSelect-select": {
                        borderRadius: "8px",
                      },
                      "& .MuiListItem-root": {
                        "&:hover": {
                          backgroundColor: "white",
                          color: "black",
                        },
                      },
                      "& .Mui-selected": {
                        backgroundColor: "white",
                        color: "black",
                      },
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>

            <div className="flex">
              <ul
                className="flex justify-center items-center gap-x-[10px] z-30"
                role="navigation"
                aria-label="Pagination"
              >
                <li
                  className={` prev-btn flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB] disabled] ${
                    currentPage == 0
                      ? "bg-[#cccccc] pointer-events-none"
                      : " cursor-pointer"
                  }`}
                  onClick={previousPage}
                >
                  <img src="https://www.tailwindtap.com/assets/travelagency-admin/leftarrow.svg" />
                </li>

                {generatePaginationLinks().map((item, index) => (
                  <li
                    key={index}
                    onClick={() => changePage(item - 1)}
                    className={`flex items-center justify-center w-[36px] rounded-[6px] h-[34px] border-solid border-[2px] cursor-pointer ${
                      currentPage === item - 1
                        ? "bg-[#e1ecf0] text-[#23436d]"
                        : "border-[#E4E4EB]"
                    }`}
                  >
                    <span aria-hidden="true">{item}</span>
                  </li>
                ))}

                <li
                  className={`flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB] ${
                    currentPage == totalPage - 1
                      ? "bg-[#cccccc] pointer-events-none"
                      : " cursor-pointer"
                  }`}
                  onClick={nextPage}
                >
                  <img src="https://www.tailwindtap.com/assets/travelagency-admin/rightarrow.svg" />
                </li>
              </ul>
            </div>
          </div>

          <Modal
            open={openViewDetails}
            onClose={handleCloseViewDetails}
            aria-describedby="modal-data"
          >
            <Box sx={style} noValidate>
              <div
                id="modal-data"
                className="w-full h-full flex flex-col justify-start items-center gap-3"
              >
                <div className="w-full h-full flex flex-col justify-center items-center gap-5">
                  <h2 className="text-xl font-bold">Details</h2>
                </div>
                <div className="w-full h-full flex flex-col justify-center items-center gap-5">
                  <div className="w-80 flex flex-col justify-start items-start gap-2">
                    <label className="text-sm font-semibold"> Full Name </label>
                    <TextField
                      sx={{ width: "100%" }}
                      id="recordID"
                      value={
                        !campaignDataById.name ? "---" : campaignDataById.name
                      }
                    />
                  </div>
                  <div className="w-80 flex flex-col justify-start items-start gap-2">
                    <label className="text-sm font-semibold">
                      {" "}
                      Email Template
                    </label>
                    <TextField
                      sx={{ width: "100%" }}
                      id="fullNameID"
                      value={"client@client.com"}
                    />
                  </div>
                  <div className="w-80 flex flex-col justify-start items-start gap-2">
                    <label className="text-sm font-semibold">
                      {" "}
                      Landing Page
                    </label>
                    <TextField
                      sx={{ width: "100%" }}
                      id="fullNameID"
                      value={"client@client.com"}
                    />
                  </div>
                  <div className="w-80 flex flex-col justify-start items-start gap-2">
                    <label className="text-sm font-semibold"> URL </label>
                    <TextField
                      sx={{ width: "100%" }}
                      id="fullNameID"
                      value={"client@client.com"}
                    />
                  </div>
                </div>
              </div>
            </Box>
          </Modal>

          <Modal
            open={openLaunchCampaign}
            onClose={handleCloseLaunchCampaign}
            aria-describedby="modal-data"
          >
            <Box sx={styleLaunchCampaign} noValidate>
              <div
                id="modal-data"
                className="w-full h-full flex flex-col justify-center items-center gap-4"
              >
                <div
                  onClick={handleCloseLaunchCampaign}
                  className="w-full flex justify-end items-end"
                >
                  <CloseIcon />
                </div>
                <h2 className="text-xl font-bold">Add Launch Date</h2>
                <div className="w-full flex flex-col justify-start items-start gap-2">
                  <TextField
                    name="name"
                    label="Campaign Name"
                    value={formDataLaunchCampaign.name}
                    onChange={handleInputChangeLaunchCampaign}
                    variant="outlined"
                  />
                  <TextField
                    name="template.name"
                    label="Template Name"
                    value={formDataLaunchCampaign.template.name}
                    onChange={handleInputChangeLaunchCampaign}
                    variant="outlined"
                  />
                  <TextField
                    name="url"
                    label="URL"
                    value={formDataLaunchCampaign.url}
                    onChange={handleInputChangeLaunchCampaign}
                    variant="outlined"
                  />
                  <TextField
                    name="page.name"
                    label="Landing Page Name"
                    value={formDataLaunchCampaign.page.name}
                    onChange={handleInputChangeLaunchCampaign}
                    variant="outlined"
                  />
                  <TextField
                    name="smtp.name"
                    label="Sending Profile Name"
                    value={formDataLaunchCampaign.smtp.name}
                    onChange={handleInputChangeLaunchCampaign}
                    variant="outlined"
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DateTimePicker"]}>
                      <DateTimePicker
                        label="Add Launch Date & Time"
                        value={formDataLaunchCampaign.launch_date}
                        onChange={handleDateChangeLaunchCampaign}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <button
                  className="w-full px-4 py-2 text-white text-lg bg-[#00A3AE] cursor-pointer rounded-xl"
                  onClick={handleLaunchLaunchCampaign}
                >
                  Launch
                </button>
              </div>
            </Box>
          </Modal>

          <CampaignAnalyticsDialog
            open={openAnalytics}
            handleClose={handleCloseAnalytics}
            stats={CampaignAnalyticsStats}
          />
        </div>
      </div>
    </>
  );
};

export default CampaignReportTable;
