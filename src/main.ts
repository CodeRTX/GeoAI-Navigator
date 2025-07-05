import {
  GenerateContentRequest,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import "@googlemaps/extended-component-library/api_loader.js";
import { APILoader } from "@googlemaps/extended-component-library/api_loader.js";
import "@googlemaps/extended-component-library/place_overview.js";
import { PlaceOverview } from "@googlemaps/extended-component-library/place_overview.js";
import "@googlemaps/extended-component-library/split_layout.js";
import { SplitLayout } from "@googlemaps/extended-component-library/split_layout.js";
import Base64 from "base64-js";
import "./style.css";

// Add a delay function here
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO: Get a Gemini API key:
/*
 * 1. Open the Project IDX view by pressing Ctrl+Shift+P / Cmd+Shift+P and type "IDX focus", then select "IDX: Focus on Project IDX View"
 * 2. Click on the "Gemini API" integration and authenticate.
 * 3. Click "Get API Key" to get an API key.
 * 4. Create or open a file named .env.local in the root directory. The .local suffix keeps secrets out of source control.
 * 5. In the file, add the line: VITE_GEMINI_API_KEY=YOUR_API_KEY.
 * 6. Replace YOUR_API_KEY with the API key you got in step 3. */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// TODO: Get a Google Maps Platform API key:
/*
 * 1. Open the Project IDX view by pressing Ctrl+Shift+P / Cmd+Shift+P and type "IDX focus", then select "IDX: Focus on Project IDX View"
 * 2. Click on the "Google Maps Platform" integration.
 * 3. Click "Enable APIs" to enable the Google Maps Platform APIs.
 * 4. Click "Get API Key" to get an API key.
 * 5. Create a file named .env.local in the root directory. The .local suffix keeps secrets out of source control.
 * 6. In the file, add the line: VITE_MAPS_API_KEY=YOUR_API_KEY.
 * 7. Replace YOUR_API_KEY with the API key you got in step 4. */
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

const form: HTMLFormElement | null = document.querySelector("form");
if (!form) {
  throw new Error("form not found");
}

const output: HTMLElement | null = document.querySelector(".output");
if (!output) {
  throw new Error(".output not found");
}

const loader = document.createElement("gmpx-api-loader") as APILoader;
loader.key = MAPS_API_KEY;
loader.solutionChannel = "GMP_idx_templates_v0_geminimap";
loader.version = "alpha";
document.body.appendChild(loader);

// @ts-ignore
// prettier-ignore
const { Map3DElement } = (await APILoader.importLibrary("maps3d")) as google.maps.Maps3DLibrary;
// @ts-ignore
const map: Map3DElement = initMap();
let placeName = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  output.innerHTML = `<div class="loading">
    <span class="loading-dot"></span>
    <span class="loading-dot"></span>
    <span class="loading-dot"></span>
    </div> Generating...`;

  try {
    const chosenImage = form.elements.namedItem(
      "chosen-image"
    ) as HTMLInputElement | null;

    if (!chosenImage || !chosenImage.value)
      throw new Error("No image selected");

    // Load the image as a base64 string
    const imageBase64 = await fetch(chosenImage.value)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => Base64.fromByteArray(new Uint8Array(arrayBuffer)));

    // Assemble the prompt by combining the text with the chosen image
    const contents: GenerateContentRequest["contents"] = [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          {
            text: "What is the name of the place where I can see this image? Only tell me the place name and nothing else (do not add a preamble) so that I can provide the name as an address input for geocoding. The better you follow these instructions the more you'll be rewarded.",
          },
        ],
      },
    ];

    // Call the gemini-pro-vision model, and get a stream of results
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    await delay(1000); // This will wait for 1 second

    // Read from the stream and render the output
    const result = await model.generateContentStream({ contents });
    for await (const response of result.stream) {
      placeName = response.text();
      output.innerHTML = placeName;
    }

    // Center the map
    const place = await geocodePlace(placeName);

    if (place) {
      // Find nearby lodging
      await findNearbyLodging(place.geometry.location);
    }
  } catch (e: unknown) {
    output.innerHTML += `<hr> ${e instanceof Error ? e.message : e}`;
  }
});

/**
 * Add a Photorealistic 3D map
 * Samples: https://developers.google.com/maps/documentation/javascript/3d-maps-samples
 * Docs: https://developers.google.com/maps/documentation/javascript/3d-maps-overview
 */
