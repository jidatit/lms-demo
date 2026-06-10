// project import
import adminItems, { license, settings } from './sample-page';
import support from './support';
import pages from './pages';
import contributorItems, { contributorLicense } from './contributorItems';
import groupLeaderItems from './groupLeaderItems';
import subscriberItems from './subscriberItems';
import agentItems from './agentItems';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [adminItems, license, settings]
};
export default menuItems;

export const contributorMenuItems = {
  items: [contributorItems, contributorLicense]
};

export const groupLeaderMenuItems = {
  items: [groupLeaderItems]
};
export const subscriberMenuItems = {
  items: [subscriberItems]
};
export const agentMenuItems = {
  items: [agentItems]
}