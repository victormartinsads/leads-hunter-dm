async function printSnippet(handle) {
  const query = encodeURIComponent(`site:instagram.com/${handle}`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('Snippet length:', html.length);
  // Extract snippet text inside result__snippet
  const matches = Array.from(html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g));
  for (const m of matches) {
    console.log('Snippet content:', m[1].replace(/<[^>]+>/g, '').trim());
  }
}

printSnippet('drayasminabrahao');
