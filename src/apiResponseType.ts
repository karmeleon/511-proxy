export interface APIResponse {
    ServiceDelivery: ServiceDelivery;
}

export interface ServiceDelivery {
    ResponseTimestamp: Date;
    ProducerRef: string;
    Status: boolean;
    StopMonitoringDelivery: StopMonitoringDelivery;
}

export interface StopMonitoringDelivery {
    version: string;
    ResponseTimestamp: Date;
    Status: boolean;
    MonitoredStopVisit: MonitoredStopVisit[];
}

export interface MonitoredStopVisit {
    RecordedAtTime: Date;
    MonitoringRef: string;
    MonitoredVehicleJourney: MonitoredVehicleJourney;
}

export interface MonitoredVehicleJourney {
    LineRef: string;
    DirectionRef: "IB" | "OB" | "N" | "S" | "W" | "E";
    FramedVehicleJourneyRef: FramedVehicleJourneyRef;
    PublishedLineName: string;
    OperatorRef: string;
    OriginRef: string;
    OriginName: string;
    DestinationRef: string;
    DestinationName: string;
    Monitored: boolean;
    InCongestion: null;
    VehicleLocation: VehicleLocation;
    Bearing: string;
    Occupancy: "seatsAvailable" | "standingAvailable" | "full" | null;
    VehicleRef: string;
    MonitoredCall: MonitoredCall;
}

export interface FramedVehicleJourneyRef {
    DataFrameRef: Date;
    DatedVehicleJourneyRef: string;
}

export interface MonitoredCall {
    StopPointRef: string;
    StopPointName: string;
    VehicleLocationAtStop: string;
    VehicleAtStop: string;
    DestinationDisplay: string;
    AimedArrivalTime: Date;
    ExpectedArrivalTime: null;
    AimedDepartureTime: Date;
    ExpectedDepartureTime: Date;
    Distances: string;
}

export interface VehicleLocation {
    Longitude: string;
    Latitude: string;
}
