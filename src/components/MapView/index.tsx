import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import Leaflet, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import bbox from '@turf/bbox';
import { lineString, featureCollection, point } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import { toGeoJSON } from '@mapbox/polyline';
import { colors } from '@entur/tokens';

delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    'leaflet/dist/images/marker-icon-2x.png',
    import.meta.url
  ).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url)
    .href,
});

const DEFAULT_CENTER: LatLngTuple = [60, 10];

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
      })
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
  const map = useMap();
  const cumulativeBoundsRef = useRef(null);

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

  const collectionKey = useMemo(() => {
    if (!collection) return 'empty';

    const vehiclePoints = collection.features
      .filter((feature) => feature.geometry.type === 'Point')
      .map((feature) => {
        const pointGeometry = feature.geometry as any;
        return `${pointGeometry.coordinates[0]},${
          pointGeometry.coordinates[1]
        }-${feature.properties?.markerType || 'default'}`;
      })
      .join('|');

    return `${collection.features.length}-${vehiclePoints}`;
  }, [collection]);

  const pointToLayer = useCallback((feature, latlng) => {
    const age = feature.properties?.age || 0;
    const opacity = Math.max(0.1, 1.0 - age * 0.1);

    const customIcon = new Leaflet.Icon({
      iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url)
        .href,
      shadowUrl: new URL(
        'leaflet/dist/images/marker-shadow.png',
        import.meta.url
      ).href,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: `marker-age-${age}`,
    });

    const marker = Leaflet.marker(latlng, { icon: customIcon });
    marker.setOpacity(opacity);

    return marker;
  }, []);

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

    if (!cumulativeBoundsRef.current) {
      cumulativeBoundsRef.current = newBounds;
    } else {
      cumulativeBoundsRef.current.extend(newBounds);
    }

    map.fitBounds(cumulativeBoundsRef.current);
  }, [map, collection]);

  if (!collection) {
    return null;
  }

  return (
    <GeoJSON
      key={collectionKey}
      data={collection}
      style={(feature) => ({ color: feature.properties.color })}
      pointToLayer={pointToLayer}
    />
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
          })
        );
      });
    });

    return {
      ...mapData,
      vehiclePositions: historicalPositions,
    };
  }, [mapData, vehicleHistory]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={10}
      style={{
        width: '100%',
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
      <MapContent mapData={enhancedMapData} />
    </MapContainer>
  );
}
