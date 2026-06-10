import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  InputLabel,
  Box,
  Grid,
  Card,
  CardMedia,
  IconButton,
  CardContent,
  Paper,
  styled,
  List,
  ListItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
// import { h5pVideosData } from "./data/h5pVideosData";
import Spinner from "../../shared/components/Spinner";
// import EditableCourseDetails from "../components/EditableCourseDetails";
import { Link, useNavigate } from "react-router-dom";
import { h5pVideosData } from "../../dashboard/pages/data/h5pVideosData";
import EditableCourseDetails from "../../dashboard/components/EditableCourseDetails";
import EditableBundleDetails from "../components/EditableBundleDetails";
import AddIcon from "@mui/icons-material/Add";
import BundleCourseManagement from "../components/BundleCourseManagement";
import Heading from "../../components/ui";

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  borderRadius: "24px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: selected ? "#e3f2fd" : "#ffffff",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
}));
const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  padding: "24px",
});

const BundleDetails = () => {
  const [loading_course, setloading_course] = useState(true);
  const [editImage, setEditImage] = useState(false);
  const [admin, setAdmin] = useState("");
  const [bundleDetails, setBundleDetails] = useState({});
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [coursesData, setCoursesData] = useState([]);
  const [courseIds, setCourseIds] = useState([]);

  const getAllCourses = async () => {
    try {
      const result = await axiosInstance.get("/courses/all");
      const courses = result.data.data;
      setCoursesData(courses);
    } catch (error) {
      console.log(error);
    }
  };
  //   const [courseDetails, setCourseDetails] = useState({
  //     id: "",
  //     title: "",
  //     description: "",
  //     priceperseat: "",
  //     featuredImage: null,
  //     lessons: [],
  //   });

  useEffect(() => {
    getAllCourses();
  }, []);

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    lesson_video_path: "",
    lesson_video_name: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const fetchBundleAndCourseDetails = async (bundleId) => {
    try {
      const bundleResponse = await axiosInstance.get(
        `/courses/bundles/${bundleId}`
      );
      const bundleData = bundleResponse.data.data;
      bundleData.quantity = 1;
      bundleData.subtotal = bundleData.seatprice;

      setBundleDetails(bundleData);

      const coursesResponse = await axiosInstance.get(
        `/courses/bundles_courses/${bundleId}`
      );
      const courseIds = coursesResponse.data.course_ids;

      const courseDetailsResponses = await Promise.all(
        courseIds.map((id) => axiosInstance.get(`/courses/${id}`))
      );
      const courses = courseDetailsResponses.map(
        (response) => response.data.data
      );

      setCoursesDetails(courses);

      const courseIdsOnly = courses.map((course) => course.id);
      setCourseIds(courseIdsOnly);

      //   // Fetch any applicable discounts
      //   fetchDiscountDetails(bundleId, bundleData);
    } catch (error) {
      console.error("Error fetching bundle and course details:", error);
    } finally {
      setloading_course(false);
    }
  };

  const handleSave = async (updatedFields) => {
    setloading_course(true);
    const updatedData = {
      ...updatedFields,
      courseIds,
    };

    try {
      await axiosInstance.put(
        `/courses/update_bundles/${bundleDetails?.bundleId}`,
        updatedData
      );
      setBundleDetails((prev) => ({ ...prev, ...updatedFields }));
      toast.success("Bundle details updated successfully!");
    } catch (error) {
      console.log("Error updating course details:", error);
      toast.error("Error updating course details!");
    } finally {
      setloading_course(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    setCourseId(id);

    const admin = searchParams.get("admin");
    setAdmin(admin);

    if (id) {
      fetchBundleAndCourseDetails(id);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleOpenDialog = () => {
    setOpen(true);
    setSelectedCourses([]);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAddCourses = () => {
    console.log("selectedcprse", selectedCourses);
    // onAddCourses(selectedCourses);
    handleCloseDialog();
  };

  const handleUpdateBundleCourses = async (updatedCourseIds) => {
    try {
      setloading_course(true);
      await axiosInstance.put(
        `/courses/update_bundles/${bundleDetails?.bundleId}`,
        {
          ...bundleDetails,
          courseIds: updatedCourseIds,
        }
      );

      setCourseIds(updatedCourseIds);

      const courseDetailsResponses = await Promise.all(
        updatedCourseIds.map((id) => axiosInstance.get(`/courses/${id}`))
      );
      const courses = courseDetailsResponses.map(
        (response) => response.data.data
      );
      setCoursesDetails(courses);

      toast.success("Bundle courses updated successfully!");
    } catch (error) {
      console.error("Error updating bundle courses:", error);
      toast.error("Failed to update bundle courses!");
    } finally {
      setloading_course(false);
    }
  };

  //   const handleImageSubmit = async (e) => {
  //     const formData = new FormData();
  //     if (newImage) {
  //       formData.append("featuredImage", newImage);
  //     }
  //     try {
  //       const response = await axiosInstance.put(
  //         `/courses/set_image/${coursesDetails.id}`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );
  //       if (response.data.success) {
  //         toast.success("Featured Image Updated!");
  //         fetchBundleAndCourseDetails(coursesDetails.id);
  //         setNewImage(null);
  //         setImagePreview(null);
  //         setEditImage(false);
  //       }
  //     } catch (error) {
  //       console.log("Error updating featured image:", error);
  //     }
  //   };
  //   const handleSave = async (updatedFields) => {
  //     try {
  //       await axiosInstance.put(
  //         `/courses/update/${courseDetails.id}`,
  //         updatedFields
  //       );
  //       setCourseDetails((prev) => ({ ...prev, ...updatedFields }));
  //       toast.success("Course details updated successfully!"); // Success toast
  //     } catch (error) {
  //       console.log("Error updating course details:", error);
  //       toast.error("Error updating course details!"); // Error toast
  //     }
  //   };

  //   const toggleEditing = (index) => {
  //     const updatedLessons = [...courseDetails.lessons];
  //     updatedLessons[index].isEditing = !updatedLessons[index].isEditing;
  //     setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  //   };

  return (
    <div className="w-full flex flex-col justify-start items-center">
      <div className="w-full flex flex-col justify-center items-start">
        <Heading text={"Bundle Details"} />
      </div>
      {loading_course === false ? (
        <div className="w-full">
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <EditableBundleDetails
                courseDetails={bundleDetails}
                onSave={handleSave}
                admin={admin}
              />
            </Grid>

            <BundleCourseManagement
              bundleId={bundleDetails?.bundleId}
              allCourses={coursesData}
              existingCourses={coursesDetails}
              onUpdateBundleCourses={handleUpdateBundleCourses}
              admin={admin}
            />
          </Grid>
        </div>
      ) : (
        <>
          <div className="w-[95%] bg-white flex flex-col justify-center items-center p-6 rounded-lg shadow-md">
            <Spinner />
          </div>
        </>
      )}
    </div>
  );
};

export default BundleDetails;
