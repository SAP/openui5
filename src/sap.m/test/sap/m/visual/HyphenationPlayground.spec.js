/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.HyphenationPlayground", function() {
	"use strict";
	// initial loading

	var aLangCodes = [
		"bg",
		"ca",
		"hr",
		"cs",
		"da",
		"nl",
		"en-us",
		"et",
		"fi",
		"fr",
		"de",
		"el",
		"hi",
		"hu",
		"it",
		"lt",
		"nb-no",
		"pl",
		"pt",
		"ru",
		"sr",
		"sl",
		"es",
		"sv",
		"th",
		"tr",
		"uk"
	];

	var fnTakePicture = function(sLang, n) {
		var sNameOfTest = "should visualize hyphenation for language: " + sLang;
		var sNameOfImage = n + "_hyphenation_" + sLang;
		var sId = 'hyph-' + sLang;
		var text = element(by.id(sId));
		var script = "document.getElementById('" + sId + "').scrollIntoView()";

		it(sNameOfTest, function () {
			browser.executeScript(script).then(function() {
				expect(takeScreenshot(text)).toLookAs(sNameOfImage);
			});
		});
	};

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	for ( var index = 0; index < aLangCodes.length; index++) {
		fnTakePicture(aLangCodes[index], index + 1);
	}
});