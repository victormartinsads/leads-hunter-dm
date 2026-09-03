async function fetchRealFollowerCount(handle) {
  const cleanHandle = handle.replace('@', '').trim();
  const url = `https://www.instagram.com/${cleanHandle}/`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await res.text();

    // Check og:description meta tag
    const metaMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    if (metaMatch) {
      const content = metaMatch[1];
      console.log(`[${cleanHandle}] Meta Description: "${content}"`);

      // Parse followers: "6,064 Followers", "15.4k Followers", "5.300 seguidores"
      const followersMatch = content.match(/([\d.,KkMm]+)\s*(?:Followers|seguidores)/i);
      if (followersMatch) {
        let rawNum = followersMatch[1].toUpperCase();
        let multiplier = 1;
        if (rawNum.endsWith('K')) {
          multiplier = 1000;
          rawNum = rawNum.replace('K', '');
        } else if (rawNum.endsWith('M')) {
          multiplier = 1000000;
          rawNum = rawNum.replace('M', '');
        }
        
        // Handle Brazilian formatting "5.300" -> 5300 or US "5,300" -> 5300
        const parsedNumber = parseFloat(rawNum.replace(/\./g, '').replace(',', '.')) * multiplier;
        return Math.round(parsedNumber);
      }
    }
  } catch (err) {
    console.error(`Error fetching followers for ${cleanHandle}:`, err.message);
  }

  return null;
}

fetchRealFollowerCount('popular').then(count => console.log('Parsed followers for @popular:', count));
fetchRealFollowerCount('drayasminabrahao').then(count => console.log('Parsed followers for @drayasminabrahao:', count));
