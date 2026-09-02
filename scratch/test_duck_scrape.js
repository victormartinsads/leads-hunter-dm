async function searchInstagramProfiles(keyword, limit = 20) {
  const query = encodeURIComponent(`site:instagram.com "${keyword.replace('#', '')}" "whatsapp"`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  console.log(`Searching real Instagram profiles for: "${keyword}"...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const html = await res.text();
  
  // Extract instagram.com/@handle or instagram.com/handle links
  const matches = Array.from(html.matchAll(/instagram\.com\/([a-zA-Z0-9_.]+)\/?/g));
  const handles = new Set();

  const ignored = ['p', 'explore', 'reels', 'stories', 'accounts', 'about', 'legal', 'directory', 'developer'];

  for (const m of matches) {
    const handle = m[1].toLowerCase().replace('@', '');
    if (!ignored.includes(handle) && handle.length > 2 && !handle.includes('.com')) {
      handles.add('@' + handle);
    }
  }

  console.log(`Extracted ${handles.size} real Instagram handles:`, Array.from(handles).slice(0, limit));
}

searchInstagramProfiles('facetas em resina');
