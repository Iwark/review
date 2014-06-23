require "date-utils"
fs = require "fs"

printLog = (content) ->
	logFile = fs.readFileSync "./log", "utf-8"
	date = new Date()
	date = date.toFormat("MM/DD HH24:MI:SS")
	logData = "[" + date + "] " + content + "\n"
	fs.appendFileSync "./log", logData
	console.log logData

module.exports =
	info: (content) ->
		content = "<div>" + content + "</div>"
		printLog(content)
		return

	warn: (content) ->
		content = "<div style='color: #f4be00;'>" + content + "</div>"
		printLog(content)
		return

	error: (content) ->
		content = "<div style='color: #db1921;'>" + content + "</div>"
		printLog(content)
		return