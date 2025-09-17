<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Fish Zone Predictor App

This is a React TypeScript application built with Vite and Tailwind CSS for fishing zone prediction. The app demonstrates a prototype fishing zone prediction system with the following key features:

## Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Leaflet** and **React-Leaflet** for maps
- **Lucide React** for icons

## Project Structure
- `src/components/` - React components for each page
- `src/data/` - Dummy data for the application
- Mobile-first responsive design
- Bottom navigation pattern

## Key Components
- **HomePage**: Dashboard with map, PFZ zones, and quick stats
- **ReportsPage**: Monthly fishing trip summaries and statistics
- **AlertsPage**: Weather, boundary, and seasonal alerts
- **ProfilePage**: Fisherman profile and account information
- **BottomNavigation**: Mobile-style navigation component

## Design Principles
- Mobile-first responsive design
- Clean, minimal UI optimized for fishermen
- Ocean-themed color palette
- Dummy data for prototype demonstration
- Focus on UI/UX flow rather than backend functionality

## Data Types
The app uses TypeScript interfaces for:
- FishingZone (coordinates, probability, fish types)
- Alert (weather, boundary, seasonal alerts)
- TripSummary (monthly fishing statistics)
- UserProfile (fisherman information)

When working with this codebase, maintain the mobile-first approach and ocean theme. All data is hardcoded for demo purposes.
