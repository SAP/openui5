/*!
 * ${copyright}
 */
/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/plugins/CellSelector",
	"sap/ui/table/Table",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/m/Text"
], function (Core, qutils, KeyCodes, CellSelector, GridTable, ODataModel, MockServer, GridColumn, GridFixedRowMode, Text) {
	"use strict";

	function getCell(oTable, iRow, iCol) {
		var oRowInstance = oTable.getRows().find(function (oRow) {
			return oRow.getIndex() === iRow;
		});
		if (oRowInstance) {
			return oRowInstance.getCells()[iCol].$().parents("td")[0];
		}
	}

	QUnit.module("API", {
		beforeEach: function() {
			var sServiceURI = "/service/";
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = new GridTable({
				threshold: 5,
				rowMode: new GridFixedRowMode({
					rowCount: 5
				}),
				columns: [
					new GridColumn({ template: new Text({text: "{ProductId}"}) }),
					new GridColumn({ template: new Text({text: "{Name}"}) }),
					new GridColumn({ template: new Text({text: "{Category}"}) })
				],
				rows: "{/Products}",
				models: new ODataModel(sServiceURI, true),
				dependents: this.oCellSelector
			}).placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("RangeLimit Property - getSelectionRange/getSelectedRowContexts APIs", function (assert) {
		var done = assert.async();

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oBinding = this.oTable.getBinding("rows");
			var oGetContextsSpy = sinon.spy(oBinding, "getContexts");
			assert.ok(oBinding.getLength() > this.oCellSelector.getRangeLimit());

			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oBinding.getAllCurrentContexts().length, this.oTable.getThreshold() + this.oTable.getRowMode().getRowCount());

			qutils.triggerKeyup(oCell, KeyCodes.SPACE, false, false, true /* Ctrl */); // enlarge selection to all rows and cells
			assert.equal(oGetContextsSpy.callCount, 1);
			assert.ok(oGetContextsSpy.calledWithExactly(0, this.oCellSelector.getRangeLimit(), 0, true));
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 0, colIndex: 0}, to: {rowIndex: Infinity, colIndex: 0}});

			oBinding.attachEventOnce("dataReceived", setTimeout.bind(0, () => {
				assert.equal(oBinding.getAllCurrentContexts().length, this.oCellSelector.getRangeLimit());
				assert.equal(this.oCellSelector.getSelectedRowContexts().length, this.oCellSelector.getRangeLimit());
				assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(0, this.oCellSelector.getRangeLimit()));

				oGetContextsSpy.restore();
				done();
			}));
		});
	});
});