/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.TableSelectDialog', function() {
	"use strict";

	it('should open simple table select dialog', function() {
		element(by.id('tsdWithBindingInput-vhi')).click();
		var tableSelectDialog = element(by.id('TableSelectDialog2-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('0-simple-tableSelectDialog');
		element(by.id('TableSelectDialog2-cancel')).click();
	});

	/*it('should open table select dialog in multiselect mode', function() {
		element(by.id('tsdWithMultiSelectButton')).click();
		var tableSelectDialog = element(by.id('TableSelectDialog4-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('tableSelectDialog-multiselect');

		element(by.id('TableSelectDialog4-table-sa-CbBg')).click();
		expect(takeScreenshot(tableSelectDialog)).toLookAs('1-tableSelectDialog-multiselect-selection');

		element(by.id('TableSelectDialog4-cancel')).click();
	});*/

	it('should open table select dialog in multiselect mode with large data', function() {
		element(by.id('tsdWithLargeDataAndMultiSelectButton')).click();
		var tableSelectDialog = element(by.id('TableSelectDialog5-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('2-TSD-multiselect-largeData');
		element(by.id('TableSelectDialog5-cancel')).click();
	});

	it('should open table select dialog in multiselect mode with very large data', function() {
		element(by.id('tsdWithVeryLargeDataButton')).click();
		var tableSelectDialog = element(by.id('TableSelectDialog6-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('3-TSD-multiselect-veryLargeData');
		element(by.id('TableSelectDialog6-cancel')).click();
	});

	it('should open table select dialog in multiselect mode with Reset enabled button and long title', function() {
		element(by.id('Button12')).click();
		var tableSelectDialog = element(by.id('resetButtonTableSelectDialog-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('4-TSD-resetButton-enabled');
		element(by.id('resetButtonTableSelectDialog-cancel')).click();
	});

	it('should open table select dialog, scroll down to see if headers are sticky', function() {
		element(by.id('Button12')).click();
		var tableSelectDialog = element(by.id('resetButtonTableSelectDialog-dialog'));
		element(by.id('__item7-resetButtonTableSelectDialog-table-49')).click();
		expect(takeScreenshot(tableSelectDialog)).toLookAs("5-TSD-sticky-headers");
		element(by.id('resetButtonTableSelectDialog-cancel')).click();
	});

	it('should open table select dialog in multiselect mode with Reset disabled button and no title', function() {
		element(by.id('Button3')).click();
		var tableSelectDialog = element(by.id('TableSelectDialog3-dialog'));
		expect(takeScreenshot(tableSelectDialog)).toLookAs('6-TSD-resetButton-disabled');
		element(by.id('TableSelectDialog3-cancel')).click();
	});

	it("Should open resizable TableSelectDialog", function () {
		element(by.id("Button13")).click();
		expect(takeScreenshot(element(by.id("TableSelectDialog13-dialog")))).toLookAs("7-TSD-resizable");
		element(by.id("TableSelectDialog13-cancel")).click();
	});

	it("Should open TableSelectDialog with Responsive Padding", function () {
		element(by.id("Button14")).click();
		expect(takeScreenshot(element(by.id("TableSelectDialog14-dialog")))).toLookAs("8-TSD-responsive-padding");
		element(by.id("TableSelectDialog14-cancel")).click();
	});
});