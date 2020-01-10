/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.ui.unified.YearRangePicker", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.calendar.YearRangePicker';

	it('YearRangePicker is rendered corretly', function() {
		var oYearRangePicker = element(by.id("YRP1"));
		expect(takeScreenshot(oYearRangePicker)).toLookAs("year_range_picker_rendered");
	});
});