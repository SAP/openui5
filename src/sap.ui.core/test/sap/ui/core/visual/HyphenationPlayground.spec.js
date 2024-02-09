/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.ui.core.HyphenationPlayground", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.core.hyphenation.Hyphenation'; // Hyphenation API

	var aLangCodesWithThirdPartySupport = [
		"bg",
		"ca",
		"hr",
		"da",
		"nl",
		"en-us",
		"et",
		"fi",
		"fr",
		"de",
		"el-monoton",
		"hi",
		"hu",
		"it",
		"lt",
		"nb-no",
		"pt",
		"ru",
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
		"da": "350px",
		"nl" : "320px",
		"en-us": "280px",
		"et" : "350px",
		"fi": "350px",
		"fr" : "340px",
		"de" : "350px",
		"el-monoton" : "350px",
		"hi" : "150px",
		"hu" : "350px",
		"it" : "350px",
		"lt" : "320px",
		"nb-no": "320px",
		"pt" : "350px",
		"ru" : "350px",
		"sl" : "350px",
		"es" : "350px",
		"sv" : "350px",
		"th" : "320px",
		"tr" : "300px",
		"uk": "200px"
	};

	var fnTakePictures = function(sLang, n) {
		it("should visualize hyphenation for language: " + sLang, function () {
			var oText = element(by.id("hyph-" + sLang));

			browser.executeScript(function (sId, width) {
				var Element = sap.ui.require("sap/ui/core/Element");
				Element.getElementById(sId).setWidth(width);
				document.getElementById(sId).scrollIntoView();
				}, 'formWithTexts-' + sLang, aFormWidth[sLang]);

			expect(takeScreenshot(oText)).toLookAs(n + "_thirdParty_language_" + sLang);
		});
	};

	for (var index = 0; index < aLangCodesWithThirdPartySupport.length; index++) {
		fnTakePictures(aLangCodesWithThirdPartySupport[index], index + 1);
	}
});