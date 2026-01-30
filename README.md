# 🎯 CSSBattle API

A powerful, serverless API that scrapes [CSSBattle](https://cssbattle.dev) player profiles using **Puppeteer** (browser automation) and returns clean JSON data. Built with Node.js and fully compatible with Vercel for seamless deployment.

**Perfect for:** Developers building tools, dashboards, or apps that need CSSBattle player data integration.

## ✨ Features

- 🚀 **Puppeteer-based web scraping** - Handles JavaScript-rendered content effortlessly
- ⚡ **Serverless Node.js API** - Deploy instantly with Vercel (no server required)
- 📊 **Comprehensive player statistics** - Streaks, rankings, battle stats, daily targets & more
- ✔️ **Input validation & error handling** - Robust error responses with detailed messages
- 💾 **Smart caching** - Cache headers (1 hour) to reduce load and improve performance
- 🔄 **CORS enabled** - Use from any frontend application
- 🏆 **Production-ready** - Battle-tested and deployed with reliability in mind

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ydxj/cssbattle-api.git
cd cssbattle-api

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Server will be available at `http://localhost:3000`

### Deploy to Vercel

```bash
npm run deploy
```

Or connect your GitHub repository to Vercel for automatic deployments on every push.

## 📡 API Usage

### Get Player Profile

Fetch complete player statistics from CSSBattle with a single API call.

**Request:**
```
GET /api/player/[username]
```

**Example:**
```bash
curl https://cssbattle-api.vercel.app/api/player/zerhouni
```

**Response (200 OK):**

```json
{
  "username": "zerhouni",
  "profileUrl": "https://cssbattle.dev/player/zerhouni",
  "streaks": {
    "current": 18,
    "longest": 18
  },
  "battleStats": {
    "globalRank": 6238,
    "targetsPlayed": 36,
    "totalScore": 22960.62
  },
  "dailyTargets": {
    "targetsPlayed": 33,
    "avgMatch": 99.94,
    "avgCharacters": 257
  },
  "versus": {
    "rating": 1200,
    "gamesPlayed": 0,
    "wins": 0
  }
}
```

## Error Responses

**400 - Invalid Username:**
```json
{
  "error": "Invalid username format",
  "message": "Username can only contain letters, numbers, hyphens, and underscores"
}
```

**404 - Player Not Found:**
```json
{
  "error": "Player not found",
  "message": "No player found with username: invalid"
}
```

**500 - Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to scrape profile"
}
```

## 🔧 How It Works

1. **Browser Rendering** - Uses Puppeteer Core + Chromium to render JavaScript-heavy pages
2. **Smart Data Extraction** - DOM queries pull all player statistics accurately
3. **Intelligent Caching** - Responses cached for 1 hour via Cache-Control headers
4. **Input Validation** - Username format validated to prevent errors
5. **Error Handling** - Graceful fallbacks with detailed error messages

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js (ESM)** | JavaScript runtime |
| **Puppeteer Core** | Headless browser automation |
| **@sparticuz/chromium** | Lightweight Chromium for serverless |
| **Vercel** | Serverless deployment platform |

## ⚡ Performance & Optimization

| Metric | Value |
|--------|-------|
| First request | 5-10 seconds (cold start) |
| Cached requests | < 100ms |
| Function timeout | 15 seconds |
| Cache duration | 1 hour (3600s) |

The API optimizes performance through aggressive caching and leverages Vercel's global CDN for fast response times worldwide.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy with one click

3. **Automatic Deployments**
   - Every push triggers automatic deployment
   - Preview URLs for PRs

The `vercel.json` file includes optimized configuration for:
- Function timeout settings
- CORS headers for cross-origin requests
- Output directory configuration

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 💻 Code contributions

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

ISC
