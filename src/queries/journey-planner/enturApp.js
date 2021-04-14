import { toISOStringWithTimezone } from '../../utils/time';

const query = {
  query: `
query ($numTripPatterns: Int!, $from: Location!, $to: Location!, $dateTime: DateTime!, $arriveBy: Boolean!, $wheelchair: Boolean!, $modes: [Mode]!, $transportSubmodes: [TransportSubmodeFilter], $maxPreTransitWalkDistance: Float, $walkSpeed: Float, $minimumTransferTime: Int, $allowBikeRental: Boolean, $useFlex: Boolean, $banned: InputBanned, $whiteListed: InputWhiteListed) {
  trip(
    numTripPatterns: $numTripPatterns,
    from: $from,
    to: $to,
    dateTime: $dateTime,
    arriveBy: $arriveBy,
    wheelchair: $wheelchair,
    modes: $modes,
    transportSubmodes: $transportSubmodes,
    maxPreTransitWalkDistance: $maxPreTransitWalkDistance,
    walkSpeed: $walkSpeed,
    minimumTransferTime: $minimumTransferTime,
    allowBikeRental: $allowBikeRental,
    useFlex: $useFlex,
    banned: $banned,
    whiteListed: $whiteListed
  ) {
    tripPatterns {
      expectedStartTime
      expectedEndTime
      directDuration
      duration
      distance
      walkDistance
      legs {
        ...legFields
      }
    }
  }
}

fragment legFields on Leg {
  aimedEndTime
  aimedStartTime
  authority {
    ...authorityFields
  }
  distance
  directDuration
  duration
  expectedEndTime
  expectedStartTime
  fromEstimatedCall {
    ...estimatedCallFields
  }
  fromPlace {
    ...placeFields
  }
  interchangeFrom {
    ...interchangeFields
  }
  interchangeTo {
    ...interchangeFields
  }
  intermediateEstimatedCalls {
    ...estimatedCallFields
  }
  line {
    ...lineFields
  }
  mode
  operator {
    ...operatorFields
  }
  pointsOnLink {
    ...pointsOnLinkFields
  }
  realtime
  ride
  rentedBike
  serviceJourney {
    ...serviceJourneyFields
  }
  situations {
    ...situationFields
  }
  toEstimatedCall {
    ...estimatedCallFields
  }
  toPlace {
    ...placeFields
  }
  transportSubmode
}

fragment lineFields on Line {
  bookingArrangements {
    ...bookingArrangementFields
  }
  description
  flexibleLineType
  id
  name
  notices {
    ...noticeFields
  }
  publicCode
  transportMode
  transportSubmode
}

fragment bookingArrangementFields on BookingArrangement {
  bookingMethods
  bookingNote
  minimumBookingPeriod
  bookingContact {
    phone
    url
  }
}

fragment noticeFields on Notice {
  text
}

fragment placeFields on Place {
  name
  latitude
  longitude
  quay {
    ...quayFields
  }
  bikeRentalStation {
    ...bikeRentalStationFields
  }
}

fragment quayFields on Quay {
  id
  name
  description
  publicCode
  situations {
    ...situationFields
  }
  stopPlace {
    ...stopPlaceFields
  }
}

fragment situationFields on PtSituationElement {
  situationNumber
  summary {
    language
    value
  }
  description {
    language
    value
  }
  advice {
    language
    value
  }
  lines {
    ...lineFields
  }
  validityPeriod {
    startTime
    endTime
  }
  reportType
  infoLinks {
    uri
    label
  }
}

fragment stopPlaceFields on StopPlace {
  id
  description
  name
  latitude
  longitude
  tariffZones {
    id
  }
}

fragment bikeRentalStationFields on BikeRentalStation {
  id
  name
  networks
  bikesAvailable
  spacesAvailable
  longitude
  latitude
}

fragment authorityFields on Authority {
  id
  name
  url
}

fragment operatorFields on Operator {
  id
  name
  url
}

fragment serviceJourneyFields on ServiceJourney {
  id
  journeyPattern {
    line {
      ...lineFields
    }
    notices {
      ...noticeFields
    }
  }
  notices {
    ...noticeFields
  }
  publicCode
  privateCode
  transportSubmode
}

fragment interchangeFields on Interchange {
  guaranteed
  staySeated
  FromServiceJourney {
    id
  }
  ToServiceJourney {
    id
  }
}

fragment pointsOnLinkFields on PointsOnLink {
  points
  length
}

fragment estimatedCallFields on EstimatedCall {
  actualArrivalTime
  actualDepartureTime
  aimedArrivalTime
  aimedDepartureTime
  cancellation
  date
  destinationDisplay {
    frontText
  }
  expectedDepartureTime
  expectedArrivalTime
  forAlighting
  forBoarding
  notices {
    ...noticeFields
  }
  predictionInaccurate
  quay {
    ...quayFields
  }
  realtime
  requestStop
  serviceJourney {
    ...serviceJourneyFields
  }
  situations {
    ...situationFields
  }
}
`.trim(),
  variables: {
    walkSpeed: 1.3,
    minimumTransferTime: 120,
    useFlex: false,
    maxPreTransitWalkDistance: 2000,
    from: {
      name: 'Oslo S, Oslo',
      place: 'NSR:StopPlace:59872'
    },
    to: {
      name: 'Kjelsås, Oslo',
      place: 'NSR:StopPlace:59648'
    },
    dateTime: toISOStringWithTimezone(new Date()),
    arriveBy: false,
    modes: ['foot', 'coach', 'bus', 'tram', 'rail', 'metro', 'water'],
    transportSubmodes: [],
    wheelchair: false,
    numTripPatterns: 5
  }
};

export default query;
