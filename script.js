const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Your OpenWeatherMap API key
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');
const loading = document.getElementById('loading');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const humidity = document.getElementById('humidity');
const unitToggle = document.getElementById('unit-toggle');
const forecastList = document.getElementById('forecast-list');

let isCelsius = true;

// Fetch weather data by city name
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('City not found');
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Fetch 5-day forecast by city name
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Forecast not found');
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Display weather data
function displayWeather(data) {
  cityName.textContent = data.name;
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  temperature.textContent = `Temperature: ${data.main.temp}°C`;
  weatherCondition.textContent = `Condition: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  weatherInfo.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}

// Display 5-day forecast
function displayForecast(data) {
  forecastList.innerHTML = '';
  const dailyForecast = data.list.filter((item, index) => index % 8 === 0); // Get one forecast per day
  dailyForecast.forEach((item) => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon">
      <p>${item.main.temp}°C</p>
      <p>${item.weather[0].description}</p>
    `;
    forecastList.appendChild(forecastItem);
  });
}

// Toggle between Celsius and Fahrenheit
unitToggle.addEventListener('click', () => {
  isCelsius = !isCelsius;
  const temp = parseFloat(temperature.textContent.split(' ')[1]);
  if (isCelsius) {
    temperature.textContent = `Temperature: ${((temp - 32) * (5 / 9)).toFixed(2)}°C`;
    unitToggle.textContent = 'Switch to Fahrenheit';
  } else {
    temperature.textContent = `Temperature: ${(temp * (9 / 5) + 32).toFixed(2)}°F`;
    unitToggle.textContent = 'Switch to Celsius';
  }
});

// Handle form submission
weatherForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name.');
    return;
  }
  loading.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
  errorMessage.classList.add('hidden');
  try {
    const weatherData = await fetchWeather(city);
    const forecastData = await fetchForecast(city);
    displayWeather(weatherData);
    displayForecast(forecastData);
  } catch (error) {
    errorMessage.textContent = 'City not found. Please try again.';
    errorMessage.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
  } finally {
    loading.classList.add('hidden');
  }
});

// Handle geolocation
locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Location not found');
        const data = await response.json();
        cityInput.value = data.name;
        weatherForm.dispatchEvent(new Event('submit'));
      } catch (error) {
        errorMessage.textContent = 'Unable to fetch weather for your location.';
        errorMessage.classList.remove('hidden');
        weatherInfo.classList.add('hidden');
      }
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
// Initialize the chart
const ctx = document.getElementById('temperature-chart').getContext('2d');
let temperatureChart;

// Function to create or update the temperature trend graph
function updateTemperatureChart(forecastData) {
  const labels = forecastData.list
    .filter((item, index) => index % 8 === 0) // Get one forecast per day
    .map((item) => new Date(item.dt * 1000).toLocaleDateString());

  const temperatures = forecastData.list
    .filter((item, index) => index % 8 === 0)
    .map((item) => item.main.temp);

  if (temperatureChart) {
    // Update existing chart
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatures;
    temperatureChart.update();
  } else {
    // Create new chart
    temperatureChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
  }
}

// Modify the displayForecast function to include the chart
function displayForecast(data) {
  forecastList.innerHTML = '';
  const dailyForecast = data.list.filter((item, index) => index % 8 === 0); // Get one forecast per day
  dailyForecast.forEach((item) => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon">
      <p>${item.main.temp}°C</p>
      <p>${item.weather[0].description}</p>
    `;
    forecastList.appendChild(forecastItem);
  });

  // Update the temperature trend graph
  updateTemperatureChart(data);
}
});