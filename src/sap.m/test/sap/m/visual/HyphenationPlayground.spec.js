/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.HyphenationPlayground", function() {
	"use strict";

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

	var fnTakePictures = function(sLang, n) {
		var sNameOfTestNat = "should visualize hyphenation for language: " + sLang + "Native(CSS)";
		var sNameOfTest = "should visualize hyphenation for language: " + sLang;

		var sNameOfImageNat = n + "_Nat" + "_hyph_" + sLang;
		var sNameOfImage = n + "_3rd-party_hyph_" + sLang;

		var sIdNat = 'txt-' + sLang;
		var sId = 'hyph-' + sLang;

		var textNat = element(by.id(sIdNat));
		var text = element(by.id(sId));

		var scriptNat = "document.getElementById('" + sIdNat + "').scrollIntoView()";
		var script = "document.getElementById('" + sId + "').scrollIntoView()";
		var scriptFormWidth = 'sap.ui.getCore().byId("formWitTexts-' + sLang + '").setWidth("350px")';

		// with css native hyphenation
		it(sNameOfTestNat, function () {
			browser.executeScript(scriptFormWidth);
			browser.executeScript(scriptNat).then(function() {
				expect(takeScreenshot(textNat)).toLookAs(sNameOfImageNat);
			});
		});

		// with third-party hyphenation
		if ((sLang != "cs") && (sLang != "pl") && (sLang != "sr")) { // cs, pl and sr don't have 3rd party samples
			it(sNameOfTest, function () {
				browser.executeScript(script).then(function() {
					expect(takeScreenshot(text)).toLookAs(sNameOfImage);
				});
			});
		}
	};

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	for ( var index = 0; index < aLangCodes.length; index++) {
		fnTakePictures(aLangCodes[index], index + 1);
	}
});
