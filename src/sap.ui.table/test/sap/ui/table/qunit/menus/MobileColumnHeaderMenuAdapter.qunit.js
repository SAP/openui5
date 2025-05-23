/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/menus/MobileColumnHeaderMenuAdapter",
	"sap/m/library",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/table/columnmenu/ItemContainer",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/model/type/Integer"
], function(
	Library,
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	TableUtils,
	Column,
	MobileColumnHeaderMenuAdapter,
	MLibrary,
	ColumnMenu,
	QuickAction,
	QuickSort,
	QuickSortItem,
	Item,
	ItemContainer,
	Button,
	CoreLibrary,
	Device,
	IntegerType
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
			this.oColumn1.setSortOrder(CoreLibrary.SortOrder.Descending);
			this.oColumn1.setFilterProperty("F");
			this.oColumn1.setFilterValue("initial filter value");
			this.oColumn1.setHeaderMenu(this.oMenu1);

			this.oMenu2 = new ColumnMenu();
			this.oColumn2 = TableQUnitUtils.createTextColumn({label: "Menu without custom items"});
			this.oColumn2.setSortProperty("G");
			this.oColumn2.setFilterProperty("G");
			this.oColumn2.setHeaderMenu(this.oMenu2);

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
			const oElement = this.oTable.qunit.getColumnHeaderCell(iColumnIndex);

			oElement.focus();
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oElement, "click");

			return new Promise(function(resolve) {
				const oMenu = this["oMenu" + (iColumnIndex + 1)];

				if (oMenu.isOpen()) {
					resolve();
				} else {
					oMenu.attachEventOnce("beforeOpen", resolve);
				}
			}.bind(this));
		},
		closeMenu: function(oMenu) {
			oMenu.close();
			return new Promise(function(resolve) {
				if (!oMenu._oPopover.isOpen()) {
					resolve();
				} else {
					oMenu._oPopover.attachEventOnce("afterClose", resolve);
				}
			});
		},
		getQuickAction: function(oMenu, sType) {
			const aQuickActions = oMenu.getAggregation("_quickActions").filter(function(oQuickAction) {
				return oQuickAction.isA("sap.m.table.columnmenu." + sType);
			});

			return sType === "QuickAction" ? aQuickActions : aQuickActions[0];
		}
	});

	QUnit.test("Menu entries", async function(assert) {
		await this.openColumnMenu(0);
		let oColumn = this.oTable.getColumns()[0];
		let oMenu = oColumn.getHeaderMenuInstance();
		let oQuickSort = this.getQuickAction(oMenu, "QuickSort");
		let aQuickSortItems = oQuickSort.getItems();

		assert.equal(aQuickSortItems.length, 1, "Quick sort item count");
		assert.strictEqual(aQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
		assert.strictEqual(aQuickSortItems[0].getLabel(), oColumn.getLabel().getText(), "Quick sort 'label'");
		assert.strictEqual(aQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.Descending, "Quick sort 'sortOrder'");

		let oQuickFilter = this.getQuickAction(oMenu, "QuickAction")[0];
		let aQuickFilterContent = oQuickFilter.getContent();
		assert.strictEqual(oQuickFilter.getLabel(), oColumn.getLabel().getText(), "Quick filter 'label'");
		assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
		assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
		assert.strictEqual(aQuickFilterContent[0].getValue(), "initial filter value", "Quick filter value");

		let oQuickFreeze = this.getQuickAction(oMenu, "QuickAction")[1];
		let aQuickFreezeContent = oQuickFreeze.getContent();
		assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
		assert.equal(oQuickFreeze.getLabel(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze label");
		assert.ok(aQuickFreezeContent[0].isA("sap.m.Switch"), "Quick freeze content is a sap.m.Switch");

		await this.openColumnMenu(1);
		oColumn = this.oTable.getColumns()[1];
		oMenu = oColumn.getHeaderMenuInstance();

		oQuickSort = this.getQuickAction(oMenu, "QuickSort");
		aQuickSortItems = oQuickSort.getItems();
		assert.equal(aQuickSortItems.length, 1, "Quick sort item count");
		assert.strictEqual(aQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
		assert.strictEqual(aQuickSortItems[0].getLabel(), oColumn.getLabel().getText(), "Quick sort 'label'");
		assert.strictEqual(aQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.None, "Quick sort 'sortOrder'");

		oQuickFilter = this.getQuickAction(oMenu, "QuickAction")[0];
		aQuickFilterContent = oQuickFilter.getContent();
		assert.strictEqual(oQuickFilter.getLabel(), oColumn.getLabel().getText(), "Quick filter 'label'");
		assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
		assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
		assert.strictEqual(aQuickFilterContent[0].getValue(), "", "Quick filter value");

		oQuickFreeze = this.getQuickAction(oMenu, "QuickAction")[1];
		aQuickFreezeContent = oQuickFreeze.getContent();
		assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
		assert.equal(oQuickFreeze.getLabel(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze label");
		assert.ok(aQuickFreezeContent[0].isA("sap.m.Switch"), "Quick freeze content is a sap.m.Switch");

		await this.closeMenu(oMenu);
		this.oColumn2.setShowSortMenuEntry(false);
		this.oColumn2.setShowFilterMenuEntry(false);
		this.oTable.setEnableColumnFreeze(false);

		await this.openColumnMenu(1);
		oColumn = this.oTable.getColumns()[1];
		oMenu = oColumn.getHeaderMenuInstance();

		assert.notOk(this.getQuickAction(oMenu, "QuickSort").getVisible(), "No Quick Sort");
		assert.notOk(this.getQuickAction(oMenu, "QuickAction")[0].getVisible(), "No Quick Filter");
		assert.notOk(this.getQuickAction(oMenu, "QuickAction")[1].getVisible(), "No Column Freeze");
	});

	QUnit.test("Quick Sort", async function(assert) {
		const oTable = this.oTable;
		const oColumnSortSpy = this.spy(this.oColumn1, "_sort");

		await this.openColumnMenu(0);
		let oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
		const oQuickAction = this.getQuickAction(oMenu, "QuickSort").getItems()[0].getAggregation("quickAction");
		const oSegmentedButton = oQuickAction.getContent()[0];

		qutils.triggerMouseEvent(oSegmentedButton.getButtons()[1].getId(), "mousedown", null, null, null, null, 0);
		qutils.triggerMouseEvent(oSegmentedButton.getButtons()[1].getId(), "click");

		assert.ok(oColumnSortSpy.calledOnceWithExactly(CoreLibrary.SortOrder.Ascending, false),
			"Column#_sort is called once with the correct parameters");

		await this.closeMenu(oMenu);
		this.oColumn1.setShowSortMenuEntry(false);

		await this.openColumnMenu(0);
		oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
		assert.ok(this.getQuickAction(oMenu, "QuickSort").getItems()[0].getAggregation("quickAction") === oQuickAction,
			"The QuickSort instance is not destroyed");
		assert.notOk(this.getQuickAction(oMenu, "QuickSort").getVisible(), "The QuickSort is not visible");
	});

	QUnit.test("Quick Filter and validation", async function(assert) {
		const oTable = this.oTable;
		const oColumn = this.oColumn1;
		const oColumnGetFilterStateSpy = this.spy(oColumn, "_getFilterState");
		const oColumnFilterSpy = this.spy(oColumn, "filter");

		await this.openColumnMenu(0);
		let oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
		const oQuickFilter = this.getQuickAction(oMenu, "QuickAction")[0];
		const oFilterField = oQuickFilter.getContent()[0];

		assert.ok(oColumnGetFilterStateSpy.calledOnce, "Column#_getFilterState is called once when the menu opens");
		oFilterField.setValue("test");
		oFilterField.fireEvent("submit");

		assert.ok(oColumnGetFilterStateSpy.calledTwice, "Column#_getFilterState is called when the filter value is submitted");
		assert.ok(oColumnFilterSpy.calledOnceWithExactly("test"), "Column#filter is called once with the correct parameters");
		oColumnGetFilterStateSpy.restore();
		oColumnFilterSpy.restore();

		oColumn.setFilterType(new IntegerType());
		assert.equal(oColumn._getFilterState(), "Error", "Validation error, the expected input was integer");

		oColumn.setFilterValue("1");
		assert.equal(oColumn._getFilterState(), "None", "Validation successful");

		await this.closeMenu(oMenu);
		this.oColumn1.setShowFilterMenuEntry(false);

		await this.openColumnMenu(0);
		oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
		assert.ok(this.getQuickAction(oMenu, "QuickAction")[0] === oQuickFilter, "The QuickFilter instance is not destroyed");
		assert.notOk(oQuickFilter.getVisible(), "The QuickFilter is not visible");
	});

	QUnit.test("Custom Filter", async function(assert) {
		const oTable = this.oTable;
		const oColumn = this.oColumn2;

		oTable.setEnableCustomFilter(true);

		await this.openColumnMenu(1);
		const oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
		const oCustomFilter = oMenu.getAggregation("_items")[0].getItems()[0];

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

	QUnit.test("Quick Total", async function(assert) {
		const oTable = this.oTable;

		// simulate AnalyticalTable
		const oAnalyticalTableStub = sinon.stub(TableUtils, "isA");
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

		const oColumnSetSummedSpy = this.spy(this.oColumn2, "setSummed");

		await this.openColumnMenu(1);
		const oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
		const oQuickTotal = this.getQuickAction(oMenu, "QuickTotal");
		const oSwitch = oQuickTotal.getEffectiveQuickActions()[0].getContent()[0];

		await new Promise(function(resolve) {
			oMenu.attachEventOnce("afterClose", function() {
				assert.ok(oColumnSetSummedSpy.calledOnceWithExactly(true), "Column#setSummed is called once with the correct parameters");
				resolve();
			});

			qutils.triggerKeyup(oSwitch.getDomRef(), "SPACE");
		});

		this.oColumn2._isAggregatableByMenu = function() {
			return false;
		};

		await this.openColumnMenu(0);
		assert.ok(oQuickTotal, "The QuickTotal instance is not destroyed");
		assert.notOk(oQuickTotal.getVisible(), "The QuickTotal is not visible");
	});

	QUnit.test("Quick Freeze", async function(assert) {
		const oTable = this.oTable;
		const oColumnFreezeSpy = this.spy();
		oTable.attachColumnFreeze(function(oEvent) {
			oColumnFreezeSpy(oEvent.getParameters());
		});

		await this.openColumnMenu(0);
		const oColumn = oTable.getColumns()[0];
		const oMenu = oColumn.getHeaderMenuInstance();
		const oQuickFreeze = this.getQuickAction(oMenu, "QuickAction")[1];
		const oSwitch = oQuickFreeze.getContent()[0];

		await new Promise(function(resolve) {
			oMenu.attachEventOnce("afterClose", function() {
				assert.ok(oColumnFreezeSpy.calledOnceWithExactly({
					id: oTable.getId(),
					column: oColumn
				}),
					"Table#ColumnFreeze event is fired once with the correct parameters");
				resolve();
			});

			qutils.triggerKeyup(oSwitch.getDomRef(), "SPACE");
		});

		oTable.setEnableColumnFreeze(false);

		await this.openColumnMenu(0);
		assert.ok(this.getQuickAction(oMenu, "QuickAction")[1] === oQuickFreeze, "The QuickFreeze instance is not destroyed");
		assert.notOk(oQuickFreeze.getVisible(), "The QuickFreeze is not visible");
	});

	QUnit.test("Resize", async function(assert) {
		const oTable = this.oTable;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalDesktopSupport = Device.system.desktop;

		Device.support.pointer = false;
		Device.system.desktop = false;

		await this.openColumnMenu(0);
		const oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
		const oQuickResize = this.getQuickAction(oMenu, "QuickAction")[2];
		const aContent = oQuickResize.getContent();

		const sLabel = Library.getResourceBundleFor("sap.m").getText("table.COLUMNMENU_RESIZE");
		assert.strictEqual(oQuickResize.getLabel(), sLabel, "label is correct");
		assert.strictEqual(oQuickResize.getContent()[0].getTooltip(), sLabel, "tooltip is correct");
		assert.strictEqual(aContent[0].getIcon(), "sap-icon://resize-horizontal", "button has the correct icon");

		qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
		qutils.triggerMouseEvent(aContent[0].getId(), "click");

		assert.ok(oTable.$().hasClass("sapUiTableResizing") && oTable.$("rsz").hasClass("sapUiTableColRszActive"), "Resizing started");

		Device.support.pointer = bOriginalPointerSupport;
		Device.system.desktop = bOriginalDesktopSupport;
	});

	QUnit.test("Resize Input", async function(assert) {
		const oTable = this.oTable;
		const oColumnResizeSpy = this.spy();
		oTable.attachColumnResize(function(oEvent) {
			oColumnResizeSpy(oEvent.getParameters());
		});
		await this.openColumnMenu(0);
		let oColumn = oTable.getColumns()[0];
		let oMenu = oColumn.getHeaderMenuInstance();
		let oQuickResize = this.getQuickAction(oMenu, "QuickResize");

		assert.ok(oQuickResize, "QuickResizeInput is available");
		assert.ok(oQuickResize.getVisible(), "QuickResizeInput is visible");
		let oStepInput = oQuickResize.getContent()[0];
		assert.ok(oStepInput.isA("sap.m.StepInput"), "The QuickResize contains a StepInput");
		assert.equal(oStepInput.getValue(), 100, "Resize input value is correct (px)");

		oStepInput.setValue("200");
		oStepInput.fireChange({width: 200});
		assert.equal(oColumn.getWidth(), "200px", "Column width is set correctly");
		assert.ok(oColumnResizeSpy.calledOnceWithExactly({
			id: oTable.getId(),
			column: oColumn,
			width: "200px"
		}), "columnResize event is fired once with the correct parameters");
		assert.ok(oMenu.isOpen(), "Menu is still open");

		oColumn = oTable.getColumns()[1];
		oColumn.setWidth("10rem");
		oMenu.close();
		await nextUIUpdate();

		await this.openColumnMenu(1);
		oMenu = oColumn.getHeaderMenuInstance();
		oQuickResize = this.getQuickAction(oMenu, "QuickResize");

		assert.ok(oQuickResize, "QuickResizeInput is available");
		assert.ok(oQuickResize.getVisible(), "QuickResizeInput is visible");
		oStepInput = oQuickResize.getContent()[0];
		assert.ok(oStepInput.isA("sap.m.StepInput"), "The QuickResizeInput contains a StepInput");
		assert.equal(oStepInput.getValue(), 160, "Resize input value is correct (px)");
		oMenu.close();
		await nextUIUpdate();

		oColumn = oTable.getColumns()[0];
		oColumn.setResizable(false);
		await this.openColumnMenu(0);
		oMenu = oColumn.getHeaderMenuInstance();
		oQuickResize = this.getQuickAction(oMenu, "QuickResize");
		assert.notOk(oQuickResize.getVisible(), "QuickResizeInput is not visible");
		oMenu.close();
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = new Column({
				sortProperty: "A"
			});
			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn]
			});

			this.oAdapter = new MobileColumnHeaderMenuAdapter();
			this.oAdapter._oItemContainer = new ItemContainer();
		},
		afterEach: function() {
			this.oMenu.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("injectMenuItems", function(assert) {
		const oAddAggregationSpy = sinon.spy(this.oMenu, "addAggregation");

		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		assert.equal(oAddAggregationSpy.callCount, 8,
			"Menu.addAggregation is called 8 times (sort, filter, group, total, freeze, resize, resize alternative, items)");
		assert.ok(oAddAggregationSpy.calledWith("_items", this.oAdapter._oItemContainer),
			"ItemContainer is added to the menu");
	});

	QUnit.test("removeMenuItems", function(assert) {
		const oRemoveAggregationSpy = sinon.spy(this.oMenu, "removeAggregation");

		this.oAdapter.removeMenuItems(this.oMenu);
		assert.equal(oRemoveAggregationSpy.callCount, 8, "Menu.removeAggregation is called 8 times");
		assert.ok(oRemoveAggregationSpy.calledWith("_items", this.oAdapter._oItemContainer),
			"ItemContainer is removed from the menu");
	});

	QUnit.test("onAfterMenuDestroyed", function(assert) {
		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		assert.ok(this.oAdapter._oItemContainer, "reference to the ItemContainer is added");
		assert.ok(this.oAdapter._oQuickSort, "reference to the QuickSort is added");

		this.oAdapter.onAfterMenuDestroyed(this.oMenu);
		assert.notOk(this.oAdapter._oItemContainer, "reference to the ItemContainer is removed");
		assert.notOk(this.oAdapter._oQuickSort, "reference to the QuickSort is removed");
	});

	QUnit.test("destroy", function(assert) {
		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		const oDestroyQuickActionsSpy = sinon.spy(this.oAdapter, "_destroyQuickActions");
		const oDestroyItemsSpy = sinon.spy(this.oAdapter, "_destroyItems");
		assert.ok(this.oAdapter._oItemContainer, "reference to the ItemContainer is added");
		assert.ok(this.oAdapter._oQuickSort, "reference to the QuickSort is added");
		assert.ok(this.oAdapter._oColumn, "reference to the Column is added");

		this.oAdapter.destroy();
		assert.ok(oDestroyQuickActionsSpy.calledOnce, "_destroyQuickActions is called");
		assert.ok(oDestroyItemsSpy.calledOnce, "_destroyItems is called");
		assert.notOk(this.oAdapter._oItemContainer, "reference to the ItemContainer is removed");
		assert.notOk(this.oAdapter._oQuickSort, "reference to the QuickSort is removed");
		assert.notOk(this.oAdapter._oColumn, "reference to the Column is removed");
	});
});