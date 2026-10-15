const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'movies');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const postersList = [
  {
    key: 'leo',
    fileName: 'leo-poster.jpg',
    wikiFile: 'File:Leo_(2023_Indian_film).jpg',
    title: 'Leo',
  },
  {
    key: 'jailer',
    fileName: 'jailer-poster.jpg',
    wikiFile: 'File:Jailer_2023_Tamil_film_poster.jpg',
    title: 'Jailer',
  },
  {
    key: 'vikram',
    fileName: 'vikram-poster.jpg',
    wikiFile: 'File:Vikram_2022_poster.jpg',
    title: 'Vikram',
  },
  {
    key: 'master',
    fileName: 'master-poster.jpg',
    wikiFile: 'File:Master_2021_poster.jpg',
    title: 'Master',
  },
  {
    key: 'amaran',
    fileName: 'amaran-poster.jpg',
    wikiFile: 'File:Amaran_2024_poster.jpg',
    title: 'Amaran',
  },
  {
    key: 'maharaja',
    fileName: 'maharaja-poster.jpg',
    wikiFile: 'File:Maharaja_2024_film_poster.jpg',
    title: 'Maharaja',
  },
  {
    key: 'ps1',
    fileName: 'ponniyin-selvan-1-poster.jpg',
    wikiFile: 'File:Ponniyin_Selvan_I.jpg',
    title: 'Ponniyin Selvan: Part I',
  },
  {
    key: 'ps2',
    fileName: 'ponniyin-selvan-2-poster.jpg',
    wikiFile: 'File:Ponniyin_Selvan_II.jpg',
    title: 'Ponniyin Selvan: Part II',
  },
  {
    key: 'dragon',
    fileName: 'dragon-poster.jpg',
    wikiFile: 'File:Dragon_2025_poster.jpg',
    title: 'Dragon',
  },
  {
    key: 'retro',
    fileName: 'retro-poster.jpg',
    wikiFile: 'File:Retro_film_poster.jpg',
    title: 'Retro',
  },
  {
    key: 'good_bad_ugly',
    fileName: 'good-bad-ugly-poster.jpg',
    wikiFile: 'File:Good_Bad_Ugly_poster.jpg',
    title: 'Good Bad Ugly',
  },
  {
    key: 'viduthalai',
    fileName: 'viduthalai-poster.jpg',
    wikiFile: 'File:Viduthalai_Part_1.jpg',
    title: 'Viduthalai: Part 1',
  },
  {
    key: 'kalki',
    fileName: 'kalki-2898-ad-poster.jpg',
    wikiFile: 'File:Kalki_2898_AD.jpg',
    title: 'Kalki 2898 AD',
  },
];

async function getWikiImageUrl(wikiFile) {
  return new Promise((resolve) => {
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&titles=' +
      encodeURIComponent(wikiFile) +
      '&prop=imageinfo&iiprop=url&format=json';
    https
      .get(
        url,
        {
          family: 4,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CineVerseBot/1.0 (contact@cineverse.ai)',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const pages = JSON.parse(data).query.pages;
              const page = Object.values(pages)[0];
              resolve(page.imageinfo ? page.imageinfo[0].url : null);
            } catch (e) {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => resolve(null));
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(
        url,
        {
          family: 4,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CineVerseBot/1.0 (contact@cineverse.ai)',
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            // Handle redirect
            return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Status ${res.statusCode} for ${url}`));
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }
      )
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

async function run() {
  console.log('[Downloader] Starting download of real Tamil movie posters into:', targetDir);

  for (const item of postersList) {
    const destPath = path.join(targetDir, item.fileName);
    try {
      const url = await getWikiImageUrl(item.wikiFile);
      if (!url) {
        console.warn(`[Downloader] Could not find URL for ${item.title} (${item.wikiFile})`);
        continue;
      }
      console.log(`[Downloader] Downloading ${item.title} -> ${item.fileName}...`);
      await downloadFile(url, destPath);
      const stats = fs.statSync(destPath);
      console.log(`[Downloader] Success: ${item.fileName} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`[Downloader] Failed to download ${item.fileName}:`, err.message);
    }
  }

  // Also copy default fallback poster if not present
  const defaultPosterSrc = path.join(__dirname, '..', 'frontend', 'public', 'posters', 'default_poster.svg');
  const defaultPosterDest = path.join(targetDir, 'fallback-poster.svg');
  if (fs.existsSync(defaultPosterSrc)) {
    fs.copyFileSync(defaultPosterSrc, defaultPosterDest);
    console.log('[Downloader] Copied fallback-poster.svg to', defaultPosterDest);
  }

  console.log('[Downloader] All posters processed!');
}

run();
