# Fuellio – Fuel Tracker

Fuellio is a personal fuel tracking application that helps you monitor fuel expenses, calculate mileage, and analyze fuel consumption across multiple vehicles.

## Features

- **Authentication** – Secure login/signup via Netlify Identity; data is private per user and syncs across all devices.
- **Vehicle Management** – Add multiple vehicles (Car or Bike) with their fuel type (Petrol, Diesel, CNG, or Electric).
- **Add Fill-up** – Record each fill-up with date, time, fuel price, amount paid, and odometer reading. Fuel quantity is automatically calculated.
- **Distance & Mileage** – Distance driven and mileage (km/L, km/kg, or km/kWh) are auto-calculated from consecutive odometer readings.
- **History** – View, edit, and delete past fill-up records. Filter by vehicle and date range.
- **Statistics** – Bar and line charts for monthly spend, fuel quantity, and mileage trend. Summary stats for total spend, fuel consumed, total distance, and average mileage.

## Tech Stack

- **Framework**: TanStack Start (React, SSR)
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js + react-chartjs-2
- **Auth**: Netlify Identity (`@netlify/identity`)
- **Database**: Netlify Database (Postgres) via Drizzle ORM

## Local Development

> **Note**: Netlify Identity does not work on localhost. Authentication only functions when deployed to a Netlify environment. Use a branch preview for testing auth flows.

```bash
npm install
netlify dev
```

The app runs at `http://localhost:8888`.
