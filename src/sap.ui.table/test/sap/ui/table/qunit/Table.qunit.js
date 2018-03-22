/*global QUnit, sinon */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/ColumnMenu",
	"sap/ui/table/ColumnMenuRenderer",
	"sap/ui/table/AnalyticalColumnMenuRenderer",
	"sap/ui/table/TablePersoController",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
	"sap/ui/table/TableUtils",
	'sap/ui/table/library',
	"sap/ui/Device", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter", "sap/ui/model/Filter", "sap/ui/model/type/Float",
	"sap/m/Text", "sap/m/Input", "sap/m/Label", "sap/m/CheckBox", "sap/m/Button", "sap/m/Link", "sap/m/RatingIndicator", "sap/m/Image",
	"sap/m/Toolbar", "sap/m/ToolbarDesign", "sap/ui/unified/Menu", "sap/ui/unified/MenuItem", "sap/m/Menu", "sap/m/MenuItem"
], function(qutils, Table, Column, ColumnMenu, ColumnMenuRenderer, AnalyticalColumnMenuRenderer, TablePersoController, RowAction, RowActionItem,
			RowSettings, TableUtils, TableLibrary,
			Device, JSONModel, Sorter, Filter, FloatType,
			Text, Input, Label, CheckBox, Button, Link, RatingIndicator, Image, Toolbar, ToolbarDesign, Menu, MenuItem, MenuM, MenuItemM) {
	"use strict";

	// Shortcuts
	var SortOrder = TableLibrary.SortOrder;
	var SelectionMode = TableLibrary.SelectionMode;
	var VisibleRowCountMode = TableLibrary.VisibleRowCountMode;
	var NavigationMode = TableLibrary.NavigationMode;
	var SharedDomRef = TableLibrary.SharedDomRef;

	var personImg = "../images/Person.png";
	var jobPosImg = "../images/JobPosition.png";
	var oTable;

	// TABLE TEST DATA
	var aData = [
		{lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: personImg, gender: "male", rating: 4, money: 3.45},
		{lastName: "Friese", name: "Andy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: jobPosImg, gender: "male", rating: 2, money: 4.64},
		{lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: personImg, gender: "female", rating: 3, money: 7.34},
		{lastName: "Schutt", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 4, money: 1.46},
		{lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 2, money: 32.76},
		{lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 3, money: 5.67},
		{lastName: "Zar", name: "Lou", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 1, money: 9.35},
		{lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: jobPosImg, gender: "male", rating: 2, money: 10.12},
		{lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 5, money: 85.23},
		{lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 3, money: 4521},
		{lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: personImg, gender: "male", rating: 3, money: 4563.3},
		{lastName: "Time", name: "Justin", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 4, money: 665.4},
		{lastName: "Barr", name: "Sandy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 2, money: 334.4},
		{lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: jobPosImg, gender: "male", rating: 1, money: 964.3},
		{lastName: "Ander", name: "Corey", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 5, money: 2.34},
		{lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 3, money: 8.45},
		{lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: personImg, gender: "female", rating: 4, money: 53.45},
		{lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 2, money: 76.34},
		{lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: jobPosImg, gender: "male", rating: 4, money: 234.23},
		{lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 3, money: 953.3}
	];

	var aOrgData = jQuery.extend(true, [], aData);
	for (var i = 0; i < 9; i++) {
		aData = aData.concat(jQuery.extend(true, [], aOrgData));
	}

	for (var i = 0, l = aData.length; i < l; i++) {
		aData[i].lastName += " - " + i;
	}

	var DummyControl = sap.ui.core.Control.extend("sap.ui.table.test.DummyControl", {
		metadata: {
			properties: {
				height: "string"
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.addStyle("height", oControl.getHeight() || "10px");
			oRm.addStyle("width", "100px");
			oRm.addStyle("background-color", "orange");
			oRm.addStyle("box-sizing", "border-box");
			oRm.addStyle("border-top", "2px solid blue");
			oRm.addStyle("border-bottom", "2px solid blue");
			oRm.writeStyles();
			oRm.writeControlData(oControl);
			oRm.write("></div>");
		},
		setHeight: function(sHeight) {
			this.setProperty("height", sHeight, true);

			var oDomRef = this.getDomRef();
			if (oDomRef != null) {
				oDomRef.style.height = sHeight;
			}
		}
	});

	function createTable(oConfig, fnCreateColumns, sModelName) {
		var sBindingPrefix = (sModelName ? sModelName + ">" : "");

		oTable = new Table(oConfig);

		if (!fnCreateColumns) {
			fnCreateColumns = function(oTable) {
				var oControl = new Text({text: "{" + sBindingPrefix + "lastName" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "Last Name"}),
					template: oControl,
					sortProperty: "lastName",
					filterProperty: "lastName",
					width: "200px"
				}));
				oControl = new Text({text: "{" + sBindingPrefix + "name" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "First Name"}),
					template: oControl,
					sortProperty: "name",
					filterProperty: "name",
					width: "100px",
					autoResizable: true
				}));
				oControl = new CheckBox({selected: "{" + sBindingPrefix + "checked" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "Checked"}),
					template: oControl,
					sortProperty: "checked",
					filterProperty: "checked",
					width: "75px",
					hAlign: "Center"
				}));
				oControl = new Link({text: "{" + sBindingPrefix + "linkText" + "}", href: "{" + sBindingPrefix + "href" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "Web Site"}),
					template: oControl,
					sortProperty: "linkText",
					filterProperty: "linkText"
				}));
				oControl = new Image({src: "{" + sBindingPrefix + "src" + "}", alt: "Test123", tooltip: "Hello World"});
				oTable.addColumn(new Column(
					{label: new Label({text: "Image"}), template: oControl, width: "75px", hAlign: "Center"}));
				oControl = new Label({text: "{" + sBindingPrefix + "gender" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "Gender"}),
					template: oControl,
					sortProperty: "gender",
					filterProperty: "gender",
					showSortMenuEntry: false
				}));
				oControl = new RatingIndicator({value: "{" + sBindingPrefix + "rating" + "}"});
				oTable.addColumn(new Column({
					label: new Label({text: "Rating"}),
					template: oControl,
					sortProperty: "rating",
					filterProperty: "rating",
					showFilterMenuEntry: false
				}));
				var floatType = new FloatType({
					decimalSeparator: ",",
					groupingSeparator: "."
				});
				oControl = new Input({value: {path: "{" + sBindingPrefix + "money" + "}", type: floatType}});
				oTable.addColumn(new Column({
					label: new Label({text: "Money"}),
					template: oControl,
					sortProperty: "money",
					filterProperty: "money",
					filterType: floatType,

					width: "100px"
				}));
			};
		}
		fnCreateColumns(oTable);

		var oModel = new JSONModel();
		oModel.setData({modelData: aData});
		oTable.setModel(oModel, sModelName);
		oTable.bindRows(sBindingPrefix + "/modelData");

		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	}

	function destroyTable() {
		oTable.destroy();
		oTable = null;
	}

	function creatSortingTableData() {
		var aData = [
			{lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: personImg, gender: "male", rating: 4, money: 3.45},
			{lastName: "Friese", name: "Andy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: jobPosImg, gender: "male", rating: 2, money: 4.64},
			{lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: personImg, gender: "female", rating: 3, money: 7.34},
			{lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: personImg, gender: "male", rating: 3, money: 4563.3},
			{lastName: "Time", name: "Justin", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "male", rating: 4, money: 665.4},
			{lastName: "Schutt", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 4, money: 1.46},
			{lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: personImg, gender: "female", rating: 2, money: 32.76}
		];

		var oModel = new JSONModel();
		oModel.setData({modelData: aData});
		oTable.setModel(oModel);
	}

	function sortTable() {
		var aColumns = oTable.getColumns();
		oTable.sort(aColumns[1], SortOrder.Ascending, false);
		oTable.sort(aColumns[0], SortOrder.Ascending, true);
	}

	QUnit.module("Basic checks", {
		beforeEach: function() {
			createTable({
				firstVisibleRow: 5,
				visibleRowCount: 7,
				title: "TABLEHEADER",
				footer: "Footer",
				selectionMode: SelectionMode.Single,
				contextMenu: new MenuM({
					items: [
						new MenuItemM({text: "{lastName}"}),
						new MenuItemM({text: "{name}"})
					]
				}),
				toolbar: new Toolbar({
					content: [
						new Button({
							text: "Modify Table Properties..."
						})
					]
				})
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Properties", function(assert) {
		assert.expect(9);
		assert.equal(oTable.$().find(".sapUiTableHdr").text(), "TABLEHEADER", "Title of Table is correct!");
		assert.equal(jQuery.sap.byId("__toolbar0").find("button").text(), "Modify Table Properties...", "Toolbar and toolbar button are correct!");
		assert.equal(oTable.$().find(".sapUiTableFtr").text(), "Footer", "Title of Table is correct!");
		assert.equal(oTable.getSelectionMode(), "Single", "Selection mode is Single!");
		assert.equal(oTable.getSelectedIndex(), -1, "Selected Index is -1!");
		assert.equal(jQuery(".sapUiTableCtrl tr.sapUiTableTr").length, oTable.getVisibleRowCount(), "Visible Row Count correct!");
		assert.equal(jQuery(".sapUiTableRowHdr").length, oTable.getVisibleRowCount(), "Visible Row Count correct!");
		assert.equal(oTable.getFirstVisibleRow(), 5, "First Visible Row correct!");
		assert.ok(oTable.getContextMenu() instanceof MenuM, "Context menu created as specified by the application");
	});

	QUnit.test("Filter", function(assert) {
		var oColFirstName = oTable.getColumns()[1];
		var oColMoney = oTable.getColumns()[7];

		assert.equal(oTable.getBinding("rows").iLength, 200, "RowCount beforeFiltering ok");
		oTable.filter(oColFirstName, "M*");

		// check that the column menu filter input field was updated
		var oMenu = oColFirstName.getMenu();
		// open and close the menu to let it generate its items
		oMenu.open();
		oMenu.close();

		var oFilterField = sap.ui.getCore().byId(oMenu.getId() + "-filter");
		if (oFilterField) {
			assert.equal(oFilterField.getValue(), "M*", "Filter value is M* in column menu");
			oTable.filter(oColFirstName, "D*");
			assert.equal(oFilterField.getValue(), "D*", "Filter value is M* in column menu");
		}

		assert.equal(oTable.getBinding("rows").iLength, 20, "RowCount after filtering FirstName 'M*'");
		oTable.filter(oColFirstName, "Mo*");
		assert.equal(oTable.getBinding("rows").iLength, 10, "RowCount after filtering FirstName 'Mo*''");
		assert.equal(oColFirstName.getFiltered(), true, "Column FirstName is filtered");
		oTable.filter(oColFirstName, "");
		assert.equal(oColFirstName.getFiltered(), false, "Column FirstName is not filtered anymore filtered");
		assert.equal(oTable.getBinding("rows").iLength, 200, "RowCount after removing filter");

		oTable.filter(oColMoney, ">10");
		assert.equal(oTable.getBinding("rows").iLength, 120, "RowCount after filtering money >10");
		oTable.filter(oColMoney, "> 123,45");
		assert.equal(oTable.getBinding("rows").iLength, 70, "RowCount after filtering money >123,45");
		oTable.filter(oColMoney, "<50,55");
		assert.equal(oTable.getBinding("rows").iLength, 100, "RowCount after filtering money <50,55");
		oTable.filter(oColMoney, "9.35");
		assert.equal(oTable.getBinding("rows").iLength, 0, "RowCount after filtering money 9.35");
		oTable.filter(oColMoney, "5,67");
		assert.equal(oTable.getBinding("rows").iLength, 10, "RowCount after filtering money 5,67");
		oTable.filter(oColMoney, "= 32,7600");
		assert.equal(oTable.getBinding("rows").iLength, 10, "RowCount after filtering money = 32,7600");
		assert.equal(oColMoney.getFiltered(), true, "Column Money is filtered");
		oTable.filter(oColFirstName, "Do*");
		assert.equal(oTable.getBinding("rows").iLength, 10, "RowCount after filtering FirstName 'Do*' and money 32,76");
		assert.equal(oColFirstName.getFiltered() && oColMoney.getFiltered(), true, "Column FirstName and Money are filtered");
		oTable.filter(oColFirstName, "Mo*");
		assert.equal(oTable.getBinding("rows").iLength, 0, "RowCount after filtering FirstName 'Mo*' and money 32,76");
		oTable.filter(oColFirstName, "");
		oTable.filter(oColMoney, "");
		assert.equal(oColFirstName.getFiltered() && oColMoney.getFiltered(), false, "Column FirstName and Money are not filtered anymore");
		assert.equal(oTable.getBinding("rows").iLength, 200, "RowCount after removing filter");
	});

	QUnit.test("SelectionMode", function(assert) {
		oTable.setSelectionMode(SelectionMode.Multi);
		assert.equal(oTable.getSelectionMode(), "MultiToggle", "Selection mode is MultiToggle although Multi was set!");

		// check selection mode none without columns BCP: 1570822620
		oTable.removeAllColumns();
		oTable.setSelectionMode(SelectionMode.None);
		assert.equal(oTable.getSelectionMode(), "None", "Selection mode is None!");
	});

	QUnit.test("Multi Selection", function(assert) {
		var iFirstRow = oTable.getFirstVisibleRow();

		function triggerSelectionOnRow(i, bKeyboard, bCtrlKey, bShiftKey) {
			var oCell = jQuery.sap.domById(oTable.getId() + "-rowsel" + i);
			oCell.focus();
			if (bKeyboard) {
				qutils.triggerKeydown(oCell, "SPACE", !!bShiftKey, false, !!bCtrlKey);
				qutils.triggerKeyup(oCell, "SPACE", !!bShiftKey, false, !!bCtrlKey);
			} else {
				qutils.triggerEvent("click", oCell, {metaKey: !!bCtrlKey, ctrlKey: !!bCtrlKey, shiftKey: !!bShiftKey});
			}
		}

		function checkSelection(sText, aExpectedSelection) {
			var aSelection = oTable.getSelectedIndices();
			assert.equal(aSelection.length, aExpectedSelection.length, sText + ": Number of selected items is " + aExpectedSelection.length);
			for (var i = 0; i < aExpectedSelection.length; i++) {
				assert.equal(aSelection[i], iFirstRow + aExpectedSelection[i], sText + ": Selected index " + iFirstRow + aExpectedSelection[i]);
			}
		}

		oTable.setSelectionMode(SelectionMode.Multi);
		assert.equal(oTable.getSelectionMode(), "MultiToggle", "Selection mode is MultiToggle although Multi was set!");
		sap.ui.getCore().applyChanges();

		checkSelection("MultiToggle - Initial", []);
		triggerSelectionOnRow(0, false, false, false);
		checkSelection("MultiToggle - After 1st selection", [0]);
		triggerSelectionOnRow(2, false, false, false);
		checkSelection("MultiToggle - After 2nd selection", [0, 2]);
		triggerSelectionOnRow(3, false, true, false);
		checkSelection("MultiToggle - After 3rd selection", [0, 2, 3]);
		triggerSelectionOnRow(0, false, false, false);
		checkSelection("MultiToggle - After 4th selection", [2, 3]);
		triggerSelectionOnRow(3, true, false, false);
		checkSelection("MultiToggle - After 5th selection", [2]);
		triggerSelectionOnRow(0, true, false, false);
		checkSelection("MultiToggle - After 6th selection", [0, 2]);
		var oCell = oTable.$("rowsel0");
		oCell.focus();
		qutils.triggerKeydown(document.activeElement, "SHIFT", false, false, false);
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);
		checkSelection("MultiToggle - After 7th selection", [0, 1, 2, 3, 4]);
		triggerSelectionOnRow(2, false, false, true);
		checkSelection("MultiToggle - After 8th selection", [0, 1, 2, 3, 4]);
		triggerSelectionOnRow(6, false, false, true);
		checkSelection("MultiToggle - After 9th selection", [0, 1, 2, 3, 4, 5, 6]);

		oTable.clearSelection();
		oTable._enableLegacyMultiSelection = true;
		oTable.setSelectionMode(SelectionMode.Multi);
		assert.equal(oTable.getSelectionMode(), "MultiToggle",
			"Selection mode is MultiToggle although Multi and _enableLegacyMultiSelection was set!");
	});

	QUnit.test("SelectedIndex", function(assert) {
		assert.expect(1);
		oTable.setSelectedIndex(8);
		assert.equal(oTable.getSelectedIndex(), 8, "Selected Index is 8!");
	});

	QUnit.test("Check Selection of Last fixedBottomRow", function(assert) {
		assert.expect(1);
		oTable.setFixedBottomRowCount(3);
		var aRows = oTable.getRows();
		var oLastRow = aRows[aRows.length - 1];
		var $LastRow = oLastRow.getDomRefs(true);
		if ($LastRow.rowSelector) {
			$LastRow.rowSelector.click();
			assert.equal(oTable.getSelectedIndex(), 199, "Selected Index is 199");
		}
	});

	QUnit.test("SelectAll", function(assert) {
		oTable.setSelectionMode(SelectionMode.MultiToggle);
		sap.ui.getCore().applyChanges();

		var $SelectAll = oTable.$("selall");
		var sSelectAllTitleText = TableUtils.getResourceBundle().getText("TBL_SELECT_ALL");
		var sDeselectAllTitleText = TableUtils.getResourceBundle().getText("TBL_DESELECT_ALL");

		// Initially no rows are selected.
		assert.ok($SelectAll.hasClass("sapUiTableSelAll"), "Initial: The SelectAll checkbox is not checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Initial: The SelectAll title text is correct");

		// Select all rows. The SelectAll checkbox should be checked.
		oTable.selectAll();
		assert.ok(!$SelectAll.hasClass("sapUiTableSelAll"), "Called selectAll: The SelectAll checkbox is checked");
		assert.strictEqual($SelectAll.attr("title"), sDeselectAllTitleText, "Called selectAll: The SelectAll title text is correct");

		// Deselect the first row. The SelectAll checkbox should not be checked.
		oTable.removeSelectionInterval(0, 0);
		assert.ok($SelectAll.hasClass("sapUiTableSelAll"), "Deselected the first row: The SelectAll checkbox is not checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Deselected the first row: The SelectAll title text is correct");

		// Select the first row again. The SelectAll checkbox should be checked.
		oTable.addSelectionInterval(0, 0);
		assert.ok(!$SelectAll.hasClass("sapUiTableSelAll"), "Selected the first row again: The SelectAll checkbox is checked");
		assert.strictEqual($SelectAll.attr("title"), sDeselectAllTitleText, "Selected the first row again: The SelectAll title text is correct");
	});

	QUnit.test("VisibleRowCount", function(assert) {
		assert.expect(6);
		var fnError = sinon.spy(jQuery.sap.log, "error");
		oTable.setVisibleRowCount(8);
		assert.equal(oTable.getVisibleRowCount(), 8, "Visible Row Count is set correct!");
		oTable.setVisibleRowCount(Infinity);
		assert.ok(oTable.getVisibleRowCount() !== Infinity, "visibleRowCount cannot be Inifinity, this must have been ignored");
		assert.equal(oTable.getVisibleRowCount(), 8, "Visisble Row Count is still 8");
		oTable.setVisibleRowCountMode(VisibleRowCountMode.Auto);
		assert.equal(fnError.callCount, 0, "Error was not logged so far");
		oTable.setVisibleRowCount(15);
		assert.ok(oTable.getVisibleRowCount() !== 15,
			"setVisibleRowCount was ignored as visibleRowCountMode = Auto, error message must have been logged");
		assert.equal(fnError.args[0][0], "VisibleRowCount will be ignored since VisibleRowCountMode is set to Auto", "Error was logged");
		fnError.restore(); // restoring original jQuery.sap.log.error() method, else exception is thrown
	});

	QUnit.test("MinAutoRowCount", function(assert) {
		var oErrorLogSpy = sinon.spy(jQuery.sap.log, "error");

		assert.strictEqual(oTable.getMinAutoRowCount(), 5, "The default value is correct");

		oTable.setMinAutoRowCount(-1);
		assert.ok(oErrorLogSpy.callCount === 1, "Setting to -1: Error was logged");
		assert.strictEqual(oTable.getMinAutoRowCount(), 1, "Setting to -1: Property was set to the default value");

		oTable.setMinAutoRowCount("0");
		assert.ok(oErrorLogSpy.callCount === 2, "Setting to \"0\": Error was logged");
		assert.strictEqual(oTable.getMinAutoRowCount(), 1, "Setting to \"0\": Value did not change");

		oTable.setMinAutoRowCount(2);
		assert.ok(oErrorLogSpy.callCount === 2, "Setting to 2: Error was not logged");
		assert.strictEqual(oTable.getMinAutoRowCount(), 2, "Setting to 2: New value is set");

		oErrorLogSpy.restore();
	});

	QUnit.test("EnableColumnReordering", function(assert) {
		assert.expect(1);
		oTable.setEnableColumnReordering(true);
		assert.equal(oTable.getEnableColumnReordering(), true, "Reordering is allowed");
	});

	QUnit.test("FirstVisibleRow", function(assert) {
		assert.expect(4);
		assert.equal(oTable.getFirstVisibleRow(), 5, "FirstVisibleRow row is: 5");

		oTable.setFirstVisibleRow(4, false);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getFirstVisibleRow(), 4, "FirstVisibleRow has been set to: 4");

		oTable.setFirstVisibleRow(-1, false);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getFirstVisibleRow(), 0, "FirstVisibleRow has been set to: 0");

		var iMaxRowIndex = aData.length - oTable.getVisibleRowCount();
		oTable.setFirstVisibleRow(iMaxRowIndex + 1, false);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex, "FirstVisibleRow has been set to: " + iMaxRowIndex);
	});

	QUnit.test("ColumnHeaderHeight", function(assert) {
		assert.expect(2);
		oTable.setColumnHeaderHeight(100);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").height(), 100, "ColumnHeaderHeight ok");
		oTable.setColumnHeaderHeight(0);
		sap.ui.getCore().applyChanges();
		assert.ok(oTable.$().find(".sapUiTableColHdrCnt").height() < 100, "ColumnHeaderHeight ok");
	});

	QUnit.test("ColumnHeaderVisible", function(assert) {
		assert.expect(2);
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), false, "ColumnHeaderVisible ok");
		oTable.setColumnHeaderVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), true, "ColumnHeaderVisible ok");
	});

	QUnit.test("Row Height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var sequence = Promise.resolve();
		var iAssertionDelay = Device.browser.msie ? 50 : 0;
		var done = assert.async();

		oTable.removeAllColumns();
		oTable.addColumn(new Column({template: new DummyControl({height: "1px"})}));
		oTable.addColumn(new Column({template: new DummyControl({height: "1px"})}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				return new Promise(function(resolve) {
					oTable.setVisibleRowCountMode(mTestSettings.visibleRowCountMode);
					oTable.setRowHeight(mTestSettings.rowHeight || 0);
					oTable.getColumns()[1].setTemplate(new DummyControl({height: (mTestSettings.templateHeight || 1) + "px"}));
					oBody.classList.remove("sapUiSizeCozy");
					oBody.classList.remove("sapUiSizeCompact");
					oBody.classList.remove("sapUiSizeCondensed");
					if (mTestSettings.density != null) {
						oBody.classList.add(mTestSettings.density);
					}

					window.setTimeout(function() {
						var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
						mTestSettings.title += " (VisibleRowCountMode=\"" + mTestSettings.visibleRowCountMode + "\""
											   + ", Density=\"" + sDensity + "\")";

						var aRowDomRefs = oTable.getRows()[0].getDomRefs();
						assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, mTestSettings.expectedHeight,
							mTestSettings.title + ": Selector height is ok");
						assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
							mTestSettings.title + ": Fixed part height is ok");
						assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
							mTestSettings.title + ": Scrollable part height is ok");
						assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, mTestSettings.expectedHeight,
							mTestSettings.title + ": Action height is ok");

						resolve();
					}, iAssertionDelay);
				});
			});
		}

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					expectedHeight: 56
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					templateHeight: 87,
					expectedHeight: 88
				});
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application defined height with large content",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				density: sDensity,
				rowHeight: 55,
				templateHeight: 87,
				expectedHeight: 56
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCozy",
				expectedHeight: 49
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCompact",
				expectedHeight: 33
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCondensed",
				expectedHeight: 25
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: undefined,
				expectedHeight: 33
			});

			aDensities.forEach(function(sDensity) {
				test({
					title: "Default height with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					templateHeight: 87,
					expectedHeight: 88
				});
			});
		});

		sequence.then(function() {
			oBody.classList.add("sapUiSizeCozy");
			done();
		});
	});

	QUnit.test("test min-width", function(assert) {
		oTable.getDomRef().style.width = "0px";
		assert.ok(oTable.getDomRef("tableCCnt").clientHeight > 0, "CCnt still has clientHeight");
	});

	QUnit.test("getCellControl", function(assert) {
		oTable.getColumns()[2].setVisible(false);
		sap.ui.getCore().applyChanges();

		var oCell = oTable.getCellControl(0, 0, true);
		assert.strictEqual(oCell.getId(), oTable.getRows()[0].getCells()[0].getId(), "Cell 0,0");

		oCell = oTable.getCellControl(1, 1, true);
		assert.strictEqual(oCell.getId(), oTable.getRows()[1].getCells()[1].getId(), "Cell 1,1");

		oCell = oTable.getCellControl(2, 2, true);
		assert.strictEqual(oCell.getId(), oTable.getRows()[2].getCells()[2].getId(), "Cell 2,2");

		oCell = oTable.getCellControl(0, 0, false);
		assert.strictEqual(oCell.getId(), oTable.getRows()[0].getCells()[0].getId(), "Cell 0,0");

		oCell = oTable.getCellControl(1, 1, false);
		assert.strictEqual(oCell.getId(), oTable.getRows()[1].getCells()[1].getId(), "Cell 1,1");

		oCell = oTable.getCellControl(2, 2, false);
		assert.ok(!oCell, "Cell 2,2");

		oCell = oTable.getCellControl(-1, 2, false);
		assert.ok(!oCell, "Negative RowIndex");

		oCell = oTable.getCellControl(2, -1, false);
		assert.ok(!oCell, "Negative ColIndex");

		oCell = oTable.getCellControl(5000, 2, false);
		assert.ok(!oCell, "Big RowIndex");

		oCell = oTable.getCellControl(2, 5000, false);
		assert.ok(!oCell, "Big ColIndex");
	});

	QUnit.test("Row Actions", function(assert) {
		assert.equal(TableUtils.getRowActionCount(oTable), 0, "Table has no row actions");
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "Action Area");
		oTable.setRowActionCount(2);
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getRowActionCount(oTable), 0, "Table still has no row actions");
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "Action Area");
		oTable.setRowActionTemplate(new RowAction());
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getRowActionCount(oTable), 2, "Table has 2 row actions");
		assert.ok(oTable.$().hasClass("sapUiTableRAct"), "CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action Area available");
		oTable.setRowActionCount(1);
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getRowActionCount(oTable), 1, "Table has 1 row action");
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No CSS class sapUiTableRAct");
		assert.ok(oTable.$().hasClass("sapUiTableRActS"), "CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action Area available");
	});

	QUnit.test("Row Settings Template", function(assert) {
		var oOnAfterRenderingEventListener = this.spy();
		var oRowSettings;

		oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});

		assert.ok(oTable.getRowSettingsTemplate() == null, "Initially the table has no row settings template");
		assert.ok(oTable.getRows()[0].getAggregation("_settings") == null, "Initially the rows have no settings");

		oTable.setRowSettingsTemplate(new RowSettings());
		sap.ui.getCore().applyChanges();
		assert.ok(oTable.getRowSettingsTemplate() != null, "The table has a row settings template");
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Setting the row settings template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.ok(oRowSettings != null, "The rows have a settings template clone");

		oOnAfterRenderingEventListener.reset();
		oTable.getRowSettingsTemplate().setHighlight(sap.ui.core.MessageType.Success);
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.notCalled, "Changing the highlight property of the template did not cause the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), sap.ui.core.MessageType.None,
			"Changing the highlight property of the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.reset();
		oTable.getRowSettingsTemplate().invalidate();
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Invalidating the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), sap.ui.core.MessageType.None,
			"Invalidating the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.reset();
		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: sap.ui.core.MessageType.Warning
		}));
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Changing the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), sap.ui.core.MessageType.Warning,
			"Changing the template changed the highlight property of the template clones in the rows");
	});

	QUnit.test("Localization Change", function(assert) {
		var oInvalidateSpy = sinon.spy(oTable, "invalidate");
		var pAdaptLocalization;
		var done = assert.async();

		oTable.getColumns().slice(1).forEach(function(oColumn) {
			oTable.removeColumn(oColumn);
		});
		sap.ui.getCore().applyChanges();

		oTable._adaptLocalization = function(bRtlChanged, bLangChanged) {
			pAdaptLocalization = Table.prototype._adaptLocalization.apply(this, arguments);
			return pAdaptLocalization;
		};

		function assertLocalizationUpdates(bRTLChanged, bLanguageChanged) {
			var sChangesTestMessage;
			var bTableShouldBeInvalidated = bRTLChanged || bLanguageChanged;

			if (bRTLChanged && bLanguageChanged) {
				sChangesTestMessage = "Direction and language changes have been processed";
			} else if (bRTLChanged) {
				sChangesTestMessage = "Direction change has been processed";
			} else if (bLanguageChanged) {
				sChangesTestMessage = "Language change has been processed";
			} else {
				sChangesTestMessage = "Other localization changes have been processed";
			}

			if (bTableShouldBeInvalidated) {
				assert.ok(oInvalidateSpy.calledOnce, sChangesTestMessage + ": The table should be invalidated");
			} else {
				assert.ok(oInvalidateSpy.notCalled, sChangesTestMessage + ": The table should not be invalidated");
			}

			assert.strictEqual(oTable._bRtlMode !== null, bRTLChanged,
				"The flag _bRtlMode of the table should " + (bRTLChanged ? "" : " not") + " be updated");

			assert.strictEqual(oTable._oCellContextMenu === null, bLanguageChanged,
				"The cell context menu should " + (bLanguageChanged ? "" : " not") + " be reset");

			assert.strictEqual(oTable.getColumns()[0].getMenu()._bInvalidated, bLanguageChanged,
				"The column menu should " + (bLanguageChanged ? "" : " not") + " be invalidated");
		}

		function test(bChangeTextDirection, bChangeLanguage) {
			var mChanges = {changes: {}};

			oTable._bRtlMode = null;
			oTable._oCellContextMenu = new sap.ui.core.Control();
			oTable.getColumns()[0].getMenu()._bInvalidated = false;
			oInvalidateSpy.reset();

			if (bChangeTextDirection) {
				mChanges.changes.rtl = "";
			}
			if (bChangeLanguage) {
				mChanges.changes.language = "";
			}

			oTable.onlocalizationChanged(mChanges);

			var pAssert = new Promise(function(resolve) {
				window.setTimeout(function() {
					assertLocalizationUpdates(bChangeTextDirection, bChangeLanguage);
					resolve();
				}, 0);
			});

			return pAdaptLocalization.then(function() {
				return pAssert;
			}).catch(function() {
				return pAssert;
			});
		}

		// RTL + Language
		test(true, true).then(function() {
			// RTL
			return test(true, false);
		}).then(function() {
			// Language
			return test(false, true);
		}).then(function() {
			// Other localization event
			return test(false, false);
		}).then(done);
	});

	QUnit.test("AlternateRowColors", function(assert) {
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "By default there is no alternating rows");

		var isAlternatingRow = function() {
			return this.getAttribute("data-sap-ui-rowindex") % 2;
		};

		oTable.setSelectionMode("None");
		oTable.setAlternateRowColors(true);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
					 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
					 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row headers
		oTable.setSelectionMode("MultiToggle");
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed columns
		oTable.setFixedColumnCount(2);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed rows
		oTable.setFixedRowCount(2);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed bottom rows
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row actions
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new sap.ui.table.RowAction({
			items: new sap.ui.table.RowActionItem()
		}));
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check tree mode
		sinon.stub(TableUtils.Grouping, "isTreeMode").returns(false);
		oTable.rerender();
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "No alternating rows for tree mode");

	});

	QUnit.module("Column operations", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("ColumnMenu", function(assert) {
		assert.expect(5);
		var oColumn = oTable.getColumns()[1];
		var oMenu = oColumn.getMenu();
		assert.ok(oMenu !== null, "Column menu is not null");
		assert.ok(oMenu instanceof ColumnMenu, "Column menu is instance of sap.ui.table.ColumnMenu");
		oMenu.open();
		assert.ok(oMenu.getItems().length > 0, "Column menu has more than one item");
		oMenu.close();

		//Check column without sort
		oColumn = oTable.getColumns()[5];
		oMenu = oColumn.getMenu();
		oMenu.open();
		assert.equal(oMenu.getItems().length, 1, "Column menu without sort has only one fitler item");
		oMenu.close();

		//Check column without filter
		oColumn = oTable.getColumns()[6];
		oMenu = oColumn.getMenu();
		oMenu.open();
		assert.equal(oMenu.getItems().length, 2, "Column menu without filter has only two sort items");
		oMenu.close();
	});

	QUnit.test("ColumnMenuOpen Event", function(assert) {
		var oColumn = oTable.getColumns()[1];
		var oMenu = oColumn.getMenu();
		var fnHandler = function(oEvent) {
			assert.deepEqual(oEvent.getSource(), oColumn, "Correct Event Source");
			assert.deepEqual(oEvent.getParameter("menu"), oMenu, "Correct Column Menu Parameter");
		};

		var fnHandlerPreventDefault = function(oEvent) {
			oEvent.preventDefault();
		};

		oColumn.attachColumnMenuOpen(fnHandler);
		oColumn._openMenu();
		assert.equal(oMenu.getPopup().getOpenState(), sap.ui.core.OpenState.OPEN, "ColumnMenu open");
		oMenu.close();
		oColumn.detachColumnMenuOpen(fnHandler);

		oColumn.attachColumnMenuOpen(fnHandlerPreventDefault);
		oColumn._openMenu();
		assert.equal(oMenu.getPopup().getOpenState(), sap.ui.core.OpenState.CLOSED, "PreventDefault, ColumnMenu not open");
		oColumn.detachColumnMenuOpen(fnHandlerPreventDefault);
	});

	QUnit.test("ColumnVisibilityEvent", function(assert) {
		assert.expect(4);
		oTable.setShowColumnVisibilityMenu(true);

		oTable.attachColumnVisibility(function(oEvent) {
			var oEventColumn = oEvent.getParameter("column");

			if (oEventColumn === oColumn0) {
				assert.ok(true, "ColumnVisibility event fired for lastName column.");
				oEvent.preventDefault();
			} else if (oEventColumn === oColumn1) {
				assert.ok(true, "ColumnVisibility event fired for firstName column.");
			} else {
				assert.ok(false, "ColumnVisibility event fired for wrong column (" + oEventColumn.getId() + ").");
			}

		});

		var oColumn1 = oTable.getColumns()[1];
		var oColumn0 = oTable.getColumns()[0];
		var oMenu = oColumn1.getMenu();
		var sVisibilityMenuItemId = oColumn1.getMenu().getId() + "-column-visibilty";

		oMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(sVisibilityMenuItemId + "-menu-item-0", "click");

		assert.equal(oColumn0.getVisible(), true, "lastName column should be still visible (preventDefault)");

		oMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(sVisibilityMenuItemId + "-menu-item-1", "click");

		assert.equal(oColumn1.getVisible(), false, "firstName column should be invisible (no preventDefault)");

	});

	QUnit.test("CustomColumnMenu", function(assert) {
		assert.expect(1);
		var oCustomMenu = new Menu("custom-menu");
		var oColumn = oTable.getColumns()[1];
		oCustomMenu.addItem(new MenuItem({
			text: "Custom Menu"
		}));
		oColumn.setMenu(oCustomMenu);
		assert.ok(oColumn.getMenu() === oCustomMenu, "Custom menu equals set column menu");
	});

	QUnit.module("Column filtering", {
		beforeEach: function() {
			createTable({
				visibleRowCount: 5
			}, function(oTable) {
				var oControl = new Text({text: "lastName"});
				oTable.addColumn(new Column({
					label: new Label({text: "Last Name"}),
					template: oControl,
					sortProperty: "lastName",
					filterProperty: "lastName",
					filterValue: "Dente",
					filtered: true
				}));
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Menu & initial filter: references", function(assert) {
		assert.expect(4);
		var oColumn = oTable.getColumns()[0];
		var oMenu = oColumn.getMenu();
		assert.ok(oMenu !== null, "Column menu is not null");
		assert.ok(oMenu instanceof ColumnMenu, "Column menu is instance of sap.ui.table.ColumnMenu");
		assert.ok(oMenu._oColumn instanceof Column, "Internal reference to column is set");
		assert.ok(oMenu._oTable instanceof Table, "Internal reference to table is set");
	});

	QUnit.test("After initialization", function(assert) {
		assert.equal(oTable.getNavigationMode(), NavigationMode.Scrollbar, "NavigationMode defaulted to Scrollbar");
		oTable.setNavigationMode(NavigationMode.Paginator);
		assert.equal(oTable.getNavigationMode(), NavigationMode.Scrollbar,
			"NavigationMode defaulted to Scrollbar after explicitly setting it to Paginator");
	});

	QUnit.module("VisibleRowCountMode Auto", {
		beforeEach: function() {
			createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto
			});
		},
		afterEach: function() {
			destroyTable();
			document.getElementById("qunit-fixture").removeAttribute("style");
		}
	});

	QUnit.test("After initialization", function(assert) {
		var done = assert.async();

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			if (oEvent.getParameter("reason") === TableUtils.RowsUpdateReason.Render) {
				var iExpectedVisibleRowCount = Device.browser.msie ? 18 : 19;
				assert.strictEqual(oTable.getVisibleRowCount(), iExpectedVisibleRowCount, "The visible row count after initialization is correct");
				done();
			}
		});
	});

	QUnit.test("Resize", function(assert) {
		var done = assert.async();

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			if (oEvent.getParameter("reason") === TableUtils.RowsUpdateReason.Render) {
				document.getElementById("qunit-fixture").style.height = "756px";
			}

			if (oEvent.getParameter("reason") === TableUtils.RowsUpdateReason.Resize) {
				assert.strictEqual(oTable.getVisibleRowCount(), 14, " The visible row count after a resize is correct");
				done();
			}
		});
	});

	QUnit.module("Fixed columns", {
		beforeEach: function() {
			createTable({
				fixedColumnCount: 2,
				width: "500px"
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	function getExpectedHScrollLeftMargin(iNumberOfFixedCols) {
		var iWidth = iNumberOfFixedCols * 100 /* Columns */ + 48; /* Default row header width in cozy */
		return iWidth + "px";
	}

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 3, "Fixed tabled has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 7, "Scroll tabled has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("Hide one column in fixed area", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 2, "Fixed tabled has 2 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 7, "Scroll tabled has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(2),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("Hide one column in scroll area", function(assert) {
		oTable.getColumns()[5].setVisible(false);
		sap.ui.getCore().applyChanges();
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 3, "Fixed tabled has 6 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll tabled has 3 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("No fixed column used, when table is too small.", function(assert) {
		oTable.setFixedColumnCount(3);
		oTable.setWidth("400px");

		sap.ui.getCore().applyChanges();

		assert.equal(oTable.getComputedFixedColumnCount(), 0, "Computed Fixed column count correct - No Fixed Columns used");
		assert.equal(oTable.getFixedColumnCount(), 3, "Orignal fixed column count is 3");

		oTable.setWidth("500px");

		sap.ui.getCore().applyChanges();

		assert.equal(oTable.getFixedColumnCount(), 3, "Fixed Column Count is 3 again");
		assert.equal(oTable.getComputedFixedColumnCount(), 3, "Computed Fixed column count correct");
	});

	QUnit.module("API assertions", {
		beforeEach: function() {
			createTable({
				visibleRowCount: 10,
				width: "100px",
				firstVisibleRow: 1
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Scrollbars can be accessed by inheriting controls", function(assert) {
		var sScrollBarSuffix = "ScrollBar";
		var oHsb = oTable.getDomRef(SharedDomRef["Horizontal" + sScrollBarSuffix]);
		var oVsb = oTable.getDomRef(SharedDomRef["Vertical" + sScrollBarSuffix]);

		assert.ok(oHsb, "The horizontal scrollbar can be accessed with the help of SharedDomRef");
		assert.ok(oVsb, "The vertical scrollbar can be accessed with the help of SharedDomRef");

		sap.ui.getCore().applyChanges();

		oHsb.scrollLeft = 5;

		assert.equal(oTable.getFirstVisibleRow(), 1, "getFirstVisibleRow() should be 1");

		var done = assert.async();
		window.setTimeout(function() {
			assert.equal(oVsb.scrollTop, oTable._getDefaultRowHeight(), "ScrollTop can be set and read.");
			assert.equal(oHsb.scrollLeft, 5, "ScrollLeft can be set and read.");
			done();
		}, 100);
	});

	QUnit.module("Variable Row Height", {
		beforeEach: function() {
			createTable({
				visibleRowCount: 10,
				width: "300px",
				firstVisibleRow: 1
			});

			oTable.removeAllColumns();
			oTable.addColumn(new Column({
				label: new Label({text: "Variable Row Heights"}),
				template: new DummyControl({
					height: "{height}"
				}),
				width: "200px"
			}));

			oTable._bVariableRowHeightEnabled = true;
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Vertical scrollbar height", function(assert) {
		var oVsb = oTable._getScrollExtension().getVerticalScrollbar();
		var iVSbHeight = oVsb.clientHeight;

		assert.equal(iVSbHeight, 10 * oTable._getDefaultRowHeight(), "iVSbHeight is correct");
	});

	QUnit.test("FirstVisibleRow on init stays the same", function(assert) {
		assert.equal(oTable.getFirstVisibleRow(), 1, "getFirstVisibleRow() should be 1");
	});

	QUnit.test("ScrollTop on init is as expected", function(assert) {
		var oVsb = oTable._getScrollExtension().getVerticalScrollbar();
		assert.ok(oVsb);
		var iDefaultHeight = oTable._getDefaultRowHeight();

		var done = assert.async();
		window.setTimeout(function() {
			assert.strictEqual(oVsb.scrollTop, iDefaultHeight, "ScrollTop is correct: " + oVsb.scrollTop);
			done();
		}, 100);
	});

	QUnit.test("ScrollTop after scrolling to last row is as expected", function(assert) {
		var oVsb = oTable._getScrollExtension().getVerticalScrollbar();
		assert.ok(oVsb);

		oTable.setFirstVisibleRow(200);
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		window.setTimeout(function() {
			var iVSbHeight = oVsb.clientHeight;
			var oVSbScrollHeight = oVsb.scrollHeight;

			assert.equal(oVsb.scrollTop, oVSbScrollHeight - iVSbHeight, "ScrollTop is correct");
			done();
		}, 100);
	});

	QUnit.test("After scrolling to last row, the table correction is as expected", function(assert) {
		var done = assert.async();

		// Create Data with different Row Heights
		var aData = [{height: "800px"}, {height: "800px"}, {height: "800px"}, {height: "800px"}, {height: "800px"}];
		aData = aData.concat(JSON.parse(JSON.stringify(aData)));
		aData = aData.concat(JSON.parse(JSON.stringify(aData)));
		aData = aData.concat(JSON.parse(JSON.stringify(aData)));

		var oModel = new JSONModel();
		oModel.setData({modelData: aData});
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oScrollExtension = oTable._getScrollExtension();
		var iDefaultRowHeight = oTable._getDefaultRowHeight();

		window.setTimeout(function() {
			var oVsb = oScrollExtension.getVerticalScrollbar();

			assert.equal(oTable.getFirstVisibleRow(), 1, "Initial firstVisibleRow is correct");
			assert.equal(oScrollExtension.getVerticalScrollPosition(), iDefaultRowHeight, "Initial scroll position is correct");
			assert.equal(oVsb.scrollTop, iDefaultRowHeight, "Initial scrollTop is correct");
			assert.strictEqual(oTable.getDomRef("tableCCnt").scrollTop, 0, "Initial inner scroll position is correct");

			oVsb.scrollTop = 1000000;

			window.setTimeout(function() {
				assert.equal(oTable.getFirstVisibleRow(), 39, "After setting scrollTop, firstVisibleRow is correct");
				assert.equal(oScrollExtension.getVerticalScrollPosition(), iDefaultRowHeight * 31,
					"After setting scrollTop, the scroll position is correct");
				assert.equal(oVsb.scrollTop, iDefaultRowHeight * 31, "After setting scrollTop, scrollTop is correct");
				assert.strictEqual(oTable.getDomRef("tableCCnt").scrollTop, 8321,
					"After setting scrollTop, the inner scroll position is correct");
				done();
			}, 500);
		}, 500);
	});

	QUnit.module("Fixed rows and columns", {
		beforeEach: function() {
			createTable({
				fixedRowCount: 2,
				fixedColumnCount: 2,
				visibleRowCount: 8
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		assert.equal(oTable.getFixedRowCount(), 2, "Fixed row count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 3,
			"Top left tabled has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 3,
			"Bottom left tabled has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 7,
			"Top right tabled has 7 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 7,
			"Bottom right tabled has 7 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Top left tabled has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowScroll tbody tr").length, 6,
			"Bottom left tabled has 6 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Top right tabled has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowScroll tbody tr").length, 6,
			"Bottom right tabled has 6 rows");
		assert.equal($table.find(".sapUiTableVSb").css("top"),
			((oTable.getFixedRowCount() * oTable._getDefaultRowHeight()) + $table.find(".sapUiTableCCnt")[0].offsetTop - 1) + "px",
			"Vertical scrollbar has correct top padding");
	});

	QUnit.module("Fixed top and bottom rows and columns", {
		beforeEach: function() {
			createTable({
				fixedRowCount: 2,
				fixedBottomRowCount: 2,
				fixedColumnCount: 2,
				visibleRowCount: 8
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		assert.equal(oTable.getFixedRowCount(), 2, "Fixed row count correct");
		assert.equal(oTable.getFixedBottomRowCount(), 2, "Fixed bottom row count correct");
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 3,
			"Left fixed table has 2 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 3,
			"Left scroll table has 2 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixedBottom .sapUiTableCtrlCol th").length, 3,
			"Left fixed bottom table has 2 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 7,
			"Right table has 6 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 7,
			"Right scroll table has 6 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixedBottom .sapUiTableCtrlCol th").length, 7,
			"Right fixed bottom table has 6 columns + dummy rowsel");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Left fixed table has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Right table has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowScroll tbody tr").length, 4,
			"Left scroll table has 4 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowScroll tbody tr").length, 4,
			"Right scroll table has 4 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixedBottom tbody tr").length, 2,
			"Left fixed bottom table has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixedBottom tbody tr").length, 2,
			"Right fixed bottom table has 2 rows");
		assert.equal($table.find(".sapUiTableVSb").css("top"),
			((oTable.getFixedRowCount() * oTable._getDefaultRowHeight()) + $table.find(".sapUiTableCCnt")[0].offsetTop - 1) + "px",
			"Vertical scrollbar has correct top padding");
		assert.equal($table.find(".sapUiTableVSb").css("height"), (oTable.getDomRef("table").offsetHeight) + "px",
			"Vertical scrollbar has correct height");
	});

	QUnit.test("Sanity check for fixed rows", function(assert) {
		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(1);
		assert.equal(oTable.getFixedRowCount(), 1,
			"Set(visible: 10, *fixed: 1, fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(1);
		assert.equal(oTable.getFixedBottomRowCount(), 1,
			"Set(visible: 10, fixed: 1, *fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedRowCount(8);
		assert.equal(oTable.getFixedRowCount(), 8,
			"Set(visible: 10, *fixed: 8, fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedRowCount(9);
		assert.equal(oTable.getFixedRowCount(), 8,
			"Set(visible: 10, *fixed: 9 (expect 8), fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedRowCount(0);
		assert.equal(oTable.getFixedRowCount(), 0,
			"Set(visible: 10, *fixed: 0, fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedRowCount(10);
		assert.equal(oTable.getFixedRowCount(), 0,
			"Set(visible: 10, *fixed: 10 (expect 0), fixedBottom: 1), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(5);
		assert.equal(oTable.getFixedBottomRowCount(), 5,
			"Set(visible: 10, fixed: 0, *fixedBottom: 5), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(9);
		assert.equal(oTable.getFixedBottomRowCount(), 9,
			"Set(visible: 10, fixed: 0, *fixedBottom: 9), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(10);
		assert.equal(oTable.getFixedBottomRowCount(), 9,
			"Set(visible: 10, fixed: 0, *fixedBottom: 10 (expect 9)), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(11);
		assert.equal(oTable.getFixedBottomRowCount(), 9,
			"Set(visible: 10, fixed: 0, *fixedBottom: 11 (expect 9)), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedBottomRowCount(3);
		oTable.setFixedRowCount(3);

		assert.equal(oTable.getFixedBottomRowCount(), 3,
			"Set(visible: 10, fixed: 3, *fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		assert.equal(oTable.getFixedRowCount(), 3,
			"Set(visible: 10, *fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setVisibleRowCount(8);
		assert.equal(oTable.getVisibleRowCount(), 8,
			"Set(*visible: 8, fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setVisibleRowCount(7);
		assert.equal(oTable.getVisibleRowCount(), 7,
			"Set(*visible: 7, fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setVisibleRowCount(6);
		assert.equal(oTable.getVisibleRowCount(), 7,
			"Set(*visible: 6 (expect 7), fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setVisibleRowCount(5);
		assert.equal(oTable.getVisibleRowCount(), 7,
			"Set(*visible: 5 (expect 7), fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

		oTable.setFixedRowCount(0);
		oTable.setVisibleRowCount(5);
		assert.equal(oTable.getVisibleRowCount(), 5,
			"Set(*visible: 5, fixed: 3, fixedBottom: 3), " +
			"Get(visible: " + oTable.getVisibleRowCount() + ", fixed: " + oTable.getFixedRowCount()
			+ ", fixedBottom: " + oTable.getFixedBottomRowCount() + ")");

	});

	QUnit.module("Multiple header rows", {
		beforeEach: function() {
			createTable({}, function(oTable) {
				var oControl = new Text({text: "lastName"});
				var oColumn = new Column({
					multiLabels: [
						new Label({text: "Last Name"}),
						new Label({text: "Second level header"})
					], template: oControl, sortProperty: "lastName", filterProperty: "lastName"
				});
				oTable.addColumn(oColumn);
				oControl = new Input({value: "name"});
				oTable.addColumn(new Column({
					multiLabels: [
						new Label({text: "First Name", textAlign: "Right"}),
						new Label({text: "Name of the person"})
					], template: oControl, sortProperty: "name", filterProperty: "name"
				}));
				oControl = new CheckBox({selected: "checked"});
				oTable.addColumn(new Column({
					label: new Label({text: "Checked (very long label text to show wrapping behavior)"}),
					template: oControl,
					sortProperty: "checked",
					filterProperty: "checked",
					hAlign: "Center"
				}));
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Headers", function(assert) {
		assert.expect(1);
		assert.equal(oTable.$().find(".sapUiTableColHdrTr .sapUiTableCol").length, 6, "Total count of headers");
	});

	QUnit.test("Equal widths", function(assert) {
		assert.expect(3);
		var $Table = oTable.$();
		var $Head1 = $Table.find(".sapUiTableColHdrTr:eq(0)");
		var $Head2 = $Table.find(".sapUiTableColHdrTr:eq(1)");
		assert.equal($Head1.find(".sapUiTableCol:eq(0)").width(), $Head2.find(".sapUiTableCol:eq(0)").width(),
			"First column headers have equal width");
		assert.equal($Head1.find(".sapUiTableCol:eq(1)").width(), $Head2.find(".sapUiTableCol:eq(1)").width(),
			"Second column headers have equal width");
		assert.equal($Head1.find(".sapUiTableCol:eq(2)").width(), $Head2.find(".sapUiTableCol:eq(2)").width(),
			"Third column headers have equal width");
	});

	QUnit.test("Equal heights", function(assert) {
		assert.expect(6);
		var $Table = oTable.$();

		$Table.find(".sapUiTableColHdrTr").each(function(index, row) {
			var rowIndex = index;
			var $row = jQuery(row);
			var rowHeight = $row.height();
			$row.children(".sapUiTableCol").each(function(index, cell) {
				assert.equal(cell.offsetHeight, rowHeight, "Cell [" + index + "," + rowIndex + "] has correct height");
			});
		});
	});

	QUnit.module("Table with extension", {
		beforeEach: function() {
			createTable({
				extension: [
					new Button("extensionButton", {
						text: "Click me!"
					})
				]
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		var $button = $table.find(".sapUiTableExt").find("#extensionButton");
		assert.equal(oTable.getExtension().length, 1, "Table has 1 extension");
		assert.equal($button.length, 1, "Button in extension is rendered");
		assert.equal(sap.ui.getCore().byId($button.attr("id")).getText(), "Click me!", "The correct button is rendered");
	});

	QUnit.module("Invisible table", {
		beforeEach: function() {
			createTable({
				visible: false
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		assert.equal($table.children().length, 0, "No table content is rendered");
	});

	var oExport = null;

	QUnit.module("Data export", {
		beforeEach: function() {
			createTable({}, null, "myModel");
			oTable.filter(oTable.getColumns()[1], "Al");

			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
			oExport = oTable.exportData({
				exportType: new sap.ui.core.util.ExportTypeCSV()
			});
		},
		afterEach: function() {
			oExport.destroy();
			oExport = null;
			destroyTable();
		}
	});

	QUnit.test("Export filtered table with named model", function(assert) {
		var done = assert.async();
		oExport.generate()
			   .done(function(sContent) {
				   var sExpected =
					   "Last Name,First Name,Checked,Web Site,Gender,Rating,Money\r\n" +
					   "Dente - 0,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 20,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 40,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 60,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 80,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 100,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 120,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 140,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 160,Al,true,www.sap.com,male,4,3.45\r\n" +
					   "Dente - 180,Al,true,www.sap.com,male,4,3.45";
				   assert.equal(sContent, sExpected, "Generated file content should be correct.");
			   })
			   .fail(function() {
				   assert.ok(false, "Generate should not fail.");
			   })
			   .always(function() {
				   done();
			   });
	});

	QUnit.module("Toolbar", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Table toolbar should have the transparent design by default without changing the design property", function(assert) {
		var oToolbar = new Toolbar();
		var oTable = new Table({
			toolbar: oToolbar
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ToolbarDesign.Auto, oToolbar.getDesign(), "Design property of the Toolbar is Auto");
		assert.strictEqual(ToolbarDesign.Transparent, oToolbar.getActiveDesign(), "Active design of the Toolbar is Transparent");

		oTable.destroy();
	});

	QUnit.test("Table should respect the design property of the Toolbar when it is set", function(assert) {
		var oToolbar = new Toolbar({
			design: "Solid"
		});
		var oTable = new Table({
			toolbar: oToolbar
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ToolbarDesign.Solid, oToolbar.getDesign(), "Design property of the Toolbar is Solid");
		assert.strictEqual(ToolbarDesign.Solid, oToolbar.getActiveDesign(), "Active design of the Toolbar is Solid as well");

		oTable.destroy();
	});

	QUnit.test("Toolbar has style class sapMTBHeader-CTX", function(assert) {
		var oToolbar = new Toolbar();
		var oTable = new Table({
			toolbar: oToolbar
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Toolbar has style class sapMTBHeader-CTX");

		oTable.destroy();
	});

	QUnit.module("Sorting", {
		beforeEach: function() {
			createTable({
				title: "TABLEHEADER",
				footer: "Footer"
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Multi-columns sorting", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {
			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				assert.strictEqual(aSortedColumns[0].getSortProperty(), "name", "check column name.");
				assert.strictEqual(aSortedColumns[1].getSortProperty(), "lastName", "check column name.");

				assert.strictEqual(oTable.getRows()[3].getCells()[0].getText(), "Open", "second sorting column works.");
				assert.strictEqual(oTable.getRows()[3].getCells()[1].getText(), "Doris", "first sorting column works.");
			}

			done();
		};

		oTable.attachEventOnce("_rowsUpdated", fnHandler);
		sortTable();
	});

	QUnit.test("Sort Icon", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {
			var aSortedColumns = oTable.getSortedColumns();
			var cell;

			if (aSortedColumns.length === 2) {
				cell = aSortedColumns[0].$().find(".sapUiTableColCell");
				assert.ok(cell.hasClass("sapUiTableColSF"), "Icons are shown");
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is shown");
				assert.ok(!cell.hasClass("sapUiTableColSortedD"), "sort icon is ascending");

				cell = aSortedColumns[1].$().find(".sapUiTableColCell");
				assert.ok(cell.hasClass("sapUiTableColSF"), "Icons are shown");
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is shown");
				assert.ok(cell.hasClass("sapUiTableColSortedD"), "sort icon is descending");

				oTable.detachEvent("_rowsUpdated", fnHandler);
				done();
			}
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		var aColumns = oTable.getColumns();
		oTable.sort(aColumns[0], SortOrder.Ascending, false);
		oTable.sort(aColumns[1], SortOrder.Descending, true);
	});

	QUnit.test("Sort Icon", function(assert) {
		var done = assert.async();
		creatSortingTableData();
		var aColumns = oTable.getColumns();

		var fnHandler = function() {
			var aSortedColumns = oTable.getSortedColumns();

			assert.equal(aSortedColumns.length, 2, "Two columns sorted");
			assert.ok(aColumns[0].getSorted(), "First column sorted");
			assert.ok(aColumns[1].getSorted(), "Second column sorted");

			oTable.detachEvent("_rowsUpdated", fnHandler);
			oTable.attachEvent("_rowsUpdated", fnHandler2);
			// remove sorting
			oTable.sort();
		};

		var fnHandler2 = function() {
			var aSortedColumns = oTable.getSortedColumns();

			assert.equal(aSortedColumns.length, 0, "No column sorted");

			assert.ok(aColumns[0].getSorted() == false, "First column not sorted");
			assert.ok(aColumns[1].getSorted() == false, "Second column not sorted");

			oTable.detachEvent("_rowsUpdated", fnHandler2);
			done();
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		oTable.sort(aColumns[0], SortOrder.Ascending, false);
		oTable.sort(aColumns[1], SortOrder.Descending, true);
	});

	QUnit.test("remove column", function(assert) {
		var done = assert.async();
		creatSortingTableData();
		var oRemovedColumn;

		var fnHandler = function() {
			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachEvent("_rowsUpdated", fnHandler);
				oRemovedColumn = oTable.removeColumn(oTable.getSortedColumns()[0]);
				oTable.attachEvent("_rowsUpdated", fnHandler2);
			}
		};

		var fnHandler2 = function() {
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 1, "sorted column deletion.");
			assert.strictEqual(oRemovedColumn.getSortProperty(), "name", "first name is removed");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "lastName", "second column becomes the first column.");
			oTable.detachEvent("_rowsUpdated", fnHandler2);
			done();
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("remove all columns", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {

			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachEvent("_rowsUpdated", fnHandler);
				oTable.removeAllColumns();
				oTable.attachEvent("_rowsUpdated", fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachEvent("_rowsUpdated", fnHandler2);
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 0, "sorted column deletion.");
			done();
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("destroy columns", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {

			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachEvent("_rowsUpdated", fnHandler);
				oTable.destroyColumns();
				oTable.attachEvent("_rowsUpdated", fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachEvent("_rowsUpdated", fnHandler2);
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 0, "sorted column deletion.");
			done();
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("change column order", function(assert) {
		var done = assert.async();
		creatSortingTableData();
		var oRemovedColumn;

		var fnHandler = function() {

			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachEvent("_rowsUpdated", fnHandler);
				oTable._bReorderInProcess = true;
				oRemovedColumn = oTable.removeColumn(aSortedColumns[1]);

				oTable.attachEvent("_rowsUpdated", fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachEvent("_rowsUpdated", fnHandler2);
			oTable.insertColumn(oRemovedColumn, 0);
			oTable._bReorderInProcess = false;
			oTable.attachEvent("_rowsUpdated", fnHandler3);
		};

		var fnHandler3 = function() {

			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 2, "2 sorted columns.");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "name", "first name stays in first sorted column");
			assert.strictEqual(aSortedColumns[1].getSortProperty(), "lastName", "last name stays in second sorted column");
			oTable.detachEvent("_rowsUpdated", fnHandler3);
			done();
		};

		oTable.attachEvent("_rowsUpdated", fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Performance improvements", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Prevent re-rendering on setEnableBusyIndicator", function(assert) {
		var spy = this.spy();
		oTable.addEventDelegate({onAfterRendering: spy});

		// act
		oTable.setEnableBusyIndicator(true);
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(spy.notCalled, "onAfterRendering was not called");
		assert.ok(oTable.getEnableBusyIndicator(), "The overwritten function still works");
	});

	QUnit.module("Binding", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		},
		assertBindingInfo: function(assert, sTestTitle, oActualBindingInfo, oExpectedBindingInfo) {
			assert.strictEqual(oActualBindingInfo.path, oExpectedBindingInfo.path, sTestTitle + ": The path is correct");
			assert.deepEqual(oActualBindingInfo.sorter, oExpectedBindingInfo.sorter, sTestTitle + ": The sorter is correct");
			assert.deepEqual(oActualBindingInfo.filters, oExpectedBindingInfo.filters, sTestTitle + ": The filters are correct");
			assert.deepEqual(oActualBindingInfo.template, oExpectedBindingInfo.template, sTestTitle + ": The template is correct");
		}
	});

	QUnit.test("Bind rows using bindRows method", function(assert) {
		var spy = this.spy(oTable, "destroyRows");

		// bind rows again, binding could be resolved because model is set
		oTable.bindRows(oTable.getBindingInfo("rows"));

		// bind rows to different model which is not yet set
		oTable.bindRows("otherModel>/root");

		// bind rows again. Binding was not yet resolved
		oTable.bindRows("otherModel>/root");

		// BindingInfo
		var oBindingInfo = {
			path: "/modelData",
			sorter: new Sorter({
				path: "modelData>money",
				descending: true
			}),
			filters: [
				new Filter({
					path: "modelData>money",
					operator: "LT",
					value: 5
				})
			],
			template: new Label({
				text: "Last Name"
			})
		};
		oTable.bindRows(oBindingInfo);
		this.assertBindingInfo(assert, "BindingInfo", oTable.getBindingInfo("rows"), oBindingInfo);

		// destroy rows must not be called
		assert.ok(spy.notCalled, "destroyRows was not called");
	});

	QUnit.test("Bind rows using bindRows method - legacy API", function(assert) {
		var oSorter = new Sorter({
			path: "modelData>money",
			descending: true
		});
		var oFilter = new Filter({
			path: "modelData>money",
			operator: "LT",
			value: 5
		});
		var oTemplate = new Label({
			text: "Last Name"
		});

		// (sPath)
		oTable.bindRows("/modelData");
		this.assertBindingInfo(assert, "(sPath)", oTable.getBindingInfo("rows"), {
			path: "/modelData"
		});

		// (sPath, oSorter)
		oTable.bindRows("/modelData", oSorter);
		this.assertBindingInfo(assert, "(sPath, oSorter)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter
		});

		// (sPath, oSorter, aFilters)
		oTable.bindRows("/modelData", oSorter, [oFilter]);
		this.assertBindingInfo(assert, "(sPath, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter,
			filters: [oFilter]
		});

		// (sPath, vTemplate, oSorter, aFilters)
		oTable.bindRows("/modelData", oTemplate, oSorter, [oFilter]);
		this.assertBindingInfo(assert, "(sPath, vTemplate, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter,
			filters: [oFilter],
			template: oTemplate
		});
	});

	QUnit.test("Bind rows using the constructor", function(assert) {
		var spy = this.spy(Table.prototype, "bindRows");
		/*eslint-disable no-new */
		new Table({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});
		/*eslint-enable no-new */

		assert.ok(spy.calledOnce, "bindRows was called");
	});

	QUnit.test("Binding events", function(assert) {
		var aEventListenerSequence = [];

		oTable._onBindingChange = function() {
			aEventListenerSequence.push("change_table");
		};
		oTable._onBindingDataRequested = function() {
			aEventListenerSequence.push("dataRequested_table");
		};
		oTable._onBindingDataReceived = function() {
			aEventListenerSequence.push("dataReceived_table");
		};

		oTable.bindRows({
			path: "/modelData",
			events: {
				change: function() {
					aEventListenerSequence.push("change_other");
				},
				dataRequested: function() {
					aEventListenerSequence.push("dataRequested_other");
				},
				dataReceived: function() {
					aEventListenerSequence.push("dataReceived_other");
				}
			}
		});

		var oBinding = oTable.getBinding("rows");
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");

		assert.deepEqual(aEventListenerSequence, [
			"change_table", "change_other", "dataRequested_table", "dataRequested_other", "dataReceived_table", "dataReceived_other"
		], "The binding event listeners where called in the correct order");
	});

	QUnit.module("Callbacks", {
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("_updateTableCell callback", function(assert) {
		var done = assert.async();
		var iCallCountUpdateTableCellOnTable = 0;
		var iCallCountUpdateTableCell = 0;
		var fnTest = function() {
			assert.equal(iCallCountUpdateTableCellOnTable, 20, "UpdateTableCell callback called on table ok");
			assert.equal(iCallCountUpdateTableCell, 20, "UpdateTableCell callback called on cell ok");
			oTable.attachEventOnce("_rowsUpdated", fnTestScroll);
			oTable.setFirstVisibleRow(5);
		};

		var fnTestScroll = function() {
			assert.equal(iCallCountUpdateTableCellOnTable, 40, "UpdateTableCell callback called on table ok");
			assert.equal(iCallCountUpdateTableCell, 40, "UpdateTableCell callback called on cell ok");
			done();
		};

		// create a dummy control for this test which has _updateTableCell implemented
		var oRenderer = new Text().getRenderer();
		var TextView = Text.extend("sap.ui.table.qunitText", {renderer: oRenderer});
		TextView.prototype._updateTableCell = function() { iCallCountUpdateTableCell++; };

		oTable = new Table({
			columns: [
				new Column({template: new TextView()}),
				new Column({template: new TextView()})
			]
		});

		// implement _updateTableCell for table instance
		oTable._updateTableCell = function() { iCallCountUpdateTableCellOnTable++; };

		oTable.attachEventOnce("_rowsUpdated", fnTest);
		var oModel = new JSONModel();
		oModel.setData({modelData: aData});
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Events", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		},
		checkRowsUpdated: function(assert, aActualReasons, aExpectedReasons, iDelay) {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.deepEqual(aActualReasons, aExpectedReasons,
						"VisibleRowCountMode: " + oTable.getVisibleRowCountMode() + " - "
						+ (aExpectedReasons.length > 0
						? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
						: "The event _rowsUpdated has not been fired")
					);

					resolve();
				}, iDelay == null ? 100 : iDelay);
			});
		}
	});

	QUnit.test("RowSelectionChange", function(assert) {
		assert.expect(42);
		var sTestCase = "";
		var fnHandler = function(oEvent) {
			switch (sTestCase) {
				case "userSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "userClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "APIClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "userSetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "userUnsetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
			}

		};

		oTable.attachRowSelectionChange(fnHandler);

		sTestCase = "userSelectAll";
		jQuery(oTable.getDomRef("selall")).click();
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).click();

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").click();
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").click();

		sTestCase = "APISetSelectedIndex";
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Select All on Binding Change", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oModel;
		oTable.attachRowSelectionChange(function() {
			assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");

			oTable.attachEventOnce("_rowsUpdated", function() {
				assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

				oTable.attachEventOnce("_rowsUpdated", function() {
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					done();
				});

				oModel.setData({modelData: aData});
			});

			oModel = new JSONModel();
			oModel.setData({modelData: []});
			oTable.setModel(oModel);
			oTable.bindRows("/modelData");
		});

		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
		oTable.$("selall").click();
	});

	QUnit.test("_fireRowsUpdated", function(assert) {
		var done = assert.async();
		var sTestReason = "test_reason";

		oTable.attachEventOnce("_rowsUpdated", function(oEvent) {
			assert.strictEqual(sTestReason, oEvent.getParameter("reason"), "The event has been fired with the correct reason");
			done();
		});

		oTable._fireRowsUpdated(sTestReason);
	});

	QUnit.test("_rowsUpdated - Initial rendering", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		function _createTable(sVisibleRowCountMode) {
			oTable = new Table({
				rows: "{/modelData}",
				visibleRowCountMode: sVisibleRowCountMode
			});

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			oTable.addColumn(new Column({
				label: new Label({text: "Last Name"}),
				template: new Text({text: "{lastName}"})
			}));

			var oModel = new JSONModel();
			oModel.setData({modelData: aData});
			oTable.setModel(oModel);

			oTable.placeAt("qunit-fixture");
		}

		destroyTable();
		_createTable(VisibleRowCountMode.Fixed);
		this.checkRowsUpdated(assert, aFiredReasons, [
			TableUtils.RowsUpdateReason.Change,
			TableUtils.RowsUpdateReason.Render
		]).then(function() {
			destroyTable();
			_createTable(VisibleRowCountMode.Interactive);
			aFiredReasons = [];
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Change,
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			destroyTable();
			_createTable(VisibleRowCountMode.Auto);
			aFiredReasons = [];
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Change,
				TableUtils.RowsUpdateReason.Render,
				TableUtils.RowsUpdateReason.Render
			], 250);
		}).then(function() {
			done();
		});
	});

	QUnit.test("_rowsUpdated - Re-render", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		function setVisibleRowCountMode(sNewVisibleRowCountMode) {
			oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);

			return new Promise(function(resolve) {
				window.setTimeout(function() {
					aFiredReasons = [];
					resolve();
				}, 0);
			});
		}

		setVisibleRowCountMode(VisibleRowCountMode.Fixed).then(function() {
			oTable.invalidate();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Interactive);
		}).then(function() {
			oTable.invalidate();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Auto);
		}).then(function() {
			oTable.invalidate();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render,
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			done();
		});
	});

	QUnit.test("_rowsUpdated - Refresh", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.getBinding("rows").refresh(true);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Change
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Sort", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.sort(oTable.getColumns()[0], "Ascending");

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Sort
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Filter", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.filter(oTable.getColumns()[0], "test");

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Filter
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Expand", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

		window.setTimeout(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unknown
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Collapse", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);

		window.setTimeout(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unknown
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Unbind", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.unbindRows();

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unbind
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Vertical scrolling", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 100;

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.VerticalScroll
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Change first visible row by API call (setFirstVisibleRow)", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.setFirstVisibleRow(1);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Resize", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;
		var sOriginalTableParentHeight = oTable.getDomRef().parentElement.style.height;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		oTable.setVisibleRowCountMode(VisibleRowCountMode.Auto);

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.getDomRef().parentElement.style.height = "500px";
			oTable._onTableResize();

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Resize
			]).then(function() {
				oTable.getDomRef().parentElement.style.height = sOriginalTableParentHeight;
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Personalization", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		window.setTimeout(function() {
			aFiredReasons = [];
			var oPersoController = new TablePersoController({
				persoService: {
					getPersData: function() {
						return {
							done: function(callback) {
								callback.call();

								return {
									fail: function() {}
								};
							}
						};
					},
					setPersData: function() {
						return null;
					},
					delPersData: function() {
						return null;
					}
				},
				table: oTable
			});
			oPersoController.refresh();
			oTable.getBinding("rows").fireEvent("dataRequested");

			that.checkRowsUpdated(assert, aFiredReasons, []).then(function() {
				oPersoController.destroy();
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Animation", function(assert) {
		var done = assert.async();
		var aFiredReasons = [];
		var that = this;

		function fireTransitionEndEvent() {
			var oEvent;

			if (Device.browser.msie) {
				oEvent = document.createEvent("CustomEvent");
				oEvent.initCustomEvent("transitionend", true, true, true);
			} else {
				oEvent = new Event("transitionend");
			}

			document.body.dispatchEvent(oEvent);
		}

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		oTable.setVisibleRowCountMode(VisibleRowCountMode.Auto);

		window.setTimeout(function() {
			aFiredReasons = [];
			oTable.setProperty("minAutoRowCount", 30, true);
			fireTransitionEndEvent();

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Animation
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.module("Legacy Modules", {});

	QUnit.test("TreeAutoExpandMode", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/TreeAutoExpandMode", "sap/ui/table/library"], function(oClass, oLib) {
			assert.ok(oClass === sap.ui.table.TreeAutoExpandMode, "Global Namespace");
			assert.ok(oClass === oLib.TreeAutoExpandMode, "Library");
			done();
		});
	});

	QUnit.test("ColumnMenuRenderer", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/ColumnMenuRenderer", "sap/ui/table/ColumnMenu"], function(oRenderer, oMenu) {
			assert.ok(oRenderer === ColumnMenuRenderer, "Global Namespace");
			assert.ok(oRenderer === oMenu.getMetadata().getRenderer(), "Metadata");
			done();
		});
	});

	QUnit.test("AnalyticalColumnMenuRenderer", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/AnalyticalColumnMenuRenderer", "sap/ui/table/AnalyticalColumnMenu"], function(oRenderer, oMenu) {
			assert.ok(oRenderer === AnalyticalColumnMenuRenderer, "Global Namespace");
			assert.ok(oRenderer === oMenu.getMetadata().getRenderer(), "Metadata");
			done();
		});
	});

	QUnit.test("TreeTableRenderer", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/TreeTableRenderer", "sap/ui/table/TreeTable"], function(oRenderer, oTable) {
			assert.ok(oRenderer === sap.ui.table.TreeTableRenderer, "Global Namespace");
			assert.ok(oRenderer === oTable.getMetadata().getRenderer(), "Metadata");
			done();
		});
	});

	QUnit.test("TreeTableRenderer", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/AnalyticalTableRenderer", "sap/ui/table/AnalyticalTable"], function(oRenderer, oTable) {
			assert.ok(oRenderer === sap.ui.table.AnalyticalTableRenderer, "Global Namespace");
			assert.ok(oRenderer === oTable.getMetadata().getRenderer(), "Metadata");
			done();
		});
	});

	QUnit.module("Functions (public/private), mouse/touch events, properties", {
		beforeEach: function() {
			createTable();
			this.sinon = sinon.sandbox.create();
		},
		afterEach: function() {
			this.sinon.restore();
			destroyTable();
		}
	});

	QUnit.test("getRowForCell", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();

		var aRows = oTable.getRows();
		var aCells;
		for (var i = 0; i < aRows.length; i++) {
			aCells = aRows[i].getCells();
			for (var j = 0; j < aCells.length; j++) {
				assert.ok(oTable.getRowForCell(aCells[j]) === aRows[i], "Correct output for row " + i + " and visible column " + j);
			}
		}

		assert.ok(!oTable.getRowForCell(), "No cell given");
		assert.ok(!oTable.getRowForCell(oTable.getColumns()[0]), "Something wrong given");
	});

	QUnit.test("getColumnForCell", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();

		var aRows = oTable.getRows();
		var aColumns = oTable.getColumns();
		var aCells, iColumnIndex;
		for (var i = 0; i < aRows.length; i++) {
			aCells = aRows[i].getCells();
			for (var j = 0; j < aCells.length; j++) {
				iColumnIndex = j == 0 ? j : (j + 1);
				assert.ok(oTable.getColumnForCell(aCells[j]) === aColumns[iColumnIndex], "Correct output for row " + i + " and visible column " + j);
			}
		}

		assert.ok(!oTable.getColumnForCell(), "No cell given");
		assert.ok(!oTable.getColumnForCell(oTable.getColumns()[0]), "Something wrong given");
	});

	QUnit.test("test onBeforeRendering function with variableRowHeightEnabled=true", function(assert) {
		var fnCalculateRowsToDisplay = sinon.spy(oTable, "_calculateRowsToDisplay");
		oTable._bVariableRowHeightEnabled = true;
		/*eslint-disable new-cap */
		var oEvent = jQuery.Event();
		/*eslint-enable new-cap */
		oTable.onBeforeRendering(oEvent);
		assert.ok(fnCalculateRowsToDisplay.called, "_calcualteRowsToDisplay() called via onBeforeRendering()");
		assert.ok(this.sinon.stub(TableUtils, "isVariableRowHeightEnabled").returns(true));
	});

	QUnit.test("test onThemeChanged function", function(assert) {
		var fnInvalidate = sinon.spy(oTable, "invalidate");
		oTable.onThemeChanged();
		assert.ok(fnInvalidate.called, "invalidate() called from onThemeChanged()");
	});

	QUnit.test("test onAfterRendering function with variableRowHeightEnabled=true", function(assert) {
		oTable._bVariableRowHeightEnabled = true;
		/*eslint-disable new-cap */
		var oEvent = jQuery.Event();
		/*eslint-enable new-cap */
		var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
		oTable.onAfterRendering(oEvent);
		assert.equal(oVSb.scrollTop, 0, "scrollTop value is available");
	});

	QUnit.test("test _updateTableContent and cleanupTableRowForGrouping function via onAfterRendering", function(assert) {
		var fnCleanupTableRowForGrouping = sinon.spy(TableUtils.Grouping, "cleanupTableRowForGrouping");
		var fnUpdateTableContent = sinon.spy(oTable, "_updateTableContent");
		/*eslint-disable new-cap */
		var oEvent = jQuery.Event();
		/*eslint-enable new-cap */
		oTable._mode = "Group"; // return true for TableUtils.Grouping.isGroupMode(oTable)
		oTable.setEnableGrouping(true); // for testing _updateTableContent()
		oTable.setGroupBy(oTable.getColumns()[5]); // Enabling grouping on "gender" for enhancing row binding
		oTable.onAfterRendering(oEvent);
		assert.ok(fnUpdateTableContent.called);
		oTable.unbindRows();
		oTable.onAfterRendering(oEvent);
		assert.ok(fnCleanupTableRowForGrouping.called,
			"Row binding was destroyed, hence _updateTableContent executed cleanupTableRowForGrouping() from TableUtils");
	});

	QUnit.test("test _enableTextSelection function", function(assert) {
		oTable._enableTextSelection(oTable.getDomRef());
		assert.ok(oTable.getDomRef().hasAttribute("unselectable", "off"), "_enableTextSelection is on");
	});

	QUnit.test("test _clearTextSelection function", function(assert) {
		assert.equal(oTable._clearTextSelection(), window.getSelection().removeAllRanges(), "Text selection is cleared");
	});

	QUnit.test("Check for tooltip", function(assert) {
		oTable.setTooltip("Table Tooltip");
		assert.strictEqual(oTable.getTooltip(), "Table Tooltip", "Table tooltip set correctly");
	});

	QUnit.test("Check for Fixed Rows and Fixed Bottom Rows", function(assert) {
		var fnError = sinon.spy(jQuery.sap.log, "error");
		assert.equal(oTable._getFixedRowContexts().length, 0, "fixedRowContexts returned an empty array");
		oTable.setFixedRowCount(5);
		assert.equal(oTable.getFixedRowCount(), 5, "fixedRowCount is set to 5");
		assert.equal(oTable._getFixedRowContexts(oTable.getFixedRowCount()).length, 5,
			"fixedRowContexts returned non empty array when fixedRowCount is set");
		assert.equal(fnError.callCount, 0, "Error was not logged so far");
		oTable.setFixedRowCount(-1);
		assert.ok(oTable.getFixedRowCount() !== -1, "Attempt to set fixedRowCount as negative number, error message must have been logged");
		assert.equal(fnError.args[0][0], "Number of fixed rows must be greater or equal 0", "Appropriate error message was logged");
		oTable.setFixedRowCount(0);
		assert.equal(oTable.getFixedRowCount(), 0, "Resetting fixedRowCount to 0");
		assert.equal(oTable._getFixedBottomRowContexts().length, 0, "FixedBottomRowContexts returned an empty array");
		oTable.setFixedBottomRowCount(3);
		assert.equal(oTable.getFixedBottomRowCount(), 3, "FixedBottomRowCount is set to 3");
		assert.equal(oTable._getFixedBottomRowContexts(oTable.getFixedBottomRowCount(), oTable._updateTotalRowCount()).length, 3,
			"fixedBottomRowContexts returned non empty array when fixedBottomRowCount and bindingLength is set");
		oTable._updateFixedBottomRows();
		assert.equal(oTable.getFirstVisibleRow(), 0, "_updateFixedBottomRows() called with the updated fixedBottomRowCount");
		oTable.setVisibleRowCount(250);
		sap.ui.getCore().applyChanges();
		oTable._updateFixedBottomRows();
		assert.ok(oTable._getTotalRowCount() < oTable.getVisibleRowCount(), "_updateFixedBottomRows() called where bindingLength < visibleRowCount");
		oTable.setVisibleRowCount(7);
		assert.equal(oTable.getVisibleRowCount(), 7, "resetting visibleRowCount to 7");
		oTable.setFixedBottomRowCount(-1);
		assert.ok(oTable.getFixedBottomRowCount() !== -1,
			"Attempt to set fixedBottomRowCount as negative number, error mesaage must have been logged");
		assert.equal(fnError.args[1][0], "Number of fixed bottom rows must be greater or equal 0", "Appropriate error message was logged");
		fnError.restore(); // restoring original jQuery.sap.log.error() method, else exception is thrown
	});

	QUnit.test("Check show overlay", function(assert) {
		oTable.setShowOverlay(true);
		assert.strictEqual(oTable.getShowOverlay(), true, "Overlay is set on the Table");
		oTable.setShowOverlay(false);
		assert.strictEqual(oTable.getShowOverlay(), false, "Overlay is removed");
	});

	QUnit.test("Check for custom filters", function(assert) {
		oTable.setEnableCustomFilter(true);
		assert.strictEqual(oTable.getEnableCustomFilter(), true, "Custom filter is enabled");
		oTable.setEnableCustomFilter(false);
		assert.strictEqual(oTable.getEnableCustomFilter(), false, "Custom filter is disabled");
	});

	QUnit.test("Check for column freeze", function(assert) {
		oTable.setEnableColumnFreeze(true);
		assert.strictEqual(oTable.getEnableColumnFreeze(), true, "Column freeze is enabled");
		oTable.setEnableColumnFreeze(false);
		assert.strictEqual(oTable.getEnableColumnFreeze(), false, "Column freeze is disabled");
	});

	QUnit.test("Check for table focus", function(assert) {
		assert.strictEqual(oTable.getFocusInfo().id, oTable.getId(), "Table has focus");
		assert.ok(oTable.applyFocusInfo(oTable.getFocusInfo()), "Focus is applied on the table");
	});

	QUnit.test("Test for refreshRows with binding", function(assert) {
		var oEvent = {
			getParameter: function() {
				return "filter";
			}
		};
		oTable.bOutput = true;
		oTable._mTimeouts.refreshRowsAdjustRows = true;
		oTable.refreshRows(oEvent);
		assert.equal(oTable.getFirstVisibleRow(), 0, "refreshRows() executed with ChangeReason.Filter");
	});

	QUnit.test("Test for function that cannot be used programmatically", function(assert) {
		var fnError = sinon.spy(jQuery.sap.log, "error");
		assert.equal(oTable.getRows().length, 10, "Row count before row operations is 10");
		assert.equal(fnError.callCount, 0, "Error was not logged so far");
		oTable.insertRow();
		assert.equal(oTable.getRows().length, 10, "insertRow() called, but it cannot be programmatically be used. No row inserted");
		assert.equal(fnError.args[0][0], "The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!",
			"Error message logged");
		oTable.addRow();
		assert.equal(oTable.getRows().length, 10, "addRow() called, but it cannot be programmatically be used. No row added");
		assert.equal(fnError.args[1][0], "The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!",
			"Error message logged");
		oTable.removeRow();
		assert.equal(oTable.getRows().length, 10, "removeRow() called, but it cannot be programmatically be used. No row removed");
		assert.equal(fnError.args[2][0], "The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!",
			"Error message logged");
		oTable.removeAllRows();
		assert.equal(oTable.getRows().length, 10, "removeAllRows() called, but it cannot be programmatically be used. None of the rows are removed");
		assert.equal(fnError.args[3][0], "The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!",
			"Error message logged");
		oTable.destroyRows();
		assert.equal(oTable.getRows().length, 10, "destroyRows() called, but it cannot be programmatically be used. None of the rows are destoryed");
		assert.equal(fnError.args[4][0], "The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!",
			"Error message logged");
		fnError.restore();
	});

	QUnit.test("test autoResizeColumn function", function(assert) {
		var oColumn = oTable.getColumns()[0];
		oColumn.setResizable(false);
		oColumn.setAutoResizable(false);
		oTable.autoResizeColumn(0);
		assert.ok(!oColumn.getResizable(), "Columns did not resize as getResizable() returned false");
		assert.ok(!oColumn.getAutoResizable(), "Columns did not resize as getAutoResizable() returned false");
		oColumn.setResizable(true);
		oColumn.setAutoResizable(true);
		var sOldColumnWidth = oColumn.getWidth();
		oTable.autoResizeColumn(0);
		assert.ok(oColumn.getWidth() !== sOldColumnWidth, "Columns should have been resized");
	});

	QUnit.test("Check for table focus", function(assert) {
		assert.strictEqual(oTable.getFocusInfo().id, oTable.getId(), "Table has focus");
		assert.ok(oTable.applyFocusInfo(oTable.getFocusInfo()), "Focus is applied on the table");
		oTable.getFocusDomRef();
		assert.equal(oTable._getItemNavigation().getFocusedDomRef(), oTable.getColumns()[0].getDomRef());
	});

	QUnit.test("Show no data test", function(assert) {
		oTable.setShowNoData(true);
		assert.ok(oTable.getShowNoData());
		oTable.setShowNoData(false);
		assert.ok(!oTable.getShowNoData());
	});

	QUnit.test("test _onPersoApplied", function(assert) {
		var oColumn = oTable.getColumns()[0];
		oColumn.setSorted(true);
		oTable._onPersoApplied();
		assert.equal(oColumn.getSortProperty(), "lastName", "Sorting is true");
		assert.equal(oColumn.getSortOrder(), "Ascending", "Ascending order applied");
	});

	QUnit.test("BusyIndicator handling", function(assert) {
		var sBusyIndicatorParent = "sapUiTableCnt";
		var sBusyIndicatorClass = "sapUiLocalBusyIndicator";
		var onBusyStateChangedEventHandler = function(oEvent) {
			onBusyStateChangedEventHandler.callCount = this.callCount === undefined ? 1 : this.callCount + 1;
			onBusyStateChangedEventHandler.parameters = oEvent.mParameters;
		};
		onBusyStateChangedEventHandler.reset = function() {
			onBusyStateChangedEventHandler.callCount = 0;
			onBusyStateChangedEventHandler.parameters = null;
		};
		var oEvent = {};
		var oBinding = oTable.getBinding("rows");
		oEvent.getSource = function() {
			return oBinding;
		};
		oEvent.getParameter = function() {
			return false;
		};
		var clock = sinon.useFakeTimers();

		oTable.attachEvent("busyStateChanged", onBusyStateChangedEventHandler);
		oTable.setBusyIndicatorDelay(0);

		function test(bDataRequested, vExpectedPendingRequests, bExpectedBusyIndicatorVisible) {
			var bBusyStateBefore = oTable.getBusy();

			onBusyStateChangedEventHandler.reset();

			if (bDataRequested) {
				oTable._onBindingDataRequested.call(oTable, oEvent);
			} else {
				oTable._onBindingDataReceived.call(oTable, oEvent);
				clock.tick(1);
			}
			sap.ui.getCore().applyChanges();

			assert.strictEqual(oTable.getBusy(), bExpectedBusyIndicatorVisible, "The busy state of the table is: " + bExpectedBusyIndicatorVisible);

			if (bBusyStateBefore === bExpectedBusyIndicatorVisible) {
				assert.strictEqual(onBusyStateChangedEventHandler.callCount, 0, "BusyStateChanged event has not been fired");
			} else {
				assert.strictEqual(onBusyStateChangedEventHandler.callCount, 1, "BusyStateChanged event has been fired once");

				if (onBusyStateChangedEventHandler.callCount === 1) {
					assert.deepEqual(onBusyStateChangedEventHandler.parameters, {busy: bExpectedBusyIndicatorVisible, id: oTable.getId()},
						"BusyStateChanged event has been fired with the correct arguments");
				}
			}

			assert.strictEqual(oTable.getDomRef(sBusyIndicatorParent).querySelector("." + sBusyIndicatorClass) != null, bExpectedBusyIndicatorVisible,
				"The busy indicator element exists in the DOM: " + bExpectedBusyIndicatorVisible);

			if (typeof vExpectedPendingRequests === "boolean") {
				assert.strictEqual(oTable._bPendingRequest, vExpectedPendingRequests, "The pending requests flag is correct");
			} else {
				assert.strictEqual(oTable._iPendingRequests, vExpectedPendingRequests, "The pending requests counter is correct");
			}
		}

		// Busy indicator handling disabled: No busy state change.
		oTable.setEnableBusyIndicator(false);
		test(true, 1, false);
		test(true, 2, false);
		test(false, 1, false);
		test(false, 0, false);
		oTable.setEnableBusyIndicator(true);

		// No binding: No busy state change.
		this.stub(oTable, "getBinding").withArgs("rows").returns(undefined);
		test(true, 0, false);
		test(true, 0, false);
		test(false, 0, false);
		test(false, 0, false);
		oTable.getBinding.restore();

		// Simulated asynchronous analytical binding request: No busy state change.
		oEvent.getParameter = function() {
			return true;
		};
		test(true, 0, false);
		test(true, 0, false);
		test(false, 0, false);
		test(false, 0, false);
		oEvent.getParameter = function() {
			return false;
		};

		this.stub(TableUtils, "canUsePendingRequestsCounter").returns(true);
		test(true, 1, true); // Data requested: Set busy state to true.
		test(true, 2, true); // // Data requested: Keep busy state.
		test(false, 1, true); // Data received: Keep busy state.
		test(false, 0, false); // // Data received: Set busy state to false.

		TableUtils.canUsePendingRequestsCounter.returns(false);
		test(true, true, true); // Data requested: Set busy state to true.
		test(true, true, true); // // Data requested: Keep busy state.
		test(false, false, false); // Data received: Set busy state to false.
		test(false, false, false); // // Data requested: Keep busy state.

		// Cleanup
		oTable.detachEvent("busyStateChanged", onBusyStateChangedEventHandler);
		clock.restore();
		TableUtils.canUsePendingRequestsCounter.restore();
	});

	QUnit.test("NoData handling", function(assert) {
		var sNoDataClassOfTable = "sapUiTableEmpty";
		var oBinding = oTable.getBinding("rows");
		var oGetBindingLength = this.stub(oBinding, "getLength");
		var oIsInstanceOf = this.stub(TableUtils, "isInstanceOf");
		var oClock = sinon.useFakeTimers();

		function testDataReceivedListener(bNoDataVisible, sTestTitle) {
			var oEvent = {
				getSource: function() {
					return oBinding;
				},
				getParameter: function() {
					return false;
				}
			};

			oTable._onBindingDataReceived.call(oTable, oEvent);
			oClock.tick(1);
			sap.ui.getCore().applyChanges();

			assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), bNoDataVisible,
				sTestTitle + " - The table has the NoData class assigned: " + bNoDataVisible);

			assert.strictEqual(TableUtils.isNoDataVisible(oTable), bNoDataVisible,
				sTestTitle + " - NoData is visible: " + bNoDataVisible);
		}

		function testUpdateTotalRowCount(bNoDataVisible, sTestTitle) {
			oTable._updateTotalRowCount(true);
			sap.ui.getCore().applyChanges();

			assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), bNoDataVisible,
				sTestTitle + " - The table has the NoData class assigned: " + bNoDataVisible);

			assert.strictEqual(TableUtils.isNoDataVisible(oTable), bNoDataVisible,
				sTestTitle + " - NoData is visible: " + bNoDataVisible);
		}

		oTable.setShowNoData(true);

		// Data available: NoData area is not visible.
		assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), false,
			"Data available - The table has the NoData class assigned: false");
		assert.strictEqual(TableUtils.isNoDataVisible(oTable), false, "Data available - NoData is visible: false");

		// No data received: NoData area becomes visible.
		oGetBindingLength.returns(0);
		testDataReceivedListener(true, "No data received");

		// Data received: NoData area will be hidden.
		oGetBindingLength.returns(1);
		testDataReceivedListener(false, "Data received");

		// Client binding without data: NoData area becomes visible.
		oIsInstanceOf.withArgs(oBinding, "sap/ui/model/ClientListBinding").returns(true);
		oGetBindingLength.returns(0);
		testUpdateTotalRowCount(true, "Client binding without data");

		// Client binding with data: NoData area will be hidden.
		TableUtils.isInstanceOf.restore();
		oIsInstanceOf.restore();
		oIsInstanceOf.withArgs(oBinding, "sap/ui/model/ClientTreeBinding").returns(true);
		oGetBindingLength.returns(1);
		testUpdateTotalRowCount(false, "Client binding with data");

		// Binding removed: NoData area becomes visible.
		oIsInstanceOf.restore();
		oTable.unbindRows();
		testUpdateTotalRowCount(true, "Binding removed");

		// Cleanup
		oClock.restore();
		oGetBindingLength.restore();
	});

	QUnit.test("NoData Rerendering", function(assert) {
		oTable.setShowNoData(true);
		sap.ui.getCore().applyChanges();
		var bRendered = false;
		oTable.addEventDelegate({
			onAfterRendering: function() {
				bRendered = true;
			}
		});

		oTable.setNoData("Hello");
		sap.ui.getCore().applyChanges();
		assert.ok(!bRendered, "Table not rendered when changing text from default to custom text");
		bRendered = false;

		oTable.setNoData("Hello2");
		sap.ui.getCore().applyChanges();
		assert.ok(!bRendered, "Table not rendered when changing text from custom text 1 to custom text 2");
		bRendered = false;

		var oText1 = new Text();
		oTable.setNoData(oText1);
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing text from text to control");
		bRendered = false;

		var oText2 = new Text();
		oTable.setNoData(oText2);
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing text from control to control");
		bRendered = false;

		oTable.setNoData("Hello2");
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing text from control to text");
		bRendered = false;

		oText1.destroy();
		oText2.destroy();
	});

	QUnit.test("test setGroupBy function", function(assert) {
		oTable.setEnableGrouping(false);
		assert.ok(!oTable.getEnableGrouping(), "Grouping not enabled");
		oTable.setEnableGrouping(true);
		assert.ok(oTable.getEnableGrouping(), "Grouping enabled");
		assert.equal(oTable.setGroupBy("gender").getGroupBy(), null, "test for string value as paramenter, grouping not applied");
		var oColumn = oTable.getColumns()[5];
		assert.equal(oTable.setGroupBy(oColumn).getGroupBy(), oColumn.getId(), "Grouping set");
	});

	QUnit.test("test setThreshold function", function(assert) {
		oTable.setThreshold(3);
		assert.equal(oTable.getThreshold(), 3, "Threshold set to 3");
	});

	QUnit.test("Table Resize", function(assert) {
		oTable.setVisibleRowCountMode(VisibleRowCountMode.Auto);
		sap.ui.getCore().applyChanges();

		var done = assert.async();
		var $TableParent = oTable.$().parent();

		window.setTimeout(function() {
			var iOldTableContentHeight = oTable._collectTableSizes().tableCntHeight;
			$TableParent.height(500);

			window.setTimeout(function() {
				var iNewTableContentHeight = oTable._collectTableSizes().tableCntHeight;

				assert.notStrictEqual(iOldTableContentHeight, iNewTableContentHeight,
					"The table content height has changed. (Old " + iOldTableContentHeight + ", New: " + iNewTableContentHeight + ")");
				assert.ok(iOldTableContentHeight > iNewTableContentHeight, "The table content height has decreased");

				$TableParent.height("");

				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Window Resize", function(assert) {
		var done = assert.async();
		var oUpdateTableSizesStub = sinon.spy(oTable, "_updateTableSizes");

		function fireResizeEvent() {
			return new Promise(function(resolve) {
				var oEvent;

				if (Device.browser.msie) {
					oEvent = document.createEvent("CustomEvent");
					oEvent.initCustomEvent("resize", true, true, true);
				} else {
					oEvent = new Event("resize");
				}

				window.dispatchEvent(oEvent);

				window.setTimeout(function() {
					resolve();
				}, 150);
			});
		}

		fireResizeEvent().then(function() {
			assert.ok(oUpdateTableSizesStub.notCalled, "Zoom factor did not change -> _updateTableSizes was not called");

			oTable._nDevicePixelRatio = 1.15; // Default should be 1.
			return fireResizeEvent();
		}).then(function() {
			if (Device.browser.chrome) {
				assert.ok(oUpdateTableSizesStub.calledOnce, "Chrome and zoom factor did change -> _updateTableSizes was called once");
				assert.ok(oUpdateTableSizesStub.calledWith(TableUtils.RowsUpdateReason.Zoom), "_updateTableSizes called with reason \"Zoom\"");
			} else {
				assert.ok(oUpdateTableSizesStub.notCalled, "Not Chrome -> _updateTableSizes was not called");
			}

			done();
		});
	});

	QUnit.test("test setSelectionInterval function", function(assert) {
		assert.deepEqual(oTable.getSelectedIndices(), [], "Nothing is selected");
		oTable.setSelectionInterval(2, 6);
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6],
			"Calling #setSelectedIndices(2, 6) selected the correct indices");
	});

	QUnit.test("test _setLargeDataScrolling function", function(assert) {
		oTable._setLargeDataScrolling(true);
		assert.ok(oTable._bLargeDataScrolling, "Large data scrolling enabled");
		oTable._setLargeDataScrolling(false);
		assert.ok(!oTable._bLargeDataScrolling, "Large data scrolling disabled");
	});

	QUnit.test("test _getContexts, _getRowContexts and _getFixedBottomRowContexts functions", function(assert) {
		assert.equal(oTable._getContexts(1, 4, 4).length, 4, "Correct contexts must have been returned");
		oTable.setFixedRowCount(6);
		oTable.setFirstVisibleRow(2);
		assert.equal(oTable._getRowContexts().length, 10, "Correct row contexts must have been returned");
		oTable.unbindRows();
		assert.equal(oTable._getContexts(1, 4, 4).length, 0, "Empty contexts returned as row binding was destoryed");
		assert.equal(oTable._getFixedBottomRowContexts().length, 0, "Binding does not exist, hence empty context returned");
	});

	QUnit.test("test _getBaseFontSize function", function(assert) {
		assert.equal(oTable._getBaseFontSize(), 16, "Base font size returned");
	});

	QUnit.test("test _CSSSizeToPixel function", function(assert) {
		assert.equal(oTable._CSSSizeToPixel("10em", true), "160px", "CSS size converted to pixel correctly.");
		assert.equal(oTable._CSSSizeToPixel("100px", false), 100, "CSS size returned without unit.");
	});

	QUnit.test("test _getColumnsWidth function", function(assert) {
		assert.ok(oTable._getColumnsWidth() > 600 && oTable._getColumnsWidth() < 900, "Columns width returned");
	});

	QUnit.test("_getDefaultRowHeight", function(assert) {
		var oBody = document.body;

		oTable.setRowHeight(98);
		assert.strictEqual(oTable._getDefaultRowHeight(), 99, "The default row height is application defined (99)");

		oTable.setRowHeight(9);
		assert.strictEqual(oTable._getDefaultRowHeight(), 10, "The default row height is application defined (10)");

		oTable.setRowHeight(0);
		assert.strictEqual(oTable._getDefaultRowHeight(), 49, "The default row height is correct in cozy size (49)");

		oBody.classList.remove("sapUiSizeCozy");
		oBody.classList.add("sapUiSizeCompact");
		assert.strictEqual(oTable._getDefaultRowHeight(), 33, "The default row height is correct in compact size (33)");

		oBody.classList.remove("sapUiSizeCompact");
		oBody.classList.add("sapUiSizeCondensed");
		assert.strictEqual(oTable._getDefaultRowHeight(), 25, "The default row height is correct in condensed size (25)");

		oBody.classList.remove("sapUiSizeCondensed");
		assert.strictEqual(oTable._getDefaultRowHeight(), 33, "The default row height is correct in undefined size (33)");

		oBody.classList.add("sapUiSizeCozy");
	});

	QUnit.module("Performance", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Column Object Pool", function(assert) {
		var aRows = oTable.getRows();
		var oLastRowFirstColumnCell = aRows[aRows.length - 1].getCells()[0];
		var iVisibleRowCount = oTable.getVisibleRowCount();
		oTable.setVisibleRowCount(iVisibleRowCount - 1);
		sap.ui.getCore().applyChanges();

		assert.ok(oLastRowFirstColumnCell, "Control of removed row still exists");
		assert.equal(oTable.getRows().length, iVisibleRowCount - 1, "Row removed");

		assert.ok(oLastRowFirstColumnCell.getParent() === null, "Removed cell control has no parent");

		oTable.setVisibleRowCount(iVisibleRowCount);
		sap.ui.getCore().applyChanges();

		aRows = oTable.getRows();
		var oLastRowFirstColumnCellAfterCreate = aRows[aRows.length - 1].getCells()[0];
		assert.ok(oLastRowFirstColumnCell === oLastRowFirstColumnCellAfterCreate, "Old control recycled");
		assert.ok(oTable.getRows()[iVisibleRowCount - 1] !== undefined, "Row created");
		assert.ok(oLastRowFirstColumnCell.getParent() === aRows[aRows.length - 1], "Recycled cell control has last row as parent");

		var fnInvalidateRowsAggregation = sinon.spy(oTable, "invalidateRowsAggregation");
		oTable.getColumns()[0].setFlexible(false);
		assert.equal(fnInvalidateRowsAggregation.callCount, 1, "invalidateRowsAggregation() called after changing the 'flexible' property");

		oTable.getColumns()[0].setHeaderSpan(2);
		assert.equal(fnInvalidateRowsAggregation.callCount, 2, "invalidateRowsAggregation() called after changing the 'headerSpan' property");

		oTable.getColumns()[0].setVisible(false);
		assert.equal(fnInvalidateRowsAggregation.callCount, 3, "invalidateRowsAggregation() called after changing the 'visible' property");

		oTable.getColumns()[0].setHeaderSpan(1);
		assert.equal(fnInvalidateRowsAggregation.callCount, 3,
			"invalidateRowsAggregation() NOT called after changing the 'headerSpan' property for invisible column");

		oTable.getColumns()[0].setFlexible(true);
		assert.equal(fnInvalidateRowsAggregation.callCount, 3,
			"invalidateRowsAggregation() NOT called after changing the 'flexible' property for invisible column");

		oTable.getColumns()[0].setTemplate(new sap.ui.core.Control());
		assert.equal(fnInvalidateRowsAggregation.callCount, 3,
			"invalidateRowsAggregation() NOT called after changing the column template for invisible column");

		oTable.getColumns()[0].setVisible(true);
		assert.equal(fnInvalidateRowsAggregation.callCount, 4, "invalidateRowsAggregation() called after changing the 'visible' property");

		oTable.getColumns()[0].setTemplate(new sap.ui.core.Control());
		assert.equal(fnInvalidateRowsAggregation.callCount, 5, "invalidateRowsAggregation() called after changing the column template");
	});

	QUnit.module("Extensions", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Applied extensions", function(assert) {
		var aActualExtensions = [];
		var aExpectedExtensions = [
			"sap.ui.table.TablePointerExtension",
			"sap.ui.table.TableScrollExtension",
			"sap.ui.table.TableKeyboardExtension",
			"sap.ui.table.TableAccRenderExtension",
			"sap.ui.table.TableAccExtension",
			"sap.ui.table.TableDragAndDropExtension"
		];

		oTable._aExtensions.forEach(function(oExtension) {
			aActualExtensions.push(oExtension.getMetadata()._sClassName);
		});

		assert.deepEqual(aActualExtensions, aExpectedExtensions, "The table has the expected extensions applied.");
	});

	QUnit.test("Lifecycle", function(assert) {
		var aExtensions = oTable._aExtensions;

		assert.ok(oTable._bExtensionsInitialized, "The _bExtensionsInitialized flag properly indicates that extensions are initialized");

		oTable.destroy();
		var bAllExtensionsDestroyed = aExtensions.every(function(oExtension) {
			return oExtension.bIsDestroyed;
		});

		assert.ok(bAllExtensionsDestroyed, "All extensions were destroyed");
		assert.equal(oTable._aExtensions, null, "The table does not hold references to the destroyed extensions");
		assert.ok(!oTable._bExtensionsInitialized, "The _bExtensionsInitialized flag properly indicates that extensions were cleaned up");

		try {
			oTable.destroy();
		} catch (e) {
			assert.ok(false, "Duplicate call of destroy should not raise errors.");
		}
	});

	QUnit.test("Getter functions", function(assert) {
		assert.ok(typeof oTable._getPointerExtension === "function", "Getter for the PointerExtension exists");
		assert.ok(typeof oTable._getScrollExtension === "function", "Getter for the ScrollExtension exists");
		assert.ok(typeof oTable._getKeyboardExtension === "function", "Getter for the KeyboardExtension exists");
		assert.ok(typeof oTable._getAccRenderExtension === "function", "Getter for the AccRenderExtension exists");
		assert.ok(typeof oTable._getAccExtension === "function", "Getter for the AccExtension exists");
	});
});