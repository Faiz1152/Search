exports.handler = async (event) => {
  const https = require('https');
  const query = event.queryStringParameters?.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing query parameter' })
    };
  }

  try {
    const results = await fetchGoogleResults(query);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Search failed', message: error.message })
    };
  }
};

function fetchGoogleResults(searchQuery) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const query = encodeURIComponent(searchQuery);
    
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
    }).on('error', reject).end();
  });
}

function parseGoogleResults(html) {
  const results = {
    organic_results: []
  };

  const divSections = html.split('<div class="g">');
  
  for (let i = 1; i < Math.min(divSections.length, 11); i++) {
    const section = divSections[i];
    
    const titleMatch = section.match(/<h3[^>]*>([^<]+)<\/h3>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const urlMatch = section.match(/href="\/url\?q=([^&]+)/);
    const resultUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : '';
    
    const snippetMatch = section.match(/VwiC3b[^>]*>([^<]+)</);
    const snippet = snippetMatch ? snippetMatch[1].trim() : '';
    
    if (title && resultUrl) {
      results.organic_results.push({
        title: title,
        link: resultUrl,
        snippet: snippet,
        position: results.organic_results.length + 1
      });
    }
  }

  return results;
}
