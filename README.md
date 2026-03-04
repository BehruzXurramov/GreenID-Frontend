# GreenID Frontend (MVP)

Production-ready MVP frontend for GreenID using React + Vite, React Router, SCSS, React Icons, and native Fetch.

## Stack

- React (Vite)
- React Router DOM
- SCSS (SASS)
- React Icons
- Native Fetch API with centralized wrapper

## Quick Start

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Environment

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=https://bestapi.uz/greenid
VITE_GOOGLE_LOGIN_URL=https://bestapi.uz/greenid/auth/google
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

## Folder Structure

```text
src/
  api/
    authApi.js
    client.js
    imgbbApi.js
    submissionsApi.js
    usersApi.js
  assets/
  components/
    admin/
    common/
    submissions/
  constants/
    storageKeys.js
  context/
    AuthContext.jsx
  hooks/
    useAuth.js
  layouts/
    AppShellLayout.jsx
  pages/
    AccessDeniedPage.jsx
    AdminPage.jsx
    DashboardPage.jsx
    NotFoundPage.jsx
    WelcomePage.jsx
  routes/
    AdminRoute.jsx
    AppRouter.jsx
    ProtectedRoute.jsx
  styles/
    abstracts/
    base/
    components/
    layout/
    pages/
    index.scss
  utils/
    formatters.js
```

## OAuth Note

Backend callback (`/auth/google/callback`) returns raw JSON on API domain. Automatic popup parsing works when callback becomes readable in popup context, but can fail on strict cross-origin setups.  
For seamless user experience, backend should redirect callback to frontend origin and pass auth payload via:
- secure HTTP-only session/cookie strategy, or
- short-lived one-time code exchanged on frontend.

## Implemented Features

- Full-screen landing page (no scroll) with eco visual style
- Role-aware auth context with local storage persistence
- Central API wrapper with JWT header and global 401 redirect
- Protected routes (`/dashboard`) and admin-only route (`/admin`)
- User dashboard with responsive sidebar + submission cards
- Submission create modal with file select, preview, image type/size validation (max 32MB), and ImgBB upload
- Admin panel with:
  - submission review/update cards
  - users table
- Friendly API error messages
- 403 Access Denied UI and 404 fallback page
