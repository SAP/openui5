/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.ui.core.HyphenationPlayground", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.core.hyphenation.Hyphenation'; // Hyphenation API

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

	var aFormWidth = {
		"bg": "300px",
		"ca" : "350px",
		"hr" : "350px",
		"cs" : "280px",
		"da": "350px",
		"nl" : "320px",
		"en-us": "280px",
		"et" : "350px",
		"fi": "350px",
		"fr" : "340px",
		"de" : "350px",
		"el" : "350px",
		"hi" : "280px",
		"hu" : "350px",
		"it" : "350px",
		"lt" : "320px",
		"nb-no": "320px",
		"pl" : "350px",
		"pt" : "350px",
		"ru" : "350px",
		"sr" : "320px",
		"sl" : "350px",
		"es" : "350px",
		"sv" : "350px",
		"th" : "320px",
		"tr" : "300px",
		"uk": "200px"
	};

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
		var scriptFormWidth = 'sap.ui.getCore().byId("formWitTexts-' + sLang + '").setWidth("' + aFormWidth[sLang] + '")';

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

	for ( var index = 0; index < aLangCodes.length; index++) {
		fnTakePictures(aLangCodes[index], index + 1);
	}
});
