// India's marine boundary coordinates (Exclusive Economic Zone - EEZ)
// This represents the approximate 200 nautical mile boundary from India's coastline

export const indiaMarineBoundary: [number, number][] = [
  // West Coast - Starting from Gujarat
  [23.0225, 68.2023], // Gujarat west
  [22.4697, 68.7717], // Gujarat southwest
  [21.6417, 69.0219], // Gujarat-Maharashtra border
  [20.5937, 70.2656], // Maharashtra west
  [19.0760, 71.8777], // Mumbai offshore
  [17.6868, 72.8691], // Goa offshore  
  [15.2993, 73.0133], // Karnataka offshore
  [12.9716, 74.7965], // Mangalore offshore
  [11.2588, 75.7804], // Kerala north offshore
  [9.9312, 76.2673], // Kochi offshore
  [8.5241, 76.9366], // Kerala south offshore
  [8.0883, 77.5518], // Kanyakumari area

  // South - Around Kanyakumari and Sri Lanka waters
  [7.9629, 78.1504], // Southeast tip
  [8.1895, 79.0977], // Tamil Nadu southeast
  [9.0820, 79.8400], // Rameswaram area
  [10.7905, 79.8322], // Tamil Nadu east coast
  [11.4016, 79.8083], // Pondicherry offshore

  // East Coast - Bay of Bengal
  [13.0827, 80.2707], // Chennai offshore
  [15.9129, 80.9320], // Andhra Pradesh offshore
  [17.6868, 82.7047], // Visakhapatnam offshore
  [18.9388, 84.6790], // Odisha offshore
  [20.9517, 86.8025], // Odisha northeast
  [21.9162, 87.8550], // West Bengal offshore

  // Northeast - Bangladesh border area
  [22.1568, 88.9497], // Sunderbans area
  [22.5048, 89.2705], // Bangladesh border waters

  // Andaman & Nicobar Islands waters
  [14.5203, 92.8372], // Andaman Sea west
  [13.0878, 93.9063], // Port Blair area
  [11.5434, 92.6271], // Nicobar islands
  [6.9271, 93.8263],  // Great Nicobar south
  [6.0534, 95.0699],  // Southern boundary

  // Back to mainland via Lakshadweep waters
  [11.2588, 71.6431], // Lakshadweep waters
  [12.2958, 70.7813], // Arabian Sea
  [15.2993, 69.7272], // Arabian Sea north
  [18.5204, 68.9730], // Gujarat waters
  [20.5937, 68.4574], // Back to Gujarat
  [23.0225, 68.2023]  // Closing the boundary
];

export const lakshadweepBoundary: [number, number][] = [
  [10.5667, 71.6431],
  [11.1667, 72.1833], 
  [11.9500, 72.5833],
  [12.2833, 71.8167],
  [11.7500, 71.4333],
  [10.8333, 71.2167],
  [10.5667, 71.6431]
];

export const andamanNicobarBoundary: [number, number][] = [
  [13.6667, 92.7500],
  [14.6667, 93.0000],
  [13.4167, 93.8333],
  [11.5000, 92.7500],
  [7.0000, 93.8333],
  [6.4500, 95.2167],
  [6.9000, 95.8333],
  [8.3000, 94.2500],
  [10.5000, 94.2167],
  [12.8333, 93.5833],
  [14.1667, 92.9167],
  [13.6667, 92.7500]
];