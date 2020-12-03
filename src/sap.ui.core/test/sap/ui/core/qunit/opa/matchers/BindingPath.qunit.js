/*global QUnit */
sap.ui.define([
	'sap/ui/test/matchers/BindingPath',
	'sap/m/List',
	'../fixture/bindingPath'
], function (BindingPath, List, fixture) {
	"use strict";

	QUnit.module("BindingPath - basics");

	QUnit.test("Should not match anything if context and property path are undefined", function (assert) {
		var oBindingPath = new BindingPath();
		var bMatch = oBindingPath.isMatching(new List());

		assert.ok(!bMatch, "Should not match any element if both paths are undefined");
	});

	QUnit.module("BindingPath - properties", {
		beforeEach: function () {
			fixture.PropertyFixture.beforeEach.call(this);
		},

		afterEach: function () {
			fixture.PropertyFixture.afterEach.call(this);
		}
	});

	QUnit.test("Should match property path", function (assert) {
		var oBindingPath = new BindingPath({
			propertyPath: "/propertyText"
		});
		var bResult = oBindingPath.isMatching(this.oPropertyText);
		assert.ok(bResult, "Should match control with exact property path");

		oBindingPath.setPropertyPath(/\/prop.*Text/);
		assert.ok(oBindingPath.isMatching(this.oPropertyText), "Should match control with regex property path");
		oBindingPath.setPropertyPath(/\/PROP.*TeXt/i);
		assert.ok(oBindingPath.isMatching(this.oPropertyText), "Should match control with property path - regex + flags");

		oBindingPath.setPropertyPath({regex: {source: "\/PROP.*TeXt", flags: "i"}});
		assert.ok(oBindingPath.isMatching(this.oPropertyText), "Should match control with property path - declarative regex");
	});

	QUnit.test("Should match composite property binding path", function (assert) {
		var oBindingPath = new BindingPath();
		oBindingPath.setPropertyPath("/compositeProperty/partOne");
		var bResultOne = oBindingPath.isMatching(this.oCompositePropertyText);

		oBindingPath.setPropertyPath("/compositeProperty/partTwo");
		var bResultTwo = oBindingPath.isMatching(this.oCompositePropertyText);
		assert.ok(bResultOne && bResultTwo, "Should match control with composite property path and model name");

		oBindingPath.setPropertyPath(/comp.*Property.*Two/);
		assert.ok(oBindingPath.isMatching(this.oCompositePropertyText), "Should match control with regex property path");
	});

	QUnit.test("Should match both property path and model name", function (assert) {
		var oBindingPath = new BindingPath({
			modelName: "myModel",
			propertyPath: "/propertyText"
		});
		var bResult = oBindingPath.isMatching(this.oNamedModelPropertyText);
		assert.ok(bResult, "Should match control with exact property path and model name");
	});

	QUnit.test("Should match by static value", function (assert) {
		var oBindingPath = new BindingPath({
			value: "hello"
		});
		var bResult = oBindingPath.isMatching(this.oStaticPropertyText);
		assert.ok(bResult, "Should match control with static binding");
	});

	QUnit.test("Should not match property path if model name is different", function (assert) {
		var oBindingPath = new BindingPath({
			modelName: "name",
			propertyPath: "/propertyText"
		});
		var bResult = oBindingPath.isMatching(this.oNamedModelPropertyText);
		assert.ok(!bResult, "Should not match if path is the same but model name does not match");
	});

	QUnit.test("Should not match if property path is different and model is the same", function (assert) {
		var oBindingPath = new BindingPath({
			modelName: "myModel",
			propertyPath: "/property"
		});
		var bResult = oBindingPath.isMatching(this.oNamedModelPropertyText);
		assert.ok(!bResult, "Should not match if property path is different");
	});

	QUnit.module("_BindingPath - object binding", {
		beforeEach: function () {
			fixture.ObjectFixture.beforeEach.call(this);
		},
		afterEach: function () {
			fixture.ObjectFixture.afterEach.call(this);
		}
	});

	QUnit.test("Should match control with bound object", function (assert) {
		var oBindingPath = new BindingPath({
			path: "/compositeProperty"
		});
		oBindingPath.setPropertyPath("partOne");
		var bResultOne = oBindingPath.isMatching(this.oInput);
		oBindingPath.setPropertyPath("partTwo");
		var bResultTwo = oBindingPath.isMatching(this.oInput);
		assert.ok(bResultOne && bResultTwo, "Should match control with composite property path and object binding");

		oBindingPath.setPropertyPath(/^\/.*Two/);
		assert.ok(oBindingPath.isMatching(this.oInput), "Should match control with regex property path");
	});

	QUnit.test("Should match control with parent object binding", function (assert) {
		var oBindingPath = new BindingPath({
			path: "/compositeProperty"
		});
		oBindingPath.setPropertyPath("partOne");
		var bResultOne = oBindingPath.isMatching(this.oTexts[0]);
		oBindingPath.setPropertyPath("partTwo");
		var bResultTwo = oBindingPath.isMatching(this.oTexts[1]);
		assert.ok(bResultOne && bResultTwo, "Should match control with composite property path and parent object binding");

		oBindingPath.setPath(/^\/composite.*/);
		oBindingPath.setPropertyPath(/^\/.*Two/);
		assert.ok(oBindingPath.isMatching(this.oTexts[1]), "Should match control with regex paths");
	});

	// crucial usecase for tests exising before propertyPath is introduced
	QUnit.test("Should match with context path only", function (assert) {
		var oBindingPath = new BindingPath({
			path: "/compositeProperty"
		});
		var aMatchingControls = this.oTexts.concat([this.oInput]);
		var bResults = aMatchingControls.filter(function (oControl) {
			return oBindingPath.isMatching(oControl);
		});
		assert.strictEqual(bResults.length, aMatchingControls.length, "Should match even if only context path is given");

		oBindingPath.setPath(/^\/.*COMPosite/i);
		assert.ok(oBindingPath.isMatching(this.oInput), "Should match control with property path - regex and flags");
		oBindingPath.setPath({regex: {source: "^\/.*COMPosite", flags: "i"}});
		assert.ok(oBindingPath.isMatching(this.oInput), "Should match control with property path - declarative regex");
	});

	QUnit.test("Should not match if only context path is different", function (assert) {
		var oBindingPath = new BindingPath({
			path: "/compositeProperty11",
			propertyPath: "partOne"
		});
		var bResult = oBindingPath.isMatching(this.oInput);
		assert.ok(!bResult, "Should not match if context path is different");

		oBindingPath.setPath(/compOsIte/);
		assert.ok(!oBindingPath.isMatching(this.oInput), "Should not match if context path regex is different");
	});

	QUnit.test("Should not match if only property path is different", function (assert) {
		 var oBindingPath = new BindingPath({
			path: "/compositeProperty",
			propertyPath: "partOne11"
		});
		var bResult = oBindingPath.isMatching(this.oInput);
		assert.ok(!bResult, "Should not match if property path is different");
	});

	QUnit.test("Should not match if only model name is different", function (assert) {
		var oBindingPath = new BindingPath({
			path: "/compositeProperty",
			propertyPath: "partOne"
		});
		assert.ok(!oBindingPath.isMatching(this.oNamedInput), "Should not match if model name is different");
		oBindingPath.setModelName("myModel");
		assert.ok(oBindingPath.isMatching(this.oNamedInput), "Should match if model name matches");
	});

	QUnit.module("_BindingPath - aggregation", {
		beforeEach: function () {
			fixture.AggregationFixture.beforeEach.call(this);
		},
		afterEach: function () {
			fixture.AggregationFixture.afterEach.call(this);
		}
	});

	QUnit.test("Should match control with aggregation binding", function (assert) {
		var aMatchingLists = this.aLists.filter(function (oList, iListIndex) {
			var oBindingPath = new BindingPath({
				propertyPath: "/" + fixture.AggregationFixture.data.paths[iListIndex]
			});
			return oBindingPath.isMatching(oList);
		});
		assert.strictEqual(aMatchingLists.length, this.aLists.length, "Should match control with aggregation context binding");
	});

	QUnit.test("Should match control with named aggregation binding", function (assert) {
		var mModels = {unnamed: "", named: "myModel"};
		var aMatches = Object.keys(mModels).map(function (sKey, index) {
			var aMatchingLists = this.aNamedLists.filter(function (oList, iListIndex) {
				var oBindingPath = new BindingPath({
					propertyPath: "/" + fixture.AggregationFixture.data.paths[iListIndex],
					modelName: mModels[sKey]
				});
				return oBindingPath.isMatching(oList);
			});
			return aMatchingLists.length === this.aNamedLists.length;
		}.bind(this));

		assert.ok(!aMatches[0], "Should not match control with aggregation context binding when model is different");
		assert.ok(aMatches[1], "Should match control with aggregation context binding when model is the same");
	});

	QUnit.test("Should match control within aggregation", function (assert) {
		var aMatchingLists = this.aLists.filter(function (oList, iListIndex) {
			var aItems = oList.getAggregation("items");
			var aMatchingItems = aItems.filter(function (oItem) {
				var oBindingPath = new BindingPath({
					path: "/" + fixture.AggregationFixture.data.paths[iListIndex],
					propertyPath: "name"
				});
				return oBindingPath.isMatching(oItem);
			});
			return aMatchingItems.length === aItems.length;
		});
		assert.ok(aMatchingLists.length, this.aLists.length, "Should match control within aggregation");
	});

});
