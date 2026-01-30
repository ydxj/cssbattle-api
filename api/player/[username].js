import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      error: 'Username parameter is required',
      message: 'Please provide a username in the URL path'
    });
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error: 'Invalid username format'
    });
  }

  let browser = null;

  try {
    const isDev = process.env.NODE_ENV === 'development';
    
    browser = await puppeteer.launch({
      args: isDev ? [] : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isDev 
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    const profileUrl = `https://cssbattle.dev/player/${username}`;
    
    const response = await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    if (response.status() === 404) {
      await browser.close();
      return res.status(404).json({
        error: 'Player not found'
      });
    }

    await page.waitForSelector('.leaderboard-stats-box', { timeout: 10000 });

    const playerData = await page.evaluate(() => {
      const data = {
        username: window.location.pathname.split('/')[2],
        profileUrl: window.location.href,
        profilePicture: null,
        streaks: { current: null, longest: null },
        battleStats: { globalRank: null, targetsPlayed: null, totalScore: null },
        dailyTargets: { targetsPlayed: null, avgMatch: null, avgCharacters: null },
        versus: { rating: null, gamesPlayed: null, wins: null }
      };

      // Extract profile picture
      const profileImg = document.querySelector('.user-details__avatar');
      if (profileImg && profileImg.src) {
        data.profilePicture = profileImg.src;
      }

      const extractNumber = (text) => {
        if (!text) return null;
        const cleaned = text.replace(/,/g, '').replace(/%/g, '');
        const match = cleaned.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : null;
      };

      document.querySelectorAll('.leaderboard-stats-box').forEach(box => {
        const spans = box.querySelectorAll('span');
        if (spans.length >= 2) {
          const value = spans[0].textContent.trim();
          const label = spans[spans.length - 1].textContent.trim().toLowerCase();
          
          if (label.includes('current streak')) {
            data.streaks.current = Math.round(extractNumber(value) || 0);
          } else if (label.includes('longest streak')) {
            data.streaks.longest = Math.round(extractNumber(value) || 0);
          }
        }
      });

      // Map each h2 heading to its nearby panels
      document.querySelectorAll('h2').forEach(h2 => {
        const heading = h2.textContent.trim().toLowerCase();
        // Get the parent container of the h2
        let container = h2.parentElement;
        // Find all panels that follow this heading in the same section
        const allPanels = container ? container.querySelectorAll('[data-snow-surface="true"]') : [];
        allPanels.forEach(panel => {
          panel.setAttribute('data-section', heading);
        });
      });

      // Process all panels with their section context
      document.querySelectorAll('[data-snow-surface="true"]').forEach(panel => {
        const spans = panel.querySelectorAll('span');
        if (spans.length >= 2) {
          const value = spans[0].textContent.trim();
          const label = spans[1].textContent.trim().toLowerCase();
          const section = panel.getAttribute('data-section') || '';
          const num = extractNumber(value);

          if (num === null && num !== 0) return;

          if (label.includes('global rank')) {
            data.battleStats.globalRank = Math.round(num);
          } else if (label.includes('total score')) {
            data.battleStats.totalScore = num;
          } else if (label.includes('targets played')) {
            if (section.includes('battle') || section.includes('stats')) {
              data.battleStats.targetsPlayed = Math.round(num);
            } else if (section.includes('daily')) {
              data.dailyTargets.targetsPlayed = Math.round(num);
            } else {
              if (!data.battleStats.targetsPlayed) {
                data.battleStats.targetsPlayed = Math.round(num);
              } else if (!data.dailyTargets.targetsPlayed) {
                data.dailyTargets.targetsPlayed = Math.round(num);
              }
            }
          } else if (label.includes('avg match')) {
            data.dailyTargets.avgMatch = num;
          } else if (label.includes('avg characters')) {
            data.dailyTargets.avgCharacters = Math.round(num);
          } else if (label.includes('rating')) {
            data.versus.rating = Math.round(num);
          } else if (label.includes('games played')) {
            data.versus.gamesPlayed = Math.round(num);
          } else if (label.includes('wins')) {
            data.versus.wins = Math.round(num);
          }
        }
      });

      return data;
    });

    await browser.close();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(playerData);

  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    console.error('Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to scrape profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
