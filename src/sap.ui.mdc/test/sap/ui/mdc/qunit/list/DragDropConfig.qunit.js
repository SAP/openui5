sap.ui.define([
	"sap/ui/mdc/List",
	"sap/ui/mdc/list/GridListType",
	"sap/ui/mdc/list/DragDropConfig",
	"sap/ui/mdc/enums/ListSelectionMode",
	"sap/f/GridListItem",
	"sap/f/dnd/GridDropInfo",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(MDCList, GridListType, DragDropConfig, ListSelectionMode, GridListItem, GridDropInfo, VBox, Text, JSONModel, nextUIUpdate) {

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

	function createTemplate() {
		return new GridListItem({
			content: [
				new VBox({
					items: [
						new Text({text: "{name}"})
					]
				})
			]
		});
	}

	async function createMDCList(mSettings) {
		mSettings = Object.assign({
			type: new GridListType(),
			delegate: {
				name: "sap/ui/mdc/ListDelegate",
				payload: {
					bindingPath: "/"
				}
			},
			selectionMode: ListSelectionMode.Multi,
			itemContentTemplate: createTemplate(),
			models: oJSONModel
		}, mSettings);

		const oList = new MDCList(mSettings);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oList;
	}

	function waitForInitialized(oList) {
		return oList.initialized().then(async function() {
			await nextUIUpdate();
			await nextUIUpdate();
			return oList;
		});
	}

	// Yields to the event loop so that async sap.ui.require callbacks complete, then applies pending UI updates.
	function waitForRequire() {
		return new Promise((resolve) => { setTimeout(resolve, 0); }).then(() => nextUIUpdate());
	}

	QUnit.module("Basics", {
		beforeEach: async function() {
			this.oList = await createMDCList();
			this.oDragDropConfig = new DragDropConfig();
			this.oList.addDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oList.destroy(true);
		}
	});

	QUnit.test("Properties", function(assert) {
		return waitForInitialized(this.oList).then(async () => {
			const oInnerList = this.oList._oList;

			this.oDragDropConfig.setDraggable(true);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig.getDraggable(), "List is draggable");
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo object is created");
			assert.ok(oInnerList.indexOfDragDropConfig(this.oDragDropConfig._oDragInfo) > -1, "DragInfo added to the inner list");
			assert.equal(this.oDragDropConfig._oDragInfo.getSourceAggregation(), "items", "sourceAggregation is items");

			this.oDragDropConfig.setDropEffect("Copy");
			assert.equal(this.oDragDropConfig.getDropEffect(), "Copy", "DropEffect is set to Copy");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo not created since not droppable");

			this.oDragDropConfig.setDropPosition("Between");
			assert.equal(this.oDragDropConfig.getDropPosition(), "Between", "DropPosition is set to Between");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo not created since not droppable");

			this.oDragDropConfig.setGroupName("TestGroup");
			assert.equal(this.oDragDropConfig.getGroupName(), "TestGroup", "GroupName is set");
			assert.equal(this.oDragDropConfig._oDragInfo.getGroupName(), "TestGroup", "GroupName forwarded to DragInfo");

			this.oDragDropConfig.setDroppable(true);
			await waitForRequire();
			assert.ok(this.oDragDropConfig.getDroppable(), "List is droppable");
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo object is created");
			assert.ok(oInnerList.indexOfDragDropConfig(this.oDragDropConfig._oDropInfo) > -1, "DropInfo added to the inner list");
			assert.equal(this.oDragDropConfig._oDropInfo.getTargetAggregation(), "items", "targetAggregation is items");
			assert.equal(this.oDragDropConfig._oDropInfo.getDropEffect(), "Copy", "DropEffect forwarded to DropInfo");
			assert.equal(this.oDragDropConfig._oDropInfo.getDropPosition(), "Between", "DropPosition forwarded to DropInfo");
			assert.equal(this.oDragDropConfig._oDropInfo.getGroupName(), "TestGroup", "GroupName forwarded to DropInfo");

			this.oDragDropConfig.setEnabled(false);
			assert.notOk(this.oDragDropConfig.getEnabled(), "DragDropConfig is disabled");
			assert.equal(this.oDragDropConfig._oDragInfo.getEnabled(), false, "DragInfo is disabled");
			assert.equal(this.oDragDropConfig._oDropInfo.getEnabled(), false, "DropInfo is disabled");

			this.oDragDropConfig.setEnabled(true);
			assert.ok(this.oDragDropConfig.getEnabled(), "DragDropConfig is re-enabled");
			assert.ok(this.oDragDropConfig._oDragInfo.getEnabled(), "DragInfo is re-enabled");
			assert.ok(this.oDragDropConfig._oDropInfo.getEnabled(), "DropInfo is re-enabled");

			this.oList.removeDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
			assert.notOk(this.oDragDropConfig._oDragInfo, "DragInfo removed after disconnect");
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo removed after disconnect");

			this.oList.addDragDropConfig(this.oDragDropConfig);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo recreated after reconnect");
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo recreated after reconnect");
		});
	});

	QUnit.test("Lifecycle - destroy", function(assert) {
		return waitForInitialized(this.oList).then(async () => {
			this.oDragDropConfig.setDraggable(true);
			this.oDragDropConfig.setDroppable(true);
			await nextUIUpdate();

			assert.ok(this.oDragDropConfig._oObserver, "Observer exists");
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo exists");
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo exists");

			this.oDragDropConfig.destroy();
			assert.notOk(this.oDragDropConfig._oObserver, "Observer destroyed");
		});
	});

	QUnit.test("Disable drag removes DragInfo", function(assert) {
		return waitForInitialized(this.oList).then(async () => {
			this.oDragDropConfig.setDraggable(true);
			await nextUIUpdate();
			assert.ok(this.oDragDropConfig._oDragInfo, "DragInfo exists");

			this.oDragDropConfig.setDraggable(false);
			assert.notOk(this.oDragDropConfig._oDragInfo, "DragInfo removed");
		});
	});

	QUnit.test("Disable drop removes DropInfo", function(assert) {
		return waitForInitialized(this.oList).then(async () => {
			this.oDragDropConfig.setDroppable(true);
			await waitForRequire();
			assert.ok(this.oDragDropConfig._oDropInfo, "DropInfo exists");

			this.oDragDropConfig.setDroppable(false);
			assert.notOk(this.oDragDropConfig._oDropInfo, "DropInfo removed");
		});
	});

	QUnit.test("KeyboardHandling property forwarding", function(assert) {
		return waitForInitialized(this.oList).then(async () => {
			this.oDragDropConfig.setDraggable(true);
			this.oDragDropConfig.setDroppable(true);
			await nextUIUpdate();

			this.oDragDropConfig.setKeyboardHandling(false);
			assert.equal(this.oDragDropConfig._oDragInfo.getKeyboardHandling(), false, "KeyboardHandling forwarded to DragInfo");
			assert.equal(this.oDragDropConfig._oDropInfo.getKeyboardHandling(), false, "KeyboardHandling forwarded to DropInfo");
		});
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			// Disable growing so items are materialized synchronously for the event assertions.
			this.oList = await createMDCList({ growingMode: "None" });
			this.oDragDropConfig = new DragDropConfig({
				draggable: true,
				droppable: true
			});
			this.oList.addDragDropConfig(this.oDragDropConfig);
			await waitForInitialized(this.oList);
			await waitForRequire();
		},
		afterEach: function() {
			this.oList.destroy(true);
		}
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

		return waitForInitialized(this.oList).then(async () => {
			await waitForRequire();
			await nextUIUpdate();
			const oInnerList = this.oList._oList;
			const aItems = oInnerList.getItems();
			const oDraggedItem = aItems[0];
			const oInvalidDropItem = aItems[1];
			const oDroppedItem = aItems[2];

			this.oDragDropConfig.attachDragOver((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), oDroppedItem.getBindingContext(),
					"dragOver event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("dragSource"), oDraggedItem.getBindingContext(),
					"dragOver event dragSource parameter is correct");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "dragOver event dropPosition parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragOver event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});
			this.oDragDropConfig.attachDrop((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), oDroppedItem.getBindingContext(),
					"drop event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("dragSource"), oDraggedItem.getBindingContext(),
					"drop event dragSource parameter is correct");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "drop event dropPosition parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of drop event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});
			this.oDragDropConfig.attachDragEnd((oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), oDraggedItem.getBindingContext(),
					"dragEnd event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragEnd event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
			});

			const fnPreventDefaultSpy = sinon.spy(window.Event.prototype, "preventDefault");

			// dragStart with preventDefault
			this.oDragDropConfig.attachEventOnce("dragStart", (oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), oDraggedItem.getBindingContext(),
					"dragStart event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragStart event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
				oEvent.preventDefault();
			});
			triggerEvent("dragstart", oDraggedItem);
			assert.equal(fnPreventDefaultSpy.callCount, 1, "preventDefault of the dragstart event is called");

			// dragStart without preventDefault
			triggerEvent("dragstart", oDraggedItem);

			// dragEnter on valid target
			triggerEvent("dragenter", oDroppedItem);
			assert.ok(document.querySelector(".sapUiDnDIndicator")?.clientWidth, "Drop indicator is visible");

			// dragEnter with preventDefault on invalid target
			this.oDragDropConfig.attachEventOnce("dragEnter", (oEvent) => {
				assert.equal(oEvent.getParameter("bindingContext"), oInvalidDropItem.getBindingContext(),
					"dragEnter event bindingContext parameter is correct");
				assert.equal(oEvent.getParameter("browserEvent"), oDragEvent, "browserEvent parameter of dragEnter event is provided");
				assert.equal(oEvent.getParameter("browserEvent").type, oEvent.getId().toLowerCase(), "event types are matched");
				assert.equal(oEvent.getParameter("dropPosition"), "On", "Drop position is provided for dragenter");
				oEvent.preventDefault();
			});
			triggerEvent("dragenter", oInvalidDropItem);
			assert.notOk(document.querySelector(".sapUiDnDIndicator")?.clientWidth, "Drop indicator is not visible after preventDefault");
			assert.equal(fnPreventDefaultSpy.callCount, 2, "preventDefault of the dragenter event is called");

			// dragEnter on valid target again
			triggerEvent("dragenter", oDroppedItem);

			// dragOver with preventDefault
			this.oDragDropConfig.attachEventOnce("dragOver", (oEvent) => {
				oEvent.preventDefault();
			});
			triggerEvent("dragover", oDroppedItem);
			assert.equal(fnPreventDefaultSpy.callCount, 3, "preventDefault of the dragover event is called");

			// dragOver, drop, dragEnd (persistent handlers above validate params)
			triggerEvent("dragover", oDroppedItem);
			triggerEvent("drop", oDroppedItem);
			triggerEvent("dragend", oDraggedItem);

			fnPreventDefaultSpy.restore();
		});
	});

});
