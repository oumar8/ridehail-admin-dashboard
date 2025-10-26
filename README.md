# Admin Dashboard

Next.js admin dashboard for the ride-hailing platform.

## Features

### 1. Active Drivers Map 🗺️
- Real-time map view of all online drivers
- Driver status indicators (Available, Busy, Offline)
- Driver list with contact info and vehicle details
- Auto-refresh every 10 seconds

### 2. User Management 👥
- View all registered users
- Search users by name, email, or phone
- Block/unblock users
- Delete users from the platform
- View user statistics (total rides, join date)

### 3. Active Rides 🚗
- Real-time view of all active rides
- See passenger and driver information
- Track ride status (Requested, Accepted, In Progress, etc.)
- View pickup and dropoff locations
- Fare and distance information
- Auto-refresh every 5 seconds

### 4. System Configuration ⚙️
- Configure base fare
- Set driver search radius
- Adjust per-kilometer rate
- Set per-minute rate
- Configure minimum fare
- Preview fare calculations

## Setup

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

```bash
cd admin-dashboard
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Login

Use an admin account to login:
- Email: admin@example.com
- Password: (your admin password)

**Note:** Make sure the user has `role: 'ADMIN'` in the database.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Maps:** Leaflet + React-Leaflet
- **Charts:** Recharts (for future analytics)
- **Icons:** Lucide React
- **HTTP Client:** Axios

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/login`

### Drivers
- `GET /api/v1/admin/drivers` - All drivers
- `GET /api/v1/admin/drivers/active` - Active drivers with locations
- `PATCH /api/v1/admin/drivers/:id/status` - Update driver status

### Users
- `GET /api/v1/admin/users` - All users
- `PATCH /api/v1/admin/users/:id/block` - Block user
- `PATCH /api/v1/admin/users/:id/unblock` - Unblock user
- `DELETE /api/v1/admin/users/:id` - Delete user

### Rides
- `GET /api/v1/admin/rides` - All rides
- `GET /api/v1/admin/rides/active` - Active rides only

### Configuration
- `GET /api/v1/admin/config` - Get configuration
- `PATCH /api/v1/admin/config` - Update configuration

## Security

- JWT-based authentication
- Role-based access control (ADMIN role required)
- Tokens stored in localStorage
- Auto-redirect to login if not authenticated

## Future Enhancements

- Analytics dashboard with charts
- Driver performance metrics
- Revenue tracking
- Real-time notifications
- Export data to CSV
- Advanced filtering and sorting
- Ride dispute management
- Driver approval workflow
# ridehail-admin-dashboard
