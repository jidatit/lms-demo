import React, { useState, useMemo, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { BsGraphUpArrow } from "react-icons/bs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../../utils/axiosConfig";
import { useAuth } from "../../AuthContext";
import { CircularProgress } from "@mui/material";
import { FaChevronDown, FaUsersLine } from "react-icons/fa6";
import { MdAutoGraph, MdLibraryBooks } from "react-icons/md";
import { CiSearch } from "react-icons/ci";

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

const ModuleReportTable = ({ SelectedGroupName }) => {
  const { currentUser } = useAuth();
  const email = currentUser.email;
  const [modulesData, setModulesData] = useState([]);
  const [filteredModulesData, setFilteredModulesData] = useState([]);
  const [numOfUsers, setNumOfUsers] = useState("");
  const [numOfModules, setNumOfModules] = useState("");
  const [apiLoader, setapiLoader] = useState(true);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(5);

  const handleRowPerPageChange = (event) => {
    setRowPerPage(event.target.value);
  };

  const [openFirst, setOpenFirst] = useState(false);
  const handleOpenFirst = (data) => () => {
    setOpenFirst(true);
  };
  const handleCloseFirst = () => setOpenFirst(false);

  useEffect(() => {
    setRowsToShow(filteredModulesData?.slice(0, rowPerPage));
  }, [filteredModulesData, rowPerPage]);

  const totalPage = useMemo(
    () => Math.ceil(filteredModulesData?.length / rowPerPage),
    [filteredModulesData?.length, rowPerPage]
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

  const transformModuleData = (modulesStats) => {
    return modulesStats.map((module) => ({
      id: module.course_id,
      module: module.course_title,
      enrolled: module.enrolled,
      notStarted: module.not_started,
      inProgress: module.in_progress,
      completed: module.completed,
      group_name: module.group_name,
      averageChallengeScore: 0,
      percentageComplete: module.avg_completion_percentage,
    }));
  };

  const getModulesData = async () => {
    try {
      const resp = await axiosInstance.post(`/modules_report/all`, {
        email,
      });
      setNumOfModules(resp.data.data?.courses_len);
      setNumOfUsers(resp.data.data?.all_group_users_len);
      const transformedData =
        resp.data.data?.modulesStats &&
        transformModuleData(resp.data.data?.modulesStats);
      setModulesData(transformedData);
      setFilteredModulesData(transformedData);
    } catch (error) {
      console.error("Error fetching module data:", error.message);
    } finally {
      setapiLoader(false);
    }
  };

  useEffect(() => {
    getModulesData();
  }, []);

  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState([]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const mockData = [
        { date: "2024-07-01", value: 100 },
        { date: "2024-07-02", value: 200 },
        { date: "2024-07-03", value: 150 },
      ];

      if (selectedDate) {
        const filteredData = mockData.filter(
          (entry) => entry.date === selectedDate
        );
        setData(filteredData);
      } else {
        setData(mockData);
      }
    };

    fetchData();
  }, [selectedDate]);

  const nextPage = () => {
    const startIndex = rowPerPage * (currentPage + 1);
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredModulesData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };

  const changePage = (value) => {
    const startIndex = value * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredModulesData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };

  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredModulesData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };

  const ReportsSection = ({ numOfUsers, numOfModules, modulesData }) => {
    return (
      <div className="w-full bg-white shadow-lg rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Reports</h2>
        <div className="flex flex-wrap justify-between items-center gap-8">
          <ReportCard title="Users" value={numOfUsers} icon={<FaUsersLine />} />
          <ReportCard
            title="Modules"
            value={modulesData?.length}
            icon={<MdLibraryBooks />}
          />
          {/* <ReportCard
						title="Completion Rate"
						value={`${calculateCompletionRate(
							numOfUsers,
							modulesData.length,
						)}%`}
						icon={<MdAutoGraph />}
					/> */}
        </div>
      </div>
    );
  };

  const ReportCard = ({ title, value, icon }) => {
    return (
      <div className="flex-1 min-w-[200px] bg-gray-50 rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl text-[#23436d]">{icon}</span>
          <span className="text-3xl font-bold text-[#23436d]">{value}</span>
        </div>
        <h3 className="text-xl text-gray-700">{title}</h3>
      </div>
    );
  };

  const calculateCompletionRate = (users, modules) => {
    if (users === 0 || modules === 0) return 0;
    return Math.round((modules / users) * 100);
  };

  useEffect(() => {
    if (SelectedGroupName) {
      const filteredData = modulesData.filter(
        (module) => module.group_name === SelectedGroupName
      );

      setFilteredModulesData(filteredData);
    } else {
      // Reset to the original data if no group is selected
      setFilteredModulesData(modulesData);
    }
  }, [SelectedGroupName, modulesData]); // Dependency array

  return (
    <>
      {apiLoader ? (
        <>
          <div className="w-full flex flex-col justify-center items-center min-h-[70vh]">
            <CircularProgress />
          </div>
        </>
      ) : (
        <>
          <div className="h-full bg-white flex items-center justify-center py-4 pt-0! rounded-lg shadow-lg mt-[1rem]">
            <div className="w-full px-2">
              <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2 ">
                <table className="table-auto overflow-scroll md:overflow-auto w-full text-left font-inter border ">
                  <thead className="rounded-lg text-base text-white font-semibold w-full border-t-2 border-gray-300 pt-6 pb-6">
                    <tr>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        ID
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Module
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base text-center font-bold whitespace-nowrap">
                        Enrolled
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base text-center font-bold whitespace-nowrap">
                        Not Started
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base text-center font-bold whitespace-nowrap">
                        In Progress
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base text-center font-bold whitespace-nowrap">
                        Completed
                      </th>
                      {/* <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Avg Challenge Score
                      </th> */}
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        % Complete
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
                            {!data?.id ? <div> - </div> : <div>{data.id}</div>}
                          </td>
                          <td
                            className={`py-2 px-3 text-base font-semibold text-[#00C543] ${
                              index == 0
                                ? "border-t-2 border-gray-300"
                                : index == rowsToShow?.length
                                ? "border-y"
                                : "border-t"
                            } whitespace-nowrap`}
                          >
                            {!data?.module ? (
                              <div> - </div>
                            ) : (
                              <div>{data.module}</div>
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
                            {!data?.enrolled ? (
                              <div> - </div>
                            ) : (
                              <div>{data.enrolled}</div>
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
                            {!data?.notStarted ? (
                              <div> - </div>
                            ) : (
                              <div>{data.notStarted}</div>
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
                            {!data?.inProgress ? (
                              <div> - </div>
                            ) : (
                              <div>{data.inProgress}</div>
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
                            {!data?.completed ? (
                              <div> - </div>
                            ) : (
                              <div>{data.completed}</div>
                            )}
                          </td>
                          {/* <td
                            className={`py-2 px-3 text-base text-center font-normal ${
                              index == 0
                                ? "border-t-2 border-gray-300"
                                : index == rowsToShow?.length
                                ? "border-y"
                                : "border-t"
                            } whitespace-nowrap`}
                          >
                            {!data?.averageChallengeScore ? (
                              <div> - </div>
                            ) : (
                              <div>{data.averageChallengeScore}</div>
                            )}
                          </td> */}
                          <td
                            className={`py-2 px-3 text-base text-center font-normal ${
                              index == 0
                                ? "border-t-2 border-gray-300"
                                : index == rowsToShow?.length
                                ? "border-y"
                                : "border-t"
                            } whitespace-nowrap`}
                          >
                            {!data?.percentageComplete ? (
                              <div> - </div>
                            ) : (
                              <div>{data.percentageComplete}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full flex justify-center sm:justify-between xl:flex-row flex-col gap-10 mt-12 lg:mt-8 px-0 lg:px-4 xl:px-4 items-center">
                <div className="text-base text-center">
                  Showing
                  <span className="font-bold bg-[#e1ecf0]  text-[#23436d]  mx-2 p-2 text-center rounded-lg">
                    {currentPage === 0 ? 1 : currentPage * rowPerPage + 1}
                  </span>
                  to{" "}
                  <span className="font-bold bg-[#e1ecf0]  text-[#23436d]  mx-2 py-2 px-3 text-center rounded-lg">
                    {currentPage === totalPage - 1
                      ? filteredModulesData?.length
                      : (currentPage + 1) * rowPerPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold bg-[#e1ecf0]  text-[#23436d]  mx-2 py-2 px-3 text-center rounded-lg">
                    {filteredModulesData?.length}
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
                open={openFirst}
                onClose={handleCloseFirst}
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
                        <label className="text-sm font-semibold">
                          {" "}
                          Full Name{" "}
                        </label>
                        {/* value={!dataWithLeadId.id ? '---' : dataWithLeadId.id}  */}
                        <TextField
                          sx={{ width: "100%" }}
                          id="recordID"
                          value={"Muhammad Umar"}
                        />
                      </div>
                      <div className="w-80 flex flex-col justify-start items-start gap-2">
                        <label className="text-sm font-semibold"> Email</label>
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ModuleReportTable;
