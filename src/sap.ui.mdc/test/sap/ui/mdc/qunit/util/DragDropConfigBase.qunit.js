/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/util/DragDropConfigBase",
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel"
], function(DragDropConfigBase, Control, List, StandardListItem, JSONModel) {
	"use strict";

	// Minimal concrete subclass implementing the two template methods.
	const TestConfig = DragDropConfigBase.extend("sap.ui.mdc.qunit.util.TestDragDropConfig", {
		renderer: null
	});
	TestConfig.prototype._getItemsAggregationName = function() {
		return "items";
	};

	// Minimal MDC-like parent exposing the hidden _content aggregation the base observes.
	const TestParent = Control.extend("sap.ui.mdc.qunit.util.TestDragDropParent", {
		metadata: {
			aggregations: {
				_content: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				dragDropConfig: {type: "sap.ui.mdc.util.DragDropConfigBase", multiple: true}
			}
		},
		renderer: null
	});

	function createInnerList() {
		const oList = new List({
			items: {path: "/", template: new StandardListItem({title: "{name}"})}
		});
		oList.setModel(new JSONModel([{name: "A"}, {name: "B"}]));
		return oList;
	}

	QUnit.module("Lifecycle", {
		afterEach: function() {
			this.oConfig?.destroy();
		}
	});

	QUnit.test("init creates the observer, exit destroys it", function(assert) {
		this.oConfig = new TestConfig();
		assert.ok(this.oConfig._oObserver, "Observer is created in init");

		const oObserver = this.oConfig._oObserver;
		const oDestroySpy = sinon.spy(oObserver, "destroy");
		this.oConfig.destroy();
		this.oConfig = null;
		assert.ok(oDestroySpy.calledOnce, "Observer is destroyed in exit");
	});

	QUnit.test("abstract _getItemsAggregationName throws when not implemented", function(assert) {
		const oConfig = new DragDropConfigBase();
		assert.throws(function() {
			oConfig._getItemsAggregationName();
		}, /does not implement/, "Throws a descriptive error");
		oConfig.destroy();
	});

	QUnit.module("Parent and inner control connection", {
		beforeEach: function() {
			this.oInnerList = createInnerList();
			this.oParent = new TestParent();
			this.oConfig = new TestConfig();
		},
		afterEach: function() {
			this.oConfig.destroy();
			this.oParent.destroy();
			this.oInnerList.destroy();
		}
	});

	QUnit.test("connects to an inner control that is already present", function(assert) {
		this.oParent.setAggregation("_content", this.oInnerList);
		this.oParent.addDragDropConfig(this.oConfig);

		assert.strictEqual(this.oConfig._oInnerControl, this.oInnerList, "Inner control is picked up on connect");
	});

	QUnit.test("connects to an inner control inserted later", function(assert) {
		this.oParent.addDragDropConfig(this.oConfig);
		assert.notOk(this.oConfig._oInnerControl, "No inner control before it is inserted");

		this.oParent.setAggregation("_content", this.oInnerList);
		assert.strictEqual(this.oConfig._oInnerControl, this.oInnerList, "Inner control is picked up via the observer");
	});

	QUnit.test("disconnects when the inner control is removed", function(assert) {
		this.oParent.setAggregation("_content", this.oInnerList);
		this.oParent.addDragDropConfig(this.oConfig);

		this.oParent.setAggregation("_content", null);
		assert.notOk(this.oConfig._oInnerControl, "Inner control reference is cleared");
	});

	QUnit.test("disconnects from the previous parent when reparented", function(assert) {
		this.oParent.setAggregation("_content", this.oInnerList);
		this.oParent.addDragDropConfig(this.oConfig);
		assert.ok(this.oConfig._oInnerControl, "Connected to the first parent");

		const oOtherParent = new TestParent();
		oOtherParent.addDragDropConfig(this.oConfig);
		assert.notOk(this.oConfig._oInnerControl, "Cleared when moved to a parent without inner control");
		oOtherParent.destroy();
	});

	QUnit.module("DragInfo / DropInfo management", {
		beforeEach: function() {
			this.oInnerList = createInnerList();
			this.oParent = new TestParent();
			this.oParent.setAggregation("_content", this.oInnerList);
			this.oConfig = new TestConfig();
			this.oParent.addDragDropConfig(this.oConfig);
		},
		afterEach: function() {
			this.oConfig.destroy();
			this.oParent.destroy();
			this.oInnerList.destroy();
		}
	});

	QUnit.test("draggable toggles a DragInfo on the inner control", function(assert) {
		assert.notOk(this.oConfig._oDragInfo, "No DragInfo while draggable is false");

		this.oConfig.setDraggable(true);
		assert.ok(this.oConfig._oDragInfo, "DragInfo created when draggable is set");
		assert.strictEqual(this.oConfig._oDragInfo.getSourceAggregation(), "items", "Source aggregation from subclass");
		assert.ok(this.oInnerList.getDragDropConfig().includes(this.oConfig._oDragInfo), "DragInfo added to the inner control");

		this.oConfig.setDraggable(false);
		assert.notOk(this.oConfig._oDragInfo, "DragInfo removed when draggable is unset");
	});

	QUnit.test("droppable toggles a DropInfo on the inner control", function(assert) {
		assert.notOk(this.oConfig._oDropInfo, "No DropInfo while droppable is false");

		this.oConfig.setDroppable(true);
		assert.ok(this.oConfig._oDropInfo, "DropInfo created when droppable is set");
		assert.strictEqual(this.oConfig._oDropInfo.getTargetAggregation(), "items", "Target aggregation from subclass");

		this.oConfig.setDroppable(false);
		assert.notOk(this.oConfig._oDropInfo, "DropInfo removed when droppable is unset");
	});

	QUnit.test("dropEffect and dropPosition forward to an existing DropInfo", function(assert) {
		this.oConfig.setDroppable(true);
		this.oConfig.setDropEffect("Copy");
		this.oConfig.setDropPosition("Between");

		assert.strictEqual(this.oConfig._oDropInfo.getDropEffect(), "Copy", "dropEffect forwarded");
		assert.strictEqual(this.oConfig._oDropInfo.getDropPosition(), "Between", "dropPosition forwarded");
	});

	QUnit.test("enabled and groupName forward to existing infos", function(assert) {
		this.oConfig.setDraggable(true);
		this.oConfig.setDroppable(true);

		this.oConfig.setGroupName("g1");
		assert.strictEqual(this.oConfig._oDragInfo.getGroupName(), "g1", "groupName forwarded to DragInfo");
		assert.strictEqual(this.oConfig._oDropInfo.getGroupName(), "g1", "groupName forwarded to DropInfo");

		this.oConfig.setEnabled(false);
		assert.notOk(this.oConfig._oDragInfo.getEnabled(), "enabled forwarded to DragInfo");
		assert.notOk(this.oConfig._oDropInfo.getEnabled(), "enabled forwarded to DropInfo");
	});

	QUnit.module("Event mapping", {
		beforeEach: function() {
			this.oInnerList = createInnerList();
			this.oParent = new TestParent();
			this.oParent.setAggregation("_content", this.oInnerList);
			this.oConfig = new TestConfig();
			this.oParent.addDragDropConfig(this.oConfig);
			this.oConfig.setDraggable(true);
		},
		afterEach: function() {
			this.oConfig.destroy();
			this.oParent.destroy();
			this.oInnerList.destroy();
		}
	});

	QUnit.test("dragStart fires with a binding context and can be prevented", function(assert) {
		const oItem = this.oInnerList.getItems()[0];
		const oDragSession = {getDragControl: () => oItem, getDropControl: () => null};
		const oInnerEvent = {
			getId: () => "dragStart",
			getParameter: (s) => (s === "dragSession" ? oDragSession : "browserEvt"),
			preventDefault: sinon.spy()
		};

		this.oConfig.attachDragStart((oEvent) => {
			assert.ok(oEvent.getParameter("bindingContext"), "bindingContext is provided");
			assert.strictEqual(oEvent.getParameter("browserEvent"), "browserEvt", "browserEvent forwarded");
			oEvent.preventDefault();
		});

		this.oConfig._onDragInfoEvent(oInnerEvent);
		assert.ok(oInnerEvent.preventDefault.calledOnce, "Inner event default prevented when the public event is prevented");
	});

	QUnit.test("drop fires with dragSource and dropPosition", function(assert) {
		const oItem = this.oInnerList.getItems()[0];
		const oDragSession = {getDragControl: () => oItem, getDropControl: () => oItem};
		const oInnerEvent = {
			getId: () => "drop",
			getParameter: (s) => {
				if (s === "dragSession") { return oDragSession; }
				if (s === "dropPosition") { return "After"; }
				return "browserEvt";
			}
		};

		assert.expect(2);
		this.oConfig.attachDrop((oEvent) => {
			assert.ok(oEvent.getParameter("dragSource"), "dragSource is provided");
			assert.strictEqual(oEvent.getParameter("dropPosition"), "After", "dropPosition forwarded");
		});

		this.oConfig._onDropInfoEvent(oInnerEvent);
	});
});
