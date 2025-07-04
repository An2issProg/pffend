'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon path issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define a simple location type to avoid passing Leaflet-specific objects
export interface Location {
  lat: number;
  lng: number;
}

const EventfulMap = ({ onLocationSelect, selectedLocation }: { onLocationSelect: (location: Location) => void, selectedLocation: Location | null }) => {
  const map = useMapEvents({
    click(e) {
      // Pass a simple object instead of e.latlng
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation, map.getZoom());
    }
  }, [selectedLocation, map]);

  useEffect(() => {
    // When the map is conditionally rendered (e.g., in an accordion),
    // its container might not have the correct size initially.
    // invalidateSize() tells Leaflet to re-check the container size.
    // A small delay ensures the DOM has updated before invalidating.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  return selectedLocation ? <Marker position={selectedLocation}></Marker> : null;
}


const LocationPicker = ({ onLocationSelect, initialPosition, selectedLocation }: { onLocationSelect: (location: Location) => void, initialPosition?: [number, number], selectedLocation: Location | null }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[200px] w-full bg-gray-200 rounded-xl animate-pulse" />;
  }

  return (
    <MapContainer center={initialPosition || [36.8065, 10.1815]} zoom={13} scrollWheelZoom={false} style={{ height: '200px', width: '100%', borderRadius: '12px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <EventfulMap onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
    </MapContainer>
  );
};

export default LocationPicker;
