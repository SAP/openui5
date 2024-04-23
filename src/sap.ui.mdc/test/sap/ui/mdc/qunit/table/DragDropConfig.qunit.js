sap.ui.define([
	"sap/m/Text",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/DragDropConfig",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"./QUnitUtils"
], function(Text, MDCTable, MDCColumn, DragDropConfig, JSONModel, nextUIUpdate, MDCTableQUnitUtils) {

	"use strict";
	/*global QUnit,sinon */

	const aData = [];
	for (let i = 0; i < 5; i++) {
		aData.push({
			id: i,
			name: "name" + i
		});
	}

	const oJSONModel = new JSONModel(aData);

	async function createMDCTable(mSettings) {
		mSettings = Object.assign({
			type: "ResponsiveTable",
			delegate: {
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/"
				}
			},
			selectionMode: "Multi",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new MDCColumn({
					header: sKey,
					propertyKey: sKey,
					template: new Text({ text: "{" + sKey + "}" })
				});
			}),
			models: oJSONModel
		}, mSettings);

		const oTable = new MDCTable(mSettings);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oTable;
	}

	QUnit.module("Basics", {
		beforeEach: async function() {
			this.oTable = await createMDCTable();
			this.oDragDropConfig = new DragDropConfig();
			this.oTable.addDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy(true);
		}
	});

	QUnit.test("Properties", function(assert) {
		return this.oTable._fullyInitialized().then(() => {
			return MDCTableQUnitUtils.waitForBinding(this.oTable);
		}).then(async () => {
			const oInnerTable = this.oTable._oTable;

			this.oDragDropConfig.setDraggable(true);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig.getDraggable(), "Table is draggable");
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo object is created");
			assert.ok(oInnerTable.indexOfDragDropConfig(this.oDragDropConfig._oDragInfo) > -1, "DragInfo object added to the inner Table");
			assert.equal(this.oDragDropConfig._oDragInfo.getSourceAggregation(), "items", "sourceAggregation is set correctly");
			assert.ok(oInnerTable.getItems()[0].getDomRef().draggable, "Table row is draggable");

			this.oDragDropConfig.setDropEffect("Copy");
			assert.equal(this.oDragDropConfig.getDropEffect(), "Copy", "DropEffect is set to Copy");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo is not created yet since the DragDropConfig is not droppable");

			this.oDragDropConfig.setDropPosition("OnOrBetween");
			assert.equal(this.oDragDropConfig.getDropPosition(), "OnOrBetween", "DropPosition is set to OnOrBetween");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo is not created yet since the DragDropConfig is not droppable");

			this.oDragDropConfig.setGroupName("X");
			assert.equal(this.oDragDropConfig.getGroupName(), "X", "GroupName is set to X");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo is not created yet since the DragDropConfig is not droppable");
			assert.equal(this.oDragDropConfig._oDragInfo.getGroupName(), "X", "GroupName is set on the DragInfo");

			this.oDragDropConfig.setDroppable(true);
			assert.ok(this.oDragDropConfig.getDroppable(), "Table is droppable");
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo object is created");
			assert.ok(oInnerTable.indexOfDragDropConfig(this.oDragDropConfig._oDropInfo) > -1, "DropInfo object added to the inner Table");
			assert.equal(this.oDragDropConfig._oDragInfo.getSourceAggregation(), "items", "sourceAggregation is set correctly");
			assert.equal(this.oDragDropConfig.getDropEffect(), this.oDragDropConfig._oDropInfo.getDropEffect(), "DropEffect is set on the DropInfo");
			assert.equal(this.oDragDropConfig.getDropPosition(), this.oDragDropConfig._oDropInfo.getDropPosition(), "DropPosition is set on the DropInfo");
			assert.equal(this.oDragDropConfig.getGroupName(), this.oDragDropConfig._oDropInfo.getGroupName(), "GroupName is set on the DropInfo");

			this.oDragDropConfig.setEnabled(false);
			assert.notOk(this.oDragDropConfig.getEnabled(), "DragDropConfig is disabled");
			assert.equal(this.oDragDropConfig.getEnabled(), this.oDragDropConfig._oDragInfo.getEnabled(), "DragInfo is disabled");
			assert.equal(this.oDragDropConfig.getEnabled(), this.oDragDropConfig._oDropInfo.getEnabled(), "DropInfo is disabled");

			this.oDragDropConfig.setEnabled(true);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig.getEnabled(), "DragDropConfig is enabled again");
			assert.equal(this.oDragDropConfig.getEnabled(), this.oDragDropConfig._oDragInfo.getEnabled(), "DragInfo is enabled again");
			assert.equal(this.oDragDropConfig.getEnabled(), this.oDragDropConfig._oDragInfo.getEnabled(), "DragInfo is enabled again");

			this.oTable.removeDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
			assert.notOk(this.oDragDropConfig._oDragInfo, "DragInfo object is removed");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo object is removed");
			assert.notOk(oInnerTable.getItems()[0].getDomRef().draggable, "Table row is not draggable");

			this.oTable.addDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo object is created again");
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo object is created again");
			assert.ok(oInnerTable.getItems()[0].getDomRef().draggable, "Table row is draggable again");

			this.oTable.setType("Table");
			return this.oTable.initialized();
		}).then(() => {
			assert.equal(this.oDragDropConfig._oDragInfo.getSourceAggregation(), "rows", "sourceAggregation is set to rows");
			assert.equal(this.oDragDropConfig._oDropInfo.getTargetAggregation(), "rows", "targeteAggregation is set to rows");

			this.oDragDropConfig.setDraggable(false);
			assert.notOk(this.oDragDropConfig._oDragInfo, "DragInfo object is destroyed");

			this.oDragDropConfig.setDroppable(false);
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo object is destroyed");

			assert.ok(this.oDragDropConfig._oObserver, "The MutationObserver object was alive");
			this.oDragDropConfig.destroy();
			assert.notOk(this.oDragDropConfig._oObserver, "The MutationObserver object is destroyed");
		});
	});

	QUnit.test("Events", function(assert) {

		let oDragEvent;
		const triggerEvent = (sEventType, oControl) => {
			oDragEvent = new Event(sEventType, {
				bubbles: true,
				cancelable: true
			});

			oDragEvent.dataTransfer = new window.DataTransfer();
			oControl.getDomRef().dispatchEvent(oDragEvent);
		};

		const testEvents = (aRows) => {
			this.oDraggedRow = aRows[0];
			this.oInvalidDroppedRow = aRows[1];
			this.oDroppedRow = aRows[2];

			const fnPreventDefaultSpy = sinon.spy(window.Event.prototype, "preventDefault");
			this.oDragDropConfig.attachEventOnce("dragStart", (oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), this.oDraggedRow.getBindingContext(), "dragStart event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragStart event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
				oEvent.preventDefault();
			});
			triggerEvent("dragstart", this.oDraggedRow);
			assert.equal(fnPreventDefaultSpy.callCount, 1, "preventDefault of the dragstart event is called");

			triggerEvent("dragstart", this.oDraggedRow);

			triggerEvent("dragenter", this.oDroppedRow);
			assert.ok(document.querySelector(".sapUiDnDIndicator").clientWidth, "Drop indicator is visible");

			this.oDragDropConfig.attachEventOnce("dragEnter", (oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), this.oInvalidDroppedRow.getBindingContext(), "dragEnter event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragEnter event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "Drop position is provided for dragenter");
				oEvent.preventDefault();
			});
			triggerEvent("dragenter", this.oInvalidDroppedRow);
			assert.notOk(document.querySelector(".sapUiDnDIndicator").clientWidth, "Drop indicator is not visible");
			assert.equal(fnPreventDefaultSpy.callCount, 2, "preventDefault of the dragenter event is called");
			triggerEvent("dragenter", this.oDroppedRow);

			this.oDragDropConfig.attachEventOnce("dragOver", (oEvent) => {
				oEvent.preventDefault();
			});
			triggerEvent("dragover", this.oDroppedRow);
			assert.equal(fnPreventDefaultSpy.callCount, 3, "preventDefault of the dragover event is called");

			triggerEvent("dragover", this.oDroppedRow);
			triggerEvent("drop", this.oDroppedRow);
			triggerEvent("dragend", this.oDraggedRow);
			fnPreventDefaultSpy.restore();
		};

		return this.oTable._fullyInitialized().then(() => {
			return MDCTableQUnitUtils.waitForBinding(this.oTable);
		}).then(async () => {
			this.oDragDropConfig.attachDragOver((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), this.oDroppedRow.getBindingContext(), "dragOver event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("dragSource"), this.oDraggedRow.getBindingContext(), "dragOver event dragSource parameter is correct");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "dragOver event dropPosition parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragOver event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});
			this.oDragDropConfig.attachDrop((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), this.oDroppedRow.getBindingContext(), "drop event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("dragSource"), this.oDraggedRow.getBindingContext(), "drop event dragSource parameter is correct");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "drop event dropPosition parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of drop event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});
			this.oDragDropConfig.attachDragEnd((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), this.oDraggedRow.getBindingContext(), "dragEnd event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragEnd event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});

			this.oDragDropConfig.setDraggable(true);
			this.oDragDropConfig.setDroppable(true);
			await nextUIUpdate();

			testEvents(this.oTable._oTable.getItems());

			this.oTable.setType("Table");
			return this.oTable._fullyInitialized();
		}).then(() => {
			return MDCTableQUnitUtils.waitForBinding(this.oTable);
		}).then(() => {
			return new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("rowsUpdated", () => {
					testEvents(this.oTable._oTable.getRows());
					resolve();
				});
			});
		});
	});

});