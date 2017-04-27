/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.ActionSheet", function () {
	"use strict";

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	// verify actionsheet opens and contains the correct items
	it("should open ActionSheet with no title and no cancel", function () {
		element(by.id("noTitleNoCancel")).click();
		expect(takeScreenshot()).toLookAs("actionsheet-no-title-no-cancel");
		element(by.id("actionSheetButton")).click();
	});

	// verify actionsheet opens and contains the correct items
	it("should open ActionSheet with no title with cancel", function () {
		element(by.id("noTitleWithCancel")).click();
		expect(takeScreenshot()).toLookAs("actionsheet-no-title-with-cancel");
		element(by.id("actionSheetButton")).click();
	});

	// verify actionsheet opens and contains the correct items
	it("should open ActionSheet with title and cancel", function () {
		element(by.id("withTitleAndCancel")).click();
		expect(takeScreenshot()).toLookAs("actionsheet-with-title-and-cancel");
		element(by.id("actionSheetButton")).click();
	});

	// verify actionsheet opens and contains the correct items
	it("should open ActionSheet with many buttons", function () {
		element(by.id("withManyButtons")).click();
		expect(takeScreenshot()).toLookAs("actionsheet-with-many-buttons");
		element(by.id("actionSheetWithManyButtonsButton")).click();
	});

	// verify actionsheet opens and contains the correct items
	it("should open ActionSheet without icons", function () {
		element(by.id("withoutIcons")).click();
		expect(takeScreenshot()).toLookAs("actionsheet-without-icons");
		element(by.id("actionSheetWithoutIconsButton")).click();
	});


});
