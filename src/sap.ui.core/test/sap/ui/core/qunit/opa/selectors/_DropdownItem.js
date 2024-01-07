/*global QUnit*/
sap.ui.define([
	"sap/ui/test/selectors/_DropdownItem",
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_DropdownItem, _ControlSelectorGenerator, JSONModel, Select, Item, nextUIUpdate) {
	"use strict";

	QUnit.module("_DropdownItem", {
		beforeEach: function () {
			var oJSONModel = new JSONModel({
				items: [{id: "1", name: "Item 11"}, {id: "2", name: "Item 22"}]
			});
			this.oSelect = new Select("mySelect");
			this.oSelect.bindItems({
				path: "/items",
				template: new Item({
					key: "{id}",
					text: "{name}"
				})
			});
			this.oSelect.placeAt("qunit-fixture");
			this.oSelect.getUIArea().setModel(oJSONModel);

			return nextUIUpdate();
		},
		afterEach: function () {
			this.oSelect.getUIArea().setModel();
			this.oSelect.destroy();
		}
	});

	QUnit.test("Should generate selector for item inside dropdown", function (assert) {
		var fnDone = assert.async();
		this.oSelect.open();
		// wait for select list to open
		setTimeout(function () {
			_ControlSelectorGenerator._generate({control: this.oSelect.getItems()[0], includeAll: true})
			.then(function (aSelectors) {
				var mDropdownSelector = aSelectors[2][0];
				assert.strictEqual(mDropdownSelector.ancestor.controlType, "sap.m.SelectList", "Should generate selector with the dropdown ancestor");
				assert.strictEqual(mDropdownSelector.controlType, "sap.ui.core.Item", "Should generate selector with item type");
				assert.strictEqual(mDropdownSelector.properties.key, "1", "Should generate selector with item selector key");
			}).finally(fnDone);
		}.bind(this), 100);
	});

	QUnit.test("Should find ancestor select list", function (assert) {
		var oGenerator = new _DropdownItem();
		assert.ok(!oGenerator._isValidationRootRequired());
		assert.ok(oGenerator._isAncestorRequired());
		var oAncestor = oGenerator._getAncestor(this.oSelect.getItems()[0]);
		assert.strictEqual(oAncestor, this.oSelect.getList(), "Should find ancestor select list");
	});
});
