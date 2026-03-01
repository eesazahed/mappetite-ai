# Mappetite AI

A travel meal planning app that finds and schedules restaurants near your hotel based on your cuisine preferences, budget, and trip duration.

## What It Does

Enter your hotel, city, trip details, and food preferences — Mappetite generates a day-by-day meal schedule with restaurants plotted on an interactive Google Map.

- Geocodes your hotel to find nearby restaurants via Google Places
- Filters by cuisine type, budget per day, and maximum travel distance
- Builds a randomized meal schedule across your trip
- Displays all restaurant locations on an interactive map

## Getting Started

### Prerequisites

You need a [Google Maps API key](https://developers.google.com/maps) with the following APIs enabled:
- Geocoding API
- Places API (Nearby Search)
- Maps JavaScript API

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root:

```env
GMAPS_API_KEY=your_server_side_key
NEXT_PUBLIC_GMAPS_API_KEY=your_client_side_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Usage

Fill in the form with:

| Field | Description |
|---|---|
| City | The city you're visiting |
| Hotel | Hotel name or address |
| Trip Duration | Number of days |
| Mode of Transport | Walk, car, public transit, or bike |
| Max Travel Distance | How far you're willing to travel (km) |
| Budget per Day | Your daily food budget |
| Preferred Cuisine | Comma-separated cuisines (e.g. `Italian, Thai`) |
| Meals per Day | 1–5 meals per day |

Click **Plan meals** to generate your schedule and see restaurants on the map.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/) for map rendering
- Google Maps Geocoding + Places APIs
