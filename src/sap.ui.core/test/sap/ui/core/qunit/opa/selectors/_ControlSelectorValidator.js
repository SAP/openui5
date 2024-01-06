/*global QUnit*/
sap.ui.define([
	"sap/base/util/extend",
	"sap/ui/test/selectors/_ControlSelectorValidator",
	"sap/ui/test/_ControlFinder",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (extend, _ControlSelectorValidator, _ControlFinder, JSONModel, List, StandardListItem, Text, nextUIUpdate) {
	"use strict";

	QUnit.module("_ControlSelectorValidator", {
		beforeEach: function () {
			var oJSONModel = new JSONModel({
				items: [
					{id: "1", title: "SameTitle"},
					{id: "2", title: "SameTitle"}
				]
			});

			this.oList = new List();
			this.oList.bindItems({
				path: "/items",
				template: new StandardListItem({
					title: "{title}",
					type: "Navigation"
				})
			});
			this.oText = new Text({text: "uniqueText"});
			this.oTextNoSelector1 = new Text({text: "duplicateText"});
			this.oTextNoSelector2 = new Text({text: "duplicateText"});

			this.oList.placeAt("qunit-fixture");
			this.oText.placeAt("qunit-fixture");
			this.oTextNoSelector1.placeAt("qunit-fixture");
			this.oTextNoSelector2.placeAt("qunit-fixture");

			this.oUIArea = this.oList.getUIArea();
			this.oUIArea.setModel(oJSONModel);

			return nextUIUpdate();
		},
		afterEach: function () {
			this.oUIArea.setModel();
			this.oList.destroy();
			this.oText.destroy();
			this.oTextNoSelector1.destroy();
			this.oTextNoSelector2.destroy();
		}
	});

	QUnit.test("Should validate unique selectors", function (assert) {
		var mUniqueSelector = {
			controlType: "sap.m.Text",
			properties: {text: "uniqueText"}
		};
		var oControlSelectorValidator = new _ControlSelectorValidator();
		var bValid = oControlSelectorValidator._validate(mUniqueSelector);
		assert.ok(bValid, "Should find one valid selector");
	});

	QUnit.test("Should filter out selectors that match multiple controls - multiple disabled", function (assert) {
		var mDuplicateSelector = {
			controlType: "sap.m.Text",
			properties: {text: "duplicateText"}
		};
		var oControlSelectorValidator = new _ControlSelectorValidator();
		var bValid = oControlSelectorValidator._validate(mDuplicateSelector);
		assert.ok(!bValid, "Should not validate selectors that are not unique");
	});

	QUnit.test("Should validate selectors that match multiple controls - multiple enabled", function (assert) {
		var mDuplicateSelector = {
			controlType: "sap.m.Text",
			properties: {text: "duplicateText"}
		};
		var oControlSelectorValidator = new _ControlSelectorValidator(null, true);
		var bValid = oControlSelectorValidator._validate(mDuplicateSelector);
		assert.ok(bValid, "Should validate selectors that are not unique");
	});

	QUnit.test("Should validate against validation ancestor", function (assert) {
		var mFirstRowSelector = {
			controlType: "sap.m.StandardListItem",
			bindingPath: {
				path: "/items/0",
				propertyPath: "title"
			}
		};
		var mRowItemSelector = {
			controlType: "sap.ui.core.Icon",
			properties: {src: "sap-icon://slim-arrow-right"}
		};
		var oRowSelectorValidator = new _ControlSelectorValidator();
		var bValidFirstRow = oRowSelectorValidator._validate(mFirstRowSelector);
		assert.ok(bValidFirstRow, "Should match unique validation ancestor");

		var oRow = _ControlFinder._findControls(extend({}, mFirstRowSelector))[0];
		var oRowItemSelectorValidator = new _ControlSelectorValidator(oRow);
		var bValidRowItem = oRowItemSelectorValidator._validate(mRowItemSelector);
		assert.ok(bValidRowItem, "Should match child with unique selector relative to validation root");
	});
});
