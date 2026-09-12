const https = require('https');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;

function fetchGoogleResults(searchQuery) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(searchQuery);
    const googleUrl = `https://www.google.com/search?q=${query}&num=10`;
    
    const options = {
      hostname: 'www.google.com',
      path: `/search?q=${query}&num=10`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const results = parseGoogleResults(data);
          resolve(results);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    }).end();
  });
}

function parseGoogleResults(html) {
  const results = {
    organic_results: [],
    search_parameters: { q: '' }
  };

  // Extract organic results
  const resultPattern = /<div class="g">.*?<a href="\/url\?q=([^&]+)&.*?">([^<]+)<\/a>.*?<div[^>]*>([^<]*)<\/div>/gs;
  let match;
  let count = 0;

  // Simple regex parsing - extracts title, link, and snippet
  const linkPattern = /href="\/url\?q=([^&]+)/g;
  const titlePattern = /<h3[^>]*>([^<]+)<\/h3>/g;
  
  let links = [];
  while ((match = linkPattern.exec(html)) && links.length < 10) {
    try {
      links.push(decodeURIComponent(match[1]));
    } catch (e) {}
  }

  // Extract titles and snippets more carefully
  const divSections = html.split('<div class="g">');
  
  for (let i = 1; i < Math.min(divSections.length, 11); i++) {
    const section = divSections[i];
    
    // Extract title
    const titleMatch = section.match(/<h3[^>]*>([^<]+)<\/h3>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract URL
    const urlMatch = section.match(/href="\/url\?q=([^&]+)/);
    const resultUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : '';
    
    // Extract snippet/description
    const snippetMatch = section.match(/VwiC3b[^>]*>([^<]+)</);
    const snippet = snippetMatch ? snippetMatch[1].trim() : '';
    
    if (title && resultUrl) {
      results.organic_results.push({
        title: title,
        link: resultUrl,
        snippet: snippet,
        position: count + 1
      });
      count++;
    }
  }

  return results;
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'Server running' }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === '/api/search' && query.q) {
    try {
      const results = await fetchGoogleResults(query.q);
      res.writeHead(200);
      res.end(JSON.stringify(results));
    } catch (error) {
      console.error('Search error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: 'Search failed', 
        message: error.message 
      }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Search server running on http://localhost:${PORT}`);
});
