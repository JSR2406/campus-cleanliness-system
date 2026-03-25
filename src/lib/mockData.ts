export const MOCK_COMPLAINTS = [
  {
    id: 1,
    description: "Overflowing dustbin near Block A entrance",
    location: "Block A",
    status: "Pending",
    priority: "HIGH",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    image_url: "https://picsum.photos/seed/dustbin/800/600",
    User: { name: "John Doe", email: "john@example.com" },
    Assignment: null,
    Feedback: null
  },
  {
    id: 2,
    description: "Water leakage in 2nd floor washroom",
    location: "Block B",
    status: "In Progress",
    priority: "HIGH",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    image_url: "https://picsum.photos/seed/leak/800/600",
    User: { name: "Jane Smith", email: "jane@example.com" },
    Assignment: { staff: { name: "Mike Ross" } },
    Feedback: null
  },
  {
    id: 3,
    description: "Littering in the central garden area",
    location: "Central Garden",
    status: "Completed",
    priority: "LOW",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    image_url: "https://picsum.photos/seed/garden/800/600",
    User: { name: "Alice Brown", email: "alice@example.com" },
    Assignment: { staff: { name: "Harvey Specter" } },
    Feedback: { rating: 5, comment: "Great job, very quick!" }
  },
  {
    id: 4,
    description: "Broken window pane in Room 302",
    location: "Hostel 1",
    status: "Completed",
    priority: "MEDIUM",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    image_url: "https://picsum.photos/seed/window/800/600",
    User: { name: "Bob Wilson", email: "bob@example.com" },
    Assignment: { staff: { name: "Donna Paulsen" } },
    Feedback: { rating: 4, comment: "Good work, thanks." }
  },
  {
    id: 5,
    description: "AC not working in Main Library",
    location: "Library",
    status: "Pending",
    priority: "HIGH",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    image_url: "https://picsum.photos/seed/ac/800/600",
    User: { name: "Sam Williams", email: "sam@example.com" },
    Assignment: null,
    Feedback: null
  },
  {
    id: 6,
    description: "Flickering lights in Corridor C",
    location: "Block C",
    status: "Assigned",
    priority: "LOW",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    image_url: "https://picsum.photos/seed/light/800/600",
    User: { name: "Lucy Chen", email: "lucy@example.com" },
    Assignment: { staff: { name: "Mike Ross" } },
    Feedback: null
  },
  {
    id: 7,
    description: "Spilled coffee near cafeteria entrance",
    location: "Cafeteria",
    status: "In Progress",
    priority: "MEDIUM",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    image_url: "https://picsum.photos/seed/coffee/800/600",
    User: { name: "Tom Hardy", email: "tom@example.com" },
    Assignment: { staff: { name: "Rachel Zane" } },
    Feedback: null
  },
  {
    id: 8,
    description: "Dirty tables in the designated study area",
    location: "Library",
    status: "Completed",
    priority: "LOW",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    image_url: "https://picsum.photos/seed/table/800/600",
    User: { name: "Emma Stone", email: "emma@example.com" },
    Assignment: { staff: { name: "Harvey Specter" } },
    Feedback: { rating: 5, comment: "Cleaned perfectly!" }
  }
];

export const MOCK_STAFF = [
  { id: 101, name: "Mike Ross", email: "mike@campus.com" },
  { id: 102, name: "Harvey Specter", email: "harvey@campus.com" },
  { id: 103, name: "Donna Paulsen", email: "donna@campus.com" },
  { id: 104, name: "Rachel Zane", email: "rachel@campus.com" }
];

export const MOCK_ANALYTICS = {
  total: 8,
  completed: 3,
  byLocation: {
    "Block A": 1,
    "Block B": 1,
    "Block C": 1,
    "Hostel 1": 1,
    "Central Garden": 1,
    "Library": 2,
    "Cafeteria": 1
  },
  byStatus: {
    "Pending": 2,
    "Assigned": 1,
    "In Progress": 2,
    "Completed": 3
  },
  avgSLA_hours: "6.0",
  avgRating: "4.7",
  totalFeedback: 3,
  heatmapData: [
    { location: "Block A", count: 1 },
    { location: "Block B", count: 1 },
    { location: "Block C", count: 1 },
    { location: "Hostel 1", count: 1 },
    { location: "Central Garden", count: 1 },
    { location: "Library", count: 2 },
    { location: "Cafeteria", count: 1 }
  ]
};
