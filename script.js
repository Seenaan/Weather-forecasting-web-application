// Check if running in a browser environment
if (typeof document !== 'undefined') {
    // DOM Element References
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const currentWeatherItemsEl = document.getElementById('current-weather-items');
    const timezoneEl = document.getElementById('time-zone');
    const countryEl = document.getElementById('country');
    const weatherForecastEl = document.getElementById('weather-forecast');
    const currentTempEl = document.getElementById('current-temp');
    const searchInputEl = document.getElementById('searchInput');
    const searchButtonEl = document.getElementById('searchButton');
    const aboutButton = document.getElementById('aboutButton');
    const aboutModal = document.getElementById('aboutModal');
    const closeButton = document.querySelector('.close-button');

    // Arrays for Date Formatting
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // OpenWeatherMap API Key (Replace with your actual API key)
    const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

    // Function to handle API requests with retry mechanism
    function fetchWithRetry(url, options = {}, retries = 3, backoff = 3000) {
        return fetch(url, options)
            .then(response => {
                // Handle rate limit (429 status)
                if (response.status === 429) {
                    if (retries > 0) {
                        console.log(`Rate limit exceeded. Retrying in ${backoff / 1000} seconds...`);
                        return new Promise(resolve => setTimeout(resolve, backoff))
                            .then(() => fetchWithRetry(url, options, retries - 1, backoff * 2));
                    } else {
                        throw new Error('Too Many Requests');
                    }
                }
                // Handle other network errors
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }
                return response.json();
            });
    }

    // Function to fetch weather data by city name
    function getWeatherDataByCity(city) {
        const trimmedCity = city.trim();
        if (!trimmedCity) {
            console.error('City name is empty');
            alert('Please enter a city name');
            return;
        }

        console.log(`Fetching weather data for city: ${trimmedCity}`);
        fetchWithRetry(`https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&appid=${API_KEY}`)
            .then(data => {
                console.log('API Response:', data);
                if (!data || !data.coord) {
                    throw new Error('Invalid data structure received');
                }
                const { coord } = data;
                return fetchWithRetry(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`);
            })
            .then(data => {
                console.log('Weather Data:', data);
                showWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Failed to fetch weather data. Please try again later.');
            });
    }

    // Function to display weather data on the page
    function showWeatherData(data) {
        console.log('Weather Data:', data);
        if (!data || !data.current) {
            console.error('Invalid data received:', data);
            return;
        }

        // Destructure data object
        const { current, timezone, daily } = data;
        const { humidity, pressure, sunrise, sunset, wind_speed, temp } = current;

        // Update DOM elements with weather information
        timezoneEl.textContent = timezone;
        countryEl.textContent = '';  // Replace with actual country data

        currentWeatherItemsEl.innerHTML = `
            <div class="weather-item">
                <div>Humidity</div>
                <div>${humidity}%</div>
            </div>
            <div class="weather-item">
                <div>Pressure</div>
                <div>${pressure}</div>
            </div>
            <div class="weather-item">
                <div>Wind Speed</div>
                <div>${wind_speed} m/s</div>
            </div>
            <div class="weather-item">
                <div>Sunrise</div>
                <div>${window.moment.unix(sunrise).format('HH:mm A')}</div>
            </div>
            <div class="weather-item">
                <div>Sunset</div>
                <div>${window.moment.unix(sunset).format('HH:mm A')}</div>
            </div>`;

        currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn/${daily[0].weather[0].icon}.png" alt="weather icon" class="w-icon">
            <div class="other">
                <div class="day">${window.moment.unix(daily[0].dt).format('dddd')}</div>
                <div class="temp">Night - ${daily[0].temp.night}&#176; C</div>
                <div class="temp">Day - ${daily[0].temp.day}&#176; C</div>
            </div>`;

        // Construct weather forecast HTML
        let forecastHTML = '';
        daily.slice(1).forEach(day => {
            forecastHTML += `
                <div class="weather-forecast-item">
                    <div class="day">${window.moment.unix(day.dt).format('ddd')}</div>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather icon" class="w-icon">
                    <div class="temp">Night - ${day.temp.night}&#176; C</div>
                    <div class="temp">Day - ${day.temp.day}&#176; C</div>
                </div>`;
        });
        weatherForecastEl.innerHTML = forecastHTML;

        // Update background based on current temperature
        const currentTemperature = temp;
        updateBackgroundByTemperature(currentTemperature);
    }

    // Function to update background based on temperature
    function updateBackgroundByTemperature(temperature) {
        const body = document.body;

        body.classList.remove('weather-very-hot', 'weather-hot', 'weather-warm', 'weather-cool', 'weather-cold', 'weather-very-cold');

        if (temperature >= 40) {
            body.classList.add('weather-very-hot');
        } else if (temperature >= 30) {
            body.classList.add('weather-hot');
        } else if (temperature >= 20) {
            body.classList.add('weather-warm');
        } else if (temperature >= 10) {
            body.classList.add('weather-cool');
        } else if (temperature >= 0) {
            body.classList.add('weather-cold');
        } else {
            body.classList.add('weather-very-cold');
        }
    }

    // Function to handle search button click or Enter key press
    function searchWeather() {
        const city = searchInputEl.value;
        if (city.trim() === '') {
            alert('Please enter a city name');
            return;
        }
        getWeatherDataByCity(city);
    }

    // Initial weather data load for default city when the document is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        const defaultCity = 'Addis Ababa'; // Default city to load weather data
        getWeatherDataByCity(defaultCity); // Fetch weather data for default city
    });

    // Update time and date every second
    setInterval(() => {
        const time = new Date();
        const month = time.getMonth();
        const date = time.getDate();
        const day = time.getDay();
        const hour = time.getHours();
        const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
        const minutes = time.getMinutes();
        const ampm = hour >= 12 ? 'PM' : 'AM';

        // Update time element with current time
        timeEl.innerHTML = `${hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat}:${minutes < 10 ? '0' + minutes : minutes} <span id="am-pm">${ampm}</span>`;
        
        // Update date element with current day, date, and month
        dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
    }, 1000);

    // Event listeners for search button click and Enter key press in search input
    searchButtonEl.addEventListener('click', searchWeather);
    searchInputEl.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });

    // Event listener to open the about modal
    aboutButton.addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });

    // Event listener to close the about modal
    closeButton.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    // Event listener to close the about modal if clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
}
