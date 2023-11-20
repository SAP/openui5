/*global QUnit*/
sap.ui.define([
	"sap/ui/test/selectors/_TableRowItem",
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_TableRowItem, _ControlSelectorGenerator, Element, XMLView, JSONModel, nextUIUpdate) {
	"use strict";

	function getViewContent() {
		return '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" viewName="myView">' +
			'<App id="myApp">' +
				'<Page id="page1">' +
					'<Table id="myTable" items="{path: &quot;/items\&quot;, templateShareable:false}" width="300px">' +
						'<columns>' +
							'<Column><Text text="Name"/></Column>' +
							'<Column><Text text="Button"/></Column>' +
						'</columns>' +
						'<items>' +
							'<ColumnListItem>' +
								'<cells>' +
									'<ObjectIdentifier id="objectId" title="{id}" text="{name}"/>' +
									'<Button id="press" text="Press"></Button>' +
								'</cells>' +
							'</ColumnListItem>' +
						'</items>' +
					'</Table>' +
				'</Page>' +
			'</App>' +
		'</mvc:View>';
	}

	QUnit.module("_TableRow", {
		beforeEach: function (assert) {
			var oJSONModel = new JSONModel({
				items: [{id: "ID1", name: "Item 11"}, {id: "ID2", name: "Item 22"}]
			});
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return XMLView.create({
				id: "myView",
				definition: getViewContent()
			}).then(function(oView) {
				this.oView = oView.setModel(oJSONModel).placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should select a control in table row", function (assert) {
		var fnDone = assert.async();
		var oControl = Element.getElementById("myView--objectId-myView--myTable-0");
		_ControlSelectorGenerator._generate({control: oControl._getTextControl(), includeAll: true})
			.then(function (aSelectors) {
				var mTableSelector = aSelectors[1][0];
				assert.strictEqual(mTableSelector.properties.text, "Item 11", "Should include control selector relative to row");
				assert.strictEqual(mTableSelector.ancestor.bindingPath.path, "/items/0", "Should include row binding context path");
				assert.strictEqual(mTableSelector.ancestor.controlType, "sap.m.ColumnListItem", "Should include row type");
				assert.strictEqual(mTableSelector.ancestor.ancestor.id, "myView--myTable", "Should include table selector");
			}).finally(fnDone);
	});

	QUnit.test("Should find control table and row", function (assert) {
		var oGenerator = new _TableRowItem();
		var oControl = Element.getElementById("myView--objectId-myView--myTable-0");
		var oRow = oGenerator._getValidationRoot(oControl);
		var oTable = oGenerator._getAncestor(oControl);
		assert.ok(oGenerator._isAncestorRequired());
		assert.ok(oGenerator._isValidationRootRequired());
		assert.ok(oRow.getId().match(/__item[0-9]+-myView--myTable-0/), "Should find control's row");
		assert.strictEqual(oTable.getId(), "myView--myTable", "Should find control's table");
		assert.strictEqual(oRow.getMetadata().getName(), "sap.m.ColumnListItem", "Should have row as validation ancestor");
		assert.strictEqual(oTable.getMetadata().getName(), "sap.m.Table", "Should have table as selector ancestor");
	});
});
