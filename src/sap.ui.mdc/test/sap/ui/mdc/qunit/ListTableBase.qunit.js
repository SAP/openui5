/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/ListTableBase",
	"sap/ui/mdc/Control",
	"sap/ui/mdc/List",
	"sap/ui/mdc/Table"
], function(ListTableBase, Control, List, Table) {
	"use strict";

	QUnit.module("Hierarchy");

	QUnit.test("is abstract and extends sap.ui.mdc.Control", function(assert) {
		assert.ok(ListTableBase.getMetadata().isAbstract(), "ListTableBase is abstract");
		assert.ok(ListTableBase.prototype instanceof Control, "ListTableBase extends sap.ui.mdc.Control");
	});

	QUnit.test("List and Table extend ListTableBase", function(assert) {
		const oList = new List();
		const oTable = new Table();
		assert.ok(oList.isA("sap.ui.mdc.ListTableBase"), "List is a ListTableBase");
		assert.ok(oTable.isA("sap.ui.mdc.ListTableBase"), "Table is a ListTableBase");
		oList.destroy();
		oTable.destroy();
	});

	QUnit.test("FilterIntegrationMixin is applied once on the base", function(assert) {
		assert.strictEqual(typeof ListTableBase.prototype.setFilter, "function", "setFilter present on the base prototype");
		assert.strictEqual(typeof ListTableBase.prototype.rebind, "function", "rebind present on the base prototype");

		const oList = new List();
		const oTable = new Table();
		assert.strictEqual(oList.setFilter, ListTableBase.prototype.setFilter, "List inherits setFilter from the base");
		assert.strictEqual(oTable.setFilter, ListTableBase.prototype.setFilter, "Table inherits setFilter from the base");
		oList.destroy();
		oTable.destroy();
	});

	QUnit.module("Shared metadata");

	const aSharedProperties = ["width", "header", "headerVisible", "headerLevel", "headerStyle", "enableExport",
		"threshold", "filterConditions", "sortConditions", "groupConditions"];
	const aSharedAggregations = ["actions", "noData", "contextMenu", "_content"];

	QUnit.test("shared properties are declared on the base", function(assert) {
		const oMetadata = ListTableBase.getMetadata();
		aSharedProperties.forEach((sProperty) => {
			assert.ok(oMetadata.getProperty(sProperty), "base declares property " + sProperty);
		});
	});

	QUnit.test("shared aggregations, association and interfaces are declared on the base", function(assert) {
		const oMetadata = ListTableBase.getMetadata();
		aSharedAggregations.forEach((sAggregation) => {
			assert.ok(oMetadata.getAggregation(sAggregation) || oMetadata.getAllPrivateAggregations()[sAggregation],
				"base declares aggregation " + sAggregation);
		});
		assert.ok(oMetadata.getAssociation("filter"), "base declares the filter association");
		assert.ok(oMetadata.getInterfaces().includes("sap.ui.mdc.IFilterSource"), "base declares IFilterSource");
		assert.ok(oMetadata.getInterfaces().includes("sap.ui.mdc.IxState"), "base declares IxState");
	});

	QUnit.test("List and Table inherit the shared metadata", function(assert) {
		const oList = new List();
		const oTable = new Table();
		aSharedProperties.forEach((sProperty) => {
			assert.ok(oList.getMetadata().getProperty(sProperty), "List inherits property " + sProperty);
			assert.ok(oTable.getMetadata().getProperty(sProperty), "Table inherits property " + sProperty);
		});
		assert.ok(oList.getMetadata().getAssociation("filter"), "List inherits the filter association");
		assert.ok(oTable.getMetadata().getAssociation("filter"), "Table inherits the filter association");
		oList.destroy();
		oTable.destroy();
	});

	QUnit.module("setDefaultExportSettings");

	QUnit.test("throws when the argument is not a sap.ui.export.TableExportSettings", function(assert) {
		const oTable = new Table();
		assert.throws(() => {
			oTable.setDefaultExportSettings(new Control());
		}, /defaultExportSettings/, "throws for a non-TableExportSettings argument");
		oTable.destroy();
	});

	QUnit.test("accepts null and empty argument", function(assert) {
		const oTable = new Table();
		assert.strictEqual(oTable.setDefaultExportSettings(null), oTable, "null is accepted and the control is returned");
		oTable.destroy();
	});
});
