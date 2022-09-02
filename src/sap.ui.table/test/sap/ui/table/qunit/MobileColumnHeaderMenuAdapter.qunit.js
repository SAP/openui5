/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/library",
	"sap/ui/table/menus/MobileColumnHeaderMenuAdapter",
	"sap/m/library",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/QuickActionContainer",
	"sap/m/table/columnmenu/ItemContainer",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	qutils,
	TableUtils,
	Column,
	Table,
	library,
	MobileColumnHeaderMenuAdapter,
	MLibrary,
	ColumnMenu,
	QuickAction,
	QuickSort,
	QuickSortItem,
	Item,
	QuickActionContainer,
	ItemContainer,
	Button,
	CoreLibrary,
	oCore,
	Device
) {
	"use strict";

	QUnit.module("Menu entries and interaction", {
		beforeEach: function() {
			this.oMenu1 = new ColumnMenu({
				quickActions: [
					new QuickSort({
						items: new QuickSortItem({
							key: "CustomQuickSort",
							label: "Custom Quick Sort"
						})
					}),
					new QuickAction({
						label: "Custom Quick Filter",
						content: new Button({text: "Execute B"}),
						category: MLibrary.table.columnmenu.Category.Filter
					})
				],
				items: [new Item({label: "Item C", icon: "sap-icon://sort"})]
			});
			this.oColumn1 = TableQUnitUtils.createTextColumn({label: "Menu with custom items"});
			this.oColumn1.setSortProperty("F");
			this.oColumn1.setSorted(true);
			this.oColumn1.setSortOrder(library.SortOrder.Descending);
			this.oColumn1.setFilterProperty("F");
			this.oColumn1.setFilterValue("initial filter value");
			this.oColumn1.setAssociation("headerMenu", this.oMenu1);

			this.oMenu2 = new ColumnMenu();
			this.oColumn2 = TableQUnitUtils.createTextColumn({label: "Menu without custom items"});
			this.oColumn2.setSortProperty("G");
			this.oColumn2.setFilterProperty("G");
			this.oColumn2.setAssociation("headerMenu", this.oMenu2);

			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn1, this.oColumn2],
				enableGrouping: true,
				enableColumnFreeze: true
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oMenu1.destroy();
			this.oMenu2.destroy();
			this.oTable.destroy();
		},
		openColumnMenu: function(iColumnIndex) {
			var oElement = this.oTable.qunit.getColumnHeaderCell(iColumnIndex);

			oElement.focus();
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oElement, "click");

			return new Promise(function(resolve) {
				var oMenu = this["oMenu" + (iColumnIndex + 1)];

				if (oMenu.isOpen()) {
					resolve();
				} else {
					oMenu.attachEventOnce("beforeOpen", resolve);
				}
			}.bind(this));
		},
		getQuickAction: function(oMenu, sType) {
			var aQuickActions = oMenu.getAggregation("_quickActions")[0].getQuickActions().filter(function(oQuickAction) {
				return oQuickAction.isA("sap.m.table.columnmenu." + sType);
			});

			return sType === "QuickAction" ? aQuickActions : aQuickActions[0];
		}
	});

	QUnit.test("Menu entries", function (assert) {
		var that = this;

		return this.openColumnMenu(0).then(function() {
			var oMenu = that.oTable.getColumns()[0].getHeaderMenuInstance();

			var oQuickSort = that.getQuickAction(oMenu, "QuickSort");
			var oQuickSortItems = oQuickSort.getItems();
			assert.equal(oQuickSortItems.length, 1, "Quick sort item count");
			assert.strictEqual(oQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
			assert.strictEqual(oQuickSortItems[0].getLabel(), "", "Quick sort 'label'");
			assert.strictEqual(oQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.Descending, "Quick sort 'sortOrder'");

			var oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			var aQuickFilterContent = oQuickFilter.getContent();
			assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
			assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
			assert.strictEqual(aQuickFilterContent[0].getValue(), "initial filter value", "Quick filter value");

			var oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			var oQuickGroupItems = oQuickGroup.getItems();
			assert.equal(oQuickGroupItems.length, 1, "Quick group item count");
			assert.strictEqual(oQuickGroupItems[0].getKey(), undefined, "Quick group 'key'");
			assert.strictEqual(oQuickGroupItems[0].getLabel(), "", "Quick group 'label'");
			assert.strictEqual(oQuickGroupItems[0].getGrouped(), false, "Quick group 'grouped'");

			var oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			var aQuickFreezeContent = oQuickFreeze.getContent();
			assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
			assert.ok(aQuickFreezeContent[0].isA("sap.m.Button"), "Quick freeze content is a sap.m.Button");
			assert.equal(aQuickFreezeContent[0].getText(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze button text");
		}).then(function() {
			return that.openColumnMenu(1);
		}).then(function() {
			var oMenu = that.oTable.getColumns()[1].getHeaderMenuInstance();

			var oQuickSort = that.getQuickAction(oMenu, "QuickSort");
			var oQuickSortItems = oQuickSort.getItems();
			assert.equal(oQuickSortItems.length, 1, "Quick sort item count");
			assert.strictEqual(oQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
			assert.strictEqual(oQuickSortItems[0].getLabel(), "", "Quick sort 'label'");
			assert.strictEqual(oQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.None, "Quick sort 'sortOrder'");

			var oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			var aQuickFilterContent = oQuickFilter.getContent();
			assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
			assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
			assert.strictEqual(aQuickFilterContent[0].getValue(), "", "Quick filter value");

			var oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			var oQuickGroupItems = oQuickGroup.getItems();
			assert.equal(oQuickGroupItems.length, 1, "Quick group item count");
			assert.strictEqual(oQuickGroupItems[0].getKey(), undefined, "Quick group 'key'");
			assert.strictEqual(oQuickGroupItems[0].getLabel(), "", "Quick group 'label'");
			assert.strictEqual(oQuickGroupItems[0].getGrouped(), false, "Quick group 'grouped'");

			var oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			var aQuickFreezeContent = oQuickFreeze.getContent();
			assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
			assert.ok(aQuickFreezeContent[0].isA("sap.m.Button"), "Quick freeze content is a sap.m.Button");
			assert.equal(aQuickFreezeContent[0].getText(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze button text");
		});
	});

	QUnit.test("Quick Sort", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oColumnSortSpy = this.spy(this.oColumn1, "sort");

		return this.openColumnMenu(0).then(function() {
			var oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickAction = that.getQuickAction(oMenu, "QuickSort").getItems()[0].getAggregation("quickAction");
			var aContent = oQuickAction.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oColumnSortSpy.calledOnceWithExactly(false, true), "Column#sort is called once with the correct arguments");
		});
	});

	QUnit.test("Quick Filter and validation", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oColumn = this.oColumn1;
		var oColumnGetFilterStateSpy = this.spy(oColumn, "_getFilterState");
		var oColumnFilterSpy = this.spy(oColumn, "filter");

		return this.openColumnMenu(0).then(function() {
			var oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			var oFilterField = oQuickFilter.getContent()[0];

			assert.ok(oColumnGetFilterStateSpy.calledOnce, "Column#_getFilterState is called once when the menu opens");
			oFilterField.setValue("test");
			oFilterField.fireEvent("submit");

			assert.ok(oColumnGetFilterStateSpy.calledTwice, "Column#_getFilterState is called when the filter value is submitted");
			assert.ok(oColumnFilterSpy.calledOnceWithExactly("test"), "Column#filter is called once with the correct arguments");
			oColumnGetFilterStateSpy.restore();
			oColumnFilterSpy.restore();

			oColumn.setFilterType(new sap.ui.model.type.Integer());
			assert.equal(oColumn._getFilterState(), "Error", "Validation error, the expected input was integer");

			oColumn.setFilterValue("1");
			assert.equal(oColumn._getFilterState(), "None", "Validation successful");
		});
	});

	QUnit.test("Custom Filter", function(assert) {
		var oTable = this.oTable;
		var oColumn = this.oColumn2;

		oTable.setEnableCustomFilter(true);

		return this.openColumnMenu(1).then(function() {
			var oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
			var oCustomFilter = oMenu.getAggregation("_items")[0].getItems()[0];

			assert.equal(oCustomFilter.getLabel(), TableUtils.getResourceText("TBL_FILTER_ITEM"), "Custom filter label is correct");
			assert.equal(oCustomFilter.getIcon(), "sap-icon://filter", "Custom filter icon is correct");

			return new Promise(function(resolve) {
				oTable.attachCustomFilter(function(oEvent) {
					assert.ok(true, "'customFilter' event was fired");
					assert.equal(oEvent.getParameter("column"), oColumn, "Event parameter 'column'");
					resolve();
				});
				oCustomFilter.firePress();
			});
		});
	});

	QUnit.test("Quick Group", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oColumnSetGroupedSpy = this.spy(this.oColumn1, "_setGrouped");

		return this.openColumnMenu(0).then(function() {
			var oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			var aContent = oQuickGroup.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oColumnSetGroupedSpy.calledOnceWithExactly(true), "Column#_setGrouped is called once with the correct arguments");
		});
	});

	QUnit.test("Quick Total", function(assert) {
		var that = this;
		var oTable = this.oTable;

		// simulate AnalyticalTable
		var oAnalyticalTableStub = sinon.stub(TableUtils, "isA");
		oAnalyticalTableStub.callThrough();
		oAnalyticalTableStub.withArgs(oTable, "sap.ui.table.AnalyticalTable").returns(true);
		this.oColumn2._isAggregatableByMenu = function() {
			return true;
		};
		this.oColumn2.getSummed = function() {
			return false;
		};
		this.oColumn2.setSummed = function() {
			assert.ok(true, "setSummed is called");
		};

		var oColumnSetSummedSpy = this.spy(this.oColumn2, "setSummed");

		return this.openColumnMenu(1).then(function() {
			var oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
			var oQuickTotal = that.getQuickAction(oMenu, "QuickTotal");
			var aContent = oQuickTotal.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oColumnSetSummedSpy.calledOnceWithExactly(true), "Column#setSummed is called once with the correct arguments");
		});
	});

	QUnit.test("Quick Freeze", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oSetFixedColumnCountSpy = this.spy(this.oTable, "setFixedColumnCount");

		return this.openColumnMenu(0).then(function() {
			var oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			var aContent = oQuickFreeze.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oSetFixedColumnCountSpy.calledOnceWithExactly(1), "Table#setFixedColumnCount is called once with the correct arguments");
		});
	});

	QUnit.test("Resize", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		return this.openColumnMenu(0).then(function() {
			var oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickResize = that.getQuickAction(oMenu, "QuickAction")[2];
			var aContent = oQuickResize.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oTable.$().hasClass("sapUiTableResizing") && oTable.$("rsz").hasClass("sapUiTableColRszActive"), "Resizing started");

			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = new Column();
			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn]
			});

			this.oAdapter = new MobileColumnHeaderMenuAdapter();
			this.oAdapter._oQuickActionContainer = new QuickActionContainer();
			this.oAdapter._oItemContainer = new ItemContainer();
		},
		afterEach: function() {
			this.oMenu.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("injectMenuItems", function(assert) {
		var oAddAggregationSpy = sinon.spy(this.oMenu, "addAggregation");

		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		assert.ok(oAddAggregationSpy.calledTwice, "Menu.addAggregation is called twice");
		assert.ok(oAddAggregationSpy.firstCall.args[0] === "_quickActions" && oAddAggregationSpy.firstCall.args[1] === this.oAdapter._oQuickActionContainer,
			"QuickActionContainer is added to the menu");
		assert.ok(oAddAggregationSpy.secondCall.args[0] === "_items" && oAddAggregationSpy.secondCall.args[1] === this.oAdapter._oItemContainer,
			"ItemContainer is added to the menu");
	});

	QUnit.test("removeMenuItems", function(assert) {
		var oRemoveAggregationSpy = sinon.spy(this.oMenu, "removeAggregation");

		this.oAdapter.removeMenuItems(this.oMenu);
		assert.ok(oRemoveAggregationSpy.calledTwice, "Menu.removeAggregation is called twice");
		assert.ok(oRemoveAggregationSpy.firstCall.args[0] === "_quickActions" && oRemoveAggregationSpy.firstCall.args[1] === this.oAdapter._oQuickActionContainer,
			"QuickActionContainer is removed from the menu");
		assert.ok(oRemoveAggregationSpy.secondCall.args[0] === "_items" && oRemoveAggregationSpy.secondCall.args[1] === this.oAdapter._oItemContainer,
			"ItemContainer is removed from the menu");
	});
});