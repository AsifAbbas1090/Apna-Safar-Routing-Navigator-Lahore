# Google Maps API Setup Guide

## Current Status

✅ **API Key Added**: `AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`
✅ **Environment Variables Configured**: Both backend and frontend
✅ **Code Fixes Applied**: Multiple script loading, authentication, error handling

## Fixing REQUEST_DENIED Error

The `REQUEST_DENIED` error from Google Maps API means one of the following:

### 1. Enable Required APIs in Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/) and enable these APIs:

1. **Maps JavaScript API** (for map display)
2. **Places API** (for autocomplete)
3. **Geocoding API** (for address to coordinates)
4. **Directions API** (for route planning, if needed)

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** > **Library**
4. Search for each API and click **Enable**

### 2. Check API Key Restrictions

Your API key might have restrictions that are blocking requests:

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key: `AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`
3. Check **API restrictions**:
   - Either set to **Don't restrict key** (for development)
   - Or ensure **Places API**, **Geocoding API**, and **Maps JavaScript API** are enabled
4. Check **Application restrictions**:
   - For development: Set to **None** (not recommended for production)
   - For production: Add HTTP referrer restrictions:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - Your production domain (e.g., `https://yourdomain.com/*`)

### 3. Verify Billing is Enabled

Google Maps APIs require billing to be enabled (even for free tier):

1. Go to **Billing** in Google Cloud Console
2. Ensure billing account is linked to your project
3. Free tier includes:
   - 28,000 map loads per month
   - 40,000 geocoding requests per month
   - 17,000 places autocomplete requests per month

### 4. Check API Key Usage

Verify the API key is being used correctly:

- **Backend**: Uses `GOOGLE_MAPS_API_KEY` from `.env`
- **Frontend**: Uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from `.env.local`

Both should be: `AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`

## Quick Fix Checklist

- [ ] Enable **Places API** in Google Cloud Console
- [ ] Enable **Geocoding API** in Google Cloud Console
- [ ] Enable **Maps JavaScript API** in Google Cloud Console
- [ ] Check API key restrictions (set to "Don't restrict key" for development)
- [ ] Verify billing is enabled
- [ ] Restart backend server after updating `.env`
- [ ] Restart frontend server after updating `.env.local`
- [ ] Clear browser cache and hard refresh (Ctrl+Shift+R)

## Testing

After fixing the above:

1. **Test Autocomplete**: Type in location input field - should show suggestions
2. **Test My Location**: Click location button - should detect and reverse geocode
3. **Test Map**: Map should load without errors
4. **Check Console**: No more `REQUEST_DENIED` errors

## Common Issues

### "Multiple script loading" error
✅ **Fixed**: Created global script loader to prevent duplicate loads

### "401 Unauthorized" for reverse geocode
✅ **Fixed**: Made reverse geocode optional authentication

### "REQUEST_DENIED" for autocomplete
⚠️ **Action Required**: Enable Places API in Google Cloud Console (see above)

## Support

If issues persist:
1. Check Google Cloud Console for API usage and errors
2. Verify API key is correct in both `.env` files
3. Check browser console for detailed error messages
4. Ensure all required APIs are enabled and billing is active

