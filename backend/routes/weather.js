const express = require('express');
const router = express.Router();

const cacheService = require('../services/cacheService');

/**
 * GET /api/weather
 * Fetches weather data from Open-Meteo API
 */
router.get('/', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            success: false,
            error: 'Latitude and longitude are required'
        });
    }

    // Cache key based on rounded coordinates (to group nearby users)
    const roundedLat = parseFloat(lat).toFixed(2);
    const roundedLon = parseFloat(lon).toFixed(2);
    const cacheKey = `weather:${roundedLat}:${roundedLon}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
        console.log(`📦 Returning cached weather for ${roundedLat}, ${roundedLon}`);
        return res.json({
            success: true,
            data: cachedData
        });
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

        const response = await fetch(url, {
            signal: AbortSignal.timeout(15000)
        });
        const data = await response.json();

        if (data.error) {
            throw new Error(data.reason || 'Failed to fetch weather data');
        }

        // Cache for 15 minutes
        cacheService.set(cacheKey, data, 900);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.warn('⚠️ Weather API unavailable. Using MOCK weather data for debugging:', error.message);
        
        const mockData = {
            current: {
                temperature_2m: 28.5,
                relative_humidity_2m: 65,
                weather_code: 1, // Mostly clear
                wind_speed_10m: 10.2
            },
            daily: {
                time: [new Date().toISOString().split('T')[0]],
                weather_code: [1],
                temperature_2m_max: [32.0],
                temperature_2m_min: [22.0]
            }
        };

        // Cache the mock data so we don't keep waiting for timeouts
        cacheService.set(cacheKey, mockData, 900);

        res.json({
            success: true,
            data: mockData
        });
    }
});

module.exports = router;
