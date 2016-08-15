(function () {
	"use strict";

	function contains (sStringValue, vStringOrRegex) {
		var bContains = false;

		switch ($.type(vStringOrRegex)) {
			case "string":
				bContains = sStringValue.indexOf(vStringOrRegex) !== -1;
				break;
			case "regexp":
				bContains = vStringOrRegex.test(sStringValue);
				break;
			default:
				throw new Error("Unsupported type '" +  vStringOrRegex + "' needs to be string or Regex")
		}

		return bContains;
	}

	QUnit.assert.contains = function (sStringValue, vStringOrRegex, sMessage) {
		if (!sMessage) {
			sMessage = "Found '" + vStringOrRegex + "' in '" + sStringValue + "'";
		}
		this.push(contains(sStringValue, vStringOrRegex), sStringValue, vStringOrRegex, sMessage);
	};

	QUnit.assert.doesNotContain = function (sStringValue, vStringOrRegex, sMessage) {
		this.push(!contains(sStringValue, vStringOrRegex), sStringValue, vStringOrRegex, sMessage);
	};
})();