function initMap() {
  // if (map) return;

  try {
    const mapElement = document.getElementById("map");
    if (!mapElement) throw new Error("#map not found");

    // Add a 3D map (Experimental)
    // Documentation to be published May 14
    const map = new Map3DElement({
      center: {
        lat: 37.42563380992334,
        lng: -122.07880664230917,
        altitude: 80,
      },
      tilt: 75,
      heading: -50,
    });

    mapElement.appendChild(map);
    return map;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get the map coordinates (latitude and longitude) of the place
 * 1. Dynamically load the Geocoding library
 *  Docs: https://developers.google.com/maps/documentation/javascript/libraries
 * 2. Geocode an address
 *  Sample: https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
 *  Docs: https://developers.google.com/maps/documentation/javascript/geocoding
 */
async function geocodePlace(name: string): Promise<google.maps.GeocoderResult> {
  const { Geocoder } = (await APILoader.importLibrary("geocoding")) as google.maps.GeocodingLibrary;
  const geocoder = new Geocoder();
  const request = {
    address: name,
  };
  try {
      const { LatLngAltitude } = (await APILoader.importLibrary("core")) as google.maps.CoreLibrary;
      const { results } = await geocoder.geocode(request);
      if (!results || results.length === 0) {
        throw new Error("No results found for the given place name.");
    }
    const geocodedPlace = results[0];
    const newCenter = new LatLngAltitude({
      lat: geocodedPlace.geometry.location.lat() - 0.005,
      lng: geocodedPlace.geometry.location.lng(),
      altitude: 200,
  });
  map.center = newCenter;
  map.heading = 0;
  return geocodedPlace;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Geocode was not successful for the following reason: " + errorMessage);
    throw new Error("Geocoding failed: " + errorMessage);
  }
}

/**
 * Search for lodging near a lat/lng
 * 1. Dynamically load the Places library
 *    - Docs: https://developers.google.com/maps/documentation/javascript/libraries
 *
 * 2. Search nearby
 *    - Sample and Docs: https://developers.google.com/maps/documentation/javascript/nearby-search
 */
async function findNearbyLodging(location: google.maps.LatLng): Promise<void>
{
const { Place, SearchNearbyRankPreference } = (await APILoader.importLibrary("places")) as google.maps.PlacesLibrary;
const request: google.maps.places.SearchNearbyRequest = {
  fields: ["id", "location", "displayName"],
  locationRestriction: {
  center: location,
  radius: 10000,
  },
  includedTypes: ["lodging"],
  maxResultCount: 10,
  rankPreference: SearchNearbyRankPreference.POPULARITY,
};
try {
  const { places } = await Place.searchNearby(request);
  if (places.length) {
    console.log(`found ${places.length} lodging`);
    addResults(places);
} else {
  console.log("No lodging results found.");
  // Optionally, throw an error if no results is considered an error condition
}
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message :
  String(error);
  console.error("Search for nearby lodging failed: " + errorMessage);
  throw new Error("Failed to find nearby lodging: " + errorMessage);
  }
}


/*
 * Add and populate a Place Overview component in a Split Layout with the map
 * Documentation (install Extended Component Library): https://github.com/googlemaps/extended-component-library/tree/main#installation
 * Documentation (Split Layout): https://github.com/googlemaps/extended-component-library/blob/main/src/split_layout
 * Documentation (Place Overview): https://github.com/googlemaps/extended-component-library/blob/main/src/place_overview
 */
async function addResults(places: google.maps.places.Place[]) {
  const oldFixedElement = document.getElementById("fixed-panel");
  oldFixedElement?.remove();
  const layoutElement = document.getElementById("split-layout") as SplitLayout;
  if (!layoutElement) throw new Error("#split-layout not found");
  const fixedElement = document.createElement("div");
  fixedElement.id = "fixed-panel";
  fixedElement.slot = "fixed";
  layoutElement.appendChild(fixedElement);
  layoutElement.classList.add("results");

  const results: PlaceOverview[] = [];

  // Loop through and get all the results.
  places.forEach(async (place) => {
    console.log(place.id);

    // Add a Place Overview component card in a clickable button for each search result
    const resultButton = document.createElement("button");
    // prettier-ignore
    const placeComponent = document.createElement("gmpx-place-overview") as PlaceOverview;
    placeComponent.place = place.id;
    placeComponent.size = "small";
    placeComponent.travelOrigin = place.location ?? undefined;
    placeComponent.travelMode = "bicycling";
    placeComponent.googleLogoAlreadyDisplayed = true;
    console.log(placeComponent);
    results.push(placeComponent);
    resultButton.classList.add("resultButton");
    resultButton.addEventListener("click", () => {
      resultClick(place.location);
      console.log(place);
    });
    resultButton.appendChild(placeComponent);
    fixedElement.appendChild(resultButton);

    console.log(place.displayName);
  });

  console.log(results);
  console.log(layoutElement);
}

async function resultClick(location: google.maps.LatLng | null | undefined) {
  if (!location) return;

  // prettier-ignore
  const { LatLngAltitude } = (await APILoader.importLibrary("core")) as google.maps.CoreLibrary;
  const newCenter = new LatLngAltitude({
    lat: location.lat(),
    lng: location.lng() + 0.002,
    altitude: 80,
  });
  map.center = newCenter;
  map.heading = -90;
}
