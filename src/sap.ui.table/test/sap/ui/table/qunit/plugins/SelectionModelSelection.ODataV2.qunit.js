/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function(TableQUnitUtils, Sorter, Filter) {
	"use strict";

	QUnit.module("Automatic deselection", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();

			TableQUnitUtils.setDefaultSettings({
				rows: {path: "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Rebind", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oSelectionChangeSpy = sinon.spy();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.setSelectionInterval(2, 6);
			oTable.attachRowSelectionChange(oSelectionChangeSpy);
			oTable.bindRows(oTable.getBindingInfo("rows"));
			assert.deepEqual(oTable.getSelectedIndices(), [], "Selection");
		}).then(oTable.qunit.whenBindingChange).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
			oTable.destroy();
		});
	});

	QUnit.test("Unbind", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oSelectionChangeSpy = sinon.spy();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.setSelectionInterval(2, 6);
			oTable.attachRowSelectionChange(oSelectionChangeSpy);
			oTable.unbindRows();
			assert.deepEqual(oTable.getSelectedIndices(), [], "Selection");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
			oTable.destroy();
		});
	});

	QUnit.test("Sort", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oSelectionChangeSpy = sinon.spy();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.setSelectionInterval(2, 6);
			oTable.attachRowSelectionChange(oSelectionChangeSpy);
			oTable.getBinding().sort(new Sorter({path: "Name"}));
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection before binding change");
		}).then(oTable.qunit.whenBindingChange).then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [], "Selection after binding change");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
			oTable.destroy();
		});
	});

	QUnit.test("Filter", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oSelectionChangeSpy = sinon.spy();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.setSelectionInterval(2, 6);
			oTable.attachRowSelectionChange(oSelectionChangeSpy);
			oTable.getBinding().filter(new Filter({path: "Name", operator: "EQ", value1: "Gladiator MX"}));
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection before binding change");
		}).then(oTable.qunit.whenBindingChange).then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [], "Selection after binding change");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
			oTable.destroy();
		});
	});

	QUnit.test("Initial change of total number of rows", function(assert) {
		var oTable = TableQUnitUtils.createTable(function(oTable) {
			oTable.setSelectionInterval(2, 6);
		});

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
			oTable.destroy();
		});
	});

	QUnit.test("Selection during rebind", function(assert) {
		var oTable = TableQUnitUtils.createTable();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.bindRows(oTable.getBindingInfo("rows"));
			oTable.setSelectionInterval(2, 6);
		}).then(oTable.qunit.whenBindingChange).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
			oTable.destroy();
		});
	});
});