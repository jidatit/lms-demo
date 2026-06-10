import React, { useEffect, useState } from 'react';
import ReportingTable from '../components/ReportingTable';
import { useAuth } from 'contexts/AuthContext';
import axiosInstance from 'utils/axiosConfig';

function ReportingPage({ mode }) {
  const { currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [SelectedGroupId, setSelectedGroupId] = useState('');
  const [AllGroups, setAllGroups] = useState([]);

  // const fetchAllGroups = async () => {
  //   try {
  //     const resp = await axiosInstance.get(`/groups/all/${currentUser.email}`);
  //     setAllGroups(resp.data.groups);
  //   } catch (error) {
  //     console.log('Error fetching all groups!');
  //   }
  // };

  // useEffect(() => {
  //   fetchAllGroups();
  // }, []);
  return (
    <>
      <ReportingTable
        SelectedGroupId={SelectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        groupName={groupName}
        setGroupName={setGroupName}
        mode={mode}
      />
    </>
  );
}

export default ReportingPage;
