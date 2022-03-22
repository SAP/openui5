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
		"el-monoton",
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
		"el-monoton" : "350px",
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
		it("should visualize hyphenation for language: " + sLang, function () {
			var oForm = element(by.id("formWithTexts-" + sLang));

			browser.executeScript("sap.ui.getCore().byId('formWithTexts-" + sLang + "').setWidth('" + aFormWidth[sLang] + "')");
			browser.executeScript("document.getElementById('formWithTexts-" + sLang + "').scrollIntoView()");

			expect(takeScreenshot(oForm)).toLookAs(n + "_language_" + sLang);
		});
	};

	for (var index = 0; index < aLangCodes.length; index++) {
		fnTakePictures(aLangCodes[index], index + 1);
	}
});
