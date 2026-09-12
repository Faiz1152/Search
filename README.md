# Google Search App

A beautiful, modern search engine that fetches results directly from Google.

## Features
- 🎨 Beautiful dark/light theme support
- 🚀 Fully automated - no manual backend required
- 🔍 Direct Google search results
- 📱 Responsive mobile-friendly design
- ⚡ Instant deployment to Netlify

## Deploy to Netlify

1. Connect this repo to Netlify
2. Netlify automatically detects the serverless functions
3. Click Deploy
4. Done! The search engine works automatically

No API keys, no manual server setup needed!

## How it works

- **Frontend**: `index.html` - Beautiful search interface
- **Backend**: `functions/search.js` - Netlify Function that scrapes Google results
- The backend runs automatically on Netlify (no manual setup)

## Development

For local testing:

```bash
npm install
npm run dev  # Start Netlify dev server
```

Then open `http://localhost:3000` in your browser.
