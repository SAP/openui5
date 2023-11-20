/* global QUnit */
sap.ui.define([
	"../QUnitUtils",
	"../../../delegates/TableDelegate",
	"../../util/createAppEnvironment",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/base/util/Deferred"
], function(
	TableQUnitUtils,
	TableDelegate,
	createAppEnvironment,
	PersonalizationUtils,
	Table,
	Column,
	Text,
	Core,
	Deferred
) {
	"use strict";

	const fnAddItem = TableDelegate.addItem;
	TableDelegate.addItem = function(oTable, sProperty) {
		oTable._oAddItemDeferred = new Deferred();

		return fnAddItem.apply(this, arguments).then(function(oColumn) {
			const fnResolve = oTable._oAddItemDeferred.resolve;
			oTable._oAddItemDeferred.resolve = function() {
				fnResolve(oColumn);
			};
			return oTable._oAddItemDeferred.promise;
		});
	};

	TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
		name: "colA",
		label: "Column A",
		path: "a",
		dataType: "String"
	}, {
		name: "colB",
		label: "Column B",
		path: "b",
		dataType: "String"
	}]);

	QUnit.module("Utils", {
		before: function() {
			const sTableView =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">'
					+ '<Table id="myTable" p13nMode="Column" delegate="\{'
						+ '\'name\': \'test-resources/sap/ui/mdc/delegates/TableDelegate\','
						+ '\'payload\': \{\'collectionPath\': \'/testPath\' \}'
					+ '\}">'
						+ '<columns>'
						+ '<mdcTable:Column id="myTable--columnA" header="Column A" propertyKey="colA">'
							+ '<m:Text />'
						+ '</mdcTable:Column>'
						+ '</columns>'
					+ '</Table>'
				+ '</mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				this.oUiComponentContainer = mCreatedApp.container;
				this.oTable = mCreatedApp.view.byId('myTable');
				return this.oTable.initialized();
			}.bind(this));
		},
		beforeEach: function() {
			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			return this.oTable.getEngine().reset(this.oTable, this.oTable.getActiveP13nModes()).catch(function() {
				// swallow the error that is thrown when resetting wihout p13n panel being open
			});
		},
		after: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("isUserPersonalizationActive", function(assert) {
		assert.notOk(PersonalizationUtils.isUserPersonalizationActive(this.oTable), "Not active");
	});

	QUnit.test("isUserPersonalizationActive - Personalization dialog without change", function(assert) {
		const oTable = this.oTable;

		PersonalizationUtils.openSettingsDialog(oTable);

		return TableQUnitUtils.waitForSettingsDialog(oTable).then(function(oDialog) {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			return TableQUnitUtils.closeSettingsDialog(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after dialog is closed");
		});
	});

	QUnit.test("isUserPersonalizationActive - Personalization dialog with change", function(assert) {
		const oTable = this.oTable;

		PersonalizationUtils.openSettingsDialog(oTable);

		return TableQUnitUtils.waitForSettingsDialog(oTable).then(function(oDialog) {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			oTable.getEngine().createChanges({
				control: oTable,
				key: "Column",
				state: [
					{name: "colB"}
				]
			});
			return TableQUnitUtils.closeSettingsDialog(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Still active after dialog is closed and change is being applied");
			oTable._oAddItemDeferred.resolve();
			return oTable.getEngine().waitForChanges(oTable);
		}).then(function() {
			assert.notOk(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after changes were applied");
		});
	});

	QUnit.test("isUserPersonalizationActive - Column menu without change", function(assert) {
		const oTable = this.oTable;

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if menu is open");
			return TableQUnitUtils.closeColumnMenu(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after dialog is closed");
		});
	});

	QUnit.test("isUserPersonalizationActive - Column menu with change", function(assert) {
		const oTable = this.oTable;

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function(oDialog) {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			oTable.getEngine().createChanges({
				control: oTable,
				key: "Column",
				state: [
					{name: "colB"}
				]
			});
			return TableQUnitUtils.closeColumnMenu(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Still active after dialog is closed and change is being applied");
			oTable._oAddItemDeferred.resolve();
			return oTable.getEngine().waitForChanges(oTable);
		}).then(function() {
			assert.notOk(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after changes were applied");
		});
	});
});