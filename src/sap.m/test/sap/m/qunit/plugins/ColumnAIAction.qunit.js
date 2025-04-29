sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/plugins/ColumnAIAction",
	"sap/ui/core/Lib",
	"sap/base/Log",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"test-resources/sap/ui/mdc/qunit/QUnitUtils",
	"test-resources/sap/ui/mdc/qunit/table/QUnitUtils"
], function(Column, ColumnListItem, Text, Table, ColumnAIAction, Lib, Log, MDCTable, MDCColumn, JSONModel, GridColumn, GridTable, QUnitUtils, nextUIUpdate, MDCQUnitUtils, MDCTableQUnitUtils) {

	"use strict";
	/*global sinon, QUnit */

	const aData = [{
		id: "1",
		name: "name1"
	}];
	const oJSONModel = new JSONModel(aData);

	QUnit.module("ResponsiveTable", {
		beforeEach: async function() {
			this.spyColumnAIActionPress = sinon.spy();
			this.oTable = new Table({
				columns: Object.keys(aData[0]).map((sKey) => {
					return new Column({
						header: new Text({ text: sKey }),
						dependents: new ColumnAIAction({
							press: this.spyColumnAIActionPress
						})
					});
				}),
				items: {
					path: "/",
					template: new ColumnListItem({
						cells: Object.keys(aData[0]).map(function(sKey) {
							return new Text({
								text: "{" + sKey + "}"
							});
						})
					})
				},
				models: oJSONModel
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("ColumnAIAction is rendered correctly", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		const oColumnAIAction = oColumn.getDependents()[0];
		const oTableDomRef = this.oTable.getDomRef();

		assert.ok(oColumnAIAction instanceof ColumnAIAction, "ColumnAIAction created correctly");
		assert.ok(oColumnAIAction._getAction(), "ColumnAIAction action is created correctly");

		assert.strictEqual(oColumnAIAction._getAction().getIcon(), "sap-icon://ai", "AI action icon is set correctly");
		assert.strictEqual(oColumnAIAction._getAction().getType(), "Transparent", "AI action type is set correctly");
		assert.strictEqual(oColumnAIAction._getAction().getTooltip(), Lib.getResourceBundleFor("sap.m").getText("COLUMNACTIONAI_TOOLTIP"), "AI action tooltip is set correctly");
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 2, "Two ColumnAIAction are rendered correctly");

		oColumnAIAction.setEnabled(false);
		await nextUIUpdate();
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 1, "The AI action of disabled plugin is not rendered");

		oColumnAIAction.setEnabled(true);
		await nextUIUpdate();
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 2, "The AI action is rendered again");

		oColumnAIAction._getAction().$().trigger("tap");
		assert.ok(this.spyColumnAIActionPress.calledOnce, "AI action is pressed once");

		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("100000px");
		await nextUIUpdate();

		const $ItemPopin = this.oTable.getItems()[0].$("sub");
		assert.strictEqual($ItemPopin.find(".sapMPluginsColumnAIAction").length, 1, "The AI action is rendered in the popin");

		$ItemPopin.find(".sapMPluginsColumnAIAction").trigger("tap");
		assert.ok(this.spyColumnAIActionPress.calledTwice, "AI action is pressed while in the popin");
	});

	QUnit.module("GridTable", {
		beforeEach: async function() {
			this.spyColumnAIActionPress = sinon.spy();
			this.oTable = new GridTable({
				columns: Object.keys(aData[0]).map((sKey) => {
					return new GridColumn({
						label: new Text({ text: sKey }),
						template: new Text({ text: "{" + sKey + "}", wrapping: false }),
						dependents: new ColumnAIAction({
							press: this.spyColumnAIActionPress
						})
					});
				}),
				rows: { path: "/" },
				models: oJSONModel
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("ColumnAIAction is rendered correctly", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		const oColumnAIAction = oColumn.getDependents()[0];
		const oTableDomRef = this.oTable.getDomRef();

		assert.ok(oColumnAIAction instanceof ColumnAIAction, "ColumnAIAction created correctly");
		assert.ok(oColumnAIAction._getAction(), "ColumnAIAction action is created correctly");

		assert.ok(oColumn.getDomRef().querySelector(".sapMPluginsColumnAIAction"), "ColumnAIAction is rendered in the first column");
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 2, "Two ColumnAIAction are rendered correctly");

		oColumnAIAction._getAction().$().trigger("tap");
		assert.ok(this.spyColumnAIActionPress.calledOnce, "AI action is pressed once");

		oColumn.removeAllDependents();
		await nextUIUpdate();
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 1, "The AI action of disabled plugin is not rendered");

		oColumn.addDependent(new ColumnAIAction());
		await nextUIUpdate();
		assert.ok(oColumn.getDomRef().querySelector(".sapMPluginsColumnAIAction"), "ColumnAIAction is rendered in the first column");

		oColumn.addMultiLabel(new Text({
			text: "MultiColumnHeader"
		}));

		const oErrorLogSpy = sinon.spy(Log, "error");
		await nextUIUpdate();
		assert.equal(oErrorLogSpy.callCount, 1, "Setting multi label: error was logged");
		assert.notOk(oColumn.getDomRef().querySelector(".sapMPluginsColumnAIAction"), "ColumnAIAction is not rendered because of multi labels");

		oColumn.removeAllMultiLabels();
		await nextUIUpdate();
		assert.equal(oErrorLogSpy.callCount, 1, "Removing multi label: no additional error is logged");
		assert.ok(oColumn.getDomRef().querySelector(".sapMPluginsColumnAIAction"), "ColumnAIAction is rendered because there is no more multi labels");

	});

	QUnit.module("MDCTable", {
		beforeEach: async function() {
			this.oTable = new MDCTable({
				type: "ResponsiveTable",
				delegate: {
					name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
					payload: {
						collectionPath: "/"
					}
				},
				columns: Object.keys(aData[0]).map((sKey) => {
					return new MDCColumn({
						header: sKey,
						propertyKey: sKey,
						dependents: new ColumnAIAction()
					});
				}),
				models: oJSONModel
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("ColumnAIAction is handled correctly", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		const oInnerColumn = oColumn.getInnerColumn();
		const oColumnAIAction = oColumn.getDependents()[0];
		const oTableDomRef = this.oTable.getDomRef();

		assert.ok(oColumnAIAction instanceof ColumnAIAction, "ColumnAIAction created correctly");
		assert.ok(oColumnAIAction._getAction(), "ColumnAIAction action is created correctly");

		assert.ok(oInnerColumn.getDomRef().querySelector(".sapMPluginsColumnAIAction"), "ColumnAIAction is rendered in the first column");
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 2, "Two ColumnAIAction are rendered correctly");

		this.oTable.removeColumn(oColumn);
		await nextUIUpdate();
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 1, "AI action for the removed columns is not rendered");
		assert.notOk(oColumnAIAction.getEnabled(), "Plugin is disabled when the mdc/Column is removed from the table");

		this.oTable.addColumn(oColumn);
		await nextUIUpdate();
		assert.strictEqual(oTableDomRef.querySelectorAll(".sapMPluginsColumnAIAction").length, 2, "AI action is rendered for the recently added column which has AIAction plugin");
		assert.ok(oColumnAIAction.getEnabled(), "Plugin is disabled when the mdc/Column is removed from the table");
	});
});