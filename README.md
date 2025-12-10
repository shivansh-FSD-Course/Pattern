# PatternCraft

**Discover mathematical patterns in your data and visualize them in stunning 3D**

PatternCraft is a full-stack web application that analyzes datasets for mathematical patterns (Fibonacci sequences, golden ratios, exponential trends, etc.) and renders them as interactive 3D visualizations using Three.js. Share your discoveries with a community of data enthusiasts, customize your experience with multiple themes, and explore the hidden beauty of mathematics.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181-black.svg)](https://threejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green.svg)](https://www.mongodb.com/)

---

## Features

### Pattern Discovery Engine
- Automatically detects mathematical patterns in CSV datasets
- Identifies Fibonacci sequences, golden ratios, exponential growth, wave patterns
- Analyzes numerical data for statistical properties and relationships

### Three.js 3D Visualization
- Three distinct rendering styles: **Golden Spiral**, **Data Ribbon**, **Candle Spiral**
- Interactive 3D scenes with mouse/touch controls (rotate, zoom, pan)
- Real-time animations with particle effects and dynamic lighting
- Data point labels with custom canvas textures

### NASA API Integration
- Fetch real-time Near-Earth Object (asteroid) data
- Visualize asteroid trajectories, velocities, and sizes in 3D space
- Automatic data transformation with logarithmic scaling

### Community Platform
- Publish and share pattern discoveries
- Like, comment, and discuss patterns with nested comment threads
- @mention users in comments
- Advanced search and filtering by pattern type
- Sort by recent, most liked, or most viewed

### Theme Customization
- Four distinct visual themes: Forest, Sunset, Ocean, Midnight
- Real-time theme switching with CSS custom properties
- Theme persistence across sessions and devices

### Secure Authentication
- JWT-based authentication with bcrypt password hashing
- Protected routes and user authorization
- Profile customization with mathematical symbol avatars

---

## Technology Stack

### Frontend
- **React 19.1.1** - Modern UI with hooks and context
- **Vite 7.1.7** - Lightning-fast build tool
- **Three.js 0.181.2** - WebGL-powered 3D rendering
- **React Router DOM 7.9.5** - Client-side routing
- **Tailwind CSS 3.4.18** - Utility-first styling
- **Framer Motion 12.23.24** - Smooth animations
- **GSAP 3.13.0** - Advanced animation sequences
- **Axios 1.13.2** - HTTP client

### Backend
- **Node.js 20+** - JavaScript runtime
- **Express 4.18.2** - Web application framework
- **MongoDB 8.0** - NoSQL database
- **Mongoose 8.0.0** - MongoDB ODM
- **JWT 9.0.2** - Token-based authentication
- **Bcryptjs 2.4.3** - Password hashing
- **Multer 1.4.5** - File upload handling

### Optional
- **Python 3.8+** with numpy, pandas, scipy for advanced pattern analysis

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shivansh-FSD-Course/Pattern.git
cd Pattern
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Install Python dependencies (optional)
cd python
pip install -r requirements.txt
cd ..

# Create uploads directory
mkdir -p uploads

# Create .env file
touch .env
```

Configure your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/patterncraft
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/patterncraft

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173

# NASA API (optional)
NASA_API_KEY=DEMO_KEY
```

Start the backend:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Create .env file
touch .env
```

Configure your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The application will run on `http://localhost:5173`

### 4. Verify Installation

1. Backend health check: `curl http://localhost:5000/api/health`
2. Open browser to `http://localhost:5173`
3. Create an account and start exploring

---

## Usage

### Analyzing CSV Data

1. Navigate to **My Space** (Dashboard)
2. Upload a CSV file with numerical columns
3. Click **Analyze Pattern**
4. Interact with the 3D visualization:
   - Left-click drag to rotate
   - Scroll to zoom
   - Right-click drag to pan
5. Switch between renderers (Spiral, Ribbon, Rings)
6. Toggle labels to view data points

### Using NASA Data

1. In Dashboard, find **NASA Space Data** section
2. Click **Fetch Asteroid Data**
3. Click **Analyze** to visualize
4. Explore asteroid trajectories in 3D

### Publishing to Community

1. After analyzing a pattern, click **Publish**
2. Add a title and caption
3. Select pattern type
4. Click **Publish to Community**
5. View in Community feed

### Interacting with Community

1. Navigate to **Community**
2. Search and filter patterns by type
3. Like patterns and add comments
4. Use @username to mention others
5. Reply to create nested discussions

---

## Project Structure

```
Pattern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   └── renderers/ # Three.js visualization renderers
│   │   ├── pages/         # Page components
│   │   ├── api/           # Axios configuration
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Authentication, etc.
│   │   └── config/        # Database configuration
│   ├── python/            # Python analysis algorithms
│   │   ├── algorithms/
│   │   └── requirements.txt
│   ├── uploads/           # Temporary file storage
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `GET /api/auth/stats` - Get user statistics (protected)

### Patterns
- `POST /api/patterns/analyze` - Analyze CSV file (protected)
- `POST /api/patterns/publish` - Publish pattern (protected)
- `GET /api/patterns/community` - Get all patterns (public)
- `GET /api/patterns/my-patterns` - Get user's patterns (protected)
- `DELETE /api/patterns/:id` - Delete pattern (protected)
- `POST /api/patterns/:patternId/like` - Like/unlike pattern (protected)

### Comments
- `POST /api/patterns/:patternId/comments` - Add comment (protected)
- `DELETE /api/patterns/:patternId/comments/:commentId` - Delete comment (protected)
- `POST /api/patterns/:patternId/comments/:commentId/like` - Like comment (protected)

### NASA
- `GET /api/patterns/nasa-data/:type` - Fetch NASA data (public)
- `POST /api/patterns/analyze-nasa` - Analyze NASA data (public)

---

## Development

### Frontend Development

```bash
cd client
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
```

### Environment Variables

**Backend (`server/.env`):**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `CLIENT_URL` - Frontend URL for CORS
- `NASA_API_KEY` - NASA API key (optional)

**Frontend (`client/.env`):**
- `VITE_API_URL` - Backend API URL

---

## Deployment

### Frontend (Static Hosting)

Build the production bundle:

```bash
cd client
npm run build
```

Deploy the `dist/` directory to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **AWS S3**: Upload to S3 bucket with static hosting

Configure your hosting to:
- Redirect all routes to `index.html` (SPA routing)
- Set environment variable `VITE_API_URL` to your production backend URL

### Backend (Node.js Hosting)

Deploy to platforms like:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repository
- **AWS EC2**: Use PM2 for process management
- **DigitalOcean**: Deploy with App Platform

Set production environment variables in your hosting platform's dashboard.

### Database

Use **MongoDB Atlas** for production database:
1. Create a cluster at https://www.mongodb.com/cloud/atlas
2. Set up database user and password
3. Whitelist your backend server's IP
4. Use the connection string in `MONGODB_URI`

---

## Browser Compatibility

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- WebGL 2.0 support
- ES6+ JavaScript
- LocalStorage API
- Fetch API

---

## Known Limitations

- Very large datasets (10,000+ rows) may cause performance issues
- Only CSV file format supported
- Pattern types limited to predefined categories
- Mobile 3D interaction less optimal than desktop
- Requires internet connection for all features
- Python analysis algorithms included but not currently integrated

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally: `mongosh`
- For Atlas: Check IP whitelist and connection string
- Verify `MONGODB_URI` in `.env` is correct

### Port Already in Use
- Kill process using port 5000: `lsof -i :5000` then `kill -9 [PID]`
- Or change `PORT` in `server/.env`

### CORS Errors
- Verify `CLIENT_URL` in `server/.env` matches frontend URL
- Restart backend after changing `.env`

### 3D Visualization Not Rendering
- Verify WebGL is enabled: https://get.webgl.org/
- Update graphics drivers
- Try a different browser (Chrome recommended)

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Contributing

This is a course project for Full Stack Development at LUT University. While contributions are welcome, please note this is primarily an academic demonstration.

If you'd like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- **Course**: Full Stack Development, LUT University
- **Author**: Shivansh Singh
- **NASA API**: Data provided by NASA's Near-Earth Object Web Service
- **Three.js**: 3D graphics library by Mr.doob and contributors
- **Open Source Community**: All the amazing libraries that made this possible

---

Version 1.0.0 | December 2025
