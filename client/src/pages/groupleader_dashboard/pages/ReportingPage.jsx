import React, { useEffect, useState } from 'react';

import { useAuth } from 'contexts/AuthContext';
import axiosInstance from 'utils/axiosConfig';
import ReportingTable from '../components/ReportingTable';

function ReportingPage({ mode }) {
  const { currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [SelectedGroupId, setSelectedGroupId] = useState('');
  const [AllGroups, setAllGroups] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [groupLeadersGroups, setGroupLeadersGroups] = useState([]);
  const [retrievedGroupNames, setRetrievedGroupNames] = useState([]);

  const [loadingGroups, setLoadingGroups] = useState(true);

  const fetchGroupIdAndName = async () => {
    try {
      // Fetch the group IDs for the current user
      const groupIdResponse = await axiosInstance.get(`/groups/${currentUser?.id}/groupid`);
      const retrievedGroupIds = groupIdResponse?.data?.group_id;

      setGroupId(retrievedGroupIds);

      if (retrievedGroupIds && retrievedGroupIds.length > 0) {
        const groupNameResponse = await axiosInstance.post(`groups/group/details`, { group_id: retrievedGroupIds });

        setAllGroups(groupNameResponse?.data?.groups);

        const retrievedGroupNames = groupNameResponse?.data?.groups?.map((group) => group.name);
        setGroupLeadersGroups(retrievedGroupNames);
        setRetrievedGroupNames(retrievedGroupNames);
        setLoadingGroups(false);
      }
    } catch (error) {
      console.error('Error fetching group data!', error);
      setLoadingGroups(false); // Handle error case and stop loading
    }
  };

  useEffect(() => {
    fetchGroupIdAndName();
  }, []);

  return (
    <>
      {AllGroups && (
        <ReportingTable
          SelectedGroupId={SelectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          groupName={groupName}
          setGroupName={setGroupName}
          AllGroups={AllGroups}
          mode={mode}
          groupLeadersGroups={groupLeadersGroups}
          groupNames={retrievedGroupNames}
          loadingGroups={loadingGroups} // Pass the loading state to the child
        />
      )}
    </>
  );
}

export default ReportingPage;
