import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location'); // e.g., "lat,lon" or "London"

  if (!location) {
    return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.TOMORROW_IO_API_KEY;

  if (!apiKey) {
    // Fallback to mock data if API key is not yet configured
    console.warn("Using mock weather data because TOMORROW_IO_API_KEY is not set.");
    return NextResponse.json({
      location: location,
      current: {
        temperature: 28,
        humidity: 60,
        precipitationProbability: 10,
        weatherCode: 1000 // Clear
      },
      forecast: [
        { day: 'Day 1', temp: 29, rainChance: 5 },
        { day: 'Day 2', temp: 30, rainChance: 25 },
        { day: 'Day 3', temp: 27, rainChance: 80 }, // High rain chance specifically to demonstrate pesticide alert
        { day: 'Day 4', temp: 26, rainChance: 40 },
        { day: 'Day 5', temp: 28, rainChance: 10 }
      ]
    });
  }

  try {
    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Error fetching weather data' }, { status: response.status });
    }

    // Adapt Tomorrow.io complex response to our simpler format
    // Extracted based on Tomorrow.io V4 API standards
    const minutelyValues = data.timelines?.minutely?.[0]?.values || {};
    const hourlyValues = data.timelines?.hourly?.[0]?.values || {};
    const currentValues = Object.keys(minutelyValues).length > 0 ? minutelyValues : hourlyValues;
    const dailyTimeline = data.timelines?.daily || [];

    return NextResponse.json({
      location: data.location?.name || location,
      current: {
        temperature: currentValues.temperature || 0,
        humidity: currentValues.humidity || 0,
        precipitationProbability: currentValues.precipitationProbability || 0,
        weatherCode: currentValues.weatherCode || 1000,
      },
      forecast: dailyTimeline.slice(0, 5).map((day, idx) => ({
        day: new Date(day.time).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: day.values.temperatureAvg || 0,
        rainChance: day.values.precipitationProbabilityAvg || 0
      }))
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
