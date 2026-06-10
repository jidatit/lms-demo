import { useLayoutEffect, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

// project import
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItem, { agentMenuItems, contributorMenuItems, groupLeaderMenuItems, subscriberMenuItems } from 'menu-items';

import useConfig from 'hooks/useConfig';
import { HORIZONTAL_MAX_ITEM, MenuOrientation } from 'config';
import { useGetMenuMaster } from 'api/menu';
import { set } from 'lodash';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation({ mode }) {
  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [selectedID, setSelectedID] = useState('');
  const [selectedItems, setSelectedItems] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [menuItems, setMenuItems] = useState({ items: [] });

  useLayoutEffect(() => {
    if (mode === 'contributor') {
      setMenuItems(contributorMenuItems);
    } else if (mode === 'groupleader') {
      setMenuItems(groupLeaderMenuItems);
    } else if (mode === 'subscriber') {
      setMenuItems(subscriberMenuItems);
    } else if (mode === 'supportAgent') {
      setMenuItems(agentMenuItems);
    }
    else {
      setMenuItems(menuItem);
    }
  }, [mode]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  //  first it checks menu item is more than giving HORIZONTAL_MAX_ITEM after that get lastItemid by giving horizontal max
  // item and it sets horizontal menu by giving horizontal max item lastly slice menuItem from array and set into remItems

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  // Helper: recursively remove hidden items
  const filterHidden = (items) =>
    items
      .filter((item) => !item.hidden)
      .map((item) =>
        item.children
          ? { ...item, children: filterHidden(item.children) }
          : item
      );

  const filteredMenu = filterHidden(menuItems.items);

  const navGroups = filteredMenu
    .slice(0, lastItemIndex + 1)
    .map((item, index) => {
      switch (item.type) {
        case 'group':
          if (item.url && item.id !== lastItemId) {
            return (
              <List key={item.id} {...(isHorizontal && { sx: { mt: 0.5 } })}>
                {!isHorizontal && index !== 0 && <Divider sx={{ my: 0.5 }} />}
                <NavItem item={item} level={1} isParents />
              </List>
            );
          }

          return (
            <NavGroup
              key={item.id}
              setSelectedID={setSelectedID}
              setSelectedItems={setSelectedItems}
              setSelectedLevel={setSelectedLevel}
              selectedLevel={selectedLevel}
              selectedID={selectedID}
              selectedItems={selectedItems}
              lastItem={lastItem}
              remItems={remItems}
              lastItemId={lastItemId}
              item={item}
            />
          );
        default:
          return (
            <Typography key={item.id} variant="h6" color="error" align="center">
              Fix - Navigation Group
            </Typography>
          );
      }
    });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        ...(!isHorizontal && { '& > ul:first-of-type': { mt: 0 } }),
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
}
