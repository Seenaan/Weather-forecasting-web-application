// Import necessary modules
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const fetchMock = require('jest-fetch-mock');

// Mock fetch globally
fetchMock.enableMocks();

// Read and load HTML content from index.html using JSDOM
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const { document } = dom.window;

// Mock global variables and functions
global.document = document;
global.fetch = fetchMock;

// Load your script file (adjust the path accordingly)
const { getWeatherDataByCity, showWeatherData, updateBackgroundByTemperature, searchWeather } = require('./script');

// Define days and months for date formatting (adjust as needed)
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock API key for testing purposes
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

// Mock data for testing purposes (example data structure)
const mockWeatherData = {
    current: {
        humidity: 60,
        pressure: 1012,
        sunrise: 1627030783,
        sunset: 1627076273,
        wind_speed: 2.3,
        temp: 25,
    },
    timezone: 'Europe/Berlin',
    daily: [
        {
            dt: 1627128000,
            temp: {
                day: 28,
                night: 20,
            },
            weather: [
                {
                    icon: '01d',
                },
            ],
        },
        // Add more mock data as needed
    ],
};

// Tests for Weather App script
describe('Weather App Script', () => {
    // Mock fetch responses
    beforeEach(() => {
        fetch.resetMocks();
    });

    it('getWeatherDataByCity should fetch weather data', async () => {
        // Mock fetch responses
        fetch.mockResponseOnce(JSON.stringify({ coord: { lat: 52.52, lon: 13.405 }, ...mockWeatherData }));
        
        // Call function
        await getWeatherDataByCity('Berlin');

        // Assertions
        expect(fetch).toHaveBeenCalledTimes(2); // Adjust based on your fetch calls
        expect(fetch).toHaveBeenCalledWith(`https://api.openweathermap.org/data/2.5/weather?q=Berlin&appid=${API_KEY}`);
        expect(fetch).toHaveBeenCalledWith(`https://api.openweathermap.org/data/2.5/onecall?lat=52.52&lon=13.405&exclude=hourly,minutely&units=metric&appid=${API_KEY}`);
    });

    it('showWeatherData should display weather data on the page', () => {
        // Prepare DOM elements (mocking as needed)
        const timezoneEl = document.createElement('div');
        timezoneEl.id = 'time-zone';
        document.body.appendChild(timezoneEl);

        const currentWeatherItemsEl = document.createElement('div');
        currentWeatherItemsEl.id = 'current-weather-items';
        document.body.appendChild(currentWeatherItemsEl);

        const currentTempEl = document.createElement('div');
        currentTempEl.id = 'current-temp';
        document.body.appendChild(currentTempEl);

        const weatherForecastEl = document.createElement('div');
        weatherForecastEl.id = 'weather-forecast';
        document.body.appendChild(weatherForecastEl);

        // Call function
        showWeatherData(mockWeatherData);

        // Assertions
        expect(timezoneEl.textContent).toBe('Europe/Berlin'); // Adjust based on your data structure
        expect(currentWeatherItemsEl.innerHTML).toContain('Humidity');
        expect(currentTempEl.innerHTML).toContain('w-icon');
        expect(weatherForecastEl.innerHTML).toContain('weather-forecast-item');
    });

    it('updateBackgroundByTemperature should update background class based on temperature', () => {
        // Mock temperature values
        updateBackgroundByTemperature(30);
        
        // Assertions
        expect(document.body.classList).toContain('weather-hot'); // Adjust based on your temperature thresholds
    });

    it('searchWeather should fetch weather data when city is provided', async () => {
        // Mock fetch responses
        fetch.mockResponseOnce(JSON.stringify({ coord: { lat: 52.52, lon: 13.405 }, ...mockWeatherData }));

        // Mock user input
        const searchInputEl = document.createElement('input');
        searchInputEl.id = 'searchInput';
        searchInputEl.value = 'Berlin';
        document.body.appendChild(searchInputEl);

        // Call function
        searchWeather();

        // Wait for asynchronous operations (e.g., fetch calls)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Assertions
        expect(fetch).toHaveBeenCalledTimes(2); // Adjust based on your fetch calls
        expect(fetch).toHaveBeenCalledWith(`https://api.openweathermap.org/data/2.5/weather?q=Berlin&appid=${API_KEY}`);
        expect(fetch).toHaveBeenCalledWith(`https://api.openweathermap.org/data/2.5/onecall?lat=52.52&lon=13.405&exclude=hourly,minutely&units=metric&appid=${API_KEY}`);
    });

    it('searchWeather should alert when city is empty', () => {
        // Mock empty user input
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

        // Mock user input
        const searchInputEl = document.createElement('input');
        searchInputEl.id = 'searchInput';
        searchInputEl.value = '';
        document.body.appendChild(searchInputEl);

        // Call function
        searchWeather();

        // Assertions
        expect(alertSpy).toHaveBeenCalled();
    });
});
