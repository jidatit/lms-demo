import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box } from '@mui/material';

function DynamicTabs({ tabs, value, handleChange }) {
  return (
    <>
      <Tabs value={value} onChange={handleChange} aria-label="dynamic tabs">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition={tab.iconPosition || 'start'}
            {...(tab.a11yProps ? tab.a11yProps(index) : {})}
          />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

DynamicTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.element,
      iconPosition: PropTypes.string,
      component: PropTypes.node.isRequired,
      a11yProps: PropTypes.func
    })
  ).isRequired,
  value: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired
};

export default DynamicTabs;
