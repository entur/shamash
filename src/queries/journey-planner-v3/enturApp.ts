import { toISOStringWithTimezone } from '../../utils/time';

const query = {
  query: `
query (
  $numTripPatterns: Int,
  $from: Location!,
  $to: Location!,
  $dateTime: DateTime!,
  $arriveBy: Boolean!,
  $wheelchairAccessible: Boolean!,
  $modes: Modes!,
  $walkSpeed: Float,
  $minimumTransferTime: Int,
  $banned: InputBanned,
  $whiteListed: InputWhiteListed,
  $debugItineraryFilter: Boolean,
  $searchWindow: Int,
) {
  trip(
      numTripPatterns: $numTripPatterns,
      from: $from,
      to: $to,
      dateTime: $dateTime,
      arriveBy: $arriveBy,
      wheelchairAccessible: $wheelchairAccessible,
      modes: $modes,
      walkSpeed: $walkSpeed,
      transferSlack: $minimumTransferTime,
      banned: $banned,
      whiteListed: $whiteListed,
      debugItineraryFilter: $debugItineraryFilter,
      searchWindow: $searchWindow
  ) {
      metadata {
          searchWindowUsed
          nextDateTime
          prevDateTime
      }
      routingErrors {
          inputField
          description
          code
      }
      tripPatterns {
          generalizedCost
          startTime
          endTime
          expectedStartTime
          expectedEndTime
          directDuration
          duration
          distance
          walkDistance
          systemNotices {
              tag
              text
          }
          legs {
              generalizedCost
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

  bookingArrangements {
      ...bookingArrangementFields
  }
}

fragment bookingArrangementFields on BookingArrangement {
  bookingMethods
  bookingNote
  latestBookingTime
  minimumBookingPeriod
  bookWhen
  bookingContact {
      phone
      url
  }
}

fragment lineFields on Line {
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
}

fragment interchangeFields on Interchange {
  guaranteed
  staySeated
  maximumWaitTime
  fromServiceJourney {
      id
  }
  toServiceJourney {
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
}
`.trim(),
  variables: {
    walkSpeed: 1.3,
    minimumTransferTime: 120,
    from: {
      name: 'Oslo S, Oslo',
      place: 'NSR:StopPlace:59872',
    },
    to: {
      name: 'Kjelsås, Oslo',
      place: 'NSR:StopPlace:59648',
    },
    dateTime: toISOStringWithTimezone(new Date()),
    arriveBy: false,
    modes: {
      accessMode: 'foot',
      egressMode: 'foot',
      transportModes: [
        { transportMode: 'bus' },
        { transportMode: 'coach' },
        { transportMode: 'tram' },
        { transportMode: 'rail' },
        { transportMode: 'metro' },
        { transportMode: 'water' },
        { transportMode: 'air' },
        { transportMode: 'lift' },
      ],
    },
    wheelchairAccessible: false,
    numTripPatterns: 5,
  },
};

export default query;
