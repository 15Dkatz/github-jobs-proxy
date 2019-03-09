const express = require('express');
const request = require('request');
const LimitingMiddleware = require('limiting-middleware');

const app = express();

app.use(new LimitingMiddleware().limitByIp());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  next();
});

// TODO: Send something html formatted to have local anchor links
app.get('/', (req, res) => {
  res.send('Service up! Try /positions?description=javascript&location=San+Francisco');
});


app.get('/ping', (req, res) => {
  res.send('pong!');
});

app.get('/positions', (req, res) => {
  const { description, location } = req.query;

  request(
    { url: `https://jobs.github.com/positions.json?description=${description}&location=${location}` },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return next(new Error(`Positions not available for ${description} + ${location}`));
      }

      res.json(JSON.parse(body));
    }
  )
});

app.use((err, req, res, next) => {
  res.status(500).json({ type: 'error', message: err.message });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
