/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/ColumnMenu",
	"sap/ui/table/ColumnMenuRenderer",
	"sap/ui/table/AnalyticalColumnMenuRenderer",
	"sap/ui/table/TablePersoController",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/util/PasteHelper",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/type/Float",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/CheckBox",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/RatingIndicator",
	"sap/m/Image",
	"sap/m/Toolbar",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/plugins/DataStateIndicator"
], function(qutils, TableQUnitUtils, Table, Column, ColumnMenu, ColumnMenuRenderer, AnalyticalColumnMenuRenderer, TablePersoController, RowAction,
			RowActionItem, RowSettings, TableUtils, TableLibrary, SelectionPlugin,
			CoreLibrary, Control, MockServer, PasteHelper, Device, JSONModel, ODataModel, Sorter, Filter, FloatType,
			Text, Input, Label, CheckBox, Button, Link, RatingIndicator, Image, Toolbar, Menu, MenuItem, MenuM, MenuItemM, Log, library, DataStateIndicator) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// Shortcuts
	var SortOrder = TableLibrary.SortOrder;
	var SelectionMode = TableLibrary.SelectionMode;
	var VisibleRowCountMode = TableLibrary.VisibleRowCountMode;
	var NavigationMode = TableLibrary.NavigationMode;
	var SharedDomRef = TableLibrary.SharedDomRef;

	// mapping of global function calls
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;

	var sServiceURI = "/service/";

	function createODataModel(sURL) {
		sURL = sURL == null ? sServiceURI : sURL;
		return new ODataModel(sURL, {
			json: true
		});
	}

	function startMockServer(iResponseTime) {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseTime == null ? 10 : iResponseTime
		});

		var oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		var sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", sURLPrefix + "/mockdata/");
		oMockServer.start();
		return oMockServer;
	}

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

	var HeightTestControl = TableQUnitUtils.getHeightTestControl();

	function createTable(oConfig, fnCreateColumns, sModelName) {
		var sBindingPrefix = (sModelName ? sModelName + ">" : "");

		oTable = new Table(oConfig);

		if (!fnCreateColumns) {
			fnCreateColumns = function(oTable) {
				var oControl = new Text({text: "{" + sBindingPrefix + "lastName" + "}", wrapping: false});
				oTable.addColumn(new Column({
					label: new Label({text: "Last Name"}),
					template: oControl,
					sortProperty: "lastName",
					filterProperty: "lastName",
					width: "200px"
				}));
				oControl = new Text({text: "{" + sBindingPrefix + "name" + "}", wrapping: false});
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
		if (oTable) {
			oTable.destroy();
			oTable = null;
		}
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

	QUnit.test("bindRows, unbindRows", function(assert) {
		var oBindingInfo = oTable.getBindingInfo("rows");
		var oBindSpy = sinon.spy(oTable, "_bindRows");
		var oUnbindSpy = sinon.spy(oTable, "_unbindRows");
		var oChangeSpy = this.spy();
		var oDataRequestedSpy = this.spy();
		var oDataReceivedSpy = this.spy();

		oTable.unbindAggregation("rows");
		assert.ok(oUnbindSpy.calledOnce, "_unbindRows is called once");
		oTable.bindAggregation("rows", oBindingInfo);
		assert.ok(oBindSpy.calledOnce, "_bindRows is called once");
		assert.ok(oBindSpy.calledWithExactly(oBindingInfo), "_bindRows is called with the correct parameter");

		oBindSpy.reset();
		oUnbindSpy.reset();

		oTable.unbindRows();
		assert.ok(oUnbindSpy.calledOnce, "_unbindRows is called once");
		oBindingInfo.events = {
			change: oChangeSpy,
			dataRequested: oDataRequestedSpy,
			dataReceived: oDataReceivedSpy
		};
		oTable.bindRows(oBindingInfo);
		assert.ok(oBindSpy.calledOnce, "_bindRows is called once");
		assert.ok(oBindSpy.calledWithExactly(oBindingInfo), "_bindRows is called with the correct parameter");

		oChangeSpy.reset();
		var oBinding = oTable.getBinding("rows");
		oBinding.fireEvent("change");
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");

		assert.ok(oChangeSpy.calledOnce, "The change event listener was called once");
		assert.ok(oDataRequestedSpy.calledOnce, "The dataRequested event listener was called once");
		assert.ok(oDataReceivedSpy.calledOnce, "The dataReceived event listener was called once");

		oTable._bRowsBeingBound = true;
		oUnbindSpy.reset();
		oTable.unbindAggregation("rows");
		assert.ok(!oUnbindSpy.called, "_unbindRows is not called");
	});

	QUnit.test("Initialize skip propagation", function(assert) {
		var oTable = new Table();

		assert.deepEqual(oTable.mSkipPropagation, {
			rowActionTemplate: true,
			rowSettingsTemplate: true
		}, "Skip propagation is correctly initialized for template aggregations");

		oTable.destroy();
	});

	QUnit.test("Properties", function(assert) {
		assert.equal(oTable.$().find(".sapUiTableHdr").text(), "TABLEHEADER", "Title of Table is correct!");
		assert.equal(oTable.getToolbar().$().find("button").text(), "Modify Table Properties...", "Toolbar and toolbar button are correct!");
		assert.equal(oTable.$().find(".sapUiTableFtr").text(), "Footer", "Title of Table is correct!");
		assert.equal(oTable.getSelectionMode(), "Single", "Selection mode is Single!");
		assert.equal(oTable.getSelectedIndex(), -1, "Selected Index is -1!");
		assert.equal(oTable.$().find(".sapUiTableCtrl tr.sapUiTableTr").length, oTable.getVisibleRowCount(), "Visible Row Count correct!");
		assert.equal(oTable.$().find(".sapUiTableRowSelectionCell").length, oTable.getVisibleRowCount(), "Visible Row Count correct!");
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
		assert.equal(oColFirstName.getFiltered(), false, "Column FirstName is not filtered anymore");
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
		oTable.filter(oColFirstName);
		oTable.filter(oColMoney, null);
		assert.equal(oColFirstName.getFiltered() && oColMoney.getFiltered(), false, "Column FirstName and Money are not filtered anymore");
		assert.equal(oTable.getBinding("rows").iLength, 200, "RowCount after removing filter");

		assert.throws(
			function() {
				oTable.filter(oColFirstName, true);
			},
			"Throws error if the filter value is not a string"
		);
	});

	QUnit.test("SelectionMode", function(assert) {
		oTable.setSelectionMode(SelectionMode.MultiToggle);
		assert.strictEqual(oTable.getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode set to MultiToggle");
		oTable.setSelectionMode(SelectionMode.Single);
		assert.strictEqual(oTable.getSelectionMode(), SelectionMode.Single, "SelectionMode set to Single");
		oTable.setSelectionMode(SelectionMode.Multi);
		assert.strictEqual(oTable.getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode defaults to MultiToggle, if Multi is set");
		oTable.setSelectionMode(SelectionMode.None);
		assert.strictEqual(oTable.getSelectionMode(), SelectionMode.None, "SelectionMode set to None");

		oTable._enableLegacyMultiSelection();
		oTable.setSelectionMode(SelectionMode.Multi);
		assert.strictEqual(oTable.getSelectionMode(), SelectionMode.MultiToggle,
			"SelectionMode defaults to MultiToggle, if Multi is set when legacy multi selection is enabled");
	});

	QUnit.test("SelectionMode = None", function(assert) {
		oTable.setSelectionMode(SelectionMode.None);

		oTable.setSelectedIndex(1);
		assert.deepEqual(oTable.getSelectedIndices(), [], "setSelectedIndex does not select in SelectionMode=\"None\"");

		oTable.setSelectionInterval(1, 1);
		assert.deepEqual(oTable.getSelectedIndices(), [], "setSelectionInterval does not select in SelectionMode=\"None\"");

		oTable.addSelectionInterval(1, 1);
		assert.deepEqual(oTable.getSelectedIndices(), [], "addSelectionInterval does not select in SelectionMode=\"None\"");
	});

	QUnit.test("SelectedIndex", function(assert) {
		oTable.setSelectedIndex(8);
		assert.equal(oTable.getSelectedIndex(), 8, "Selected Index is 8!");
	});

	QUnit.test("Check Selection of Last fixedBottomRow", function(assert) {
		oTable.setFixedBottomRowCount(3);
		//sap.ui.getCore().applyChanges();

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
		var fnError = sinon.spy(Log, "error");
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
		fnError.restore(); // restoring original Log.error() method, else exception is thrown
	});

	QUnit.test("MinAutoRowCount", function(assert) {
		var oErrorLogSpy = sinon.spy(Log, "error");

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
		oTable.setEnableColumnReordering(true);
		assert.equal(oTable.getEnableColumnReordering(), true, "Reordering is allowed");
	});

	QUnit.test("FirstVisibleRow", function(assert) {
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

	QUnit.test("ColumnHeaderVisible", function(assert) {
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), false, "ColumnHeaderVisible ok");
		oTable.setColumnHeaderVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), true, "ColumnHeaderVisible ok");
	});

	QUnit.test("Column headers active state styling", function(assert) {
		var aColumns = oTable.getColumns();
		oTable.setEnableColumnReordering(false);
		sap.ui.getCore().applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"),
			"Column has active state styling because of the column header popup");
		assert.ok(!aColumns[4].$().hasClass("sapUiTableHeaderCellActive"),
			"Column has no active state styling because the reordering is disabled and the column doesn't have a column header popup");

		oTable.setEnableColumnReordering(true);
		sap.ui.getCore().applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
		assert.ok(aColumns[4].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");

		oTable.attachColumnSelect(function(oEvent) {
			oEvent.preventDefault();
		});
		oTable.setEnableColumnReordering(false);
		sap.ui.getCore().applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
		assert.ok(aColumns[4].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
	});

	QUnit.test("Row Height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var sequence = Promise.resolve();

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		oTable.removeAllColumns();
		oTable.addColumn(new Column({template: new HeightTestControl({height: "1px"})}));
		oTable.addColumn(new Column({template: new HeightTestControl({height: "1px"})}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				oTable.setVisibleRowCountMode(mTestSettings.visibleRowCountMode);
				oTable.setRowHeight(mTestSettings.rowHeight || 0);
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();

				return new Promise(function(resolve) {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
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
			});
		}

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCozy",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCozy
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCompact",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCompact
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCondensed",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCondensed
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: undefined,
				expectedHeight: TableUtils.DefaultRowHeight.undefined
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
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

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					templateHeight: 87,
					expectedHeight: sVisibleRowCountMode === VisibleRowCountMode.Auto ? 56 : 88
				});
			});
		});

		return sequence.then(function() {
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");
			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});

	QUnit.test("Column Header Height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var sequence = Promise.resolve();
		var iPadding = 14;

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		oTable.removeAllColumns();
		oTable.addColumn(new Column({label: new HeightTestControl({height: "1px"}), template: new HeightTestControl()}));
		oTable.addColumn(new Column({label: new HeightTestControl({height: "1px"}), template: new HeightTestControl()}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				oTable.setVisibleRowCountMode(mTestSettings.visibleRowCountMode);
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.setRowHeight(mTestSettings.rowHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();

				return new Promise(function(resolve) {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
				var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
				mTestSettings.title += " (VisibleRowCountMode=\"" + mTestSettings.visibleRowCountMode + "\""
									   + ", Density=\"" + sDensity + "\")";

				var aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
				var oColumnHeaderCnt = oTable.getDomRef().querySelector(".sapUiTableColHdrCnt");

				assert.strictEqual(aRowDomRefs[0].getBoundingClientRect().height, mTestSettings.expectedHeight,
								   mTestSettings.title + ": Fixed part height is ok");
				assert.strictEqual(aRowDomRefs[1].getBoundingClientRect().height, mTestSettings.expectedHeight,
								   mTestSettings.title + ": Scrollable part height is ok");
				assert.strictEqual(oColumnHeaderCnt.getBoundingClientRect().height, mTestSettings.expectedHeight + 1 /* border */,
								   mTestSettings.title + ": Column header container height is ok");
			});
		}

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCozy",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCozy
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCompact",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCompact
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: "sapUiSizeCondensed",
				expectedHeight: TableUtils.DefaultRowHeight.sapUiSizeCompact
			});

			test({
				title: "Default height",
				visibleRowCountMode: sVisibleRowCountMode,
				density: undefined,
				expectedHeight: TableUtils.DefaultRowHeight.undefined
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Default height with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight)",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					expectedHeight: 56
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (columnHeaderHeight)",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					columnHeaderHeight: 55,
					expectedHeight: 55
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight = columnHeaderHeight)",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					columnHeaderHeight: 55,
					expectedHeight: 55
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight < columnHeaderHeight)",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					columnHeaderHeight: 80,
					expectedHeight: 80
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight > columnHeaderHeight)",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 80,
					columnHeaderHeight: 55,
					expectedHeight: 55
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight) with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (columnHeaderHeight) with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					columnHeaderHeight: 55,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight = columnHeaderHeight) with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					columnHeaderHeight: 55,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight < columnHeaderHeight) with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 55,
					columnHeaderHeight: 80,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		[VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto].forEach(function(sVisibleRowCountMode) {
			aDensities.forEach(function(sDensity) {
				test({
					title: "Application defined height (rowHeight > columnHeaderHeight) with large content",
					visibleRowCountMode: sVisibleRowCountMode,
					density: sDensity,
					rowHeight: 80,
					columnHeaderHeight: 55,
					labelHeight: 87,
					expectedHeight: 87 + iPadding
				});
			});
		});

		sequence = sequence.then(function() {
			oTable.insertColumn(new Column({
				label: new Text({text: "a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a"}),
				template: new HeightTestControl(),
				width: "100px"
			}), 1);

			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			var aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
			var iHeightWithoutIcons = Device.browser.msie ? aRowDomRefs[0].offsetHeight : aRowDomRefs[0].getBoundingClientRect().height;
			var iFixedPartHeight;
			var iScrollablePartHeight;

			oTable.getColumns()[1].setSorted(true);
			oTable.getColumns()[1].setFiltered(true);
			iFixedPartHeight = Device.browser.msie ? aRowDomRefs[0].offsetHeight : aRowDomRefs[0].getBoundingClientRect().height;
			iScrollablePartHeight = Device.browser.msie ? aRowDomRefs[1].offsetHeight : aRowDomRefs[1].getBoundingClientRect().height;
			assert.ok(iFixedPartHeight > iHeightWithoutIcons, "Height increased after adding icons");
			assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after adding icons");

			oTable.getColumns()[1].setSorted(false);
			oTable.getColumns()[1].setFiltered(false);
			iFixedPartHeight = Device.browser.msie ? aRowDomRefs[0].offsetHeight : aRowDomRefs[0].getBoundingClientRect().height;
			iScrollablePartHeight = Device.browser.msie ? aRowDomRefs[1].offsetHeight : aRowDomRefs[1].getBoundingClientRect().height;
			assert.strictEqual(iFixedPartHeight, iHeightWithoutIcons, "After removing the icons, the height is the same as before");
			assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after removing icons");
		}).then(function() {
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");
			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});

		return sequence;
	});

	QUnit.test("Skip _updateTableSizes if table has no width", function(assert) {
		var oDomRef = oTable.getDomRef();
		var oResetRowHeights = sinon.spy(oTable, "_resetRowHeights"); // _resetRowHeights is used to check if a layout update was performed

		oDomRef.style.width = "100px";
		oDomRef.style.height = "100px";
		oTable._updateTableSizes();
		assert.ok(oResetRowHeights.called, "The table has a height and width -> _updateTableSizes was executed");
		oResetRowHeights.reset();

		oDomRef.style.height = "0px";
		oTable._updateTableSizes();
		assert.ok(oResetRowHeights.called, "The table has no height -> _updateTableSizes was executed");
		oResetRowHeights.reset();

		oDomRef.style.width = "0px";
		oDomRef.style.height = "100px";
		oTable._updateTableSizes();
		assert.ok(oResetRowHeights.notCalled, "The table has no width -> _updateTableSizes was not executed");
		oResetRowHeights.reset();
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
		oTable.getRowSettingsTemplate().setHighlight(CoreLibrary.MessageType.Success);
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.notCalled, "Changing the highlight property of the template did not cause the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.None,
			"Changing the highlight property of the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.reset();
		oTable.getRowSettingsTemplate().invalidate();
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Invalidating the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.None,
			"Invalidating the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.reset();
		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: CoreLibrary.MessageType.Warning
		}));
		sap.ui.getCore().applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Changing the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.Warning,
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
				assert.ok(oInvalidateSpy.calledOnce, sChangesTestMessage + ": The table was invalidated");
			} else {
				assert.ok(oInvalidateSpy.notCalled, sChangesTestMessage + ": The table was not invalidated");
			}

			assert.strictEqual(oTable._bRtlMode !== null, bRTLChanged,
				"The flag _bRtlMode of the table was " + (bRTLChanged ? "" : " not") + " updated");

			assert.strictEqual(oTable._oCellContextMenu === null, bLanguageChanged,
				"The cell context menu was " + (bLanguageChanged ? "" : " not") + " reset");

			assert.strictEqual(oTable.getColumns()[0].getMenu()._bInvalidated, bLanguageChanged,
				"The column menu was " + (bLanguageChanged ? "" : " not") + " invalidated");
		}

		function test(bChangeTextDirection, bChangeLanguage) {
			var mChanges = {changes: {}};

			oTable._bRtlMode = null;
			oTable._oCellContextMenu = new Control();
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
				setTimeout(function() {
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
		oTable.setRowActionTemplate(new RowAction({
			items: new RowActionItem()
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
		assert.equal(oMenu.getPopup().getOpenState(), CoreLibrary.OpenState.OPEN, "ColumnMenu open");
		oMenu.close();
		oColumn.detachColumnMenuOpen(fnHandler);

		oColumn.attachColumnMenuOpen(fnHandlerPreventDefault);
		oColumn._openMenu();
		assert.equal(oMenu.getPopup().getOpenState(), CoreLibrary.OpenState.CLOSED, "PreventDefault, ColumnMenu not open");
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

		assert.equal(oColumn0.getVisible(), true, "lastName column is still visible (preventDefault)");

		oMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(sVisibilityMenuItemId + "-menu-item-1", "click");

		assert.equal(oColumn1.getVisible(), false, "firstName column is invisible (no preventDefault)");
	});

	QUnit.test("CustomColumnMenu", function(assert) {
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

	QUnit.module("Get contexts from client binding", {
		before: function() {
			this.oGetContextsSpy = sinon.spy(sap.ui.table.Table.prototype, "_getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = 500;
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
		},
		createTable: function(sVisibleRowCountMode) {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				rows: {path: "/"},
				rowHeight: 50,
				models: new JSONModel(new Array(100))
			});

			return this.oTable;
		}
	});

	QUnit.test("VisibleRowCountMode = Fixed: Initialization", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Fixed);
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Binding#getContexts was called once");  // render
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Interactive: Initialization", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Interactive);
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Binding#getContexts was called once");  // render
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Initialization", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto);
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 2, "Binding#getContexts was called 2 times");  // updateRows, render
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The second call to Binding#getContexts considers the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Resize", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto);
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oGetContextsSpy.reset();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Binding#getContexts was called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The call to Binding#getContexts considers the visible row count");
			oGetContextsSpy.reset();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Binding#getContexts was called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The call to Binding#getContexts considers the visible row count");
			oGetContextsSpy.reset();
		});
	});

	QUnit.module("Get contexts from OData binding", {
		before: function() {
			sinon.stub(ODataModel, "_getSharedData", function() {return {};}); // Avoid caching of metadata across tests.
			this.oMockServer = startMockServer();
			this.oDataModel = createODataModel();
			this.oGetContextsSpy = sinon.spy(sap.ui.table.Table.prototype, "_getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = 500;

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			ODataModel._getSharedData.restore();
			this.oMockServer.destroy();
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
		},
		createTable: function(sVisibleRowCountMode, oModel) {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				rows: {path : "/Products"},
				rowHeight: 50,
				models: oModel ? oModel : this.oDataModel
			});

			return this.oTable;
		}
	});

	QUnit.test("VisibleRowCountMode = Fixed: Initialization when metadata not loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Fixed, createODataModel());
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, refreshRows, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 3, "Binding#getContexts was called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Fixed: Initialization when metadata loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Fixed);
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 3, "Binding#getContexts was called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Interactive: Initialization when metadata not loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Interactive, createODataModel());
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, refreshRows, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 3, "Binding#getContexts was called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Interactive: Initialization when metadata loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Interactive);
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 3, "Binding#getContexts was called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"All calls to Binding#getContexts consider the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Initialization when metadata not loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto, createODataModel());
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, render, auto rerender, refreshRows, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 4, "Binding#getContexts was called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 20, 100),
				"The second call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 20, 100),
				"The third call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The fourth call to Binding#getContexts considers the visible row count");
			assert.notEqual(oTable.getVisibleRowCount(), 20,
				"The computed request length and the visible row count should not be equal in this test");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Initialization when metadata loaded", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto);
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, auto rerender, updateRows
		return pReady.then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 4, "Binding#getContexts was called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 20, 100),
				"The second call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 20, 100),
				"The third call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The fourth call to Binding#getContexts considers the visible row count");
			assert.notEqual(oTable.getVisibleRowCount(), 20,
				"The computed request length and the visible row count should not be equal in this test");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Resize", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto);
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.ok(oGetContextsSpy.calledOnce, "Binding#getContexts was called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The call to Binding#getContexts considers the visible row count");
			oGetContextsSpy.reset();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.ok(oGetContextsSpy.calledOnce, "Binding#getContexts was called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The call to Binding#getContexts considers the visible row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Refresh", function(assert) {
		var oTable = this.createTable(VisibleRowCountMode.Auto);
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding("rows").refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok(oGetContextsSpy.calledTwice, "Binding#getContexts was called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, oTable.getVisibleRowCount(), 100),
				"The second call to Binding#getContexts considers the visible row count");
			assert.notEqual(oTable.getVisibleRowCount(), 20,
				"The computed request length and the visible row count should not be equal in this test");
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
		var iWidth = iNumberOfFixedCols * 100 /* Columns */ + TableUtils.BaseSize.sapUiSizeCozy; /* Default row header width in cozy */
		return iWidth + "px";
	}

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 2, "Fixed table has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll table has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("Content is wider than column", function(assert) {
		oTable.getColumns()[0].setWidth("60px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTable.getDomRef("table-fixed").getBoundingClientRect().width, 160, "Fixed column table has the correct width");
	});

	QUnit.test("Hide one column in fixed area", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 1, "Fixed table has 2 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll table has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(2),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("Hide one column in scroll area", function(assert) {
		oTable.getColumns()[5].setVisible(false);
		sap.ui.getCore().applyChanges();
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 2, "Fixed table has 6 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 5, "Scroll table has 3 Columns");
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
		var oHSb = oTable.getDomRef(SharedDomRef["Horizontal" + sScrollBarSuffix]);
		var oVSb = oTable.getDomRef(SharedDomRef["Vertical" + sScrollBarSuffix]);
		var done = assert.async();

		assert.ok(oHSb, "The horizontal scrollbar can be accessed with the help of SharedDomRef");
		assert.ok(oVSb, "The vertical scrollbar can be accessed with the help of SharedDomRef");
		assert.strictEqual(oTable.getFirstVisibleRow(), 1, "getFirstVisibleRow() returns 1");

		oHSb.scrollLeft = 5;

		setTimeout(function() {
			assert.equal(oVSb.scrollTop, oTable._getBaseRowHeight(), "ScrollTop can be set and read.");
			assert.equal(oHSb.scrollLeft, 5, "ScrollLeft can be set and read.");
			done();
		}, 100);
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
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 2,
			"Top left table has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 2,
			"Bottom left table has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 6,
			"Top right table has 7 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 6,
			"Bottom right table has 7 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Top left table has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed.sapUiTableCtrlRowScroll tbody tr").length, 6,
			"Bottom left table has 6 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowFixed tbody tr").length, 2,
			"Top right table has 2 rows");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll.sapUiTableCtrlRowScroll tbody tr").length, 6,
			"Bottom right table has 6 rows");
		assert.equal($table.find(".sapUiTableVSb").css("top"),
			((oTable.getFixedRowCount() * oTable._getBaseRowHeight()) + $table.find(".sapUiTableCCnt")[0].offsetTop - 1) + "px",
			"Vertical scrollbar has correct top padding");
	});

	QUnit.module("Fixed top and bottom rows and columns", {
		beforeEach: function() {
			var TestControl = TableQUnitUtils.getTestControl();

			createTable({
				fixedRowCount: 2,
				fixedBottomRowCount: 2,
				fixedColumnCount: 2,
				visibleRowCount: 8
			}, function(oTable) {
				for (var i = 0; i < 8; i++) {
					oTable.addColumn(new Column({label: new TestControl(), template: new TestControl()}));
				}
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
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 2,
			"Left fixed table has 2 columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 2,
			"Left scroll table has 2 columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScrFixed .sapUiTableCtrlRowFixedBottom .sapUiTableCtrlCol th").length, 2,
			"Left fixed bottom table has 2 columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixed .sapUiTableCtrlCol th").length, 6,
			"Right table has 6 columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowScroll .sapUiTableCtrlCol th").length, 6,
			"Right scroll table has 6 columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScr .sapUiTableCtrlRowFixedBottom .sapUiTableCtrlCol th").length, 6,
			"Right fixed bottom table has 6 columns");
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
			((oTable.getFixedRowCount() * oTable._getBaseRowHeight()) + $table.find(".sapUiTableCCnt")[0].offsetTop - 1) + "px",
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
				oControl = new CheckBox({selected: true});
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
		assert.equal(oTable.$().find(".sapUiTableColHdrTr .sapUiTableHeaderCell").length, 6, "Total count of headers");
	});

	QUnit.test("Equal widths", function(assert) {
		var $Table = oTable.$();
		var $Head1 = $Table.find(".sapUiTableColHdrTr:eq(0)");
		var $Head2 = $Table.find(".sapUiTableColHdrTr:eq(1)");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(0)").width(), $Head2.find(".sapUiTableHeaderCell:eq(0)").width(),
			"First column headers have equal width");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(1)").width(), $Head2.find(".sapUiTableHeaderCell:eq(1)").width(),
			"Second column headers have equal width");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(2)").width(), $Head2.find(".sapUiTableHeaderCell:eq(2)").width(),
			"Third column headers have equal width");
	});

	QUnit.test("Equal heights", function(assert) {
		assert.expect(6);
		var $Table = oTable.$();

		$Table.find(".sapUiTableColHdrTr").each(function(index, row) {
			var rowIndex = index;
			var $row = jQuery(row);
			var rowHeight = $row.height();
			$row.children(".sapUiTableHeaderCell").each(function(index, cell) {
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
		},
		afterEach: function() {
			oExport.destroy();
			oExport = null;
			destroyTable();
		}
	});

	QUnit.test("Export filtered table with named model", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/core/util/ExportTypeCSV"], function(ExportTypeCSV) {
			oExport = oTable.exportData({
				exportType: new ExportTypeCSV()
			});
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
					assert.equal(sContent, sExpected, "Generated file content is correct.");
				})
				.fail(function() {
					assert.ok(false, "Generate should not fail.");
				})
				.always(function() {
					done();
				});
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
				cell = aSortedColumns[0].$();
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is shown");
				assert.ok(!cell.hasClass("sapUiTableColSortedD"), "Sort icon is ascending");

				cell = aSortedColumns[1].$();
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is shown");
				assert.ok(cell.hasClass("sapUiTableColSortedD"), "Sort icon is descending");

				oTable.detachEvent("_rowsUpdated", fnHandler);

				oTable.rerender();
				cell = aSortedColumns[0].$();
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is still shown after rendering");
				assert.ok(!cell.hasClass("sapUiTableColSortedD"), "Sort icon is ascending");

				cell = aSortedColumns[1].$();
				assert.ok(cell.hasClass("sapUiTableColSorted"), "Sort icon is still shown after rendering");
				assert.ok(cell.hasClass("sapUiTableColSortedD"), "Sort icon is descending");

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
		var oDestroyRows = this.spy(oTable, "destroyRows");

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
		assert.ok(oDestroyRows.notCalled, "destroyRows was not called");
	});

	QUnit.test("Bind rows using bindRows method - legacy API", function(assert) {
		var oInnerBindRows = this.spy(oTable, "_bindRows");
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
		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");
		this.assertBindingInfo(assert, "(sPath)", oTable.getBindingInfo("rows"), {
			path: "/modelData"
		});
		oInnerBindRows.reset();

		// (sPath, oSorter)
		oTable.bindRows("/modelData", oSorter);
		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");
		this.assertBindingInfo(assert, "(sPath, oSorter)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter
		});
		oInnerBindRows.reset();

		// (sPath, oSorter, aFilters)
		oTable.bindRows("/modelData", oSorter, [oFilter]);
		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");
		this.assertBindingInfo(assert, "(sPath, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter,
			filters: [oFilter]
		});
		oInnerBindRows.reset();

		// (sPath, vTemplate, oSorter, aFilters)
		oTable.bindRows("/modelData", oTemplate, oSorter, [oFilter]);
		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");
		this.assertBindingInfo(assert, "(sPath, vTemplate, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
			path: "/modelData",
			sorter: oSorter,
			filters: [oFilter],
			template: oTemplate
		});
	});

	QUnit.test("Bind rows using the constructor", function(assert) {
		var oInnerBindRows = this.spy(Table.prototype, "_bindRows");

		/*eslint-disable no-new */
		new Table({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});
		/*eslint-enable no-new */

		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");

		oInnerBindRows.restore();
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
		], "The binding event listeners were called in the correct order");
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

	QUnit.module("Event: _rowsUpdated", {
		before: function() {
			this.oQunitFixture = document.getElementById("qunit-fixture");
			this.sOriginalQUnitFixtureHeight = this.oQunitFixture.style.height;
			this.sOriginalQUnitFixtureDisplay = this.oQunitFixture.style.display;
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
			this.restoreQUnitFixtureHeight();
			this.restoreQUnitFixtureDisplay();
		},
		/**
		 * Creates a table with a JSON model.
		 *
		 * @param {sap.ui.table.VisibleRowCountMode} sVisibleRowCountMode The visible row count mode.
		 * @param {boolean} [bWithBinding=true] Whether the rows aggregation should be bound.
		 * @param {function(sap.ui.table.Table)} [fnBeforePlaceAt] Before place at callback.
		 * @returns {sap.ui.table.Table} The created table.
		 */
		createTableWithJSONModel: function(sVisibleRowCountMode, bWithBinding, fnBeforePlaceAt) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable({
				rows: bWithBinding !== false ? "{/}" : "",
				visibleRowCountMode: sVisibleRowCountMode,
				models: new JSONModel(new Array(100)),
				columns: [
					new Column({
						label: new Label({text: "Last Name"}),
						template: new Text({text: "{lastName}"}),
						sortProperty: "lastName",
						filterProperty: "lastName"
					})
				]
			}, fnBeforePlaceAt);

			return this.oTable;
		},
		/**
		 * Creates a table with an OData model.
		 *
		 * @param {sap.ui.table.VisibleRowCountMode} sVisibleRowCountMode The visible row count mode.
		 * @param {boolean} [bWithBinding=true] Whether the rows aggregation should be bound.
		 * @param {function(sap.ui.table.Table)} [fnBeforePlaceAt] Before place at callback.
		 * @returns {sap.ui.table.Table} The created table.
		 */
		createTableWithODataModel: function(sVisibleRowCountMode, bWithBinding, fnBeforePlaceAt) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable({
				rows: bWithBinding !== false ? "{/Products}" : "",
				visibleRowCountMode: sVisibleRowCountMode,
				models: createODataModel(),
				columns: [
					new Column({
						label: new Label({text: "Name"}),
						template: new Text({text: "{Name}"}),
						sortProperty: "Name",
						filterProperty: "Name"
					})
				]
			}, fnBeforePlaceAt);

			return this.oTable;
		},
		checkRowsUpdated: function(assert, aActualReasons, aExpectedReasons, iDelay) {
			var that = this;

			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.deepEqual(aActualReasons, aExpectedReasons,
						"VisibleRowCountMode: " + that.oTable.getVisibleRowCountMode() + " - "
						+ (aExpectedReasons.length > 0
						   ? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
						   : "The event _rowsUpdated has not been fired")
					);

					resolve();
				}, iDelay == null ? 250 : iDelay);
			});
		},
		setQUnitFixtureHeight: function(sHeight) {
			this.oQunitFixture.style.height = sHeight;

			return new Promise(function(resolve) {
				window.requestAnimationFrame(resolve);
			});
		},
		restoreQUnitFixtureHeight: function() {
			return this.setQUnitFixtureHeight(this.sOriginalQUnitFixtureHeight);
		},
		setQUnitFixtureDisplay: function(sDisplay) {
			this.oQunitFixture.style.display = sDisplay;

			return new Promise(function(resolve) {
				window.requestAnimationFrame(resolve);
			});
		},
		restoreQUnitFixtureDisplay: function() {
			return this.setQUnitFixtureDisplay(this.sOriginalQUnitFixtureDisplay);
		}
	});

	QUnit.test("_fireRowsUpdated", function(assert) {
		var done = assert.async();
		var oTable = new Table();
		var sTestReason = "test_reason";

		oTable.attachEventOnce("_rowsUpdated", function(oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), sTestReason, "The event has been fired with the correct reason");
			oTable.destroy();
			done();
		});

		oTable._fireRowsUpdated(sTestReason);
	});

	QUnit.test("Initial rendering without binding", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithJSONModel(sVisibleRowCountMode, false, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		_createTable(VisibleRowCountMode.Fixed);
		return this.checkRowsUpdated(assert, aFiredReasons, []).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		});
	});

	QUnit.test("Initial rendering without binding in invisible container", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithJSONModel(sVisibleRowCountMode, false, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		return this.setQUnitFixtureDisplay("none").then(function() {
			_createTable(VisibleRowCountMode.Fixed);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		});
	});

	QUnit.test("Initial rendering with client binding", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithJSONModel(sVisibleRowCountMode, true, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		_createTable(VisibleRowCountMode.Fixed);
		return this.checkRowsUpdated(assert, aFiredReasons, [
			TableUtils.RowsUpdateReason.Render
		]).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Initial rendering with client binding in invisible container", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithJSONModel(sVisibleRowCountMode, true, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		return this.setQUnitFixtureDisplay("none").then(function() {
			_createTable(VisibleRowCountMode.Fixed);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Initial rendering with OData binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithODataModel(sVisibleRowCountMode, true, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		_createTable(VisibleRowCountMode.Fixed);
		return this.checkRowsUpdated(assert, aFiredReasons, [
			TableUtils.RowsUpdateReason.Render
		]).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Initial rendering with OData binding in invisible container", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function _createTable(sVisibleRowCountMode, iRowHeight) {
			oTable = that.createTableWithODataModel(sVisibleRowCountMode, true, function(oTable) {
				aFiredReasons = [];
				oTable.setRowHeight(iRowHeight);
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});
			});
		}

		return this.setQUnitFixtureDisplay("none").then(function() {
			_createTable(VisibleRowCountMode.Fixed);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Interactive);
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			_createTable(VisibleRowCountMode.Auto);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {

			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			// No need to adjust row count after rendering. The table starts with 10 rows, and only 10 rows with a height of 90px fit.
			_createTable(VisibleRowCountMode.Auto, 90);
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Re-render without binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed, false);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		function setVisibleRowCountMode(sNewVisibleRowCountMode) {
			oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);
			sap.ui.getCore().applyChanges();
			return oTable.qunit.whenRenderingFinished();
		}

		return this.oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Interactive);
		}).then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Auto);
		}).then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			oTable.setRowHeight(oTable._getDefaultRowHeight() + 20); // The table would show less rows.
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		});
	});

	QUnit.test("Re-render without binding in invisible container", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed, false);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		function setVisibleRowCountMode(sNewVisibleRowCountMode) {
			oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);
			sap.ui.getCore().applyChanges();
			return oTable.qunit.whenRenderingFinished();
		}

		return this.oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Interactive);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Auto);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.setRowHeight(oTable._getDefaultRowHeight() + 20); // The table would show less rows.
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		});
	});

	QUnit.test("Re-render with binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		function setVisibleRowCountMode(sNewVisibleRowCountMode) {
			oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);
			sap.ui.getCore().applyChanges();
			return oTable.qunit.whenNextRowsUpdated();
		}

		return this.oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Interactive);
		}).then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Auto);
		}).then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			oTable.setRowHeight(oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Re-render with binding in invisible container", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		function setVisibleRowCountMode(sNewVisibleRowCountMode) {
			oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);
			sap.ui.getCore().applyChanges();
			return oTable.qunit.whenRenderingFinished();
		}

		return this.oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Interactive);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, []);

		}).then(function() {
			return setVisibleRowCountMode(VisibleRowCountMode.Auto);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.invalidate();
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			aFiredReasons = [];
			return that.setQUnitFixtureDisplay("none");
		}).then(function() {
			oTable.setRowHeight(oTable._getDefaultRowHeight() + 20); // The table would show less rows.
			sap.ui.getCore().applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			return that.restoreQUnitFixtureDisplay();
		}).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Re-render and refresh", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding("rows").attachEventOnce("change", function() {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.invalidate();
				oTable.getBinding("rows").refresh(true);
				sap.ui.getCore().applyChanges();

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Render
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Changing VisibleRowCountMode (VisibleRowCount stays unchanged)", function(assert) {
		var aFiredReasons = [];
		var iVisibleRowCount = null;
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		function _createTable(sVisibleRowCountMode) {
			oTable = that.createTableWithJSONModel(sVisibleRowCountMode, null, function(oTable) {
				oTable.setVisibleRowCount(iVisibleRowCount);
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				if (iVisibleRowCount == null) {
					iVisibleRowCount = oTable.getVisibleRowCount();
				}
			});
		}

		function test(sInitialVisibleRowCountMode, sNewVisibleRowCountMode) {
			return _createTable(sInitialVisibleRowCountMode).then(function() {
				aFiredReasons = [];
				oTable.attachEvent("_rowsUpdated", function(oEvent) {
					aFiredReasons.push(oEvent.getParameter("reason"));
				});

				oTable.setVisibleRowCountMode(sNewVisibleRowCountMode);
				sap.ui.getCore().applyChanges();

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Render
				]);
			});
		}

		return test(VisibleRowCountMode.Auto, VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Auto, VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Fixed, VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Fixed, VisibleRowCountMode.Auto);
		}).then(function() {
			return test(VisibleRowCountMode.Interactive, VisibleRowCountMode.Fixed);
		}).then(function() {
			return test(VisibleRowCountMode.Interactive, VisibleRowCountMode.Auto);
		});
	});

	QUnit.test("Refresh", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding("rows").attachEventOnce("change", function() {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.getBinding("rows").refresh(true);

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Change
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Sort with client binding", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithJSONModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				aFiredReasons = [];
				oTable.sort(oTable.getColumns()[0], "Ascending");

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Sort
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		});
	});

	QUnit.test("Sort with OData binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding("rows").attachEventOnce("change", function() {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.sort(oTable.getColumns()[0], "Ascending");

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Sort
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Filter with client binding", function(assert) {
		var aFiredReasons = [];
		var that = this;

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithJSONModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				aFiredReasons = [];
				oTable.filter(oTable.getColumns()[0], "test");

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Filter
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		});
	});

	QUnit.test("Filter with OData binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding("rows").attachEventOnce("change", function() {
					oTable.attachEventOnce("_rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.filter(oTable.getColumns()[0], "test");

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Filter
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Expand", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed, null, function(oTable) {
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			TableUtils.Grouping.setupExperimentalGrouping(oTable);
		});

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unknown
			]);
		});
	});

	QUnit.test("Collapse", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed, null, function(oTable) {
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			TableUtils.Grouping.setupExperimentalGrouping(oTable);
		});

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unknown
			]);
		});
	});

	QUnit.test("Unbind", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.unbindRows();

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Unbind
			]);
		});
	});

	QUnit.test("Bind with client binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);
		var oBindingInfo = oTable.getBindingInfo("rows");

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.unbindRows();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			aFiredReasons = [];
			oTable.bindRows(oBindingInfo);

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Change
			]);
		});
	});

	QUnit.test("Bind with OData binding", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oMockServer = startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);
			var oBindingInfo = oTable.getBindingInfo("rows");

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return oTable.qunit.whenBindingChange().then(oTable.qunit.whenRenderingFinished).then(function() {
				oTable.unbindRows();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				aFiredReasons = [];
				oTable.bindRows(oBindingInfo);

				return that.checkRowsUpdated(assert, aFiredReasons, [
					TableUtils.RowsUpdateReason.Change
				]);
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		}).then(function() {
			return test(VisibleRowCountMode.Auto);
		}).then(function() {
			oMockServer.destroy();
		});
	});

	QUnit.test("Vertical scrolling", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 100;

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.VerticalScroll
			]);
		});
	});

	QUnit.test("Change first visible row by API call (setFirstVisibleRow)", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.setFirstVisibleRow(1);

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]);
		});
	});

	QUnit.test("Resize", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Auto);
		var sOriginalTableParentHeight = oTable.getDomRef().parentElement.style.height;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.getDomRef().parentElement.style.height = "500px";

			return new Promise(function(resolve) {
				window.requestAnimationFrame(function() {
					that.checkRowsUpdated(assert, aFiredReasons, [
						TableUtils.RowsUpdateReason.Resize
					], 500).then(function() {
						oTable.getDomRef().parentElement.style.height = sOriginalTableParentHeight;
						resolve();
					});
				});
			});
		});
	});

	QUnit.test("Personalization", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
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

			return new Promise(function(resolve) {
				window.requestAnimationFrame(function() {
					that.checkRowsUpdated(assert, aFiredReasons, []).then(function() {
						oPersoController.destroy();
						resolve();
					});
				});
			});
		});
	});

	QUnit.test("Animation", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Auto);

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

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.setProperty("rowHeight", 30, true);
			fireTransitionEndEvent();

			return new Promise(function(resolve) {
				window.requestAnimationFrame(function() {
					that.checkRowsUpdated(assert, aFiredReasons, [
						TableUtils.RowsUpdateReason.Animation
					], 500).then(resolve);
				});
			});
		});
	});

	QUnit.test("Render when theme not applied", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oCore = sap.ui.getCore();
		var oIsThemeApplied = sinon.stub(oCore, "isThemeApplied").returns(false);
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Auto);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return this.checkRowsUpdated(assert, aFiredReasons, []).then(function() {
			aFiredReasons = [];
			oTable.invalidate();
			oCore.applyChanges();
			return that.checkRowsUpdated(assert, aFiredReasons, []);
		}).then(function() {
			aFiredReasons = [];
			oIsThemeApplied.returns(true);
			oTable.onThemeChanged();
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(function() {
			oIsThemeApplied.restore();
		});
	});

	QUnit.test("Theme change", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTableWithJSONModel(VisibleRowCountMode.Fixed);

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.onThemeChanged();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.module("Paste", {
		beforeEach: function() {
			var PasteTestControl = this.PasteTestControl;
			createTable({
				visibleRowCount: 1,
				fixedColumnCount: 1,
				selectionMode: SelectionMode.MultiToggle,
				rowActionCount: 1,
				rowActionTemplate: new RowAction({items: [new RowActionItem()]}),
				title: new PasteTestControl({tagName: "div", handleOnPaste: false}),
				toolbar: new Toolbar({active: true, content: [new PasteTestControl({tagName: "div", handleOnPaste: false})]}),
				extension: [new PasteTestControl({tagName: "div", handleOnPaste: false})],
				footer: new PasteTestControl({tagName: "div", handleOnPaste: false})
			}, function(oTable) {
				["div", "input", "textarea"].forEach(function(sTagName) {
					oTable.addColumn(new Column({
						label: new PasteTestControl({tagName: sTagName, handleOnPaste: false}),
						template: new PasteTestControl({tagName: sTagName, handleOnPaste: false})
					}));
					oTable.addColumn(new Column({
						label: new PasteTestControl({tagName: sTagName, handleOnPaste: true}),
						template: new PasteTestControl({tagName: sTagName, handleOnPaste: true})
					}));
				});
			});
			this.oPasteSpy = sinon.spy(function(oEvent) {
				this.oPasteSpy._mEventParameters = oEvent.mParameters;
			}.bind(this));
			oTable.attachPaste(this.oPasteSpy);
		},
		afterEach: function() {
			this.oPasteSpy = null;
			destroyTable();
		},
		PasteTestControl: Control.extend("sap.ui.table.test.PasteTestControl", {
			metadata: {
				properties: {
					tagName: {type: "string"},
					handleOnPaste: {type: "boolean"}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart(oControl.getTagName(), oControl).attr("tabindex", "-1").openEnd();
					oRm.close(oControl.getTagName());
				}
			},
			onpaste: function(oEvent) {
				if (this.getHandleOnPaste()) {
					oEvent.setMarked();
				}
			},
			allowsPasteOnTable: function() {
				return this.getTagName() !== "input" && this.getTagName() !== "textarea" && !this.getHandleOnPaste();
			}
		}),
		createPasteEvent: function(sData) {
			var oEvent;

			function getData() {
				return sData;
			}

			var oClipboardData = {getData: getData};

			if (typeof Event === "function") {

				if (Device.browser.chrome) {
					oClipboardData = new DataTransfer();
					oClipboardData.setData("text/plain", sData);

					oEvent = new ClipboardEvent("paste", {
						bubbles: true,
						cancelable: true,
						clipboardData: oClipboardData
					});
				} else {
					oEvent = new Event("paste", {
						bubbles: true,
						cancelable: true
					});
					oEvent.clipboardData = oClipboardData;
				}

			} else { // IE
				oEvent = document.createEvent("Event");
				oEvent.initEvent("paste", true, true);
				oEvent.clipboardData = oClipboardData;
			}

			return oEvent;
		},
		test: function(assert, sTestTitle, oHTMLElement, bShouldFireOnce) {
			var sData = "data";
			sTestTitle = sTestTitle == null ? "" : sTestTitle + ": ";

			oHTMLElement.focus();
			if (oHTMLElement === document.activeElement) {
				oHTMLElement.dispatchEvent(this.createPasteEvent(sData));
			}

			assert.strictEqual(this.oPasteSpy.callCount, bShouldFireOnce ? 1 : 0,
				sTestTitle + "The paste event was fired the correct number of times");

			if (this.oPasteSpy.callCount === 1 && bShouldFireOnce) {
				assert.deepEqual(this.oPasteSpy._mEventParameters.data, [[sData]], sTestTitle + "The data parameter has the correct value");
			}

			this.oPasteSpy.reset();
		}
	});

	QUnit.test("Elements where the paste event should not be fired", function(assert) {
		this.test(assert, "Title control", oTable.getTitle().getDomRef(), false);
		this.test(assert, "Toolbar control", oTable.getToolbar().getDomRef(), false);
		this.test(assert, "Toolbar content control", oTable.getToolbar().getContent()[0].getDomRef(), false);
		this.test(assert, "Extension control", oTable.getExtension()[0].getDomRef(), false);
		this.test(assert, "Footer control", oTable.getFooter().getDomRef(), false);
	});

	QUnit.test("NoData", function(assert) {
		oTable.unbindRows();
		sap.ui.getCore().applyChanges();
		this.test(assert, null, oTable.getDomRef("noDataCnt"), true);
	});

	QUnit.test("Cells", function(assert) {
		this.test(assert, "SelectAll", getSelectAll(null, null, oTable)[0], true);
		this.test(assert, "Header cell in fixed column", getColumnHeader(0, null, null, oTable)[0], true);
		this.test(assert, "Header cell in scrollable column", getColumnHeader(1, null, null, oTable)[0], true);
		this.test(assert, "Row selector cell", getRowHeader(0, null, null, oTable)[0], true);
		this.test(assert, "Content cell in fixed column", getCell(0, 0, null, null, oTable)[0], true);
		this.test(assert, "Content cell in scrollable column", getCell(0, 1, null, null, oTable)[0], true);
		this.test(assert, "Row action cell", getRowAction(0, null, null, oTable)[0], true);
	});

	QUnit.test("Cell content", function(assert) {
		oTable.getColumns().forEach(function(oColumn) {
			var oControl = oColumn.getLabel();
			this.test(assert, "Header - Column " + oColumn.getIndex(), oControl.getDomRef(), oControl.allowsPasteOnTable());
		}.bind(this));
		oTable.getColumns().forEach(function(oColumn) {
			var oControl = oTable.getRows()[0].getCells()[oColumn.getIndex()];
			this.test(assert, "Content - Column " + oColumn.getIndex(), oControl.getDomRef(), oControl.allowsPasteOnTable());
		}.bind(this));
		this.test(assert, "Content - Row action", oTable.getRows()[0].getRowAction().getAggregation("_icons")[0].getDomRef(), true);
	});

	QUnit.test("No paste data", function(assert) {
		sinon.stub(PasteHelper, "getPastedDataAs2DArray").returns([]);
		this.test(assert, "Element that allows paste on table", getCell(0, 1, null, null, oTable)[0], false);
		PasteHelper.getPastedDataAs2DArray.returns([[]]);
		this.test(assert, "Element that allows paste on table", getCell(0, 1, null, null, oTable)[0], false);
		PasteHelper.getPastedDataAs2DArray.restore();
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

	QUnit.test("test onThemeChanged function", function(assert) {
		var fnInvalidate = sinon.spy(oTable, "invalidate");
		oTable.onThemeChanged();
		assert.ok(fnInvalidate.called, "invalidate() called from onThemeChanged()");
	});

	QUnit.test("test _enableTextSelection function", function(assert) {
		oTable._enableTextSelection(oTable.getDomRef());
		assert.ok(oTable.getDomRef().hasAttribute("unselectable", "off"), "_enableTextSelection is on");
	});

	QUnit.test("test _clearTextSelection function", function(assert) {
		assert.equal(oTable._clearTextSelection(), window.getSelection().removeAllRanges(), "Text selection is cleared");
	});

	QUnit.test("test _toggleSelectAll function", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionMode(SelectionMode.None);
		oTable._toggleSelectAll();
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection was not changed if SelectionMode is None");

		oTable.setSelectionMode(SelectionMode.Single);
		oTable._toggleSelectAll();
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection was not changed if SelectionMode is Single");

		oTable.setSelectedIndex(1);
		oTable._toggleSelectAll();
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Selection was not changed if SelectionMode is Single");

		oTable.setSelectionMode(SelectionMode.MultiToggle);
		oTable._toggleSelectAll();
		assert.ok(TableUtils.areAllRowsSelected(oTable), "All rows selected if not all rows were selected and SelectionMode is MultiToggle");

		oTable._toggleSelectAll();
		assert.ok(!TableUtils.areAllRowsSelected(oTable), "All rows deselected if all rows were selected and SelectionMode is MultiToggle");
	});

	QUnit.test("Check for tooltip", function(assert) {
		oTable.setTooltip("Table Tooltip");
		assert.strictEqual(oTable.getTooltip(), "Table Tooltip", "Table tooltip set correctly");
	});

	QUnit.test("Check for Fixed Rows and Fixed Bottom Rows", function(assert) {
		var fnError = sinon.spy(Log, "error");
		assert.equal(oTable._getFixedRowContexts().length, 0, "fixedRowContexts returned an empty array");
		oTable.setFixedRowCount(5);
		assert.equal(oTable.getFixedRowCount(), 5, "fixedRowCount is set to 5");
		assert.equal(oTable._getFixedRowContexts().length, 5,
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
		assert.equal(oTable._getFixedBottomRowContexts().length, 3,
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
		fnError.restore(); // restoring original Log.error() method, else exception is thrown
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
		oTable._mTimeouts.refreshRowsCreateRows = true;
		oTable.refreshRows(oEvent);
		assert.equal(oTable.getFirstVisibleRow(), 0, "refreshRows() executed with ChangeReason.Filter");
	});

	QUnit.test("Test for function that cannot be used programmatically", function(assert) {
		var fnError = sinon.spy(Log, "error");
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
		assert.ok(oColumn.getWidth() !== sOldColumnWidth, "Columns have been resized");
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
		var oBindingInfo = oTable.getBindingInfo("rows");
		var oGetBindingLength = this.stub(oBinding, "getLength");
		var oBindingIsA = this.stub(oBinding, "isA");
		var oClock = sinon.useFakeTimers();

		function testNoData(bVisible, sTestTitle) {
			assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), bVisible,
				sTestTitle + " - The table has the NoData class assigned: " + bVisible);

			assert.strictEqual(TableUtils.isNoDataVisible(oTable), bVisible,
				sTestTitle + " - NoData is visible: " + bVisible);
		}

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

			testNoData(bNoDataVisible, sTestTitle);
		}

		function testUpdateTotalRowCount(bNoDataVisible, sTestTitle) {
			oTable._adjustToTotalRowCount();
			sap.ui.getCore().applyChanges();

			testNoData(bNoDataVisible, sTestTitle);
		}

		oGetBindingLength.returns(1);
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
		oBindingIsA.withArgs("sap.ui.model.ClientListBinding").returns(true);
		oGetBindingLength.returns(0);
		testUpdateTotalRowCount(true, "Client binding without data");

		// Client binding with data: NoData area will be hidden.
		oBindingIsA.restore();
		oBindingIsA.withArgs("sap.ui.model.ClientTreeBinding").returns(true);
		oGetBindingLength.returns(1);
		testUpdateTotalRowCount(false, "Client binding with data");

		// Binding removed: NoData area becomes visible.
		oBindingIsA.restore();
		oTable.unbindRows();
		testUpdateTotalRowCount(true, "Binding removed");

		// Calling refreshRows without reason after bindRows: NoData area will be hidden.
		oTable.bindRows(oBindingInfo);
		oTable.refreshRows();
		testUpdateTotalRowCount(false, "Calling refreshRows without reason after bindRows");

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
		assert.ok(!bRendered, "Table not rendered when changing NoData from default text to custom text");
		bRendered = false;

		oTable.setNoData("Hello2");
		sap.ui.getCore().applyChanges();
		assert.ok(!bRendered, "Table not rendered when changing NoData from text to a different text");
		bRendered = false;

		oTable.setNoData("Hello2");
		sap.ui.getCore().applyChanges();
		assert.ok(!bRendered, "Table not rendered when changing NoData from text to the same text");
		bRendered = false;

		var oText1 = new Text();
		oTable.setNoData(oText1);
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing NoData from text to control");
		bRendered = false;

		var oText2 = new Text();
		oTable.setNoData(oText2);
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing NoData from control to control");
		bRendered = false;

		oTable.setNoData("Hello2");
		sap.ui.getCore().applyChanges();
		assert.ok(bRendered, "Table rendered when changing NoData from control to text");
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

		setTimeout(function() {
			var iOldTableContentHeight = oTable._collectTableSizes().tableCntHeight;
			$TableParent.height(500);

			setTimeout(function() {
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

				setTimeout(function() {
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

	QUnit.test("test _getContexts, _getRowContexts functions", function(assert) {
		assert.equal(oTable._getContexts(1, 4, 4).length, 4, "Correct contexts must have been returned");
		assert.equal(oTable._getRowContexts().length, 10, "Correct row contexts must have been returned");
		oTable.unbindRows();
		assert.equal(oTable._getContexts(1, 4, 4).length, 0, "Empty contexts returned as row binding was destoryed");
	});

	QUnit.test("test _getColumnsWidth function", function(assert) {
		assert.ok(oTable._getColumnsWidth() > 600 && oTable._getColumnsWidth() < 900, "Columns width returned");
	});

	QUnit.test("_getBaseRowHeight", function(assert) {
		var oBody = document.body;

		oTable.setRowHeight(98);
		assert.strictEqual(oTable._getBaseRowHeight(), 99, "The base row height is application defined (99)");

		oTable.setRowHeight(9);
		assert.strictEqual(oTable._getBaseRowHeight(), 10, "The base row height is application defined (10)");

		oTable.setRowHeight(0);
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCozy,
			"The base row height is correct in cozy size (49)");

		oBody.classList.remove("sapUiSizeCozy");
		oBody.classList.add("sapUiSizeCompact");
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCompact,
			"The base row height is correct in compact size (33)");

		oBody.classList.remove("sapUiSizeCompact");
		oBody.classList.add("sapUiSizeCondensed");
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCondensed,
			"The base row height is correct in condensed size (25)");

		oBody.classList.remove("sapUiSizeCondensed");
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.undefined,
			"The base row height is correct in undefined size (33)");

		oBody.classList.add("sapUiSizeCozy");
	});

	QUnit.test("_getTotalRowCount", function(assert){
		oTable.bindRows({path: "/modelData"});
		assert.strictEqual(oTable._getTotalRowCount(), 200, "Binding#getLength defines the total row count in the table");

		oTable.bindRows({path: "/modelData", length: 5});
		assert.strictEqual(oTable._getTotalRowCount(), 5, "The \"length\" parameter in the binding info overrides Binding#getLength");

		oTable.setModel(null);
		assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding the total row count is 0, regardless of the binding info");

		oTable.unbindRows();
		assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding or binding info the total row count is 0");
	});

	QUnit.module("Performance", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Row And Cell Pools", function(assert) {
		var aRows = oTable.getRows();
		var oLastRow = aRows[aRows.length - 1];
		var oLastRowFirstCell = oLastRow.getCells()[0];
		var iInitialVisibleRowCount = oTable.getVisibleRowCount();

		oTable.setVisibleRowCount(iInitialVisibleRowCount - 1);
		sap.ui.getCore().applyChanges();

		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] === undefined, "Row was removed from aggregation");
		assert.ok(!oLastRow.bIsDestroyed, "Removed row was not destroyed");
		assert.ok(!oLastRowFirstCell.bIsDestroyed, "Cells of the removed row were not destroyed");
		assert.ok(oLastRow.getParent() === null, "Removed row has no parent");

		oTable.setVisibleRowCount(iInitialVisibleRowCount);
		sap.ui.getCore().applyChanges();

		aRows = oTable.getRows();
		var oLastRowAfterRowsUpdate = aRows[aRows.length - 1];
		var oLastRowFirstCellAfterRowsUpdate = oLastRowAfterRowsUpdate.getCells()[0];
		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] !== undefined, "Row was added to the aggregation");
		assert.ok(oLastRow === oLastRowAfterRowsUpdate, "Old row was recycled");
		assert.ok(oLastRowFirstCell === oLastRowFirstCellAfterRowsUpdate, "Old cells recycled");
		assert.ok(oLastRowFirstCell.getParent() === oLastRowAfterRowsUpdate, "Recycled cells have the last row as parent");

		oTable.setVisibleRowCount(iInitialVisibleRowCount - 1);
		sap.ui.getCore().applyChanges();
		oTable.invalidateRowsAggregation();
		oTable.setVisibleRowCount(iInitialVisibleRowCount);
		sap.ui.getCore().applyChanges();

		aRows = oTable.getRows();
		oLastRowAfterRowsUpdate = aRows[aRows.length - 1];
		oLastRowFirstCellAfterRowsUpdate = oLastRowAfterRowsUpdate.getCells()[0];
		assert.ok(oLastRow !== oLastRowAfterRowsUpdate, "Old row was replaced after row invalidation");
		assert.ok(oLastRowFirstCell === oLastRowFirstCellAfterRowsUpdate, "Old cells recycled");
		assert.ok(oLastRowFirstCell.getParent() === oLastRowAfterRowsUpdate, "Recycled cells have the last row as parent");
	});

	QUnit.test("Destruction of the table if showNoData = true", function(assert) {
		var oFakeRow = {
			destroy: function() {},
			getIndex: function() {return -1;}
		};
		var oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.destroy();
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Destruction of the table if showNoData = false", function(assert) {
		var oFakeRow = {
			destroy: function() {},
			getIndex: function() {return -1;}
		};
		var oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.setShowNoData(false);
		oTable.destroy();
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Destruction of the rows aggregation", function(assert) {
		var oFakeRow = {
			destroy: function() {},
			getIndex: function() {return -1;}
		};
		var oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.destroyAggregation("rows");
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Lazy row creation with client binding - VisibleRowCountMode = Fixed|Interactive", function(assert) {
		destroyTable();

		function test(sVisibleRowCountMode) {
			var oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				visibleRowCount: 5
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

				oTable.destroy();

				oTable = TableQUnitUtils.createTable({
					visibleRowCountMode: sVisibleRowCountMode,
					visibleRowCount: 5,
					rows: {path: "/"},
					models: new JSONModel(new Array(100))
				}, function(oTable) {
					assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
				});
			}).then(oTable.qunit.whenInitialRenderingFinished).then(function() {
				assert.strictEqual(oTable.getRows().length, 5, "After rendering with binding: The table has the correct number of rows");

				oTable.unbindRows();
				assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

				oTable.bindRows({path: "/"});
				assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				assert.strictEqual(oTable.getRows().length, 5, "After asynchronous row update: The table has the correct number of rows");

				oTable.destroy();

				oTable = TableQUnitUtils.createTable({
					visibleRowCountMode: sVisibleRowCountMode,
					visibleRowCount: 5,
					rows: {path: "/"},
					models: new JSONModel(new Array(100)),
					placeAt: false
				});
			}).then(oTable.qunit.whenBindingChange).then(TableQUnitUtils.$wait(100)).then(function() {
				assert.strictEqual(oTable.getRows().length, 5,
					"If the table is not rendered but bound, the table has the correct number of rows after an asynchronous row update");
			});
		}

		return test(VisibleRowCountMode.Fixed).then(function() {
			return test(VisibleRowCountMode.Interactive);
		});
	});

	QUnit.test("Lazy row creation client binding - VisibleRowCountMode = Auto", function(assert) {
		destroyTable();

		oTable = TableQUnitUtils.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto
		}, function(oTable) {
			assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

		}).then(function() {
			oTable.destroy();

			oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				rows: {path: "/"},
				models: new JSONModel(new Array(100))
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
			});
		}).then(oTable.qunit.whenInitialRenderingFinished).then(function() {
			assert.ok(oTable.getRows().length > 0, "After rendering with binding: The table has rows");
		}).then(function() {
			oTable.unbindRows();
			assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

			oTable.bindRows({path: "/"});
			assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok(oTable.getRows().length > 0, "After asynchronous row update: The table has rows");

			oTable.destroy();

			oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				rows: {path: "/"},
				models: new JSONModel(new Array(100)),
				placeAt: false
			});
		}).then(oTable.qunit.whenBindingChange).then(TableQUnitUtils.$wait(100)).then(function() {
			assert.strictEqual(oTable.getRows().length, 0, "If the table is not rendered and only bound, the table has no rows");
		});
	});

	QUnit.module("Avoid DOM modification in onBeforeRendering", {
		beforeEach: function() {
			createTable(null, function() {
				oTable.addColumn(new Column({
					label: "Label",
					template: "Text"
				}));
			});

			this.sDOMStringA = oTable.getDomRef().outerHTML;
			this.sDOMStringB = "";

			oTable.addEventDelegate({
				onBeforeRendering: function() {
					this.sDOMStringB = oTable.getDomRef().outerHTML;
				}.bind(this)
			});
		},
		afterEach: function() {
			destroyTable();
		},
		compareDOMStrings: function(assert) {
			assert.strictEqual(this.sDOMStringB, this.sDOMStringA, "DOM did not change");
		}
	});

	QUnit.test("Table invalidation", function(assert) {
		oTable.invalidate();
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Rows invalidation", function(assert) {
		oTable.invalidateRowsAggregation();
		oTable.invalidate();
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one row", function(assert) {
		oTable.setVisibleRowCount(oTable.getVisibleRowCount() - 1);
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one row", function(assert) {
		oTable.setVisibleRowCount(oTable.getVisibleRowCount() + 1);
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one column", function(assert) {
		oTable.removeColumn(oTable.getColumns()[0]);
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one column", function(assert) {
		oTable.addColumn(new Column({
			label: "Label",
			template: "Template"
		}));
		sap.ui.getCore().applyChanges();
		this.compareDOMStrings(assert);
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
			"sap.ui.table.extensions.Pointer",
			"sap.ui.table.extensions.Scrolling",
			"sap.ui.table.extensions.Keyboard",
			"sap.ui.table.extensions.AccessibilityRender",
			"sap.ui.table.extensions.Accessibility",
			"sap.ui.table.extensions.DragAndDrop"
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

		assert.ok(bAllExtensionsDestroyed, "All extensions destroyed");
		assert.equal(oTable._aExtensions, null, "The table does not hold references to the destroyed extensions");
		assert.ok(!oTable._bExtensionsInitialized, "The _bExtensionsInitialized flag properly indicates that extensions were cleaned up");

		try {
			oTable.destroy();
		} catch (e) {
			assert.ok(false, "Duplicate call of destroy does not raise errors.");
		}
	});

	QUnit.test("Getter functions", function(assert) {
		assert.ok(typeof oTable._getPointerExtension === "function", "Getter for the pointer extension exists");
		assert.ok(typeof oTable._getScrollExtension === "function", "Getter for the scroll extension exists");
		assert.ok(typeof oTable._getKeyboardExtension === "function", "Getter for the KeyboardExtension exists");
		assert.ok(typeof oTable._getAccRenderExtension === "function", "Getter for the accessibility render extension exists");
		assert.ok(typeof oTable._getAccExtension === "function", "Getter for the accessibility extension exists");
	});

	QUnit.test("Add Synchronization extension", function(assert) {
		var done = assert.async();

		oTable._enableSynchronization().then(function(oSyncInterface) {
			var bSyncExtensionIsAdded = false;
			oTable._aExtensions.forEach(function(oExtension) {
				if (oExtension.getMetadata().getName() === "sap.ui.table.extensions.Synchronization") {
					bSyncExtensionIsAdded = true;
				}
			});

			assert.ok(bSyncExtensionIsAdded, "The synchronization extension is added");
			assert.ok(typeof oTable._getSyncExtension === "function", "Getter for the synchronization extension exists");
			if (oTable._getSyncExtension) {
				assert.equal(oSyncInterface, oTable._getSyncExtension().getInterface(), "The Promise resolved with the synchronization interface");
			}
		}).then(done);
	});

	QUnit.module("Renderer Methods", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("renderVSbExternal", function(assert) {
		var Div = document.createElement("div");
		var oRM = sap.ui.getCore().createRenderManager();

		oTable.getRenderer().renderVSbExternal(oRM, oTable);
		oRM.flush(Div);

		assert.strictEqual(Div.childElementCount, 0, "Nothing should be rendered without synchronization enabled");
	});

	QUnit.test("renderHSbExternal", function(assert) {
		var Div = document.createElement("div");
		var oRM = sap.ui.getCore().createRenderManager();

		oTable.getRenderer().renderHSbExternal(oRM, oTable, "id", 100);
		oRM.flush(Div);

		assert.strictEqual(Div.childElementCount, 0, "Nothing should be rendered without synchronization enabled");
	});

	QUnit.module("Selection plugin", {
		beforeEach: function() {
			this.oTable = new Table();
			this.TestSelectionPlugin = SelectionPlugin.extend("sap.ui.table.test.SelectionPlugin");
			this.oTestPlugin = new this.TestSelectionPlugin();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oTestPlugin.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oOtherTestPlugin = new (SelectionPlugin.extend("sap.ui.table.test.OtherTestSelectionPlugin"))();
		var oTable = this.oTable;

		function expectLegacyPlugin() {
			assert.ok(oTable._getSelectionPlugin().isA("sap.ui.table.plugins.SelectionModelPlugin"), "The legacy selection plugin is used");
			assert.strictEqual(oTable._hasSelectionPlugin(), false, "Table#_hasSelectionPlugin returns \"false\"");
		}

		function expectAppliedPlugin(oAppliedPlugin) {
			assert.strictEqual(oTable._getSelectionPlugin(), oAppliedPlugin, "The applied selection plugin is used");
			assert.strictEqual(oTable._hasSelectionPlugin(), true, "Table#_hasSelectionPlugin returns \"true\"");
		}

		expectLegacyPlugin();

		oTable.addPlugin(this.oTestPlugin);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.removePlugin(this.oTestPlugin);
		expectLegacyPlugin();

		oTable.insertPlugin(this.oTestPlugin, 0);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.removeAllPlugins();
		expectLegacyPlugin();

		oTable.addPlugin(this.oTestPlugin);
		oTable.addPlugin(oOtherTestPlugin);
		expectAppliedPlugin(this.oTestPlugin);
		oTable.removePlugin(this.oTestPlugin);
		expectAppliedPlugin(oOtherTestPlugin);
		oTable.insertPlugin(this.oTestPlugin, 0);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.destroyPlugins();
		expectLegacyPlugin();

		sinon.spy(Table.prototype, "_createLegacySelectionPlugin");
		this.oTestPlugin = new this.TestSelectionPlugin(); // The old one was destroyed.
		oTable = new Table({
			plugins: [this.oTestPlugin]
		});

		assert.ok(oTable._getSelectionPlugin().isA("sap.ui.table.test.SelectionPlugin"),
			"The selection plugin set to the table is used");
		assert.ok(oTable._hasSelectionPlugin(), "Table#_hasSelectionPlugin returns \"true\"");
		assert.ok(Table.prototype._createLegacySelectionPlugin.notCalled, "No legacy selection plugin was created on init");

		Table.prototype._createLegacySelectionPlugin.restore();
	});

	QUnit.test("Set selection mode", function(assert) {
		this.oTable.setSelectionMode(SelectionMode.Single);
		assert.strictEqual(this.oTable.getSelectionMode(), SelectionMode.Single,
			"If the default selection plugin is used, the selection mode can be set");

		this.oTable.addPlugin(this.oTestPlugin);
		this.oTable.setSelectionMode(SelectionMode.MultiToggle);
		assert.strictEqual(this.oTable.getSelectionMode(), SelectionMode.Single,
			"The selection mode cannot be changed here, it is controlled by the plugin");
	});

	QUnit.test("Selection API", function(assert) {
		var aMethodNames = [
			"getSelectedIndex",
			"setSelectedIndex",
			"clearSelection",
			"selectAll",
			"getSelectedIndices",
			"addSelectionInterval",
			"setSelectionInterval",
			"removeSelectionInterval",
			"isIndexSelected"
		];
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		aMethodNames.forEach(function(sMethodName) {
			var oSpy = sinon.spy(oSelectionPlugin, sMethodName);

			this.oTable[sMethodName]();
			assert.ok(oSpy.calledOnce, "Table#" + sMethodName + " calls LegacySelectionPlugin#" + sMethodName + " once");
		}.bind(this));

		this.oTable.addPlugin(this.oTestPlugin);
		oSelectionPlugin = this.oTable._getSelectionPlugin();

		aMethodNames.forEach(function(sMethodName) {
			var oSpy = sinon.spy(oSelectionPlugin, sMethodName);

			assert.throws(this.oTable[sMethodName], "Table#" + sMethodName + " throws an error if a selection plugin is applied");
			assert.ok(oSpy.notCalled, "Table#" + sMethodName + " does not call SelectionPlugin#" + sMethodName);
		}.bind(this));
	});

	QUnit.test("Legacy multi selection", function(assert) {
		this.oTable.addPlugin(this.oTestPlugin);
		assert.throws(this.oTable._enableLegacyMultiSelection, "Table#_enableLegacyMultiSelection throws an error if a selection plugin is applied");

		this.oTable.removePlugin(this.oTestPlugin);
		this.oTable._enableLegacyMultiSelection();
		assert.throws(this.oTable._legacyMultiSelection, "Table#_legacyMultiSelection throws an error if a selection plugin is applied");

	});

	QUnit.module("Dependents Plugins");

	QUnit.test("DataStateIndicator Plugin Support", function(assert) {
		try {
			new Table({
				dependents: new DataStateIndicator()
			});
			assert.ok(true, "Table supports DataStateIndicator plugin");
		} catch (e) {
			assert.ok(false, "Table does not support DataStateIndicator plugin");
		}
	});
});