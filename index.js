const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns')
const urlparser = require('url')
const mongoose = require('mongoose');
dotenv.config({path: "./config.env"})

const DB = process.env.DATABASE

mongoose.connect(DB, { 
  useUnifiedTopology: true, 
  useNewUrlParser: true, 
}).then(() => {
  console.log('database connected')
}).catch((error) => {
  console.log(`cannot connect to database, ${error}`);
});;


// MODEL
const UrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})


const urls = mongoose.model("shortURL", UrlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// to parse POST request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  return res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  return res.json({ greeting: 'hello API' });
});

let url
// URL shortener endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(JSON.parse(JSON.stringify(req.body)))
  url = JSON.parse(JSON.stringify(req.body.url));
  console.log(url)
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' })
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        original_url: url,
        short_url: urlCount
      }
      const result = await urls.create(urlDoc)
      console.log(result)
      res.json({ original_url: url, short_url: urlCount })
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = JSON.parse(JSON.stringify(req.params.short_url))
  console.log(shorturl)
  await urls.findOne({short_url: shorturl}).then((url) => {
    let originalUrl = url.original_url
    console.log(originalUrl)
    res.redirect(originalUrl)
  })

})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
