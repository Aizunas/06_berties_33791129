const express = require("express");
const router = express.Router();
const request = require('request');

router.get('/', function(req, res, next) {
    res.render('weather.ejs');
});

router.get('/now', function(req, res, next) {
    let apiKey = 'YOUR_API_KEY_HERE';
    let city = req.query.city || 'london';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    request(url, function(err, response, body) {
        if (err) {
            next(err);
        } else {
            var weather = JSON.parse(body);
            if (weather !== undefined && weather.main !== undefined) {
                var wmsg = 'It is ' + weather.main.temp +
                    ' degrees in ' + weather.name +
                    '! <br> The humidity now is: ' +
                    weather.main.humidity;
                res.send(wmsg);
            } else {
                res.send("No data found");
            }
        }
    });
});

module.exports = router;