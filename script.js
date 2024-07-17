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

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

function fetchWithRetry(url, options = {}, retries = 3, backoff = 3000) {
    return fetch(url, options)
        .then(response => {
            if (response.status === 429) {
                if (retries > 0) {
                    console.log(`Rate limit exceeded. Retrying in ${backoff / 1000} seconds...`);
                    return new Promise(resolve => setTimeout(resolve, backoff))
                        .then(() => fetchWithRetry(url, options, retries - 1, backoff * 2));
                } else {
                    throw new Error('Too Many Requests');
                }
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

function getWeatherDataByCity(city) {
    fetchWithRetry(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(data => {
            if (!data.coord) {
                throw new Error('Invalid data structure');
            }
            const { coord } = data;
            return fetchWithRetry(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`);
        })
        .then(data => {
            console.log(data); // Log the API response to see its structure
            showWeatherData(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
        });
}

function showWeatherData(data) {
    console.log('Weather Data:', data)
    if (!data || !data.current) {
        console.error('Invalid data received:', data);
        return;
    }

    const { current, timezone, daily } = data;
    const { humidity, pressure, sunrise, sunset, wind_speed } = current;

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
            <div>${wind_speed}</div>
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

    const weatherCondition = current.weather[0].main.toLowerCase();
    updateBackground(weatherCondition);
}

function updateBackground(weatherCondition) {
    const body = document.body;

    console.log('Weather Condition:',weatherCondition);

    body.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-thunderstorm', 'weather-snow');

    switch (weatherCondition) {
        case 'clear':
            body.classList.add('weather-clear');
            break;
        case 'clouds':
            body.classList.add('weather-clouds');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-rain');
            break;
        case 'thunderstorm':
            body.classList.add('weather-thunderstorm');
            break;
        case 'snow':
            body.classList.add('weather-snow');
            break;
        default:
            body.style.backgroundColor = '#f0f0f0';
            break;
    }
}

function searchWeather() {
    const city = searchInputEl.value;
    if (city.trim() === '') {
        alert('Please enter a city name');
        return;
    }
    getWeatherDataByCity(city);
}

document.addEventListener('DOMContentLoaded', function() {
    const defaultCity = 'Addis Ababa';
    getWeatherDataByCity(defaultCity);
});

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = `${hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat}:${minutes < 10 ? '0' + minutes : minutes} <span id="am-pm">${ampm}</span>`;
    
    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

searchButtonEl.addEventListener('click', searchWeather);
searchInputEl.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// About Modal
aboutButton.addEventListener('click', () => {
    aboutModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    aboutModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == aboutModal) {
        aboutModal.style.display = 'none';
    }
});
