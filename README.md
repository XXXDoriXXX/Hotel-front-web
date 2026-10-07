# Hotel-front-web

Web panel for hotel owners: manage hotels, rooms, staff and bookings, and follow statistics.

**Live demo:** https://hotel-front-web.vercel.app

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

## Overview

This is the owner-facing client of the Hotel project. It talks to the [Hotel-back](https://github.com/XXXDoriXXX/Hotel-back) REST API. The interface language is Ukrainian.

| Repository | Role |
| --- | --- |
| [Hotel-back](https://github.com/XXXDoriXXX/Hotel-back) | REST API used by this app |
| [Hotel-front-web](https://github.com/XXXDoriXXX/Hotel-front-web) | This web panel |
| [HotelMobileApp](https://github.com/XXXDoriXXX/HotelMobileApp) | Android app for guests, uses the same API |
| [HotelFastApi](https://github.com/XXXDoriXXX/HotelFastApi) | Earlier prototype of the API (legacy) |

```
Owner browser ──> Hotel-front-web (React, Vercel) ──> Hotel-back (FastAPI) ──> PostgreSQL
```

## Features

- Owner registration and login (JWT stored in the browser, sent as a bearer token)
- Dashboard with the owner's hotels
- Create, edit and delete hotels with images, amenities and a map location picker (Google Maps)
- Create and edit rooms with images
- Booking list per hotel
- Employee management with salary history and charts
- Statistics: general, financial, client and engagement charts
- Profile page and profile editing, Stripe account connection status
- Toast notifications

## Tech stack

React 19, Vite 6, Tailwind CSS 4, React Router 7, Axios, Recharts, Google Maps (`@react-google-maps/api`), Framer Motion, React Toastify, dayjs, ESLint.

## Getting started

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/XXXDoriXXX/Hotel-front-web.git
cd Hotel-front-web
npm install
```

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API=your-google-maps-api-key
```

Start the dev server:

```bash
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

The backend must allow your dev origin in its CORS list (see `main.py` in Hotel-back).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | yes | Base URL of the Hotel-back API |
| `VITE_GOOGLE_MAPS_API` | yes | Google Maps API key (geocoding and map picker) |

## Deployment

The project is deployed on Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routing works.

## Author

[XXXDoriXXX](https://github.com/XXXDoriXXX)
