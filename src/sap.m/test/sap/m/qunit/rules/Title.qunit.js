/*global QUnit testRule*/

sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	QUnit.module("Title rule tests", {
		setup: function () {
			this.page = new sap.m.Page("myPage", {
				content: [
					new sap.m.Title({
						text: "Default title"
					}),
					new sap.m.Title({
						text: "Title with level auto",
						level: sap.ui.core.TitleLevel.Auto
					}),
					new sap.m.Title({
						text: "Title with level H1",
						level: sap.ui.core.TitleLevel.H1
					}),
					new sap.m.Title({
						text: "Title with level H5",
						level: sap.ui.core.TitleLevel.H5
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		teardown: function () {
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
