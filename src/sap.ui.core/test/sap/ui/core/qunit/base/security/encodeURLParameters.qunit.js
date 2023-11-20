/*global QUnit */
sap.ui.define(["sap/base/security/encodeURLParameters"], function(encodeURLParameters) {
	"use strict";

	QUnit.module("Encode URL parameters");
	// URL context
	QUnit.test("encode URL parameters", function(assert){
		assert.equal(encodeURLParameters({
			"?": "=",
			"&": "?",
			">&<\"\'\\/": String.fromCharCode(256)
		}),  "%3f=%3d&%26=%3f&%3e%26%3c%22%27%5c%2f=%c4%80", "parameter map");
		assert.equal(encodeURLParameters({}), "", "empty parameter map");
		assert.equal(encodeURLParameters(), "", "no parameter map");


		assert.equal(encodeURLParameters({
			"t":"test&",
			"y": '*',
			"a": false,
			"b": 0
		}), "t=test%26&y=%2a&a=false&b=0", "non-string parameter map");
	});

});
