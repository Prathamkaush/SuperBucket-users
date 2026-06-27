# Renter Side UI Template

This folder contains a separate Expo/React Native renter-side app template for Superbuket.

## Included

- `RenterApp.js`: renter-side navigation entry point.
- `screens/RenterDashboardScreen.js`: owner dashboard with metrics, spaces, leads, and verification prompt.
- `screens/RenterListingsScreen.js`: rent/sell listing manager with status filters.
- `screens/AddSpaceScreen.js`: form template to add spaces for rent or selling.
- `screens/RenterLeadsScreen.js`: lead follow-up workflow.
- `screens/RenterProfileScreen.js`: owner profile, payout, and verification settings.
- `screens/SpaceDetailScreen.js`: listing detail, performance, and actions.
- `components/`: reusable renter header, metric card, and space card.
- `data/mockRenterData.js`: placeholder data for UI preview.

## Preview

To preview this app instead of the current user app, temporarily change `App.js` to:

```js
import RenterApp from './src/apps/renter/RenterApp';

export default RenterApp;
```

Then run:

```sh
npm start
```
