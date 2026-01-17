# Troubleshooting Guide

## Current Issues & Solutions

### 1. 401 Unauthorized for Reverse Geocode

**Error**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Solution**: 
1. **Restart the backend server** - The code changes require a server restart
   ```bash
   cd backend
   npm run start:dev
   # Or if using production:
   npm run start:prod
   ```

2. Verify the changes are applied:
   - Check `backend/src/google-maps/google-maps.controller.ts` - line 95 should have `@UseGuards(OptionalJwtAuthGuard)`
   - Check `backend/src/google-maps/google-maps.service.ts` - reverseGeocode should support guest users

### 2. 500 Internal Server Error - "fetch failed"

**Error**: `Autocomplete error: fetch failed`

**Possible Causes**:
1. **Network connectivity issues** - Backend can't reach Google's API
2. **API key restrictions** - HTTP referrer or IP restrictions blocking requests
3. **Places API not enabled** - The API isn't enabled in Google Cloud Console

**Solutions**:

#### A. Enable Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Places API" and click **Enable**
4. Also enable:
   - **Geocoding API**
   - **Maps JavaScript API**

#### B. Check API Key Restrictions
1. Go to **APIs & Services** > **Credentials**
2. Click on your API key: `AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`
3. Under **API restrictions**:
   - For development: Set to **Don't restrict key**
   - Or ensure **Places API**, **Geocoding API**, and **Maps JavaScript API** are selected
4. Under **Application restrictions**:
   - For development: Set to **None**
   - For production: Add HTTP referrers:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - Your production domain

#### C. Verify API Key in Environment
Check that the API key is correctly set:
```bash
# Backend
cd backend
cat .env | grep GOOGLE_MAPS_API_KEY
# Should show: GOOGLE_MAPS_API_KEY=AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k

# Frontend
cd frontend
cat .env.local | grep GOOGLE_MAPS_API_KEY
# Should show: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k
```

### 3. ERR_INTERNET_DISCONNECTED Errors

**Error**: Multiple `ERR_INTERNET_DISCONNECTED` errors from `lh3.ggpht.com` and `maps.googleapis.com`

**Note**: These are from Google's internal services and may be:
- Network connectivity issues
- Browser cache issues
- Ad blockers interfering

**Solutions**:
1. Clear browser cache and hard refresh (Ctrl+Shift+R)
2. Disable ad blockers temporarily
3. Check internet connection
4. Try a different browser

### 4. No Autocomplete Suggestions

**Symptoms**: Typing in location input doesn't show suggestions

**Checklist**:
- [ ] Places API is enabled in Google Cloud Console
- [ ] API key restrictions allow the API
- [ ] Backend server is running and restarted
- [ ] No console errors (check browser DevTools)
- [ ] API key is correct in both `.env` files

## Quick Fix Steps

1. **Restart Backend Server**:
   ```bash
   cd backend
   # Stop the server (Ctrl+C)
   npm run start:dev
   ```

2. **Restart Frontend Server**:
   ```bash
   cd frontend
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache**:
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Hard refresh: `Ctrl+Shift+R`

4. **Verify API Key Configuration**:
   - Backend `.env`: `GOOGLE_MAPS_API_KEY=AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`
   - Frontend `.env.local`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCwQTHNz0A4weZ2zSElGEhHoUKHUDgQQ2k`

5. **Enable APIs in Google Cloud Console**:
   - Places API
   - Geocoding API
   - Maps JavaScript API

6. **Check API Key Restrictions**:
   - Set to "Don't restrict key" for development
   - Or ensure all required APIs are selected

## Testing After Fixes

1. **Test Reverse Geocode (My Location)**:
   - Click the location button
   - Should detect location and show address
   - Should work without login

2. **Test Autocomplete**:
   - Type in location input field
   - Should show suggestions after 3+ characters
   - Should work without login

3. **Test Map**:
   - Map should load without errors
   - No "multiple script loading" errors

## Still Having Issues?

1. Check backend logs for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify API key is active in Google Cloud Console
4. Check API usage/quota in Google Cloud Console
5. Ensure billing is enabled (required even for free tier)

## Code Changes Made

✅ Fixed multiple Google Maps script loading
✅ Made reverse geocode optional authentication
✅ Improved error handling for network errors
✅ Added better error messages for API failures
✅ Made autocomplete work for guest users

**Important**: All code changes require a backend server restart to take effect!

