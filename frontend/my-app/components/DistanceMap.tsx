"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Car, Clock, Copy, Navigation, X } from "lucide-react";
import { DistanceResponse } from '@/lib/types';

interface DistanceMapProps {
  isOpen: boolean;
  onClose: () => void;
  distanceData: DistanceResponse | null;
  address1: string;
  address2: string;
}

const DistanceMap: React.FC<DistanceMapProps> = ({ isOpen, onClose, distanceData, address1, address2 }) => {
  const [mapMarkers, setMapMarkers] = useState<Array<{
    id: string;
    position: { lat: number; lng: number };
    label: string;
    address: string;
  }>>([]);

  useEffect(() => {
    if (distanceData && distanceData.success) {
      const markers = [];
      
      if (distanceData.coordinates1) {
        markers.push({
          id: 'origin',
          position: { 
            lat: distanceData.coordinates1.latitude, 
            lng: distanceData.coordinates1.longitude 
          },
          label: 'Donor',
          address: address1,
        });
      }
      
      if (distanceData.coordinates2) {
        markers.push({
          id: 'destination',
          position: { 
            lat: distanceData.coordinates2.latitude, 
            lng: distanceData.coordinates2.longitude 
          },
          label: 'Food Bank',
          address: address2,
        });
      }
      
      setMapMarkers(markers);
    } else {
      setMapMarkers([]);
    }
  }, [distanceData, address1, address2]);

  const handleCopyCoordinates = () => {
    if (mapMarkers.length > 0) {
      const coordsText = mapMarkers.map(m => 
        `${m.label}: ${m.position.lat}, ${m.position.lng}`
      ).join('\n');
      
      navigator.clipboard.writeText(coordsText).then(() => {
        alert('Coordinates copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy coordinates');
      });
    }
  };

  const handleOpenInMaps = () => {
    if (mapMarkers.length >= 2) {
      const origin = mapMarkers[0];
      const destination = mapMarkers[1];
      const mapsUrl = `https://www.google.com/maps/dir/${origin.position.lat},${origin.position.lng}/${destination.position.lat},${destination.position.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Distance & Route Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Distance between <strong>Donor</strong> and <strong>Food Bank</strong> locations.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {distanceData && distanceData.success ? (
            <>
              {/* Distance Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Car className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="text-xl font-bold text-blue-800">
                      {distanceData.distance_km} km
                    </p>
                    <p className="text-sm text-blue-600">
                      ({distanceData.distance_miles} miles)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Clock className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Est. Travel Time</p>
                    <p className="text-xl font-bold text-green-800">
                      ~{Math.round(distanceData.distance_km * 1.5)} min
                    </p>
                    <p className="text-sm text-green-600">by car</p>
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Location Coordinates
                </h3>
                
                {mapMarkers.map(marker => (
                  <div key={marker.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{marker.label}</p>
                      <p className="text-sm text-gray-600 mb-2">{marker.address}</p>
                      <p className="text-sm font-mono text-gray-500 bg-white px-2 py-1 rounded border">
                        {marker.position.lat}, {marker.position.lng}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyCoordinates}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" /> 
                    Copy Coordinates
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleOpenInMaps}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" /> 
                    Open in Maps
                  </Button>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Route Visualization</h3>
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      Interactive Map
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Google Maps integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold text-lg">Failed to calculate distance</p>
              <p className="text-gray-600 mt-2">
                Please check addresses and ensure backend is running
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DistanceMap;