async function fetchExactFollowersFromSearch(handle) {
  const cleanHandle = handle.replace('@', '').trim();
  const query = encodeURIComponent(`site:instagram.com/${cleanHandle}`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const html = await res.text();
    
    // Look for follower strings in snippets
    // e.g., "12,4 mil seguidores", "5.300 seguidores", "15.4K Followers", "6,064 Followers"
    const followerMatch = html.match(/([\d.,]+)\s*(mil|k|m)?\s*(seguidores|followers)/i);
    if (followerMatch) {
      const numStr = followerMatch[1];
      const unit = (followerMatch[2] || '').toLowerCase();
      
      let val = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
      if (unit === 'mil' || unit === 'k') {
        val = val * 1000;
      } else if (unit === 'm') {
        val = val * 1000000;
      }
      return Math.round(val);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

fetchExactFollowersFromSearch('drayasminabrahao').then(cnt => console.log('@drayasminabrahao exact followers:', cnt));
fetchExactFollowersFromSearch('popular').then(cnt => console.log('@popular exact followers:', cnt));
fetchExactFollowersFromSearch('facetas_efeitoporcelana').then(cnt => console.log('@facetas_efeitoporcelana exact followers:', cnt));
