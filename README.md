# GeoAI-Navigator

A sample web application demonstrating how to integrate Google’s Gemini generative AI with the Google Maps Platform (Maps JavaScript API) using TypeScript and Vite.

## Table of ContentsFeatures

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Folder Structure](#folder-structure)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

## Features

- **Multimodal Place Recognition**: Upload an image and ask the Gemini API “Where can I see this?”
- **Text Prompt Refinement**: Use the Gemini API to enhance and refine user-generated review text.
- **Photorealistic 3D Map** (Experimental): Render a tilt‑and‑heading controlled 3D map view.
- **Geocoding**: Convert AI‑generated place names into latitude/longitude coordinates.
- **Nearby Lodging Search**: Retrieve and display lodging options around the identified location.
- **Split-Layout UI**: Display interactive map and place overview cards in a responsive split layout using Google’s Extended Component Library.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- A Google Cloud project with:
  - **Gemini AI** enabled
  - **Maps JavaScript API** enabled

## Getting Started

1. Clone the repository
  ```bash
  git clone https://github.com/CodeRTX/GeoAI-Navigator.git
  cd GeoAI-Navigator
  ```
2. Install dependencies
  ```bash
  npm install
  # or
  yarn install
  ```
3. Setup environment variables (see [Environment Variables](#environment-variables))
4. Start the development server
  ```bash
  npm run dev
  # or
  yarn devVisit
  ```
5. `http://localhost:5173` in your browser.

## Environment Variables

Create a file named `.env.local` in the project root with the following keys:
  VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
  VITE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
> **Note**: The `.local` suffix prevents accidental commits of sensitive keys to source control.

## Folder Structure

GeoAI-Navigator/
├── public/                # Static assets (index.html, favicon)
├── src/                   # Application source code
│   ├── main.ts            # Entry point
│   └── style.css          # Basic styles
├── .env.local             # Environment variables (not shown)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md

## Usage

  -Placeholder-

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with a clear description of your changes.

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
  
### Google Maps Platform, Maps JavaScript API

- [Photorealistic 3D map (Experimental)](https://developers.google.com/maps/documentation/javascript/3d-maps-overview) in the Maps JavaScript API
- [Geocoding Service](https://developers.google.com/maps/documentation/javascript/geocoding), Maps JavaScript API
- [Nearby Search (New) in the Places Library](https://developers.google.com/maps/documentation/javascript/nearby-search), Maps JavaScript API
- [Extended Component Library (beta)](https://developers.google.com/maps/documentation/javascript/libraries-open-source#web-components) for the Maps JavaScript API providing the split layout and the Place Overview components.
