/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.MessageStrip", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should show MessageStrip of type information without an icon", function() {
		expect(takeScreenshot(element(by.id("mcontainer1")))).toLookAs("information-messagestrip");
	});

	it("should show MessageStrip of type success", function() {
		expect(takeScreenshot(element(by.id("mcontainer2")))).toLookAs("success-messagestrip");
	});

	it("should show MessageStrip of type warning", function() {
		expect(takeScreenshot(element(by.id("mcontainer3")))).toLookAs("warning-messagestrip");
	});

	it("should show MessageStrip of type error", function() {
		expect(takeScreenshot(element(by.id("mcontainer4")))).toLookAs("error-messagestrip");
	});

	it("should show MessageStrip of type information and a close button", function() {
		expect(takeScreenshot(element(by.id("mcontainer5")))).toLookAs("information-messagestrip2");
	});

	it("should show MessageStrip with a long text of type information and a close button", function() {
		expect(takeScreenshot(element(by.id("mcontainer6")))).toLookAs("verylong-messagestrip");
	});

	it("should show all MessageStrips with margin between them", function() {
		element(by.id("margin-button")).click();
		expect(takeScreenshot()).toLookAs("messagestrips-with-margin");
	});

	it("should show MessageStrip containing a very long word without adding a scroll under IE11", function() {
		expect(takeScreenshot(element(by.id("mcontainer8")))).toLookAs("messagestrip-with-long-word");
	});

});
