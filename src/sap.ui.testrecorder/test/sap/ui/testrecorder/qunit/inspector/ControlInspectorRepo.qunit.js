/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/inspector/ControlInspectorRepo"
], function (ControlInspectorRepo) {
	"use strict";

	QUnit.module("ControlInspectorRepo", {
		beforeEach: function () {
			this.testData = [{
				request: {
					domElementId: "container-cart---homeView--searchField",
					action: "PRESS"
				},
				selector: {
					id: "container-cart---homeView--searchField"
				},
				snippet: "element(by.control({\n" +
				"    id: \"container-cart---homeView--searchField\"\n" +
				"}));\n"
			}, {
				request: {
					domElementId: "__item3-container-cart---homeView--categoryList-0",
					action: "PRESS"
				},
				selector: {
					controlType: "sap.m.StandardListItem",
					viewName: "sap.ui.demo.cart.view.Home",
					bindingPath: {
						path: "/ProductCategories('AC')",
						propertyPath: "CategoryName"
					}
				},
				snippet: "element(by.control({\n" +
					"    controlType: \"sap.m.StandardListItem\",\n" +
					"    viewName: \"sap.ui.demo.cart.view.Home\",\n" +
					"    bindingPath: {\n" +
					"        path: \"/ProductCategories('AC')\",\n" +
					"        propertyPath: \"CategoryName\"\n" +
					"    }\n" +
				"}));"
			}];

			this.testData.forEach(function (mData) {
				ControlInspectorRepo.save(mData.request, mData.selector, mData.snippet);
			});
		},
		afterEach: function () {
			ControlInspectorRepo.clear();
		}
	});

	QUnit.test("Should save all data for a domElementId", function (assert) {
		var aRepo = ControlInspectorRepo.getAll();
		assert.strictEqual(aRepo.length, 2, "Should save all entries");
		assert.strictEqual(aRepo[0].domElementId, this.testData[0].request.domElementId);
		assert.strictEqual(aRepo[0].selector, this.testData[0].selector);
		assert.strictEqual(aRepo[1].domElementId, this.testData[1].request.domElementId);
		assert.strictEqual(aRepo[1].selector, this.testData[1].selector);
	});

	QUnit.test("Should update data for a domElementId", function (assert) {
		var mNewData = {
			request: {
				domElementId: "container-cart---homeView--searchField",
				action: "ENTER_TEXT"
			},
			selector: {
				id: "searchField-new"
			},
			snippet: "element(by.control({\n" +
			"    id: \"searchField-new\"\n" +
			"}));\n"
		};
		ControlInspectorRepo.save(mNewData.request, mNewData.selector, mNewData.snippet);
		var aRepo = ControlInspectorRepo.getAll();
		assert.strictEqual(aRepo.length, 2, "Should save all entries");
		assert.strictEqual(aRepo[0].domElementId, mNewData.request.domElementId);
		assert.strictEqual(aRepo[0].selector, mNewData.selector);
		assert.strictEqual(aRepo[0].snippet, mNewData.snippet);
		assert.strictEqual(aRepo[1].domElementId, this.testData[1].request.domElementId);
		assert.strictEqual(aRepo[1].selector, this.testData[1].selector);
	});

	QUnit.test("Should find cached selector", function (assert) {
		var sSelector = ControlInspectorRepo.findSelector("__item3-container-cart---homeView--categoryList-0");
		assert.strictEqual(sSelector, this.testData[1].selector, "Should find the selector");
		var sMissingSelector = ControlInspectorRepo.findSelector("missing-ID");
		assert.ok(!sMissingSelector, "Should return null if selector is not cached");
	});

	QUnit.test("Should get all data of type", function (assert) {
		["request", "selector", "snippet"].forEach(function (sType) {
			var aResult = ControlInspectorRepo["get" + sType.charAt(0).toUpperCase() + sType.substr(1) + "s"]();
			assert.deepEqual(aResult[0], this.testData[0][sType]);
			assert.deepEqual(aResult[1], this.testData[1][sType]);
		}.bind(this));
	});

});
