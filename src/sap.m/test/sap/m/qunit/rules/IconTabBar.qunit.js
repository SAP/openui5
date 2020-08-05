/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function (jQuery, testRule) {
	"use strict";

	QUnit.module("IconTabBar rule tests", {
		setup: function () {
			this.page = new sap.m.Page("myPage", {
				title : "IconTabBar Support Rules Test",
				content: [
					new sap.m.IconTabBar("itb-filter", {
						expanded: true,
						expandable: true,
						selectedKey: "key3",
						items: [
							new sap.m.IconTabFilter({
								showAll: true,
								design: sap.m.IconTabFilterDesign.Horizontal,
								count: "30",
								text: "products"
							}),
							new sap.m.IconTabSeparator(),
							new sap.m.IconTabFilter({
								//icon: "sap-icon://hint",
								iconColor: sap.ui.core.IconColor.Neutral,
								count: "10",
								design: sap.m.IconTabFilterDesign.Horizontal,
								key: "key1",
								text: "Neutral with long long long text"

							}),
							new sap.m.IconTabFilter({
								icon: "sap-icon://activity-items",
								iconColor: sap.ui.core.IconColor.Critical,
								count: "10",
								design: sap.m.IconTabFilterDesign.Horizontal,
								key: "key2",
								text: "Critical lorem long text"
							}),
							new sap.m.IconTabFilter({
								//icon: "sap-icon://attachment",
								count: "5",
								design: sap.m.IconTabFilterDesign.Horizontal,
								iconColor: sap.ui.core.IconColor.Negative,
								text: "Short text",
								key: "key3"
							})
						],
						content: [
							new sap.m.Label({
								text: "info info info"
							})
						]
					}),
					new sap.m.IconTabBar("itb-mixed", {
						applyContentPadding: false,
						headerMode: sap.m.IconTabHeaderMode.Inline,
						items: [
							new sap.m.IconTabFilter({
								icon: "sap-icon://attachment", //not correct
								iconColor: sap.ui.core.IconColor.Default,
								text: "Lorem",
								count: "3",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Ipsum",
								count: "3",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							})
						]
					}),
					new sap.m.IconTabBar("itb-icons", {
						items: [
							new sap.m.IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: sap.ui.core.IconColor.Neutral,
								text: "Lorem",
								count: "33333",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: sap.ui.core.IconColor.Contrast,
								text: "Lorem",
								count: "3333",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: sap.ui.core.IconColor.Positive,
								text: "Lorem",
								count: "33333333333",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							})
						]
					}),
					new sap.m.IconTabBar("itb-text", {
						applyContentPadding: false,
						headerMode: sap.m.IconTabHeaderMode.Inline,
						items: [
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Ipsum",
								count: "3",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							}),
							new sap.m.IconTabFilter({
								iconColor: sap.ui.core.IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new sap.m.Text({
										text: "info info info"
									})
								]
							})
						]
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
		ruleId: "iconTabFilterWithHorizontalDesingShouldHaveIcons",
		expectedNumberOfIssues: 2
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "myPage",
		libName: "sap.m",
		ruleId: "iconTabBarIconsRule",
		expectedNumberOfIssues: 2
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "myPage",
		libName: "sap.m",
		ruleId: "iconTabFilterWithIconsAndLongCount",
		expectedNumberOfIssues: 2
	});
});
