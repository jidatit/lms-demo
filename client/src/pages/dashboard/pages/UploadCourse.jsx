import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from 'utils/axiosConfig';
import CoursesTable from '../components/CoursesTable';
import { useCourses } from 'api/queries/courses';
import { useBundles } from 'api/queries/bundles';

const UploadCourse = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [bundlesData, setBundlesData] = useState([]);

  const { data, isLoading: isCourseLoading, refetch } = useCourses({});
  const { data: bundles, isLoading: isBundlesLoading, refetch: refechBundles } = useBundles({});

  useEffect(() => {
    if (data?.data) {
      setCoursesData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (bundles?.data) {
      setBundlesData(bundles?.data);
    }
  }, [bundles]);

  const isAdmin = true;

  return (
    <>
      <CoursesTable coursesData={coursesData} isLoading={isCourseLoading || isBundlesLoading} getAllBundles={refechBundles} getAllCourses={refetch} bundlesData={bundlesData} />
    </>
  );
};

export default UploadCourse;
