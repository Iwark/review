(function() {
  var HowCollect, INTERVAL, MAIL, PASS, Review, Service, async, first, http, key, log, mailTo, main, mongoose, nodemailer, options, schema;

  http = require("http");

  mongoose = require("mongoose");

  async = require("async");

  nodemailer = require("nodemailer");

  schema = require("./db/schema.js");

  for (key in schema) {
    mongoose.model(key, schema[key]);
  }

  mongoose.connect("mongodb://localhost/review");

  Review = mongoose.model("Review");

  log = require("./libs/print-log.js");

  HowCollect = {
    service_id: 1,
    service_name: "ハウコレ",
    service_app_id: "763210136"
  };

  options = {
    host: "itunes.apple.com",
    path: "/jp/rss/customerreviews/id=" + HowCollect["service_app_id"] + "/json"
  };

  Service = HowCollect;

  MAIL = "iwark02@gmail.com";

  PASS = "";

  mailTo = "request@howcollect.jp";

  INTERVAL = 2 * 60 * 60 * 1000;

  first = false;

  main = function() {
    var req;
    req = http.get(options, function(res) {
      var bodyChunks;
      if (res.statusCode === 200) {
        bodyChunks = [];
        return res.on('data', function(chunk) {
          return bodyChunks.push(chunk);
        }).on('end', function() {
          var body, review;
          body = Buffer.concat(bodyChunks);
          review = JSON.parse(body);
          return async.each(review["feed"]["entry"], function(entry, callback) {
            var author, content, rating, title, version;
            if (entry["author"]) {
              author = entry["author"]["name"]["label"];
            }
            if (entry["im:rating"]) {
              rating = entry["im:rating"]["label"];
            }
            if (entry["im:version"]) {
              version = entry["im:version"]["label"];
            }
            if (entry["title"]) {
              title = entry["title"]["label"];
            }
            if (entry["content"]) {
              content = entry["content"]["label"];
            }
            if (entry["author"] && entry["im:rating"] && entry["im:version"]) {
              return Review.findOne({
                title: title,
                content: content
              }, function(err, review) {
                var newReview;
                if ((!err && !review) || first === true) {
                  first = false;
                  newReview = new Review({
                    service_id: Service["service_id"],
                    author: author,
                    rating: rating,
                    version: version,
                    title: title,
                    content: content
                  });
                  return newReview.save(function(err) {
                    var html, i, mailOptions, smtpTransport, subject;
                    console.log(newReview);
                    smtpTransport = nodemailer.createTransport("SMTP", {
                      service: "Gmail",
                      auth: {
                        user: MAIL,
                        pass: PASS
                      }
                    });
                    subject = Service["service_name"] + "新着レビュー";
                    html = "<b>" + title + "</b><br>";
                    html += author + "(v" + version + ")<br>";
                    i = 1;
                    while (i < rating) {
                      html += "★";
                      i++;
                    }
                    html += "<br><br>";
                    html += content;
                    mailOptions = {
                      from: "Review <iwark02@gmail.com>",
                      to: mailTo,
                      subject: subject,
                      html: html,
                      text: html
                    };
                    smtpTransport.sendMail(mailOptions, function(error, response) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log("Message sent: " + response.message);
                      }
                      return smtpTransport.close();
                    });
                    callback();
                  });
                } else {
                  callback();
                }
              });
            } else {
              callback();
            }
          });
        });
      }
    });
    return req.on('error', function(e) {
      return console.log('ERROR: ' + e.message);
    });
  };

  setInterval(main, INTERVAL);

}).call(this);
