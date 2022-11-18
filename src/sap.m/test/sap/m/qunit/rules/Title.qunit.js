/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/m/Title",
	"sap/ui/core/library",
	"test-resources/sap/ui/support/TestHelper"
], function (Page, Title, coreLibrary, testRule) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	QUnit.module("Title rule tests", {
		beforeEach: function () {
			this.page = new Page("myPage", {
				content: [
					new Title({
						text: "Default title"
					}),
					new Title({
						text: "Title with level auto",
						level: TitleLevel.Auto
					}),
					new Title({
						text: "Title with level H1",
						level: TitleLevel.H1
					}),
					new Title({
						text: "Title with level H5",
						level: TitleLevel.H5
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "myPage",
		libName: "sap.m",
		ruleId: "titleLevelProperty",
		expectedNumberOfIssues: 2
	});
});
