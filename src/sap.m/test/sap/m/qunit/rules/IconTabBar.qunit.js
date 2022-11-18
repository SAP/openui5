/*global QUnit */

sap.ui.define([
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/library",
	"test-resources/sap/ui/support/TestHelper"
], function (IconTabBar, IconTabFilter, IconTabSeparator, Label, Page, Text, mobileLibrary, coreLibrary,testRule) {
	"use strict";

	var IconColor = coreLibrary.IconColor;
	var IconTabFilterDesign = mobileLibrary.IconTabFilterDesign;
	var IconTabHeaderMode = mobileLibrary.IconTabHeaderMode;

	QUnit.module("IconTabBar rule tests", {
		beforeEach: function () {
			this.page = new Page("myPage", {
				title : "IconTabBar Support Rules Test",
				content: [
					new IconTabBar("itb-filter", {
						expanded: true,
						expandable: true,
						selectedKey: "key3",
						items: [
							new IconTabFilter({
								showAll: true,
								design: IconTabFilterDesign.Horizontal,
								count: "30",
								text: "products"
							}),
							new IconTabSeparator(),
							new IconTabFilter({
								//icon: "sap-icon://hint",
								iconColor: IconColor.Neutral,
								count: "10",
								design: IconTabFilterDesign.Horizontal,
								key: "key1",
								text: "Neutral with long long long text"

							}),
							new IconTabFilter({
								icon: "sap-icon://activity-items",
								iconColor: IconColor.Critical,
								count: "10",
								design: IconTabFilterDesign.Horizontal,
								key: "key2",
								text: "Critical lorem long text"
							}),
							new IconTabFilter({
								//icon: "sap-icon://attachment",
								count: "5",
								design: IconTabFilterDesign.Horizontal,
								iconColor: IconColor.Negative,
								text: "Short text",
								key: "key3"
							})
						],
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabBar("itb-mixed", {
						applyContentPadding: false,
						headerMode: IconTabHeaderMode.Inline,
						items: [
							new IconTabFilter({
								icon: "sap-icon://attachment", //not correct
								iconColor: IconColor.Default,
								text: "Lorem",
								count: "3",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Ipsum",
								count: "3",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new Text({
										text: "info info info"
									})
								]
							})
						]
					}),
					new IconTabBar("itb-icons", {
						items: [
							new IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: IconColor.Neutral,
								text: "Lorem",
								count: "33333",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: IconColor.Contrast,
								text: "Lorem",
								count: "3333",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								icon: "sap-icon://attachment",
								iconColor: IconColor.Positive,
								text: "Lorem",
								count: "33333333333",
								content: [
									new Text({
										text: "info info info"
									})
								]
							})
						]
					}),
					new IconTabBar("itb-text", {
						applyContentPadding: false,
						headerMode: IconTabHeaderMode.Inline,
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Ipsum",
								count: "3",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new Text({
										text: "info info info"
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "Lorem Ipsum",
								count: "233",
								content: [
									new Text({
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
		afterEach: function () {
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
