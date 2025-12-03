const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', (req, res, next) => {
    let apiKey = process.env.WEATHER_API_KEY;
    let city = req.query.city || 'London';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, (err, response, body) => {
        if (err) return next(err);

        let weather = JSON.parse(body);

        if (weather && weather.main) {
            res.render('weather', {
                city: weather.name,
                temp: weather.main.temp,
                humidity: weather.main.humidity,
                wind: weather.wind.speed,
                description: weather.weather[0].description
            });
        } else {
            res.send("No weather data found for that city.");
        }
    });
});


module.exports = router;
