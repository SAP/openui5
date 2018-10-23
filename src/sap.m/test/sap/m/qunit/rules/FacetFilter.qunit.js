/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("FacetFilter rules", {
		setup: function() {
			this.model1 = new sap.ui.model.json.JSONModel({
				items: [{ text: 'a' }]
			});

			this.model2 = new sap.ui.model.json.JSONModel({
				items: [{ text: 'a' }]
			});
			this.model2.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

			var ff1 = new sap.m.FacetFilter({
				lists: [
					new sap.m.FacetFilterList({
						items: {
							path: '/items',
							template: new sap.m.FacetFilterItem({
								text: 'hardcoded'
							})
						},
						growing: true
					})
				]
			});
			ff1.setModel(this.model1);

			var ff2 = new sap.m.FacetFilter({
				lists: [
					new sap.m.FacetFilterList({
						items: {
							path: '/items',
							template: new sap.m.FacetFilterItem({
								text: 'hardcoded'
							})
						},
						growing: true
					})
				]
			});
			ff2.setModel(this.model2);

			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
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
		teardown: function() {
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
