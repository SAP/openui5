/*global QUnit */
(function () {
	"use strict";

	function contains (sStringValue, vStringOrRegex) {
		var bContains = false;

		if (typeof vStringOrRegex === "string" || vStringOrRegex instanceof String) {
			bContains = sStringValue.indexOf(vStringOrRegex) !== -1;
		} else if (vStringOrRegex instanceof RegExp) {
			bContains = vStringOrRegex.test(sStringValue);
		} else {
			throw new Error("Unsupported type '" +  vStringOrRegex + "' needs to be string or Regex");
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