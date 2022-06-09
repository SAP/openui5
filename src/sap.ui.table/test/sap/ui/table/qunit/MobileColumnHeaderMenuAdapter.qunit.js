/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/CreationRow",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Menu",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/Item",
	"sap/m/Button",
	"sap/ui/core/Core",
	'sap/ui/Device'
], function(
	TableQUnitUtils,
	qutils,
	TableUtils,
	Column,
	Table,
	CreationRow,
	JSONModel,
	Menu,
	ColumnMenu,
	QuickAction,
	QuickSort,
	QuickSortItem,
	Item,
	Button,
	oCore,
	Device
) {
	"use strict";

	QUnit.module("Content", {
		beforeEach: function() {
			this.oMenu1 = new ColumnMenu({
				quickSort: new QuickAction({
					label: "Custom Quick Sort",
					content: new sap.m.Button({text: "Sort by Property A"})
				}),
				quickActions: [new QuickAction({label: "Quick Action B", content: new Button({text: "Execute B"})})],
				items: [new Item({label: "Item C", icon: "sap-icon://sort"})]
			});
			this.oMenu2 = new ColumnMenu({
				quickActions: [new QuickAction({label: "Quick Action D", content: new Button({text: "Execute D"})})],
				items: [new Item({label: "Item E", icon: "sap-icon://filter"})]
			});
			this.oColumn1 = TableQUnitUtils.createTextColumn();
			this.oColumn1.setSortProperty("F");
			this.oColumn1.setFilterProperty("F");
			this.oColumn1.setAssociation("headerMenu", this.oMenu1);

			this.oColumn2 = TableQUnitUtils.createTextColumn();
			this.oColumn2.setSortProperty("G");
			this.oColumn2.setFilterProperty("G");
			this.oColumn2.setAssociation("headerMenu", this.oMenu2);

			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn1, this.oColumn2]
			});
			this.oTable.setEnableGrouping(true);
			this.oTable.setEnableColumnFreeze(true);
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
		}
	});

	QUnit.test("Interaction and header menu content", function (assert) {
		var oMBundle = oCore.getLibraryResourceBundle("sap.m");
		var oUITableBundle = oCore.getLibraryResourceBundle("sap.ui.table");
		var done = assert.async();

		this.openColumnMenu(0);
		var oMenu1 = this.oTable.getColumns()[0].getHeaderMenuInstance();

		oMenu1.attachBeforeOpen(function() {
			var oQuickSort = oMenu1.getAggregation("_quickSort");
			var oQuickSortItem = oQuickSort.getItems()[0];
			var oQuickAction = oQuickSortItem.getAggregation("quickAction");
			var aContent = oQuickAction.getContent();

			assert.equal(oQuickAction.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_SORT"), "quick sort label is correct");
			assert.ok(aContent.length === 2 && aContent[0].isA("sap.m.Button") && aContent[1].isA("sap.m.Button"), "quick sort contains two buttons");

			var oCustomQuickSort = oMenu1.getQuickSort();
			aContent = oCustomQuickSort.getContent();
			assert.equal(oCustomQuickSort.getLabel(), "Custom Quick Sort", "quick sort label is correct");
			assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick sort contains one button");
			assert.equal(aContent[0].getText(), "Sort by Property A", "button text is correct");

			var oQuickFilter = oMenu1.getAggregation("_quickFilter");
			aContent = oQuickFilter.getContent();
			assert.equal(oQuickFilter.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_FILTER"), "quick filter label is correct");
			assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Input"), "quick filter contains one input field");

			var oQuickGroup = oMenu1.getAggregation("_quickGroup");
			aContent = oQuickGroup.getContent();
			assert.equal(oQuickGroup.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_GROUP"), "quick group label is correct");
			assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick group contains one button");
			assert.equal(aContent[0].getText(), oUITableBundle.getText("TBL_GROUP"), "button text is correct");

			oQuickAction = oMenu1.getQuickActions()[0];
			aContent = oQuickAction.getContent();
			assert.equal(oQuickAction.getLabel(), "Quick Action B", "quick action label is correct");
			assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick action contains one button");
			assert.equal(aContent[0].getText(), "Execute B", "button text is correct");

			oQuickAction = oMenu1.getAggregation("_quickActions")[0];
			aContent = oQuickAction.getContent();
			assert.equal(oQuickAction.getLabel(), undefined, "freeze doesn't have a label");
			assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick action contains one button");
			assert.equal(aContent[0].getText(), oUITableBundle.getText("TBL_FREEZE"), "button text is correct");

			var oItem = oMenu1.getItems()[0];
			assert.equal(oItem.getLabel(), "Item C", "item label is correct");

			setTimeout(function() {
				this.openColumnMenu(1);
				var oMenu2 = this.oTable.getColumns()[1].getHeaderMenuInstance();

				oMenu2.attachBeforeOpen(function() {
					oQuickSort = oMenu2.getAggregation("_quickSort");
					oQuickSortItem = oQuickSort.getItems()[0];
					oQuickAction = oQuickSortItem.getAggregation("quickAction");
					aContent = oQuickAction.getContent();

					assert.equal(oQuickAction.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_SORT"), "quick sort label is correct");
					assert.ok(aContent.length === 2 && aContent[0].isA("sap.m.Button") && aContent[1].isA("sap.m.Button"), "quick sort contains two buttons");

					oQuickFilter = oMenu2.getAggregation("_quickFilter");
					aContent = oQuickFilter.getContent();
					assert.equal(oQuickFilter.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_FILTER"), "quick filter label is correct");
					assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Input"), "quick filter contains one input field");

					oQuickGroup = oMenu2.getAggregation("_quickGroup");
					aContent = oQuickGroup.getContent();
					assert.equal(oQuickGroup.getLabel(), oMBundle.getText("table.COLUMNMENU_QUICK_GROUP"), "quick group label is correct");
					assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick group contains one button");
					assert.equal(aContent[0].getText(), oUITableBundle.getText("TBL_GROUP"), "button text is correct");

					oQuickAction = oMenu2.getQuickActions()[0];
					aContent = oQuickAction.getContent();
					assert.equal(oQuickAction.getLabel(), "Quick Action D", "quick action label is correct");
					assert.ok(aContent.length === 1 && aContent[0].isA("sap.m.Button"), "quick action contains one button");
					assert.equal(aContent[0].getText(), "Execute D", "button text is correct");

					oItem = oMenu2.getItems()[0];
					assert.equal(oItem.getLabel(), "Item E", "item label is correct");
					done();
				});
			}.bind(this), 100);
		}.bind(this));
	});

	QUnit.test("Quick Sort", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		var oSpySort = this.spy(this.oColumn1, "sort");

		this.openColumnMenu(0);

		setTimeout(function() {
			var oMenu1 = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickAction = oMenu1.getAggregation("_quickSort").getItems()[0].getAggregation("quickAction");
			var aContent = oQuickAction.getContent();
			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oSpySort.calledOnce, "sort is called");
			assert.ok(oSpySort.calledWithExactly(false, true), "sort is called with the correct parameters");
			done();
		}, 500);
	});

	QUnit.test("Quick Filter and validation", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		var oColumn1 = this.oColumn1;
		var oSpyValidate = this.spy(oColumn1, "_getFilterState");
		var oSpyFilter = this.spy(oColumn1, "filter");

		this.openColumnMenu(0);

		setTimeout(function() {
			var oMenu1 = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickFilter = oMenu1.getAggregation("_quickFilter");
			var oFilterField = oQuickFilter.getContent()[0];

			assert.ok(oSpyValidate.calledOnce, "_getFilterState is called once when the menu opens");
			oFilterField.setValue("test");
			oFilterField.fireEvent("submit");

			assert.ok(oSpyValidate.calledTwice, "_getFilterState is called when the filter value is submitted");
			assert.ok(oSpyFilter.calledOnce, "filter is called");
			assert.ok(oSpyFilter.calledWithExactly("test"), "filter is called with the correct parameter");
			oSpyValidate.restore();
			oSpyFilter.restore();

			oColumn1.setFilterType(new sap.ui.model.type.Integer());
			assert.equal(oColumn1._getFilterState(), "Error", "Validation error, the expected input was integer");

			oColumn1.setFilterValue("1");
			assert.equal(oColumn1._getFilterState(), "None", "Validation successful");

			done();
		}, 500);
	});

	QUnit.test("Custom Filter", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		var oColumn2 = this.oColumn2;

		oTable.setEnableCustomFilter(true);
		this.openColumnMenu(1);

		setTimeout(function() {
			var oMenu2 = oTable.getColumns()[1].getHeaderMenuInstance();
			var oCustomFilter = oMenu2.getAggregation("_items")[0];
			assert.equal(oCustomFilter.getLabel(), TableUtils.getResourceText("TBL_FILTER_ITEM"), "custom filter label is correct");
			assert.equal(oCustomFilter.getIcon(), "sap-icon://filter", "custom filter icon is correct");

			oTable.attachCustomFilter(function(oEvent) {
				assert.ok(true, "customFilter event was fired");
				assert.equal(oEvent.getParameter("column"), oColumn2);
				done();
			});
			oCustomFilter.firePress();
		}, 500);
	});

	QUnit.test("Quick Group", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		var oSpyGroup = this.spy(this.oColumn1, "_setGrouped");

		this.openColumnMenu(0);

		setTimeout(function() {
			var oMenu1 = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickGroup = oMenu1.getAggregation("_quickGroup");
			var aContent = oQuickGroup.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oSpyGroup.calledOnce, "_setGrouped is called");
			done();
		}, 500);
	});

	QUnit.test("Quick Total", function(assert) {
		var done = assert.async();
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

		var oSpyTotal = this.spy(this.oColumn2, "setSummed");
		this.openColumnMenu(1);

		setTimeout(function() {
			var oMenu2 = oTable.getColumns()[1].getHeaderMenuInstance();
			var oQuickTotal = oMenu2.getAggregation("_quickTotal");
			var aContent = oQuickTotal.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oSpyTotal.calledOnce, "setSummed is called");
			done();
		}, 500);
	});

	QUnit.test("Quick Freeze", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		var oSpyFreeze = this.spy(this.oTable, "setFixedColumnCount");

		this.openColumnMenu(0);

		setTimeout(function() {
			var oMenu1 = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickFreeze = oMenu1.getAggregation("_quickActions")[0];
			var aContent = oQuickFreeze.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oSpyFreeze.calledOnce, "setFixedColumnCount is called");
			assert.ok(oSpyFreeze.calledWithExactly(1), "setFixedColumnCount is called with the correct parameter");
			done();
		}, 500);
	});

	QUnit.test("Resize", function(assert) {
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var done = assert.async();
		var oTable = this.oTable;
		this.openColumnMenu(0);

		setTimeout(function() {
			var oMenu1 = oTable.getColumns()[0].getHeaderMenuInstance();
			var oQuickResize = oMenu1.getAggregation("_quickActions")[1];
			var aContent = oQuickResize.getContent();

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oTable.$().hasClass("sapUiTableResizing") && oTable.$("rsz").hasClass("sapUiTableColRszActive"), "resizing started");

			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;

			done();
		}, 500);
	});
});