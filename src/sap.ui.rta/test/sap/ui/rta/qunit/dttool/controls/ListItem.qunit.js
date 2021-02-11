/* global QUnit */

sap.ui.define([
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/List",
	"sap/ui/core/Item",
	"sap/m/Select",
	"sap/m/Input",
	"sap/base/util/ObjectPath",
	"sap/ui/rta/dttool/controls/DTToolListItem"
], function (
	Table,
	Column,
	List,
	Item,
	Select,
	Input,
	ObjectPath,
	DTToolListItem
) {
	"use strict";

	QUnit.module("DTToolListItem API", function () {
		QUnit.test("Rendering DTToolListItems", function (assert) {
			var aPropNames = ["someBooleanProperty", "someIntProperty", "someFloatProperty", "someStringProperty", "someEnumProperty", "someOtherProperty"];
			var aDefVals = [false, 3, 6.28318530717958647692, "Fluffy Dirks", "Div", "some random value"];
			var aVals = [true, 7, 3.14159265358979323846, "Fluffier Dirks", "Bare", ""];
			var aTypes = ["boolean", "int", "float", "string", "sap.m.FlexRendertype", "thatOtherType"];

			var aDTTLs = [];

			for (var i0 = 0; i0 < aPropNames.length; i0++) {
				aDTTLs[i0] = new DTToolListItem({
					propertyName: aPropNames[i0],
					defaultValue: aDefVals[i0],
					value: aVals[i0],
					type: aTypes[i0]
				});
			}

			new Table({
				columns: [
					new Column({}),
					new Column({})
				],
				items: [
					aDTTLs[0],
					aDTTLs[1],
					aDTTLs[2],
					aDTTLs[3],
					aDTTLs[4],
					aDTTLs[5]
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			var fnCheckEnumVals = function (oComboBox, sKey) {
				assert.ok(oComboBox.getItemByKey(sKey), "enum value not missing");
			};

			for (var i1 = 0; i1 < aDTTLs.length; i1++) {
				assert.strictEqual(aDTTLs[i1].getLabel(), aPropNames[i1], "name set correctly");

				var vValue = aDTTLs[i1].getContent()[0].getValue && aDTTLs[i1].getContent()[0].getValue() || aDTTLs[i1].getContent()[0].getSelectedKey();

				var oControl = aDTTLs[i1].getContent()[0];

				if (aTypes[i1] === "boolean") {
					vValue = vValue === "true";
					assert.ok(oControl.getItems()[0].getText(), "first item is true");
					assert.ok(oControl.getItems()[1].getText(), "second item is false");
				} else if (jQuery.isPlainObject(ObjectPath.get(aTypes[i1]))) {
					var oEnum = ObjectPath.get(aTypes[i1]);
					assert.strictEqual(oControl.getItems().length, Object.keys(oEnum).length, "right number of enum values");
					Object.keys(oEnum).forEach(fnCheckEnumVals.bind(this, oControl));
				} else if (aTypes[i1] === "int") {
					vValue = parseInt(vValue);
				} else if (aTypes[i1] === "float") {
					vValue = parseFloat(vValue);
				}

				assert.strictEqual(vValue, aVals[i1], "value set correctly");

				if (oControl instanceof Select) {
					assert.strictEqual(oControl.getItemByKey(aDefVals[i1] + "").getAdditionalText(), "default", "default value set correctly");
				} else if (oControl instanceof Input) {
					aDTTLs[i1].getContent()[1].firePress();
					assert.strictEqual(oControl.getValue(), "" + aDTTLs[i1].getDefaultValue(), "default value set correctly");
				}
			}
		});

		QUnit.test("the change event", function (assert) {
			var done = assert.async();

			var newVals = {
				DTTLi0: "Dirk",
				DTTLi1: true,
				DTTLi2: 42,
				DTTLi3: 0.0238095
			};

			var iChanges = 0;

			var fnChange = function (oEvent) {
				iChanges++;
				assert.strictEqual(oEvent.getParameter("newValue"), newVals[oEvent.getSource().getId()], "event fired with correct new value");

				if (iChanges === Object.keys(newVals).length) {
					done();
				}
			};

			var oDTTLi0 = new DTToolListItem({
				id: "DTTLi0",
				propertyName: "someProp",
				defaultValue: "fluffy",
				value: "Kaiserschmarrn",
				type: "string"
			}).attachChange(fnChange);

			var oDTTLi1 = new DTToolListItem({
				id: "DTTLi1",
				propertyName: "someBoolProp",
				defaultValue: false,
				value: false,
				type: "boolean"
			}).attachChange(fnChange);

			var oDTTLi2 = new DTToolListItem({
				id: "DTTLi2",
				propertyName: "someIntProp",
				defaultValue: 7,
				value: 18,
				type: "int"
			}).attachChange(fnChange);

			var oDTTLi3 = new DTToolListItem({
				id: "DTTLi3",
				propertyName: "someFloatProp",
				defaultValue: 3.14,
				value: 3.14159,
				type: "float"
			}).attachChange(fnChange);

			new List({
				items: [
					oDTTLi0,
					oDTTLi1,
					oDTTLi2,
					oDTTLi3
				]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			oDTTLi0.getContent()[0].fireChange({value: newVals["DTTLi0"]});
			oDTTLi1.getContent()[0].fireChange({selectedItem: new Item({key: newVals["DTTLi1"], value: newVals["DTTLi1"]})});
			oDTTLi2.getContent()[0].fireChange({value: newVals["DTTLi2"]});
			oDTTLi3.getContent()[0].fireChange({value: newVals["DTTLi3"]});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});