"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function ExMap() {
  return (
    <div className="bg-gray p-4 w-full h-full">
        <APIProvider
          apiKey={"AIzaSyAAfXxrhCn1VPkH0-HjeTtQIxdle296ux0"}
          onLoad={() => console.log("Maps API has loaded.")}
        >
          <Map
            className="w-full h-full"
            defaultCenter={{ lat: 22.54992, lng: 0 }}
            defaultZoom={3}
            gestureHandling="greedy"
            disableDefaultUI
          ></Map>
        </APIProvider>
    </div>
  );
}
