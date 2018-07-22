var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var app = express();
var db = require("./models");
var PORT = process.env.PORT || 3000;
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

mongoose.connect("mongodb://localhost/18HWMongo");

var arrayFromDD = []
testArray = []
app.get('/', function (req, res) {
  db.Article.find({
      "isArticleSaved": false
    })
    .then(function (data) {
      var isEmpty = false
      if(data.length==0){
        isEmpty= true
      }
      res.render('home', {
        title: "News Scraper",
        displaylink: true,
        isEmpty: isEmpty,
        data
      });
    })

});

app.get("/scrape", function (req, res) {
  var allArticles = [];
  testArray = [];
  db.Article.find({})
    .then(function (data) {
      data.forEach(function (element) {
        arrayFromDD.push(element)
      })
    })
  axios.get("https://www.charlotteobserver.com/latest-news/").then(function (response) {

    var $ = cheerio.load(response.data);
    var tag=  $("article")
   
    tag.each(function (i, element) {
       var result = {};
      // var h4 = tag.find("h4");
      result.title = $(element)
      // .closest("h4")
      .find("a")
      .text();
      result.link = $(element)
        // .closest("h4")
        .find("a")
        .attr("href");
      result.img=$(element)
      .find("img")
      .attr("src");
      result.isArticleSaved = false;
      const testArray = arrayFromDD.filter(function (value) {
        return value.title === result.title;
      });

      if (testArray.length <= 0) {
        allArticles.push(result);
        db.Article.create(result)
          .then(function (dbArticle) {})
          .catch(function (err) {
            return res.json(err);
          });
    }
    });
    
   
    
    
   
    var countArticles = allArticles.length
    res.render("home", {
      title: "Scraper News",
      addedArticles: countArticles,
      allArticles
    })
  });
});

app.get("/clear", function (req, res) {
  arrayFromDD = []
  db.Article.deleteMany({})
    .then(function (data) {
      res.render("home", {
        title: "All Articals Deleted",
        displaylink: true,
        data
      })
    })
})

app.get("/comment/:id", function(req, res){
  console.log(req.params.id)
  db.Note.find({articleID:req.params.id})
  .then(function(result){
    console.log(result)
    res.json(result)
  })
})

app.get('/saved', function (req, res) {
  db.Article.find({
      "isArticleSaved": true
    })
    .then(function (data) {
      // db.Note.find({}).then(function (data2) {
      //   console.log(data2)
      //   const renderObject = {
      //     "title": data.title,
      //     "idArticle": data._id,
      //     "link": data.link,
      //     "note": data2.note,
      //     "idNote": data2._id
      //   }
      console.log(data)
      var isEmpty = false
      if(data.length==0){
        isEmpty= true
      }
      res.render('saved', {
        title: "Your Saved Articles",
        displaylink: false,
        isEmpty: isEmpty,
        data
      });
    })

})
// });


app.post("/delete", function (req, res) {
  arrayFromDD = []
  console.log(req.body.id)
  db.Article.deleteOne({
      _id: req.body.id
    })
    .then(function (data) {
      res.render('home', {
        title: "Test",
        data
      });
    })
})

app.post("/newcomment", function (req, res) {
  console.log(req.body)
  db.Note.create(req.body)
    .then(function (result) {
      res.render("saved", {
        title: "Test",
        result
      })
      console.log(result);
    })
})

app.post("/deleteComment/:id", function(req, res){
  console.log(req.params.id)
  db.Note.deleteOne({ _id: req.params.id})
  .then(function(response){
    res.render("saved")
  })
})

app.post("/saved", function (req, res) {
  console.log(req.body.id)
  db.Article.updateOne({
      _id: req.body.id
    }, {
      $set: {
        isArticleSaved: true
      }
    })
    .then(function (data) {
      res.render("home", {
        title: "Test",
        data
      })
    })
})

app.listen(3000);