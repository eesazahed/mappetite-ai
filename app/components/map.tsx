"use client"

import React from 'react';
import {createRoot} from 'react-dom/client';
import {APIProvider, Map} from '@vis.gl/react-google-maps';

export default function ExMap() {
  return (
    <div className="bg-gray p-4">
      <div>
        <APIProvider apiKey={'AIzaSyAAfXxrhCn1VPkH0-HjeTtQIxdle296ux0'} 
        onLoad={() => console.log('Maps API has loaded.')}> 
          <h1>Hello, world!</h1> 
          <Map
            style={{width: '100vw', height: '100vh'}}
            defaultCenter={{lat: 22.54992, lng: 0}}
            defaultZoom={3}
            gestureHandling='greedy'
            disableDefaultUI
          >

          </Map>
        </APIProvider>
      </div>
    </div>
  );
}