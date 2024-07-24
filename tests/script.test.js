const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load your HTML file
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Weather App', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    document = dom.window.document;
    global.document = document; // to make document globally available
    global.window = dom.window;
    global.navigator = dom.window.navigator;
    require('../script'); // Include your script
  });

  test('should have time element', () => {
    const timeEl = document.getElementById('time');
    expect(timeEl).not.toBeNull();
  });

  test('should display default city weather on load', () => {
    const defaultCity = 'Addis Ababa';
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          coord: { lat: 9.03, lon: 38.74 },
          weather: [{ icon: '01d' }],
          main: { temp: 25 },
          name: defaultCity,
        }),
      })
    );
    global.fetch = mockFetch;

    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => {
        const cityElement = document.getElementById('city');
        expect(cityElement.textContent).toBe(defaultCity);
        resolve();
      });
    });
  });

  test('should fetch weather data for entered city', () => {
    const city = 'New York';
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          coord: { lat: 40.71, lon: -74.01 },
          weather: [{ icon: '01d' }],
          main: { temp: 20 },
          name: city,
        }),
      })
    );
    global.fetch = mockFetch;

    const searchInputEl = document.getElementById('searchInput');
    const searchButtonEl = document.getElementById('searchButton');

    searchInputEl.value = city;
    searchButtonEl.click();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`q=${city}`));
  });

  test('should show alert for empty city name', () => {
    const searchButtonEl = document.getElementById('searchButton');
    global.alert = jest.fn();

    searchButtonEl.click();

    expect(global.alert).toHaveBeenCalledWith('Please enter a city name');
  });

  test('should display weather data on the page', () => {
    const weatherData = {
      current: {
        humidity: 80,
        pressure: 1000,
        sunrise: 1625123456,
        sunset: 1625173456,
        wind_speed: 5,
        temp: 30,
      },
      daily: [
        { dt: 1625123456, temp: { night: 20, day: 30 }, weather: [{ icon: '01d' }] },
        { dt: 1625209856, temp: { night: 22, day: 32 }, weather: [{ icon: '02d' }] },
      ],
      timezone: 'Africa/Addis_Ababa',
    };

    const showWeatherData = require('../script').showWeatherData;
    showWeatherData(weatherData);

    const timezoneEl = document.getElementById('time-zone');
    const currentTempEl = document.getElementById('current-temp');
    const weatherForecastEl = document.getElementById('weather-forecast');

    expect(timezoneEl.textContent).toBe('Africa/Addis_Ababa');
    expect(currentTempEl.innerHTML).toContain('30&#176; C');
    expect(weatherForecastEl.children.length).toBe(1); // Exclude the current day
  });

  test('should update the background based on temperature', () => {
    const updateBackgroundByTemperature = require('../script').updateBackgroundByTemperature;
    const body = document.body;

    updateBackgroundByTemperature(45);
    expect(body.classList.contains('weather-very-hot')).toBe(true);

    updateBackgroundByTemperature(35);
    expect(body.classList.contains('weather-hot')).toBe(true);

    updateBackgroundByTemperature(25);
    expect(body.classList.contains('weather-warm')).toBe(true);

    updateBackgroundByTemperature(15);
    expect(body.classList.contains('weather-cool')).toBe(true);

    updateBackgroundByTemperature(5);
    expect(body.classList.contains('weather-cold')).toBe(true);

    updateBackgroundByTemperature(-5);
    expect(body.classList.contains('weather-very-cold')).toBe(true);
  });
});
