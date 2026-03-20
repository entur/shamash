import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import MapGL, { Source, Layer, Marker, NavigationControl, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import bbox from '@turf/bbox';
import { lineString, featureCollection, point } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import { toGeoJSON } from '@mapbox/polyline';
import { colors } from '@entur/tokens';
import type { LngLatBoundsLike } from 'maplibre-gl';

const DEFAULT_CENTER: [number, number] = [10, 60]; // [lng, lat]

function getTransportColor(mode) {
  return colors.transport.default[mode] || colors.transport.default.walk;
}

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
      }),
    );
}

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
    },
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

function getVehiclePositions(responseData) {
  if (!responseData) return [];

  const vehicles = responseData.data?.vehicles;

  if (!vehicles) {
    return [];
  }

  return vehicles
    .map((vehicle, index) => ({
      vehicle,
      index,
      location: vehicle?.location || {
        longitude: vehicle?.lon,
        latitude: vehicle?.lat,
      },
    }))
    .filter(({ location }) => location?.longitude && location?.latitude)
    .map(({ vehicle, index, location }) => {
      const systemName =
        vehicle?.system?.name?.translation?.[0]?.value || 'unknown';
      const vehicleKey = `${systemName}_vehicle_${index}`;

      return point([location.longitude, location.latitude], {
        vehicleKey,
        originalIndex: index,
        systemName,
      });
    });
}

function MapContent({ mapData }) {
  const { current: mapRef } = useMap();
  const cumulativeBoundsRef = useRef<LngLatBoundsLike | null>(null);

  const { lineCollection, polygonCollection, pointFeatures } = useMemo(() => {
    const { legLines, flexibleAreas, serviceJourney, vehiclePositions } =
      mapData;

    const lines = [...legLines, ...serviceJourney];
    const polygons = [...flexibleAreas];
    const points = [...vehiclePositions];

    return {
      lineCollection: lines.length > 0 ? featureCollection(lines) : null,
      polygonCollection:
        polygons.length > 0 ? featureCollection(polygons) : null,
      pointFeatures: points,
    };
  }, [mapData]);

  const allFeatures = useMemo(() => {
    const features = [];
    if (lineCollection) features.push(...lineCollection.features);
    if (polygonCollection) features.push(...polygonCollection.features);
    if (pointFeatures.length > 0) features.push(...pointFeatures);
    return features.length > 0 ? featureCollection(features) : null;
  }, [lineCollection, polygonCollection, pointFeatures]);

  useEffect(() => {
    if (!allFeatures || !mapRef) return;
    const [minX, minY, maxX, maxY] = bbox(allFeatures);

    const newBounds: LngLatBoundsLike = [
      [minX, minY],
      [maxX, maxY],
    ];

    if (!cumulativeBoundsRef.current) {
      cumulativeBoundsRef.current = newBounds;
    } else {
      const prev = cumulativeBoundsRef.current as [[number, number], [number, number]];
      cumulativeBoundsRef.current = [
        [Math.min(prev[0][0], minX), Math.min(prev[0][1], minY)],
        [Math.max(prev[1][0], maxX), Math.max(prev[1][1], maxY)],
      ];
    }

    mapRef.fitBounds(cumulativeBoundsRef.current as [[number, number], [number, number]], {
      padding: 40,
      animate: true,
      duration: 2000,
    });
  }, [mapRef, allFeatures]);

  return (
    <>
      {lineCollection && (
        <Source id="lines" type="geojson" data={lineCollection}>
          <Layer
            id="lines-layer"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 3,
            }}
          />
        </Source>
      )}
      {polygonCollection && (
        <Source id="polygons" type="geojson" data={polygonCollection}>
          <Layer
            id="polygons-layer"
            type="fill"
            paint={{
              'fill-color': '#088',
              'fill-opacity': 0.3,
            }}
          />
          <Layer
            id="polygons-outline"
            type="line"
            paint={{
              'line-color': '#088',
              'line-width': 2,
            }}
          />
        </Source>
      )}
      {pointFeatures.map((feature) => {
        const age = feature.properties?.age || 0;
        const opacity = Math.max(0.1, 1.0 - age * 0.1);
        const [lng, lat] = feature.geometry.coordinates;
        const key = `${feature.properties.vehicleKey}-${age}`;

        return (
          <Marker key={key} longitude={lng} latitude={lat} anchor="bottom">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#e74c3c',
                border: '2px solid white',
                opacity,
              }}
            />
          </Marker>
        );
      })}
    </>
  );
}

export default function MapView({ response }) {
  const [mapData, setMapData] = useState(getMapData(response));
  const [vehicleHistory, setVehicleHistory] = useState(new Map());

  useEffect(() => {
    const newMapData = getMapData(response);

    if (
      newMapData?.vehiclePositions &&
      newMapData.vehiclePositions.length > 0
    ) {
      setVehicleHistory((prevHistory) => {
        const newHistory = new Map(prevHistory);

        newMapData.vehiclePositions.forEach((currentPos) => {
          const vehicleKey = currentPos.properties.vehicleKey;
          const coords = currentPos.geometry.coordinates;
          const existingHistory = newHistory.get(vehicleKey) || [];

          const lastPosition = existingHistory[0];
          const positionChanged =
            !lastPosition ||
            Math.abs(lastPosition[0] - coords[0]) > 0.000001 ||
            Math.abs(lastPosition[1] - coords[1]) > 0.000001;

          if (positionChanged) {
            const updatedHistory = [coords, ...existingHistory].slice(0, 10);
            newHistory.set(vehicleKey, updatedHistory);
          }
        });

        return newHistory;
      });
    }

    setMapData(newMapData);
  }, [response]);

  const enhancedMapData = useMemo(() => {
    if (!mapData) return mapData;

    const historicalPositions = [];

    vehicleHistory.forEach((positions, vehicleKey) => {
      positions.forEach((coords, ageIndex) => {
        historicalPositions.push(
          point(coords, {
            vehicleKey,
            age: ageIndex,
          }),
        );
      });
    });

    return {
      ...mapData,
      vehiclePositions: historicalPositions,
    };
  }, [mapData, vehicleHistory]);

  return (
    <MapGL
      onLoad={(e) => {
        const el = e.target.getContainer().querySelector('.maplibregl-compact-show');
        el?.classList.remove('maplibregl-compact-show');
      }}
      initialViewState={{
        longitude: DEFAULT_CENTER[0],
        latitude: DEFAULT_CENTER[1],
        zoom: 10,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={{
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.osm.org/{z}/{x}/{y}.png', 'https://b.tile.osm.org/{z}/{x}/{y}.png', 'https://c.tile.osm.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      }}
    >
      <NavigationControl position="top-left" showCompass={false} />
      {enhancedMapData && <MapContent mapData={enhancedMapData} />}
    </MapGL>
  );
}
