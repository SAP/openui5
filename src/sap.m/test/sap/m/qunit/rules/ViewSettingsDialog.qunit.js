/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/ViewSettingsDialog",
	"sap/m/ViewSettingsItem",
	"sap/m/ViewSettingsFilterItem",
	"test-resources/sap/ui/support/TestHelper"
], function(Page, Panel, ViewSettingsDialog, ViewSettingsItem, ViewSettingsFilterItem, testRule) {
	"use strict";

	QUnit.module("ViewSettingsDialog rules", {
		beforeEach: function() {
			this.page = new Page({
				content: [
					new Panel({
						id: "ViewSettingsDialogTestsContext1",
						content: [
							new ViewSettingsDialog({
								sortItems: [
									new ViewSettingsItem({
										text: 'a'
									})
								]
							}),
							new ViewSettingsDialog({
								filterItems: [
									new ViewSettingsFilterItem({
										text: 'a'
									})
								]
							}),
							new ViewSettingsDialog({
								filterItems: [
									new ViewSettingsFilterItem({
										key: 'a',
										text: 'a'
									})
								],
								groupItems: [
									new ViewSettingsItem({
										key: 'b',
										text: 'b'
									})
								],
								sortItems: [
									new ViewSettingsItem({
										key: 'c',
										text: 'c'
									})
								]
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "ViewSettingsDialogTestsContext1",
		libName: "sap.m",
		ruleId: "vsdItemsHaveKeys",
		expectedNumberOfIssues: 2
	});
});
