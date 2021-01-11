import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import Leaflet from 'leaflet';
import bbox from '@turf/bbox';
import { lineString, featureCollection } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import { toGeoJSON } from '@mapbox/polyline';
import { colors } from '@entur/tokens';

const DEFAULT_CENTER = [60, 10];

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
    .filter(leg => leg?.pointsOnLink?.points)
    .map(leg =>
      lineString(toGeoJSON(leg.pointsOnLink.points).coordinates, {
        color: getTransportColor(leg.mode)
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
    .flatMap(leg => leg?.line?.quays || [])
    .filter(quay => quay.flexibleArea)
    .map(quay => lineToPolygon(lineString(quay.flexibleArea)));

  const fromPlaceAreas = tripPatterns
    .flatMap(({ legs }) => legs)
    .map(leg => leg?.fromPlace?.flexibleArea)
    .filter(Boolean)
    .map(area => lineToPolygon(lineString(area)));

  return [...quayAreas, ...fromPlaceAreas];
}

function getMapData(responseData) {
  if (!responseData) return;

  return {
    legLines: getLegLines(responseData),
    flexibleAreas: getFlexibleAreas(responseData)
  };
}

function MapContent({ mapData }) {
  const map = useMap();

  const collection = useMemo(() => {
    const { legLines, flexibleAreas } = mapData;
    const allFeatures = [...legLines, ...flexibleAreas];
    return allFeatures.length > 0 ? featureCollection(allFeatures) : null;
  }, [mapData]);

  useEffect(() => {
    if (!collection) return;
    const [minX, minY, maxX, maxY] = bbox(collection);

    const newBounds = Leaflet.latLngBounds(
      {
        lat: minY,
        lng: minX
      },
      {
        lat: maxY,
        lng: maxX
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
      style={feature => ({ color: feature.properties.color })}
    />
  );
}

export default function Map({ response }) {
  const [mapData, setMapData] = useState(getMapData(response));

  useEffect(() => {
    setMapData(getMapData(response));
  }, [response]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={10}
      style={{
        height: '100%',
        width: '100%'
      }}
      zoomControl={false}
      useFlyTo
      boundsOptions={{
        animate: true,
        duration: 2,
        paddingTopLeft: [40, 40],
        paddingBottomRight: [40, 40]
      }}
    >
      <TileLayer
        attribution={
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <MapContent mapData={mapData} />
    </MapContainer>
  );
}
