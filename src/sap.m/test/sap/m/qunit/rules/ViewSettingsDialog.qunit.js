/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("ViewSettingsDialog rules", {
		setup: function() {
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "ViewSettingsDialogTestsContext1",
						content: [
							new sap.m.ViewSettingsDialog({
								sortItems: [
									new sap.m.ViewSettingsItem({
										text: 'a'
									})
								]
							}),
							new sap.m.ViewSettingsDialog({
								filterItems: [
									new sap.m.ViewSettingsFilterItem({
										text: 'a'
									})
								]
							}),
							new sap.m.ViewSettingsDialog({
								filterItems: [
									new sap.m.ViewSettingsFilterItem({
										key: 'a',
										text: 'a'
									})
								],
								groupItems: [
									new sap.m.ViewSettingsItem({
										key: 'b',
										text: 'b'
									})
								],
								sortItems: [
									new sap.m.ViewSettingsItem({
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
		teardown: function() {
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
