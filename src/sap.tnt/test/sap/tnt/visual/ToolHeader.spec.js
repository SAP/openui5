/* global describe, it, takeScreenshot, expect, element, by */

describe("sap.tnt.ToolHeader", function () {
	"use strict";

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should see shellLike toolHeader", function () {
		var toolHeader = element(by.id("shellLike"));
		expect(takeScreenshot(toolHeader)).toLookAs("1_shell_like");
	});

	it("should see toolHeaderIcons", function () {
		var toolHeader = element(by.id("toolHeaderIcons"));
		expect(takeScreenshot(toolHeader)).toLookAs("2_tool_header_icons");
	});

	it("should see toolHeaderButtons", function () {
		var toolHeader = element(by.id("toolHeaderButtons"));
		expect(takeScreenshot(toolHeader)).toLookAs("3_tool_header_buttons");
	});

	it("should see toolHeaderButtons2", function () {
		var toolHeader = element(by.id("toolHeaderButtons2"));
		expect(takeScreenshot(toolHeader)).toLookAs("4_tool_header_buttons_2");
	});

	it("should see toolHeaderSelectSearch", function () {
		var toolHeader = element(by.id("toolHeaderSelectSearch"));
		expect(takeScreenshot(toolHeader)).toLookAs("5_tool_header_select_search");
	});

	it("should see toolHeaderITB", function () {
		var toolHeader = element(by.id("toolHeaderITB"));
		expect(takeScreenshot(toolHeader)).toLookAs("6_tool_header_ITB");
	});

	it("should see toolHeaderObjStatus", function () {
		var toolHeader = element(by.id("toolHeaderObjStatus"));
		expect(takeScreenshot(toolHeader)).toLookAs("7_tool_header_obj_status");
	});

	it("should see toolHeaderObjStatusInverted", function () {
		var toolHeader = element(by.id("toolHeaderObjStatusInverted"));
		expect(takeScreenshot(toolHeader)).toLookAs("8_tool_header_obj_status_inverted");
	});

	it("should see shellLike toolHeader Compact", function () {
		element(by.id("toggleCompact")).click();
		var toolHeader = element(by.id("shellLike"));
		expect(takeScreenshot(toolHeader)).toLookAs("9_shell_like_compact");
	});

	it("should see toolHeaderIcons Compact", function () {
		var toolHeader = element(by.id("toolHeaderIcons"));
		expect(takeScreenshot(toolHeader)).toLookAs("10_tool_header_icons_compact");
	});

	it("should see toolHeaderButtons Compact", function () {
		var toolHeader = element(by.id("toolHeaderButtons"));
		expect(takeScreenshot(toolHeader)).toLookAs("11_tool_header_buttons_compact");
	});

	it("should see toolHeaderButtons2 Compact", function () {
		var toolHeader = element(by.id("toolHeaderButtons2"));
		expect(takeScreenshot(toolHeader)).toLookAs("12_tool_header_buttons_2_compact");
	});

	it("should see toolHeaderSelectSearch Compact", function () {
		var toolHeader = element(by.id("toolHeaderSelectSearch"));
		expect(takeScreenshot(toolHeader)).toLookAs("13_tool_header_select_search_compact");
	});

	it("should see toolHeaderITB Compact", function () {
		var toolHeader = element(by.id("toolHeaderITB"));
		expect(takeScreenshot(toolHeader)).toLookAs("14_tool_header_ITB_compact");
	});

	it("should see toolHeaderObjStatus Compact", function () {
		var toolHeader = element(by.id("toolHeaderObjStatus"));
		expect(takeScreenshot(toolHeader)).toLookAs("15_tool_header_obj_status_compact");
	});

	it("should see toolHeaderObjStatusInverted Compact", function () {
		var toolHeader = element(by.id("toolHeaderObjStatusInverted"));
		expect(takeScreenshot(toolHeader)).toLookAs("16_tool_header_obj_status_inverted_com");
	});
});