var fs = require("fs"),
	path = require("path");

// cache the content of each file to avoid opening the same file multiple times
var mContent = {};

module.exports = {
	getContent: function(sFilePath) {
		var sFileName = path.resolve(sFilePath);
		if (mContent[sFileName]) {
			return mContent[sFileName];
		}

		mContent[sFileName] = JSON.parse(fs.readFileSync(sFilePath, "utf8"));
		return mContent[sFileName];
	},
	clearCache: function() {
		mContent = {};
	}
};