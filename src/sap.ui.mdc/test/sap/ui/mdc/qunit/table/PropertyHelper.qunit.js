/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/table/PropertyHelper",
	"sap/ui/mdc/table/Column"
], function(PropertyHelper, Column) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "propA",
				label: "Property A",
				visible: false,
				path: "propAPath",
				exportSettings: {
					width: 20,
					label: "Export label",
					type: "Number"
				}
			}, {
				name: "propB",
				label: "Property B",
				sortable: false,
				filterable: false,
				groupLabel: "Group Label"
			}, {
				name: "complexPropA",
				label: "Complex Property A",
				propertyInfos: ["propA", "propB"],
				exportSettings: {
					template: "{0} ({1})",
					width: 25
				},
				visible: false
			}, {
				name: "complexPropB",
				label: "Complex Property B",
				propertyInfos: ["propB"],
				exportSettings: {
					width: 30,
					label: "Complex export label B",
					textAlign: "End"
				}
			}, {
				name: "price",
				label: "Price",
				exportSettings: {
					type: "Currency",
					displayUnit: true,
					unitProperty: "currency",
					textAlign: "End"
				}
			}, {
				name: "currencyCode",
				label: "Currency",
				path: "currency"
			}]);
			this.aProperties = this.oPropertyHelper.getProperties();

			this.oColumnPropA = new Column({
				id: "propAColumn",
				dataProperty: "propA"
			});

			this.oColumnPropB = new Column({
				id: "propBColumn",
				header: "Property B",
				dataProperty: "propB",
				hAlign: "End"
			});

			this.oColumnComplexPropA = new Column({
				id: "columnComplexPropA",
				header: "Complex Property A",
				dataProperty: "complexPropA"
			});

			this.oColumnComplexPropB = new Column({
				id: "columnComplexPropB",
				dataProperty: "complexPropB"
			});

			this.oColumnPrice = new Column({
				id: "priceColumn",
				header: "Price",
				dataProperty: "price",
				hAlign: "End"
			});

			this.oInvalidColumn = new Column({
				id: "invalidColumn",
				header: "Invalid",
				dataProperty: "invalidProperty"
			});
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
			this.aProperties = null;
			this.oColumnPropA.destroy();
			this.oColumnPropB.destroy();
			this.oColumnComplexPropA.destroy();
			this.oColumnComplexPropB.destroy();
			this.oColumnPrice.destroy();
			this.oInvalidColumn.destroy();
		}
	});

	QUnit.test("getColumnExportSettings", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getColumnExportSettings(), null, "No parameter");
		assert.strictEqual(this.oPropertyHelper.getColumnExportSettings({}), null, "Empty property object");
		assert.strictEqual(this.oPropertyHelper.getColumnExportSettings(this.oInvalidColumn), null, "mdc.Column pointing to invalid property info");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropA), [{
			columnId: "propAColumn",
			label: "Export label",
			property: "propAPath",
			textAlign: "Begin",
			type: "Number",
			width: 20
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropB), [{
			columnId: "propBColumn",
			label: "Property B",
			textAlign: "End",
			type: "String",
			width: "",
			displayUnit: true,
			property: "propB"
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropA), [{
			columnId: "columnComplexPropA",
			label: "Complex Property A",
			textAlign: "Begin",
			type: "String",
			width: 25,
			property: ["propAPath", "propB"],
			template: "{0} ({1})"
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropB), [{
			columnId: "columnComplexPropB",
			label: "Complex export label B",
			textAlign: "End",
			type: "String",
			width: 30,
			property: ["propB"]
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPrice), [{
			columnId: "priceColumn",
			label: "Price",
			textAlign: "End",
			type: "Currency",
			width: "",
			displayUnit: true,
			property: "price",
			unitProperty: "currency"
		}], "Expected column export settings returned");
	});

	QUnit.test("getColumnExportSettings with bSplitCells", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropA, true), [{
			columnId: "propAColumn",
			label: "Export label",
			displayUnit: false,
			property: "propAPath",
			textAlign: "Begin",
			type: "Number",
			width: 20
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropB, true), [{
			columnId: "propBColumn",
			label: "Property B",
			displayUnit: false,
			property: "propB",
			textAlign: "End",
			type: "String",
			width: ""
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropA, true), [{
			columnId: "columnComplexPropA",
			label: "Export label",
			property: "propAPath",
			textAlign: "Begin",
			type: "Number",
			width: 20
			}, {
			columnId: "columnComplexPropA-additionalProperty1",
			label: "Property B",
			property: "propB",
			textAlign: "Begin",
			type: "String",
			width: ""
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropB, true), [{
			columnId: "columnComplexPropB",
			label: "Property B",
			property: "propB",
			textAlign: "Begin",
			type: "String",
			width: ""
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPrice, true), [{
			columnId: "priceColumn",
			displayUnit: false,
			label: "Price",
			property: "price",
			textAlign: "End",
			type: "Currency",
			unitProperty: "currency",
			width: ""
			}, {
			columnId: "priceColumn-additionalProperty",
			label: "Currency",
			property: "currency",
			textAlign: "End",
			type: "String",
			width: ""
		}], "Expected column export settings returned");
	});
});