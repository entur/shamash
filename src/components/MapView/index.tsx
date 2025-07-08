import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import Leaflet, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import bbox from '@turf/bbox';
import { lineString, featureCollection, point } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import { toGeoJSON } from '@mapbox/polyline';
import { colors } from '@entur/tokens';

const DEFAULT_CENTER: LatLngTuple = [60, 10];

function getTransportColor(mode) {
  return colors.transport.default[mode] || colors.transport.default.walk;
}

// Returns an array of LineString GeoJSON features
function getLegLines(responseData) {
  if (!responseData) return;

  const tripPatterns = responseData.data?.trip?.tripPatterns;

  if (!tripPatterns) {
    return [];
  }

  return tripPatterns
    .flatMap(({ legs }) => legs)
    .filter((leg) => leg?.pointsOnLink?.points)
    .map((leg) =>
      lineString(toGeoJSON(leg.pointsOnLink.points).coordinates, {
        color: getTransportColor(leg.mode),
      })
    );
}

// Returns an array of Polygon GeoJSON features
function getFlexibleAreas(responseData) {
  if (!responseData) return;

  const tripPatterns = responseData.data?.trip?.tripPatterns;

  if (!tripPatterns) {
    return [];
  }

  const quayAreas = tripPatterns
    .flatMap(({ legs }) => legs)
    .flatMap((leg) => leg?.line?.quays || [])
    .filter((quay) => quay.flexibleArea)
    .map((quay) => lineToPolygon(lineString(quay.flexibleArea)));

  const fromPlaceAreas = tripPatterns
    .flatMap(({ legs }) => legs)
    .map((leg) => leg?.fromPlace?.flexibleArea)
    .filter(Boolean)
    .map((area) => lineToPolygon(lineString(area)));

  return [...quayAreas, ...fromPlaceAreas];
}

// Returns an array of LineString GeoJSON features
function getServiceJourneyLines(responseData) {
  if (!responseData) return;

  const serviceJourney = responseData.data?.serviceJourney;

  if (!serviceJourney?.pointsOnLink?.points) {
    return [];
  }

  const polyline = lineString(
    toGeoJSON(serviceJourney.pointsOnLink.points).coordinates,
    {
      color: getTransportColor(serviceJourney.transportMode),
    }
  );

  return [polyline];
}

function getMapData(responseData) {
  if (!responseData) return;

  return {
    legLines: getLegLines(responseData),
    flexibleAreas: getFlexibleAreas(responseData),
    serviceJourney: getServiceJourneyLines(responseData),
    vehiclePositions: getVehiclePositions(responseData),
  };
}

// Returns an array of points
function getVehiclePositions(responseData) {
  if (!responseData) return;

  const vehicles = responseData.data?.vehicles;

  if (!vehicles) {
    return [];
  }

  return vehicles
    .map((vehicle) => vehicle?.location)
    .filter(Boolean)
    .map((location) => point([location.longitude, location.latitude]));
}

function MapContent({ mapData }) {
  const map = useMap();

  const collection = useMemo(() => {
    const { legLines, flexibleAreas, serviceJourney, vehiclePositions } =
      mapData;
    const allFeatures = [
      ...legLines,
      ...flexibleAreas,
      ...serviceJourney,
      ...vehiclePositions,
    ];
    return allFeatures.length > 0 ? featureCollection(allFeatures) : null;
  }, [mapData]);

  useEffect(() => {
    if (!collection) return;
    const [minX, minY, maxX, maxY] = bbox(collection);

    const newBounds = Leaflet.latLngBounds(
      {
        lat: minY,
        lng: minX,
      },
      {
        lat: maxY,
        lng: maxX,
      }
    );

    map.fitBounds(newBounds);
  }, [map, collection]);

  if (!collection) {
    return null;
  }

  return (
    <GeoJSON
      data={collection}
      style={(feature) => ({ color: feature.properties.color })}
    />
  );
}

function ZoomControls() {
  const map = useMap();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <button
        aria-label="Zoom in"
        style={{
          width: 36,
          height: 36,
          fontSize: 22,
          borderRadius: '50%',
          border: '1px solid #ccc',
          background: 'white',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
        onClick={() => map.setZoom(map.getZoom() + 1)}
      >
        +
      </button>
      <button
        aria-label="Zoom out"
        style={{
          width: 36,
          height: 36,
          fontSize: 22,
          borderRadius: '50%',
          border: '1px solid #ccc',
          background: 'white',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
        onClick={() => map.setZoom(map.getZoom() - 1)}
      >
        –
      </button>
    </div>
  );
}

export default function MapView({ response }) {
  const [mapData, setMapData] = useState(getMapData(response));

  useEffect(() => {
    setMapData(getMapData(response));
  }, [response]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={10}
      style={{
        width: '100%',
        height: '100%',
      }}
      zoomControl={false}
      boundsOptions={{
        animate: true,
        duration: 2,
        paddingTopLeft: [40, 40],
        paddingBottomRight: [40, 40],
      }}
    >
      <TileLayer
        attribution={
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <ZoomControls />
      <MapContent mapData={mapData} />
    </MapContainer>
  );
}
