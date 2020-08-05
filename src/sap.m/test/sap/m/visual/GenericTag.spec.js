/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.GenericTag", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify GenericTag has a focus outline
	it('should click on the GenericTag', function() {
		element(by.id('genericTag')).click();
		expect(takeScreenshot(element(by.id('genericTag')))).toLookAs('generic_tag_after_click');
	});
});
