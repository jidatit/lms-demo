import React, { useState, useMemo, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axiosInstance from "../../utils/axiosConfig";
import { useAuth } from "../../AuthContext";
import { CircularProgress } from "@mui/material";
import { CiSearch } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

const UserReportTable = ({ setDownload, download, selectedId }) => {
  const { currentUser } = useAuth();
  const [usersData, setUsersData] = useState([]);
  const [apiLoader, setapiLoader] = useState(true);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(5);
  const [openDetailsData, setopenDetailsData] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  const [SelectedGroupName, setSelectedGroupName] = useState("");
  const [filteredUsersData, setFilteredUsersData] = useState([]);
  const [AllGroups, setAllGroups] = useState([]);

  const handleRowPerPageChange = (event) => {
    setRowPerPage(event.target.value);
  };

  const [openFirst, setOpenFirst] = useState(false);
  const handleOpenFirst = (data) => () => {
    setopenDetailsData(data);
    setOpenFirst(true);
  };
  const handleCloseFirst = () => {
    setopenDetailsData(null);
    setOpenFirst(false);
  };

  useEffect(() => {
    setRowsToShow(filteredUsersData.slice(0, rowPerPage));
  }, [filteredUsersData, rowPerPage]);

  const totalPage = useMemo(
    () => Math.ceil(filteredUsersData.length / rowPerPage),
    [filteredUsersData.length, rowPerPage]
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

  const transformUserData = (userStats) => {
    return userStats.map((user) => ({
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      modulesEnrolled: user.enrolled_courses,
      notStarted: user.not_started_courses,
      inProgress: user.in_progress_courses,
      group_id: user.group_id,
      complete: user.completed_courses,
    }));
  };

  const getUsersData = async () => {
    try {
      const resp = await axiosInstance.post(
        `/users_report//all-by-group-leader`,
        {
          currentUser,
        }
      );
      const transformedUsersData =
        resp.data.data &&
        transformUserData(resp.data.data?.all_group_users_stats);
      setUsersData(transformedUsersData);
      setFilteredUsersData(transformedUsersData);
    } catch (error) {
      console.log(error.message);
    } finally {
      setapiLoader(false);
    }
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const nextPage = () => {
    const startIndex = rowPerPage * (currentPage + 1);
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredUsersData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };

  const changePage = (value) => {
    const startIndex = value * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredUsersData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };

  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowPerPage;
    const endIndex = startIndex + rowPerPage;
    const newArray = filteredUsersData.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };

  useEffect(() => {
    if (download === "download") {
      exportToExcel(usersData);
      setDownload(""); // Reset `download` to prevent re-triggering
    }
  }, [download]);

  const fetchGroupIdAndName = async () => {
    try {
      // Fetch the group IDs for the current user
      const groupIdResponse = await axiosInstance.get(
        `/groups/${currentUser?.id}/groupid`
      );

      const retrievedGroupIds = groupIdResponse?.data?.group_id;

      // setGroupId(retrievedGroupIds);

      if (retrievedGroupIds && retrievedGroupIds.length > 0) {
        const groupNameResponse = await axiosInstance.post(
          `groups/group/details`,
          { group_id: retrievedGroupIds }
        );

        setAllGroups(groupNameResponse?.data?.groups);
      }
    } catch (error) {
      console.error("Error fetching group data!", error);
    }
  };
  useEffect(() => {
    fetchGroupIdAndName();
  }, []);

  const exportToExcel = (data) => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      [
        "First Name",
        "Last Name",
        "Email Address",
        "Modules Enrolled",
        "Not Started",
        "In Progress",
        "Group Name",
        "Completed",
      ],
      ...data.map((user) => [
        user.firstName,
        user.lastName,
        user.email,
        user.modulesEnrolled,
        user.notStarted,
        user.inProgress,
        user.groupName,
        user.complete,
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");

    // Apply basic styling
    worksheet["!cols"] = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email Address
      { wch: 20 }, // Modules Enrolled
      { wch: 15 }, // Not Started
      { wch: 15 }, // In Progress
      { wch: 15 }, // Group Name
      { wch: 15 }, // Completed
    ];

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "users_data.xlsx"
    );
  };

  useEffect(() => {
    if (selectedId) {
      const filteredData = usersData.filter((module) => {
        return String(module.group_id) === String(selectedId);
      });

      setFilteredUsersData(filteredData);
    } else {
      // Reset to the original data if no group is selected
      setFilteredUsersData(usersData);
    }
  }, [selectedId, usersData]);

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
          {/* <div className="w-full flex flex-col justify-center items-center">
            <div className="w-full h-16 flex flex-row justify-end items-center rounded-t-lg text-white font-semibold text-base gap-4 pt-3 pl-10 pr-10 bg-[#e1ecf0]"></div>
          </div> */}

          <div className={`absolute my-4 mb-0 top-[27.3rem] right-[3rem]`}>
            {/* {usersData.length > 0 && (
              <CSVLink
                data={usersData}
                filename={"users_data.csv"}
                style={{
                  borderRadius: "20px",
                }}
                className="bg-[#299aa1] text-white px-4 mb-2 py-2 "
              >
                Download CSV
              </CSVLink>
            )} */}
          </div>

          <div className="h-full bg-white flex items-center justify-center py-4  pt-0! rounded-lg shadow-lg mt-[1rem]">
            <div className="w-full px-2">
              <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2 ">
                <table className="table-auto overflow-scroll md:overflow-auto w-full text-left font-inter border ">
                  <thead className="rounded-lg text-base text-white font-semibold w-full border-t-2 border-gray-300 pt-6 pb-6">
                    <tr>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        First Name
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Last Name
                      </th>
                      <th className="py-3 px-3 justify-center gap-1 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Email
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Modules Enrolled
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Not Started
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        In Progress
                      </th>
                      <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
                        Completed
                      </th>
                      {/* <th className="py-3 px-3 text-[#23436d] sm:text-base font-bold whitespace-nowrap">
												Completed
											</th> */}
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
                            {!data?.firstName ? (
                              <div> - </div>
                            ) : (
                              <div>{data.firstName}</div>
                            )}
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
                            {!data?.lastName ? (
                              <div> - </div>
                            ) : (
                              <div>{data.lastName}</div>
                            )}
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
                            {!data?.email ? (
                              <div> - </div>
                            ) : (
                              <div>{data.email}</div>
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
                            {!data?.modulesEnrolled ? (
                              <div> - </div>
                            ) : (
                              <div>{data.modulesEnrolled}</div>
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
                            {!data?.complete ? (
                              <div> - </div>
                            ) : (
                              <div>{data.complete}</div>
                            )}
                          </td>
                          {/* <td
														className={`py-2 px-3 text-base  font-normal ${
															index == 0
																? "border-t-2 border-gray-300"
																: index == rowsToShow?.length
																	? "border-y"
																	: "border-t"
														} whitespace-nowrap`}
													>
														<button
															onClick={handleOpenFirst(data)}
															className="bg-[#23436d] rounded-3xl text-white py-1 px-4"
														>
															View Details
														</button>
													</td> */}
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
                  <span className="font-bold bg-[#e1ecf0]  text-[#23436d] mx-2 py-2 px-3 text-center !rounded-lg min-w-[40px]  inline-block">
                    {currentPage === totalPage - 1
                      ? filteredUsersData?.length
                      : (currentPage + 1) * rowPerPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold bg-[#e1ecf0]  text-[#23436d] mx-2 py-2 px-3 text-center !rounded-lg min-w-[40px]  inline-block">
                    {filteredUsersData?.length}
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

              {openDetailsData && (
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
                            value={
                              openDetailsData.firstName +
                              " " +
                              openDetailsData.lastName
                            }
                          />
                        </div>
                        <div className="w-80 flex flex-col justify-start items-start gap-2">
                          <label className="text-sm font-semibold">
                            {" "}
                            Email
                          </label>
                          <TextField
                            sx={{ width: "100%" }}
                            id="fullNameID"
                            value={openDetailsData.email}
                          />
                        </div>
                      </div>
                    </div>
                  </Box>
                </Modal>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserReportTable;
