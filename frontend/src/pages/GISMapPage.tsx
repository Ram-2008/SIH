import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Info, Landmark } from 'lucide-react';
import { api } from '../services/api';
import type { GISParcel } from '../types';

// Custom Leaflet Pin Icon
const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const GISMapPage: React.FC = () => {
  const [parcels, setParcels] = useState<GISParcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<GISParcel | null>(null);

  const defaultCenter: [number, number] = [16.3350, 80.5050]; // Peddakakani, Guntur, AP

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await api.getGISParcels();
        setParcels(res);
        if (res.length > 0) setSelectedParcel(res[0]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchParcels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner with Disclaimer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900">GIS & Spatial Cadastral Map</h1>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-amber-300">
              Prototype / Sample Spatial Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Spatial geo-referencing engine mapped to ULPIN (Unique Land Parcel Identification Number)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-slate-600 font-medium">Village: <strong>Peddakakani</strong> | Mandal: <strong>Guntur</strong></span>
        </div>
      </div>

      {/* Main Map + Side Details Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View Container */}
        <div className="lg:col-span-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm h-[520px] relative overflow-hidden">
          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow backdrop-blur font-mono border border-slate-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Layer: Cadastral Parcels (EPSG:4326)</span>
          </div>

          <MapContainer
            center={defaultCenter}
            zoom={15}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {parcels.map((parcel) => {
              const coords: [number, number][] = JSON.parse(parcel.coordinates_json);
              const isSelected = selectedParcel?.id === parcel.id;

              return (
                <Polygon
                  key={parcel.id}
                  positions={coords}
                  pathOptions={{
                    color: isSelected ? '#2563EB' : '#059669',
                    fillColor: isSelected ? '#3B82F6' : '#10B981',
                    fillOpacity: isSelected ? 0.6 : 0.35,
                    weight: isSelected ? 3 : 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedParcel(parcel)
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <p className="font-extrabold text-blue-900">{parcel.owner_name}</p>
                      <p>ULPIN: {parcel.ulpin}</p>
                      <p>Khasra: {parcel.khasra_number}</p>
                      <p>Area: {parcel.area} Acres</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {selectedParcel && (
              <Marker position={[selectedParcel.center_lat, selectedParcel.center_lng]} icon={pinIcon} />
            )}
          </MapContainer>
        </div>

        {/* Parcel Details Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                <Landmark className="w-4 h-4 text-blue-600 mr-2" />
                Selected Parcel Attribute
              </h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Geo-Referenced
              </span>
            </div>

            {selectedParcel ? (
              <div className="mt-4 space-y-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ULPIN (14-Digit Pin)</span>
                  <p className="font-mono font-extrabold text-blue-700 text-sm mt-0.5">{selectedParcel.ulpin}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Landowner</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedParcel.owner_name}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Khasra Number</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedParcel.khasra_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Parcel Area</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedParcel.area} Acres</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Land Type</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedParcel.land_type}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Location Hierarchy</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedParcel.village}, {selectedParcel.district} District</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">Click a polygon parcel on the map to inspect spatial attributes</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 font-medium">
            ⚠️ <strong>Spatial Disclaimer:</strong> Cadastral boundary coordinates are for SIH prototype demonstration only and do not constitute legal survey bounds.
          </div>
        </div>
      </div>
    </div>
  );
};
