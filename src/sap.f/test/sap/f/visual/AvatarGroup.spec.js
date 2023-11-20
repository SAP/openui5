/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.f.AvatarGroup", function() {
	"use strict";

	it("Avatar group", function() {
		expect(takeScreenshot(element(by.id("avatar-group-page-cont")))).toLookAs("avatar_group");
	});
});
