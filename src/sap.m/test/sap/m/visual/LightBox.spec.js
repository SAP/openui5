/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.LightBox', function() {
	"use strict";

	it('should load test page LightBox', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	// LightBox big picture test

	it('should show body with lightBox', function () {
		element(by.id('image1')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-big-picture-body');
	});

	it('should show lightBox only', function () {
		expect(takeScreenshot(element(by.id('lB1')))).toLookAs('lb-big-picture');
		element(by.id('lB1-closeButton')).click();
	});

	// LightBox very big picture test

	//Discussed with team Belasitsa - tests will be commented until further research on how to guarantee
	//that the image will be fully loaded before taking screenshot

	// it('should show body with lightBox - very big image', function () {
	// 	element(by.id('image2')).click();
	// 	expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-very-big-picture-body');
	// });
	//
	// it('should show lightBox only - very big image', function () {
	// 	expect(takeScreenshot(element(by.id('lB2')))).toLookAs('lb-very-big-picture');
	// 	element(by.id('lB2-closeButton')).click();
	// });

	// LightBox big horizontal picture test

	it('should show body with lightBox - big horizontal image', function () {
		element(by.id('image3')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-big-horizontal-picture-body');
	});

	it('should show lightBox only - big horizontal image', function () {
		expect(takeScreenshot(element(by.id('lB3')))).toLookAs('lb-big-horizontal-picture');
		element(by.id('lB3-closeButton')).click();
	});

	// LightBox vertical picture test

	it('should show body with lightBox - vertical image', function () {
		element(by.id('image4')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-vertical-picture-body');
	});

	it('should show lightBox only - vertical image', function () {
		expect(takeScreenshot(element(by.id('lB4')))).toLookAs('lb-vertical-picture');
		element(by.id('lB4-closeButton')).click();
	});

	// LightBox picture smaller than LightBox minimal size test

	it('should show body with lightBox - image smaller than LightBox minimal size', function () {
		element(by.id('image5')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-small-picture-body');
	});

	it('should show lightBox only - image smaller than LightBox minimal size', function () {
		expect(takeScreenshot(element(by.id('lB5')))).toLookAs('lb-small-picture');
		element(by.id('lB5-closeButton')).click();
	});

	// LightBox picture height bigger than LightBox minimal size test

	it('should show body with lightBox - image height bigger than LightBox minimal size', function () {
		element(by.id('image6')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-bigger-height-picture-body');
	});

	it('should show lightBox only - image height bigger than LightBox minimal size', function () {
		expect(takeScreenshot(element(by.id('lB6')))).toLookAs('lb-bigger-height-picture');
		element(by.id('lB6-closeButton')).click();
	});

	// LightBox picture width bigger than LightBox minimal size test

	it('should show body with lightBox - image width bigger than LightBox minimal size', function () {
		element(by.id('image7')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-bigger-width-picture-body');
	});

	it('should show lightBox only - image width bigger than LightBox minimal size', function () {
		expect(takeScreenshot(element(by.id('lB7')))).toLookAs('lb-bigger-width-picture');
		element(by.id('lB7-closeButton')).click();
	});

	// LightBox invalid picture test

	it('should show body with lightBox - invalid image', function () {
		element(by.id('image8')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-invalid-picture-body');
	});

	it('should show lightBox only - invalid image', function () {
		expect(takeScreenshot(element(by.id('lB8')))).toLookAs('lb-invalid-picture');
		element(by.id('lB8-closeButton')).click();
	});

	// LightBox Compactmode

	it('should show lightBox compact mode', function () {
		element(by.id('toggleCompactModeButton')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lb-comapct-mode');
	});
});