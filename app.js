let axios   = require("axios");
let cheerio = require("cheerio");
let express = require("express");
var router  = express.Router();
var app     = express();
var moment  = require('moment-timezone');
var port    = process.env.PORT || 3000;
const log   = console.log;
const URL   = "https://www.melon.com/chart/day/index.htm"

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

const getMelon = async (url) => {
  return getHtml(url)
  .then(html => {
    let list = [];
    const $ = cheerio.load(html.data);

    let $bodyList = $("tr.lst50");
    $bodyList.each(function(i, elem) {
        list[i] = {
            rank:   $(this).find('.rank').text(),
            image:  $(this).find('td:nth-child(4) > div > a > img').attr('src').replace('/melon/resize/120/quality/80/optimize',''),
            title:  $(this).find('div.ellipsis.rank01 > span > a').text(),
            artist: $(this).find('div.ellipsis.rank02 > a').text()
        };
    });
    const data = list.filter(n => n.rank);
    return data;
  })
}
 


app.use(function (req, res, next) {
  req.timestamp  = moment().unix();
  req.receivedAt = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
  return next();
});

app.route('/')
  .get(function(req, res, next){
    getMelon (URL).then(data => {
      res.header("Access-Control-Allow-Origin", "*");
      res.send(data)
    });
  });

  app.listen(port, function(){
    console.log('Listener: ', 'Example app listening on port ' + port);
});

module.exports = app;
