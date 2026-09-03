async function printRawSnippet(handle) {
  const query = encodeURIComponent(`site:instagram.com/${handle}`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  // Strip tags and find followers
  const text = html.replace(/<[^>]+>/g, ' ');
  console.log(text.substring(0, 1500));
}

printRawSnippet('drayasminabrahao');
