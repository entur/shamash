import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import Leaflet from 'leaflet';
import bbox from '@turf/bbox';
import { lineString, multiLineString } from '@turf/helpers';
import { decode } from '@mapbox/polyline';
import { colors } from '@entur/tokens';

const DEFAULT_CENTER = [60, 10];

function getTransportColor(mode) {
  return colors.transport.default[mode] || colors.transport.default.walk;
}

function parsePointsOnLink(pointsOnLink) {
  if (!pointsOnLink?.points) return;
  return lineString(decode(pointsOnLink.points));
}

function getMapData(responseData) {
  if (!responseData) return;

  const tripPatterns = responseData.data?.trip?.tripPatterns;

  if (!tripPatterns) {
    return;
  }

  return tripPatterns
    .flatMap(({ legs }) => legs)
    .filter(leg => leg?.pointsOnLink?.points)
    .map(leg => {
      const polyline = parsePointsOnLink(leg.pointsOnLink);

      return { legLine: polyline, color: getTransportColor(leg.mode) };
    });
}

function MapContent({ mapData }) {
  const map = useMap();

  useEffect(() => {
    if (!mapData) {
      return;
    }

    const points = mapData
      .map(({ legLine }) => legLine.geometry.coordinates)
      .filter(Boolean);

    if (!points.length) {
      return;
    }

    const multiLine = multiLineString(points);
    const [minX, minY, maxX, maxY] = bbox(multiLine);

    const newBounds = Leaflet.latLngBounds(
      {
        lat: minX,
        lng: minY
      },
      {
        lat: maxX,
        lng: maxY
      }
    );

    map.fitBounds(newBounds);
  }, [map, mapData]);

  return (mapData || []).map(({ color, legLine }, index) => (
    <Polyline
      key={index}
      color={color}
      positions={legLine.geometry.coordinates}
    />
  ));
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
