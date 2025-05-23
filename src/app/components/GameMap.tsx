"use client";

import { useEffect, useRef, useState } from 'react';
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

// Create a single loader instance
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ? ['marker'] : []
});

export default function GameMap({ onMarkerPlaced, revealCity, gameOver }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null>(null);
  const [useAdvancedMarkers, setUseAdvancedMarkers] = useState(!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID);

  // Log at initialization to help debugging
  useEffect(() => {
    console.log("Map ID available:", !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID);
    console.log("Using Advanced Markers:", useAdvancedMarkers);
  }, [useAdvancedMarkers]);

  // Load and initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Import Map library
        const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 20, lng: 0 },
            zoom: 3,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            ...(useAdvancedMarkers ? { mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID } : {}),
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

          setMap(mapInstance);

          // Add click listener only if game is not over
          if (!gameOver) {
            mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
              const latLng = e.latLng;
              if (!latLng) return;

              // If a marker already exists, just update its position instead of creating a new one
              if (marker) {
                // Update existing marker position
                if ('setMap' in marker) {
                  // Standard marker
                  marker.setPosition(latLng);
                } else {
                  // Advanced marker
                  marker.position = latLng;
                }
                
                // Notify parent about the updated position
                onMarkerPlaced(latLng.lat(), latLng.lng());
                return;
              }

              // Otherwise create a new marker (first click only)
              if (useAdvancedMarkers) {
                try {
                  const { AdvancedMarkerElement } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

                  // Create new marker using AdvancedMarkerElement
                  const newMarker = new AdvancedMarkerElement({
                    position: latLng,
                    map: mapInstance,
                    title: 'Your guess',
                    gmpDraggable: true
                  });

                  // Add animation manually
                  const markerElement = newMarker.element as HTMLElement;
                  markerElement.style.transition = 'transform 0.3s ease-out';
                  markerElement.style.transform = 'translateY(-50px)';

                  setTimeout(() => {
                    markerElement.style.transform = 'translateY(0)';
                  }, 10);

                  setMarker(newMarker);

                  // Add drag listener
                  newMarker.addListener('dragend', () => {
                    const position = newMarker.position as google.maps.LatLng;
                    if (position) {
                      onMarkerPlaced(position.lat(), position.lng());
                    }
                  });
                } catch (error) {
                  console.error('Advanced markers failed, falling back to standard markers:', error);
                  setUseAdvancedMarkers(false);

                  // Fallback to standard marker
                  const newMarker = new google.maps.Marker({
                    position: latLng,
                    map: mapInstance,
                    title: 'Your guess',
                    draggable: true,
                    animation: google.maps.Animation.DROP
                  });

                  setMarker(newMarker);

                  // Add drag listener
                  newMarker.addListener('dragend', () => {
                    const position = newMarker.getPosition();
                    if (position) {
                      onMarkerPlaced(position.lat(), position.lng());
                    }
                  });
                }
              } else {
                // Use standard marker
                const newMarker = new google.maps.Marker({
                  position: latLng,
                  map: mapInstance,
                  title: 'Your guess',
                  draggable: true,
                  animation: google.maps.Animation.DROP
                });

                setMarker(newMarker);

                // Add drag listener
                newMarker.addListener('dragend', () => {
                  const position = newMarker.getPosition();
                  if (position) {
                    onMarkerPlaced(position.lat(), position.lng());
                  }
                });
              }

              // Notify parent component about marker position
              onMarkerPlaced(latLng.lat(), latLng.lng());
            });
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      // Cleanup listeners
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
      if (marker) {
        if ('setMap' in marker) {
          marker.setMap(null);
        } else {
          marker.map = null;
        }
      }
    };
  }, [gameOver, onMarkerPlaced]);

  // Handle revealing the correct city when game over
  useEffect(() => {
    const showCorrectCity = async () => {
      if (gameOver && revealCity && map) {
        try {
          // Import InfoWindow
          const { InfoWindow } = await loader.importLibrary('maps') as google.maps.MapsLibrary;

          // Create marker based on available functionality
          let revealMarker;

          if (useAdvancedMarkers) {
            try {
              const { AdvancedMarkerElement } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

              // Create custom pin element
              const pinElement = document.createElement('div');
              pinElement.className = 'correct-city-marker';
              pinElement.innerHTML = `
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <path fill="#4CAF50" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle fill="white" cx="12" cy="9" r="3" />
                </svg>
              `;

              // Create advanced marker
              revealMarker = new AdvancedMarkerElement({
                position: { lat: revealCity.lat, lng: revealCity.lng },
                map: map,
                title: revealCity.name,
                content: pinElement
              });
            } catch (error) {
              console.error('Advanced markers failed, falling back to standard markers:', error);

              // Fallback to standard marker
              revealMarker = new google.maps.Marker({
                position: { lat: revealCity.lat, lng: revealCity.lng },
                map: map,
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
            }
          } else {
            // Use standard marker
            revealMarker = new google.maps.Marker({
              position: { lat: revealCity.lat, lng: revealCity.lng },
              map: map,
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
          }

          // Add info window
          const infoWindow = new InfoWindow({
            content: `<div class="p-2"><strong>${revealCity.name}</strong></div>`
          });

          // Open info window correctly based on marker type
          if ('setMap' in revealMarker) {
            // Standard marker approach
            infoWindow.open(map, revealMarker);
          } else {
            // AdvancedMarkerElement approach
            infoWindow.open({
              map: map,
              anchor: revealMarker as google.maps.marker.AdvancedMarkerElement
            });
          }

          // Center and zoom to correct location
          map.setCenter({ lat: revealCity.lat, lng: revealCity.lng });
          map.setZoom(6);

          return () => {
            if ('setMap' in revealMarker) {
              revealMarker.setMap(null);
            } else {
              revealMarker.map = null;
            }
            infoWindow.close();
          };
        } catch (error) {
          console.error('Error showing correct city:', error);
        }
      }
    };

    showCorrectCity();
  }, [gameOver, revealCity, map, useAdvancedMarkers]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border-2 border-purple-800 shadow-lg">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}