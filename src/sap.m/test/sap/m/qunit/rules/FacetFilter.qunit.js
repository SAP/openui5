/*global QUnit */

sap.ui.define([
	"sap/m/FacetFilter",
	"sap/m/FacetFilterItem",
	"sap/m/FacetFilterList",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/ui/support/TestHelper"
], function(FacetFilter, FacetFilterItem, FacetFilterList, Page, Panel, BindingMode, JSONModel, testRule) {
	"use strict";

	QUnit.module("FacetFilter rules", {
		beforeEach: function() {
			this.model1 = new JSONModel({
				items: [{ text: 'a' }]
			});

			this.model2 = new JSONModel({
				items: [{ text: 'a' }]
			});
			this.model2.setDefaultBindingMode(BindingMode.OneWay);

			var ff1 = new FacetFilter({
				lists: [
					new FacetFilterList({
						items: {
							path: '/items',
							template: new FacetFilterItem({
								text: 'hardcoded'
							})
						},
						growing: true
					})
				]
			});
			ff1.setModel(this.model1);

			var ff2 = new FacetFilter({
				lists: [
					new FacetFilterList({
						items: {
							path: '/items',
							template: new FacetFilterItem({
								text: 'hardcoded'
							})
						},
						growing: true
					})
				]
			});
			ff2.setModel(this.model2);

			this.page = new Page({
				content: [
					new Panel({
						id: "FacetFilterTestsContext1",
						content: [
							ff1,
							ff2
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.page.destroy();
			this.model1 = null;
			this.model2 = null;
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "FacetFilterTestsContext1",
		libName: "sap.m",
		ruleId: "facetFilterGrowingOneWayBinding",
		expectedNumberOfIssues: 1
	});
});
