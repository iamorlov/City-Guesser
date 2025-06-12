"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GameMapProps {
  onMarkerPlaced: (lat: number, lng: number) => void;
  revealCity?: {
    name: string;
    lat: number;
    lng: number;
  };
  gameOver?: boolean;
}

// Create a single loader instance outside the component
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly'
});

export default function GameMap({ onMarkerPlaced, revealCity, gameOver }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Memoize the marker placement callback
  const handleMarkerPlaced = useCallback((lat: number, lng: number) => {
    onMarkerPlaced(lat, lng);
  }, [onMarkerPlaced]);
  
  // Add click handler as a separate effect
  useEffect(() => {
    // Only add click handler if map is initialized and game is not over
    if (!mapInitialized || gameOver || !googleMapRef.current) return;
    
    console.log("Setting up map click listener");
    
    // Remove any existing click listener
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Add the click listener
    clickListenerRef.current = googleMapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      console.log("Map clicked!", e.latLng?.lat(), e.latLng?.lng());
      const latLng = e.latLng;
      if (!latLng) return;
      
      try {
        // Update existing marker or create a new one
        if (markerRef.current) {
          console.log("Updating existing marker");
          markerRef.current.setPosition(latLng);
        } else {
          console.log("Creating new marker");
          const newMarker = new google.maps.Marker({
            position: latLng,
            map: googleMapRef.current,
            title: 'Your guess',
            draggable: true,
            animation: google.maps.Animation.DROP
          });
          
          markerRef.current = newMarker;
          
          // Add drag listener
          newMarker.addListener('dragend', () => {
            const position = newMarker.getPosition();
            if (position) {
              handleMarkerPlaced(position.lat(), position.lng());
            }
          });
        }
        
        // Notify parent about marker position
        handleMarkerPlaced(latLng.lat(), latLng.lng());
      } catch (error) {
        console.error("Error handling map click:", error);
      }
    });
    
    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [mapInitialized, gameOver, handleMarkerPlaced]);
  
  // Initialize map once and store it in a ref
  useEffect(() => {
    // Skip if already initialized or no map element
    if (mapInitialized || !mapRef.current) return;
    
    const initMap = async () => {
      try {
        console.log("Initializing map...");
        const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
        
        // Create the map instance
        const mapInstance = new Map(mapRef.current!, {
          center: { lat: 20, lng: 0 },
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'administrative.country',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#4a4a4a' }]
            },
            {
              featureType: 'administrative.province',
              elementType: 'geometry.stroke',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        // Store map in ref, not state
        googleMapRef.current = mapInstance;
        setMapInitialized(true);
        console.log("Map initialized successfully");
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };
    
    initMap();
    
  }, [mapInitialized]); // Only depend on mapInitialized
  
  // Handle game over state separately - reveal the correct city
  useEffect(() => {
    if (!gameOver || !revealCity || !googleMapRef.current || !mapInitialized) return;
    
    const showCorrectCity = async () => {
      try {
        console.log("Showing correct city:", revealCity.name);
        
        // Clean up existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        
        const { InfoWindow } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
        
        // Create marker for correct city
        const revealMarker = new google.maps.Marker({
          position: { lat: revealCity.lat, lng: revealCity.lng },
          map: googleMapRef.current!,
          title: revealCity.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4CAF50',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 10
          }
        });
        
        // Add info window
        const infoWindow = new InfoWindow({
          content: `<div class="p-2"><strong>${revealCity.name}</strong></div>`
        });
        
        // Open info window
        infoWindow.open(googleMapRef.current!, revealMarker);
        
        // Center and zoom to correct location
        googleMapRef.current!.setCenter({ lat: revealCity.lat, lng: revealCity.lng });
        googleMapRef.current!.setZoom(6);
      } catch (error) {
        console.error('Error showing correct city:', error);
      }
    };
    
    showCorrectCity();
  }, [gameOver, revealCity, mapInitialized]);
  
  // Reset/cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up map component");
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);
  
  return (
    <div className="w-full h-full overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}