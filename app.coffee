http = require "http"
mongoose = require "mongoose"
async = require "async"
nodemailer = require "nodemailer"

schema = require "./db/schema.js"
# データベースの初期設定
for key of schema
  mongoose.model key, schema[key]
mongoose.connect "mongodb://localhost/review"

Review = mongoose.model("Review")

log = require "./libs/print-log.js"

HowCollect = 
  service_id: 1
  service_name: "ハウコレ"
  service_app_id: "763210136"

options =
  host: "itunes.apple.com"
  path: "/jp/rss/customerreviews/id=" + HowCollect["service_app_id"] + "/json"

Service = HowCollect

MAIL = "iwark02@gmail.com"
PASS = ""

# mailTo = "iwark02@gmail.com"
mailTo = "request@howcollect.jp"

INTERVAL = 2 * 60 * 60 * 1000 # 2時間

first = false

main = () ->

  req = http.get options, (res) ->
    if res.statusCode is 200
      bodyChunks = []
      res.on 'data', (chunk) ->
        bodyChunks.push chunk
      .on 'end', () ->
        body = Buffer.concat bodyChunks
        review = JSON.parse body
        async.each review["feed"]["entry"], (entry, callback) ->
          author = entry["author"]["name"]["label"] if entry["author"]
          rating = entry["im:rating"]["label"] if entry["im:rating"]
          version = entry["im:version"]["label"] if entry["im:version"]
          title = entry["title"]["label"] if entry["title"]
          content = entry["content"]["label"] if entry["content"]
          if entry["author"] && entry["im:rating"] && entry["im:version"]
            Review.findOne
              title: title
              content: content
            , (err, review) ->
              if (!err && !review) || first is true
                first = false
                #データベースに存在していない場合
                newReview = new Review(
                  service_id: Service["service_id"]
                  author: author
                  rating: rating
                  version: version
                  title: title
                  content: content
                )
                newReview.save (err) -> 
                  console.log newReview

                  smtpTransport = nodemailer.createTransport "SMTP",
                    service: "Gmail"
                    auth:
                      user: MAIL
                      pass: PASS

                  subject =  Service["service_name"] + "新着レビュー"

                  html = "<b>" + title + "</b><br>"
                  html += author + "(v" + version + ")<br>"
                  i = 1
                  while i < rating
                    html += "★"
                    i++
                  html += "<br><br>"
                  html += content

                  mailOptions =
                    from: "Review <iwark02@gmail.com>"
                    to: mailTo
                    subject: subject
                    html: html
                    text: html

                  smtpTransport.sendMail mailOptions, (error, response) ->
                    if(error)
                      console.log error
                    else
                      console.log "Message sent: " + response.message
                    smtpTransport.close()

                  callback()
                  return
              else
                callback()
                return
          else
            callback()
            return

  req.on 'error', (e) ->
    console.log 'ERROR: ' + e.message

setInterval main, INTERVAL