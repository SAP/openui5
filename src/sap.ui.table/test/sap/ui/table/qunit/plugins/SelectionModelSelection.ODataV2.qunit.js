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
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

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
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

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
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

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
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

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
		const oTable = TableQUnitUtils.createTable(function(oTable) {
			oTable.setSelectionInterval(2, 6);
		});

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
			oTable.destroy();
		});
	});

	QUnit.test("Selection during rebind", function(assert) {
		const oTable = TableQUnitUtils.createTable();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.bindRows(oTable.getBindingInfo("rows"));
			oTable.setSelectionInterval(2, 6);
		}).then(oTable.qunit.whenBindingChange).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
			oTable.destroy();
		});
	});

	QUnit.test("#onKeyboardShortcut - Event Marking", function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const sEventMarker = "sapUiTableClearAll";
		const oEvent = {
			setMarked: function() {}
		};
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const oClearSelectionSpy = sinon.spy(oSelectionPlugin, "clearSelection");
		const oSelectAllSpy = sinon.spy(oSelectionPlugin, "selectAll");
		const oSetMarkedSpy = sinon.spy(oEvent, "setMarked");

		return oTable.qunit.whenRenderingFinished().then(function() {
			oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
			assert.ok(oSelectAllSpy.calledOnce, "select all called");
			assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked with ${sEventMarker}`);

			oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
			assert.ok(oClearSelectionSpy.calledOnce, "clear all called");
			assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

			oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
			assert.ok(oClearSelectionSpy.calledTwice, "Selection is cleared");
			assert.ok(oSetMarkedSpy.calledTwice, `Event marked twice`);
			assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

			oSetMarkedSpy.reset();

			oSelectionPlugin.onKeyboardShortcut("toggle");
			assert.ok(oSelectAllSpy.callCount, 2, "select all called");
			assert.ok(oSetMarkedSpy.notCalled, "Event has not been marked");

			oSelectionPlugin.onKeyboardShortcut("toggle");
			assert.ok(oClearSelectionSpy.calledThrice, "clear all called");
			assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked, as there was no event passed`);

			oSetMarkedSpy.reset();
			oClearSelectionSpy.reset();
			oSelectAllSpy.reset();

			oTable.destroy();
		});
	});
});