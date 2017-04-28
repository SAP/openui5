/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.AppWithBackground", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.App';

	var fnClickThenCompare = function (sId, sImageName, sTestMessage) {
		it(sTestMessage, function () {
			element(by.id(sId)).click();
			expect(takeScreenshot()).toLookAs(sImageName);
		});
	};

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	fnClickThenCompare("streched-cheetah-btn", "app-strc-cheetah",
			"should show application with background of streched cheetah");
	fnClickThenCompare("repeating-translucent-cheetah-btn", "app-rpt-transl-cheetah",
			"should show application with background of translucent repeating cheetah");
});
