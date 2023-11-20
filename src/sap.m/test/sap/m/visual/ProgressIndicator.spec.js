/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.ProgressIndicator", function() {
	"use strict";

	it("ProgressIndicator initial rendering", function() {
		for (var i = 1; i < 10; i++) {
			// ProgressIndicator id=pi5 is not visible
			if (i === 5) {
				continue;
			}

			expect(takeScreenshot(element(by.id('pi' + i)))).toLookAs("initial-rendering-pi" + i);
		}
	});

	it("ProgressIndicator set to 40%", function() {
		element(by.id("change_pi")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-value-changed");
	});

	it("ProgressIndicator set to -20%", function() {
		element(by.id("change_pi_empty")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-value-changed-empty");
	});

	it("ProgressIndicator set to 120%", function() {
		element(by.id("change_pi_full")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-value-changed-full");
	});

	it("ProgressIndicator set height", function() {
		element(by.id("small_pi")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-small");
	});

	it("ProgressIndicator set disable", function() {
		element(by.id("disable_pi")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-disabled");
	});

	it("ProgressIndicator set State", function() {
		element(by.id("state_pi")).click();
		expect(takeScreenshot(element(by.id("pi8")))).toLookAs("PI-neutral-state");
	});

});