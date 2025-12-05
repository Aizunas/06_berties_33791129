const express = require("express");
const router = express.Router();
const request = require('request');

router.get('/', function(req, res, next) {
    res.render('weather.ejs');
});

router.get('/now', function(req, res, next) {
    let apiKey = process.env.WEATHER_API_KEY;
    let city = req.query.city || 'london';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    request(url, function (err, response, body) {
        if(err){
            next(err);
        } else {
            var weather = JSON.parse(body);
            
            // Check if the API returned valid data
            if (weather !== undefined && weather.main !== undefined) {
                var wmsg = '<h2>Weather in ' + weather.name + '</h2>' +
                           '<p><strong>Temperature:</strong> '+ weather.main.temp + ' °C</p>' +
                           '<p><strong>Humidity:</strong> ' + weather.main.humidity + '%</p>' +
                           '<p><strong>Wind Speed:</strong> ' + weather.wind.speed + ' m/s</p>' +
                           '<p><strong>Description:</strong> ' + weather.weather[0].description + '</p>' +
                           '<a href="/weather">Check another city</a> | <a href="/">Home</a>';
                res.send(wmsg);
            } else {
                res.send("No data found for that city. <a href='/weather'>Try again</a>");
            }
        }
    });
});


module.exports = router;