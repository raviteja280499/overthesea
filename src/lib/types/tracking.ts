export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
}

export interface TrackingResult {
  awb: string;
  status: string;
  bookedOn: string;
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  consignee: string;
  shipper: string;
  service: string;
  carrier: string;
  carrierAwb: string;
  weight: string;
  deliveredOn: string;
  receiverName: string;
  expectedDelivery: string;
  events: TrackingEvent[];
}
