/*global describe,it,takeScreenshot,expect*/

describe("sap.f.AvatarGroup", function() {
	"use strict";

	it("Avatar group", function() {
		expect(takeScreenshot()).toLookAs("avatar_group");
	});
});
