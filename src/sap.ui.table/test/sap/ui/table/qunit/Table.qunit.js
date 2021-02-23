/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Row",
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
	"sap/ui/core/util/PasteHelper",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/ChangeReason",
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
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/library",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/base/Log"
], function(
	TableQUnitUtils,
	qutils,
	Table,
	Row,
	Column,
	ColumnMenu,
	ColumnMenuRenderer,
	AnalyticalColumnMenuRenderer,
	TablePersoController,
	RowAction,
	RowActionItem,
	RowSettings,
	TableUtils,
	library,
	SelectionPlugin,
	CoreLibrary,
	Control,
	PasteHelper,
	Device,
	JSONModel,
	Sorter,
	Filter,
	ChangeReason,
	FloatType,
	Text,
	Input,
	Label,
	CheckBox,
	Button,
	Link,
	RatingIndicator,
	Image,
	Toolbar,
	MenuM,
	MenuItemM,
	MLibrary,
	Menu,
	MenuItem,
	Log
) {
	"use strict";

	var SortOrder = library.SortOrder;
	var SelectionMode = library.SelectionMode;
	var VisibleRowCountMode = library.VisibleRowCountMode;
	var NavigationMode = library.NavigationMode;
	var SharedDomRef = library.SharedDomRef;
	var ToolbarDesign = MLibrary.ToolbarDesign;
	var ToolbarStyle = MLibrary.ToolbarStyle;

	// mapping of global function calls
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var checkFocus = window.checkFocus;

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

	var HeightTestControl = TableQUnitUtils.HeightTestControl;

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
	});

	QUnit.test("Filter", function(assert) {
		var oColFirstName = oTable.getColumns()[1];
		var oColMoney = oTable.getColumns()[7];

		assert.equal(oTable.getBinding().iLength, 200, "RowCount beforeFiltering ok");
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

		assert.equal(oTable.getBinding().iLength, 20, "RowCount after filtering FirstName 'M*'");
		oTable.filter(oColFirstName, "Mo*");
		assert.equal(oTable.getBinding().iLength, 10, "RowCount after filtering FirstName 'Mo*''");
		assert.equal(oColFirstName.getFiltered(), true, "Column FirstName is filtered");
		oTable.filter(oColFirstName, "");
		assert.equal(oColFirstName.getFiltered(), false, "Column FirstName is not filtered anymore");
		assert.equal(oTable.getBinding().iLength, 200, "RowCount after removing filter");

		oTable.filter(oColMoney, ">10");
		assert.equal(oTable.getBinding().iLength, 120, "RowCount after filtering money >10");
		oTable.filter(oColMoney, "> 123,45");
		assert.equal(oTable.getBinding().iLength, 70, "RowCount after filtering money >123,45");
		oTable.filter(oColMoney, "<50,55");
		assert.equal(oTable.getBinding().iLength, 100, "RowCount after filtering money <50,55");
		oTable.filter(oColMoney, "9.35");
		assert.equal(oTable.getBinding().iLength, 0, "RowCount after filtering money 9.35");
		oTable.filter(oColMoney, "5,67");
		assert.equal(oTable.getBinding().iLength, 10, "RowCount after filtering money 5,67");
		oTable.filter(oColMoney, "= 32,7600");
		assert.equal(oTable.getBinding().iLength, 10, "RowCount after filtering money = 32,7600");
		assert.equal(oColMoney.getFiltered(), true, "Column Money is filtered");
		oTable.filter(oColFirstName, "Do*");
		assert.equal(oTable.getBinding().iLength, 10, "RowCount after filtering FirstName 'Do*' and money 32,76");
		assert.equal(oColFirstName.getFiltered() && oColMoney.getFiltered(), true, "Column FirstName and Money are filtered");
		oTable.filter(oColFirstName, "Mo*");
		assert.equal(oTable.getBinding().iLength, 0, "RowCount after filtering FirstName 'Mo*' and money 32,76");
		oTable.filter(oColFirstName);
		oTable.filter(oColMoney, null);
		assert.equal(oColFirstName.getFiltered() && oColMoney.getFiltered(), false, "Column FirstName and Money are not filtered anymore");
		assert.equal(oTable.getBinding().iLength, 200, "RowCount after removing filter");

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
		assert.equal(oTable.getSelectedIndex(), 8, "selectedIndex is 8");
		var aRows = oTable.getRows();
		var $Row = aRows[3].getDomRefs(true);

		$Row.rowSelector.click();
		assert.equal(oTable.getProperty("selectedIndex"), -1, "selectedIndex is -1");
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
		var done = assert.async();
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

		var $TableParent = oTable.$().parent();
		setTimeout(function() {
			$TableParent.height(0);

			setTimeout(function() {
				assert.equal(oTable.getVisibleRowCount(), 5, "visibleRowCount is set correctly after table resize.");
				$TableParent.height("");
				done();
			}, 500);
		}, 500);
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

	QUnit.test("RowActionCount", function(assert) {
		assert.strictEqual(oTable.getRowActionCount(), 0, "Default is 0");

		oTable.setRowActionCount(1);
		assert.equal(oTable.getRowActionCount(), 1, "Set to 1, count is 1");

		oTable.setRowActionCount(2);
		assert.equal(oTable.getRowActionCount(), 2, "Set to 2, count is 2");

		oTable.setRowActionCount(0);
		assert.equal(oTable.getRowActionCount(), 0, "Set to 0, count is 0");

		oTable.setRowActionCount(3);
		assert.equal(oTable.getRowActionCount(), 2, "Set to 3, count is 2");

		oTable.setRowActionCount(-1);
		assert.equal(oTable.getRowActionCount(), 0, "Set to -1, count is 0");
	});

	QUnit.test("EnableColumnReordering", function(assert) {
		oTable.setEnableColumnReordering(true);
		assert.equal(oTable.getEnableColumnReordering(), true, "Reordering is allowed");
	});

	QUnit.test("FirstVisibleRow", function(assert) {
		var iMaxRowIndex = aData.length - oTable.getVisibleRowCount();

		assert.equal(oTable.getFirstVisibleRow(), 5, "FirstVisibleRow is: 5");

		oTable.setFirstVisibleRow(4);
		assert.equal(oTable.getFirstVisibleRow(), 4, "FirstVisibleRow is: 4");

		oTable.setFirstVisibleRow(-1);
		assert.equal(oTable.getFirstVisibleRow(), 0, "FirstVisibleRow is: 0");

		oTable.getBinding().fireEvent("refresh");
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex + 1, "FirstVisibleRow is: " + (iMaxRowIndex + 1));

		oTable.getBinding().fireEvent("change");
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex, "FirstVisibleRow is: " + iMaxRowIndex);

		var oBindingInfo = oTable.getBindingInfo("rows");
		oTable.unbindRows();
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex + 1, "FirstVisibleRow is: " + (iMaxRowIndex + 1));

		oTable.bindRows(oBindingInfo);
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex, "FirstVisibleRow is: " + iMaxRowIndex);
	});

	QUnit.test("_setFocus", function(assert) {
		var oSpy = sinon.spy(oTable, "onRowsUpdated");

		function testFocus(iIndex, bFirstInteractiveElement) {
			return new Promise(function(resolve) {
				if (iIndex === -1) {
					iIndex = oTable._getTotalRowCount() - 1;
				}

				iIndex = Math.min(iIndex, oTable._getTotalRowCount() - 1);

				var iFirstVisibleRow = oTable.getFirstVisibleRow();
				var iRowCount = oTable.getVisibleRowCount();
				var bScroll = true;
				if (iIndex > iFirstVisibleRow && iIndex < iFirstVisibleRow + iRowCount) {
					bScroll = false;
				}

				oTable._setFocus(iIndex, bFirstInteractiveElement).then(function() {
					assert.ok(bScroll ? oSpy.calledOnce : oSpy.notCalled, "The table was " + (bScroll ? "" : "not") + " scrolled");

					var oRow = oTable.getRows()[iIndex - oTable.getFirstVisibleRow()];
					var $Elem = (bFirstInteractiveElement && TableUtils.getFirstInteractiveElement(oRow)) ?
						TableUtils.getFirstInteractiveElement(oRow) : oRow.getDomRef("col0");
					assert.deepEqual(document.activeElement, $Elem, "The focus was set correctly");
					oSpy.reset();
					return resolve();
				});
			});
		}

		return new Promise(function(resolve) {
			resolve();
		}).then(function() {
			return testFocus(10, false);
		}).then(function() {
			return testFocus(0, false);
		}).then(function() {
			return testFocus(oTable._getTotalRowCount() / 2, false);
		}).then(function() {
			return testFocus(-1, false);
		}).then(function() {
			return testFocus(100, true);
		}).then(function() {
			return testFocus(0, true);
		}).then(function() {
			return testFocus(oTable._getTotalRowCount() / 2, true);
		}).then(function() {
			return testFocus(-1, true);
		});
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

	QUnit.test("Row height; After rendering", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var sequence = Promise.resolve();

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		oTable.removeAllColumns();
		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.addColumn(new Column({template: new HeightTestControl()}));
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
					oTable.attachEventOnce("rowsUpdated", resolve);
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

	QUnit.test("Row height; After binding context update", function(assert) {
		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		oTable.removeAllColumns();
		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.addColumn(new Column({template: new HeightTestControl({height: "{height}"})}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());
		sap.ui.getCore().applyChanges();

		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			// Updating only the content (property bindings of cells) without a binding change event for the rows is not supported.
			oTable.getBinding().getModel().getData().modelData[oTable.getRows()[0].getIndex()].height = "88px";
			oTable.getBinding().getModel().refresh(true);
			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			var aRowDomRefs = oTable.getRows()[0].getDomRefs();
			assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, 89, "Selector height is ok");
			assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, 89, "Fixed part height is ok");
			assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, 89, "Scrollable part height is ok");
			assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, 89, "Action height is ok");
		}).then(function() {
			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});

	QUnit.test("Column header height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var sequence = Promise.resolve();
		var iPadding = 14;

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		oTable.removeAllColumns();
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
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
					oTable.attachEventOnce("rowsUpdated", resolve);
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
				oTable.attachEventOnce("rowsUpdated", resolve);
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
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
		assert.ok(oResetRowHeights.called, "The table has a height and width -> _updateTableSizes was executed");
		oResetRowHeights.reset();

		oDomRef.style.height = "0px";
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
		assert.ok(oResetRowHeights.called, "The table has no height -> _updateTableSizes was executed");
		oResetRowHeights.reset();

		oDomRef.style.width = "0px";
		oDomRef.style.height = "100px";
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
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
		assert.equal(oTable.getRowActionCount(), 0, "RowActionCount is 0: Table has no row actions");
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "RowActionCount is 0: No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "RowActionCount is 0: No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "RowActionCount is 0: No action area");

		oTable.setRowActionCount(2);
		sap.ui.getCore().applyChanges();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No row action template: No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No row action template: No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "No row action template: No action area");

		oTable.setRowActionTemplate(new RowAction());
		sap.ui.getCore().applyChanges();
		assert.ok(oTable.$().hasClass("sapUiTableRAct"), "CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");

		oTable.setRowActionCount(1);
		sap.ui.getCore().applyChanges();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "RowActionCount is 1: No CSS class sapUiTableRAct");
		assert.ok(oTable.$().hasClass("sapUiTableRActS"), "RowActionCount is 1: CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");

		assert.notOk(oTable.$().hasClass("sapUiTableRActFlexible"), "The RowActions column is positioned right");
		oTable.getColumns().forEach(function(oCol) {
			oCol.setWidth("50px");
		});
		sap.ui.getCore().applyChanges();
		assert.ok(oTable.$().hasClass("sapUiTableRActFlexible"), "The position of the RowActions column is calculated based on the table content");
		var oTableSizes = oTable._collectTableSizes();
		assert.ok(oTable.$("sapUiTableRowActionScr").css("left") === 400 + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth + "px",
			"The RowActions column is positioned correctly");
		oTable.setFixedColumnCount(2);
		sap.ui.getCore().applyChanges();
		oTableSizes = oTable._collectTableSizes();
		assert.ok(oTable.$("sapUiTableRowActionScr").css("left") === 300 + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth + "px",
			"The RowActions column is positioned correctly");
	});

	QUnit.test("Row Settings Template", function(assert) {
		var oOnAfterRenderingEventListener = sinon.spy();
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
			TableUtils.Menu.openContextMenu(oTable, getCell(0, 0, null, null, oTable));
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
		TableUtils.Grouping.isTreeMode.restore();
	});

	QUnit.module("Column operations", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Add / Insert / Remove", function(assert) {
		var aColumns = oTable.getColumns();
		var oColA = aColumns[2];
		var oColB = aColumns[3];

		oTable.removeColumn(oColA);
		assert.deepEqual(oTable.getColumns()[2], oColB, "The correct column was removed");

		oTable.addColumn(oColA);
		aColumns = oTable.getColumns();
		assert.deepEqual(aColumns[aColumns.length - 1], oColA, "The column is always added at the end");

		oColA = aColumns[4];
		oColB = aColumns[5];
		oTable.removeColumn(4);
		aColumns = oTable.getColumns();
		assert.deepEqual(aColumns[4], oColB, "The correct column was removed by index");

		oTable.insertColumn(oColA, 1);
		aColumns = oTable.getColumns();
		assert.deepEqual(aColumns[1], oColA, "The column was inserted at the correct position by index");
	});

	QUnit.test("NoColumns handling", function (assert) {
		var sNoDataClassOfTable = "sapUiTableEmpty";

		assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), false,
			"Columns are visible - The table has the NoColumns class assigned: " + false);

		oTable.removeAllColumns();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oTable.getDomRef().classList.contains(sNoDataClassOfTable), true,
			"No columns are visible - The table has the NoColumns class assigned: " + true);
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
		assert.equal(oMenu.getItems().length, 1, "Column menu without sort has only one filter item");
		oMenu.close();

		//Check column without filter
		oColumn = oTable.getColumns()[6];
		oMenu = oColumn.getMenu();
		oMenu.open();
		assert.equal(oMenu.getItems().length, 2, "Column menu without filter has only two sort items");
		oMenu.close();

		var oRemoveAggregationSpy = sinon.spy(sap.ui.table.ColumnMenu.prototype, "removeAggregation");
		oTable.setShowColumnVisibilityMenu(true);
		sap.ui.getCore().applyChanges();
		oColumn = oTable.getColumns()[5];
		oMenu = oColumn.getMenu();
		oMenu.open();
		assert.equal(oMenu.getItems().length, 2, "Column menu has one filter item and one column visibility item");
		assert.ok(oRemoveAggregationSpy.notCalled, "Initial creation of the column visibility submenu");
		oMenu.close();

		oColumn = oTable.getColumns()[6];
		oMenu = oColumn.getMenu();
		oMenu.open();
		assert.ok(oRemoveAggregationSpy.withArgs("items", oTable._oColumnVisibilityMenuItem, true).calledOnce,
			"The items aggregation is being removed before updating the visibility submenu");
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
		var aSubmenuItems = oTable._oColumnVisibilityMenuItem.getSubmenu().getItems();
		qutils.triggerMouseEvent(aSubmenuItems[0].$(), "click");

		assert.equal(oColumn0.getVisible(), true, "lastName column is still visible (preventDefault)");

		oMenu.open();
		qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
		qutils.triggerMouseEvent(aSubmenuItems[1].$(), "click");

		assert.equal(oColumn1.getVisible(), false, "firstName column is invisible (no preventDefault)");
	});

	QUnit.test("Column Visibility Submenu: Icons and Enabled State", function(assert) {
		function checkSubmenuIcons(oTable, assert) {
			var aColumns = oTable.getColumns();
			var aVisibleColumns = oTable._getVisibleColumns();
			var oSubmenu = oTable._oColumnVisibilityMenuItem.getSubmenu();
			var aSubmenuItems = oSubmenu.getItems();

			for (var i = 0; i < aColumns.length; i++) {
				var oColumn = aColumns[i];
				var bVisible = aVisibleColumns.indexOf(oColumn) > -1;
				assert.equal(aSubmenuItems[i].getIcon(), bVisible ? "sap-icon://accept" : "",
					"The column visibility is correctly displayed in the submenu");
			}
		}

		oTable.setShowColumnVisibilityMenu(true);
		var aColumns = oTable.getColumns();
		var oMenu = aColumns[0].getMenu();
		oMenu.open();
		var oSubmenu = oTable._oColumnVisibilityMenuItem.getSubmenu();
		var aSubmenuItems = oSubmenu.getItems();
		assert.ok(oSubmenu, "The Column Visibility Submenu exists");
		assert.equal(aSubmenuItems.length, 8, "The Column Visibility Submenu has one item for each column");
		checkSubmenuIcons(oTable, assert);

		for (var i = 2; i < 8; i++) {
			aColumns[i].setVisible(false);
		}
		oMenu.open();
		checkSubmenuIcons(oTable, assert);

		assert.ok(aSubmenuItems[0].getEnabled() && aSubmenuItems[1].getEnabled(), "Two visible columns left: both visibility menu items are enabled");
		aColumns[1].setVisible(false);
		oMenu.open();
		aSubmenuItems = oSubmenu.getItems();
		assert.notOk(aSubmenuItems[0].getEnabled(), "One visible column left: the corresponding menu item is disabled");
		aColumns[1].setVisible(true);
		oMenu.open();
		assert.ok(aSubmenuItems[0].getEnabled() && aSubmenuItems[1].getEnabled(), "One more column made visible: both menu items are enabled");
		oMenu.close();
	});

	QUnit.test("Column Visibility Submenu: Add/Remove/Reorder Columns", function(assert) {
		function checkSubmenuItemsOrder(oTable, assert) {
			var oSubmenu = oTable._oColumnVisibilityMenuItem.getSubmenu();
			var aSubmenuItems = oSubmenu.getItems();
			var aColumns = oTable.getColumns();
			assert.equal(aSubmenuItems.length, aColumns.length, "The Column Visibility Submenu has one item for each column");

			var bCorrectOrder = true;
			for (var i = 0; i < aColumns.length; i++) {
				if (aColumns[i].getLabel().mProperties["text"] !== aSubmenuItems[i].getText()) {
					bCorrectOrder = false;
					break;
				}
			}
			assert.ok(bCorrectOrder, "The Column Visibility Submenu Items are in the correct order");
		}

		oTable.setShowColumnVisibilityMenu(true);
		var aColumns = oTable.getColumns();
		var oMenu = aColumns[0].getMenu();
		oMenu.open();
		checkSubmenuItemsOrder(oTable, assert);

		for (var i = 7; i > 0; i = i - 2) {
			oTable.removeColumn(aColumns[i]);
		}
		oMenu.open();
		checkSubmenuItemsOrder(oTable, assert);

		oTable.addColumn(aColumns[1]);
		oTable.addColumn(aColumns[3]);
		oTable.insertColumn(aColumns[5], 0);
		oTable.insertColumn(aColumns[7], 3);

		oMenu.open();
		checkSubmenuItemsOrder(oTable, assert);
		oMenu.close();
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

	QUnit.test("computedFixedColumnCount invalidation", function(assert) {
		var invalidationSpy = sinon.spy(oTable, "_invalidateComputedFixedColumnCount");
		var oCol = oTable.getColumns()[2];
		oTable.setFixedColumnCount(1);
		assert.equal(invalidationSpy.callCount, 1, "value is being invalidated");
		oCol.setHeaderSpan([2,1]);
		assert.equal(invalidationSpy.callCount, 2, "value is being invalidated");
		oTable.removeColumn(oCol);
		assert.equal(invalidationSpy.callCount, 3, "value is being invalidated");
		oTable.insertColumn(oCol, 1);
		assert.equal(invalidationSpy.callCount, 4, "value is being invalidated");
		oTable.removeAllColumns();
		assert.equal(invalidationSpy.callCount, 5, "value is being invalidated");
		oTable.addColumn(oCol);
		assert.equal(invalidationSpy.callCount, 6, "value is being invalidated");
		oTable.destroyColumns();
		assert.equal(invalidationSpy.callCount, 7, "value is being invalidated");
	});

	QUnit.test("Fixed column count and table / column width", function(assert) {
		var aColumns = oTable.getColumns();
		assert.equal(aColumns[0]._iFixWidth, undefined, "The _iFixWidth of the first column is undefined");
		assert.equal(aColumns[1]._iFixWidth, undefined, "The _iFixWidth of the second column is undefined");
		aColumns[0].setWidth("auto");
		aColumns[1].setWidth("auto");
		oTable.setFixedColumnCount(1);
		assert.equal(aColumns[0]._iFixWidth, 200, "The _iFixWidth of the fixed column is set");

		aColumns[0].setHeaderSpan([2,1]);
		oTable.setFixedColumnCount(1);
		assert.equal(oTable.getComputedFixedColumnCount(), 2,
			"The computed fixed column count is 2 because of the header span");
		assert.equal(aColumns[1]._iFixWidth, 100, "The _iFixWidth of the second fixed columns is set");

		oTable.setWidth("400px");
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getComputedFixedColumnCount(), 0,
			"The table width is too small for using fixed columns, getComputedFixedColumnCount returns 0");
		oTable.setWidth("500px");
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getComputedFixedColumnCount(), 2,
			"The table width allows displaying of the fixed columns again");
	});

	QUnit.test("Fixed column count and column spans", function(assert) {
		oTable.removeAllColumns();
		sap.ui.getCore().applyChanges();
		oTable.setFixedColumnCount(1);

		var oCol1 = new sap.ui.table.Column({
			headerSpan: [3,1],
			multiLabels: [new sap.m.Label({text: "A"}),new sap.m.Label({text: "AA"})],
			template: new sap.m.Label()
		});
		oTable.addColumn(oCol1);
		assert.equal(oTable.getComputedFixedColumnCount(), 1, "The computed fixedColumCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 0, "The lastFixedColumIndex is correct");

		var oCol2 = new sap.ui.table.Column({
			headerSpan: [2,1],
			multiLabels: [new sap.m.Label({text: "A"}),new sap.m.Label({text: "AB"})],
			template: new sap.m.Label()
		});
		oTable.addColumn(oCol2);
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "The computed fixedColumnCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 1, "The lastFixedColumIndex is correct");

		var oCol3 = new sap.ui.table.Column({
			headerSpan: [1,1],
			multiLabels: [new sap.m.Label({text: "A"}),new sap.m.Label({text: "AC"})],
			template: new sap.m.Label()
		});
		oTable.addColumn(oCol3);
		assert.equal(oTable.getComputedFixedColumnCount(), 3, "The computed fixedColumnCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 2, "The lastFixedColumIndex is correct");

		oTable.setFixedColumnCount(2);
		assert.equal(oTable.getComputedFixedColumnCount(), 3, "The computed fixedColumnCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 2, "The lastFixedColumIndex is correct");
	});

	QUnit.test("Content is wider than column", function(assert) {
		oTable.getColumns()[0].setWidth("60px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTable.getDomRef("table-fixed").getBoundingClientRect().width, 160, "Fixed column table has the correct width");
	});

	QUnit.test("Hide one column in fixed area", function(assert) {
		var iVisibleRowCount = oTable.getVisibleRowCount();
		function checkCellsFixedBorder(oTable, iCol, sMsg) {
			var oColHeader = getColumnHeader(iCol, null, null, oTable)[0];
			assert.ok(oColHeader.classList.contains("sapUiTableCellLastFixed"), sMsg);
			for (var i = 0; i < iVisibleRowCount; i++) {
				var oCell = getCell(i, iCol, null, null, oTable)[0];
				assert.ok(oCell.classList.contains("sapUiTableCellLastFixed"), sMsg);
			}
		}

		checkCellsFixedBorder(oTable, 1, "The fixed border is displayed on the last fixed column");

		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		var $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 1, "Fixed table has 2 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll table has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(2),
			"Horizontal scrollbar has correct left margin");

		checkCellsFixedBorder(oTable, 0, "When the last fixed column is not visible, the fixed border is displayed on the last visible column in fixed area");

		oTable.getColumns()[0].setVisible(false);
		oTable.getColumns()[1].setVisible(true);
		sap.ui.getCore().applyChanges();
		checkCellsFixedBorder(oTable, 0, "When one of the fixed columns is not visible, the fixed border is displayed on the last visible column in fixed area");
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
		}, 500);
	});

	QUnit.test("#focus", function(assert) {
		oTable.focus();
		checkFocus(getColumnHeader(0, null, null, oTable), assert);

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		oTable.focus();
		checkFocus(getCell(0, 0, null, null, oTable), assert);

		oTable.unbindRows();
		oTable.focus();
		checkFocus(oTable.getDomRef("noDataCnt"), assert);

		oTable.setShowOverlay(true);
		oTable.focus();
		checkFocus(oTable.getDomRef("overlay"), assert);
	});

	QUnit.test("#getFocusDomRef", function(assert) {
		assert.strictEqual(oTable.getFocusDomRef(), getColumnHeader(0, null, null, oTable)[0], "Column header visible");

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTable.getFocusDomRef(), getCell(0, 0, null, null, oTable)[0], "Column header not visible");

		getCell(0, 1, true, null, oTable);
		assert.strictEqual(oTable.getFocusDomRef(), getCell(0, 1, null, null, oTable)[0], "Last focused cell");

		oTable.unbindRows();
		assert.strictEqual(oTable.getFocusDomRef(), oTable.getDomRef("noDataCnt"), "NoData visible");

		oTable.setShowOverlay(true);
		assert.strictEqual(oTable.getFocusDomRef(), oTable.getDomRef("overlay"), "Overlay visible");

		oTable.setShowOverlay(false);
		oTable.setShowNoData(false);
		assert.strictEqual(oTable.getFocusDomRef(), oTable.getDomRef(), "No focusable elements");

		oTable.destroy();
		assert.strictEqual(oTable.getFocusDomRef(), null, "Not rendered");
	});

	QUnit.test("#getBinding", function(assert) {
		var oRowsBinding = oTable.getBinding("rows");
		var oColumnsBinding = oTable.bindColumns({path: "/", template: new Column()}).getBinding("columns");
		var oGetBinding = sinon.spy(Control.prototype, "getBinding");

		assert.strictEqual(oTable.getBinding(), oRowsBinding, "Without arguments: returned the rows binding");
		assert.ok(oGetBinding.calledOnce, "Without arguments: Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("rows"), "Without arguments: Called with 'rows'");
		assert.ok(oGetBinding.calledOn(oTable), "Without arguments: Called with the correct context");

		oGetBinding.reset();
		assert.strictEqual(oTable.getBinding(null), oRowsBinding, "With 'null': returned the rows binding");
		assert.ok(oGetBinding.calledOnce, "With 'null': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("rows"), "With 'null': Called with 'rows'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'null': Called with the correct context");

		oGetBinding.reset();
		assert.strictEqual(oTable.getBinding("rows"), oRowsBinding, "With 'rows': returned the rows binding");
		assert.ok(oGetBinding.calledOnce, "With 'rows': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("rows"), "With 'rows': Called with 'rows'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'rows': Called with the correct context");

		oGetBinding.reset();
		assert.strictEqual(oTable.getBinding("columns"), oColumnsBinding, "With 'columns': returned the columns binding");
		assert.ok(oGetBinding.calledOnce, "With 'columns': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("columns"), "With 'columns': Called with 'columns'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'columns': Called with the correct context");

		assert.notStrictEqual(oRowsBinding, oColumnsBinding, "Returned bindings for rows and columns are not the same object");

		oGetBinding.restore();
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
			var TestControl = TableQUnitUtils.TestControl;

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

	QUnit.test("Table toolbar design and style properties are set", function(assert) {
		var oToolbar = new Toolbar({
			design: "Solid",
			style: "Standard"
		});
		var oTable = new Table({
			toolbar: oToolbar
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ToolbarDesign.Solid, oToolbar.getDesign(), "Design property of the Toolbar is Solid");
		assert.strictEqual(ToolbarDesign.Solid, oToolbar.getActiveDesign(), "Active design of the Toolbar is Solid as well");

		assert.strictEqual(ToolbarStyle.Standard, oToolbar.getStyle(), "Style property of the Toolbar is Standard");

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

	QUnit.test("#pushSortedColumn, #getSortedColumns", function(assert) {
		function assertSortedColumns(aExpectedColumns) {
			var aSortedColumns = oTable.getSortedColumns();

			assert.equal(aSortedColumns.length, aExpectedColumns.length, "Number of sorted columns");

			for (var i = 0; i < aSortedColumns.length; i++) {
				assert.strictEqual(aSortedColumns[i], aExpectedColumns[i], "Sorted column #" + i);
			}
		}

		oTable.pushSortedColumn(oTable.getColumns()[1]);
		assertSortedColumns([oTable.getColumns()[1]]);

		oTable.pushSortedColumn(oTable.getColumns()[0], true);
		assertSortedColumns([oTable.getColumns()[1], oTable.getColumns()[0]]);

		oTable.pushSortedColumn(oTable.getColumns()[0], true);
		assertSortedColumns([oTable.getColumns()[1], oTable.getColumns()[0]]);

		oTable.pushSortedColumn(oTable.getColumns()[0]);
		assertSortedColumns([oTable.getColumns()[0]]);
	});

	QUnit.test("Multi-columns sorting", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {
			var aSortedColumns = oTable.getSortedColumns();

			assert.equal(aSortedColumns.length, 2, "2 columns are sorted");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "name", "First column sort property");
			assert.strictEqual(aSortedColumns[0].getSortOrder(), SortOrder.Ascending, "First column sort order");
			assert.strictEqual(aSortedColumns[1].getSortProperty(), "lastName", "Second column sort property");
			assert.strictEqual(aSortedColumns[1].getSortOrder(), SortOrder.Ascending, "Second column sort order");

			assert.strictEqual(oTable.getRows()[3].getCells()[0].getText(), "Open", "Second sorting column works.");
			assert.strictEqual(oTable.getRows()[3].getCells()[1].getText(), "Doris", "First sorting column works.");

			oTable.sort(aSortedColumns[0], SortOrder.Descending, true);

			aSortedColumns = oTable.getSortedColumns();
			assert.equal(aSortedColumns.length, 2, "2 columns are sorted");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "name", "First column sort property");
			assert.strictEqual(aSortedColumns[0].getSortOrder(), SortOrder.Descending, "First column sort order");
			assert.strictEqual(aSortedColumns[1].getSortProperty(), "lastName", "Second column sort property");
			assert.strictEqual(aSortedColumns[1].getSortOrder(), SortOrder.Ascending, "Second column sort order");

			done();
		};

		oTable.attachEventOnce("rowsUpdated", fnHandler);
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

				oTable.detachRowsUpdated(fnHandler);

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

		oTable.attachRowsUpdated(fnHandler);
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

			oTable.detachRowsUpdated(fnHandler);
			oTable.attachRowsUpdated(fnHandler2);
			// remove sorting
			oTable.sort();
		};

		var fnHandler2 = function() {
			var aSortedColumns = oTable.getSortedColumns();

			assert.equal(aSortedColumns.length, 0, "No column sorted");

			assert.ok(aColumns[0].getSorted() == false, "First column not sorted");
			assert.ok(aColumns[1].getSorted() == false, "Second column not sorted");

			oTable.detachRowsUpdated(fnHandler2);
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
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
				oTable.detachRowsUpdated(fnHandler);
				oRemovedColumn = oTable.removeColumn(oTable.getSortedColumns()[0]);
				oTable.attachRowsUpdated(fnHandler2);
			}
		};

		var fnHandler2 = function() {
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 1, "sorted column deletion.");
			assert.strictEqual(oRemovedColumn.getSortProperty(), "name", "first name is removed");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "lastName", "second column becomes the first column.");
			oTable.detachRowsUpdated(fnHandler2);
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("remove all columns", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {

			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachRowsUpdated(fnHandler);
				oTable.removeAllColumns();
				oTable.attachRowsUpdated(fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachRowsUpdated(fnHandler2);
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 0, "sorted column deletion.");
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
		sortTable();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("destroy columns", function(assert) {
		var done = assert.async();
		creatSortingTableData();

		var fnHandler = function() {

			var aSortedColumns = oTable.getSortedColumns();

			if (aSortedColumns.length === 2) {
				oTable.detachRowsUpdated(fnHandler);
				oTable.destroyColumns();
				oTable.attachRowsUpdated(fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachRowsUpdated(fnHandler2);
			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 0, "sorted column deletion.");
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
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
				oTable.detachRowsUpdated(fnHandler);
				oTable._bReorderInProcess = true;
				oRemovedColumn = oTable.removeColumn(aSortedColumns[1]);

				oTable.attachRowsUpdated(fnHandler2);
			}
		};

		var fnHandler2 = function() {
			oTable.detachRowsUpdated(fnHandler2);
			oTable.insertColumn(oRemovedColumn, 0);
			oTable._bReorderInProcess = false;
			oTable.attachRowsUpdated(fnHandler3);
		};

		var fnHandler3 = function() {

			var aSortedColumns = oTable.getSortedColumns();
			assert.strictEqual(aSortedColumns.length, 2, "2 sorted columns.");
			assert.strictEqual(aSortedColumns[0].getSortProperty(), "name", "first name stays in first sorted column");
			assert.strictEqual(aSortedColumns[1].getSortProperty(), "lastName", "last name stays in second sorted column");
			oTable.detachRowsUpdated(fnHandler3);
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
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
		var spy = sinon.spy();
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
		},
		testBindRows: function(oTable, fnBind, assert) {
			var oDestroyRows = sinon.spy(oTable, "destroyRows");
			var oInnerBindRows = sinon.spy(oTable, "_bindRows");
			var oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
			var oOnBindingChange = sinon.spy(oTable, "_onBindingChange");
			var oOnBindingDataRequested = sinon.spy(oTable, "_onBindingDataRequested");
			var oOnBindingDataReceived = sinon.spy(oTable, "_onBindingDataReceived");
			var oBindAggregationOfControl = sinon.spy(Control.prototype, "bindAggregation");
			var oBindingInfo = oTable.getBindingInfo("rows");

			function resetSpies() {
				oDestroyRows.reset();
				oInnerBindRows.reset();
				oInnerUnbindRows.reset();
				oOnBindingChange.reset();
				oOnBindingDataRequested.reset();
				oOnBindingDataReceived.reset();
				oBindAggregationOfControl.reset();
			}

			// Rebind
			fnBind(oBindingInfo);
			assert.ok(oInnerBindRows.calledOnce, "Rebind - _bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oBindingInfo), "Rebind - _bindRows was called with the correct parameters");
			assert.ok(oInnerUnbindRows.calledOnce, "Rebind - _unbindRows was called");
			assert.ok(oDestroyRows.notCalled, "Rebind - destroyRows was not called");
			assert.ok(oBindAggregationOfControl.calledOnce, "Rebind - bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oBindingInfo),
				"Rebind - bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable), "Rebind - bindAggregation of Control was called with the correct context");
			resetSpies();

			// Temporary fix for the Support Assistant hacks. Support Assistant should implement a selection plugin.
			// TODO: Before we recommend to implement a selection plugin -> Complete BLI CPOUIFTEAMB-1464
			//oTable.getBinding().fireEvent("change");
			//oTable.getBinding().fireEvent("dataRequested");
			//oTable.getBinding().fireEvent("dataReceived");
			//assert.ok(oOnBindingChange.calledOnce, "The change event listener was called once");
			//assert.ok(oOnBindingChange.calledOn(oTable), "The change event listener was called with the correct context");
			//assert.ok(oOnBindingDataRequested.calledOnce, "The dataRequested event listener was called once");
			//assert.ok(oOnBindingChange.calledOn(oTable), "The dataRequested event listener was called with the correct context");
			//assert.ok(oOnBindingDataReceived.calledOnce, "The dataReceived event listener was called once");
			//assert.ok(oOnBindingChange.calledOn(oTable), "The dataReceived event listener was called with the correct context");
			//resetSpies();

			// Rebind to non-existing model
			fnBind("otherModel>" + oBindingInfo.path);
			assert.ok(oInnerBindRows.calledOnce, "Rebind to non-existing model - _bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oTable.getBindingInfo("rows")),
				"Rebind to non-existing model - _bindRows was called with the correct parameters");
			assert.ok(oInnerUnbindRows.calledOnce, "Rebind to non-existing model - _unbindRows was called");
			assert.ok(oDestroyRows.notCalled, "Rebind to non-existing model - destroyRows was not called");
			assert.ok(oBindAggregationOfControl.calledOnce, "Rebind to non-existing model - bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oTable.getBindingInfo("rows")),
				"Rebind to non-existing model - bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable),
				"Rebind to non-existing model - bindAggregation of Control was called with the correct context");
			resetSpies();

			// Set the model.
			oTable.setModel(oTable.getModel(), "otherModel");
			assert.ok(oInnerBindRows.notCalled, "Set the model - _bindRows was not called");
			assert.ok(oInnerUnbindRows.notCalled, "Set the model - _unbindRows was not called");
			assert.ok(oDestroyRows.notCalled, "Set the model - destroyRows was not called");
			resetSpies();

			oTable.getBinding().fireEvent("change");
			oTable.getBinding().fireEvent("dataRequested");
			oTable.getBinding().fireEvent("dataReceived");
			assert.ok(oOnBindingChange.calledOnce, "The change event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The change event listener was called with the correct context");
			assert.ok(oOnBindingDataRequested.calledOnce, "The dataRequested event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The dataRequested event listener was called with the correct context");
			assert.ok(oOnBindingDataReceived.calledOnce, "The dataReceived event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The dataReceived event listener was called with the correct context");
			resetSpies();

			// Change the model.
			oTable.setModel(new JSONModel(oTable.getModel().getData()), "otherModel");
			assert.ok(oInnerBindRows.notCalled, "Change the model - _bindRows was not called");
			assert.ok(oInnerUnbindRows.notCalled, "Change the model - _unbindRows was not called");
			assert.ok(oDestroyRows.notCalled, "Change the model - destroyRows was not called");
			resetSpies();

			oTable.getBinding().fireEvent("change");
			oTable.getBinding().fireEvent("dataRequested");
			oTable.getBinding().fireEvent("dataReceived");
			assert.ok(oOnBindingChange.calledOnce, "The change event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The change event listener was called with the correct context");
			assert.ok(oOnBindingDataRequested.calledOnce, "The dataRequested event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The dataRequested event listener was called with the correct context");
			assert.ok(oOnBindingDataReceived.calledOnce, "The dataReceived event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The dataReceived event listener was called with the correct context");
			resetSpies();

			var oExternalChangeSpy = sinon.spy();
			var oExternalDataRequestedSpy = sinon.spy();
			var oExternalDataReceivedSpy = sinon.spy();
			oBindingInfo = {
				path: "/modelData",
				sorter: new Sorter({
					path: "modelData>money",
					descending: true
				}),
				filters: [
					new Filter({
						path: "modelData>money",
						operator: "LT",
						value1: 5
					})
				],
				template: new Label({
					text: "Last Name"
				}),
				events: {
					change: oExternalChangeSpy,
					dataRequested: oExternalDataRequestedSpy,
					dataReceived: oExternalDataReceivedSpy
				}
			};
			fnBind(oBindingInfo);
			this.assertBindingInfo(assert, "BindingInfo", oTable.getBindingInfo("rows"), oBindingInfo);
			resetSpies();
			oExternalChangeSpy.reset();
			oExternalDataRequestedSpy.reset();
			oExternalDataReceivedSpy.reset();

			oTable.getBinding().fireEvent("change");
			oTable.getBinding().fireEvent("dataRequested");
			oTable.getBinding().fireEvent("dataReceived");
			assert.ok(oOnBindingChange.calledOnce, "The change event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The change event listener was called with the correct context");
			assert.ok(oExternalChangeSpy.calledOnce, "The external change event listener was called once");
			assert.ok(oExternalChangeSpy.calledOn(oTable.getBinding()),
				"The external change event listener was called with the correct context");
			assert.ok(sinon.calledInOrder(oOnBindingChange, oExternalChangeSpy),
				"The change event listener of the table was called before the external change spy");
			assert.ok(oOnBindingDataRequested.calledOnce, "The dataRequested event listener was called once");
			assert.ok(oOnBindingDataRequested.calledOn(oTable), "The dataRequested event listener was called with the correct context");
			assert.ok(oExternalDataRequestedSpy.calledOnce, "The external dataRequested event listener was called once");
			assert.ok(oExternalDataRequestedSpy.calledOn(oTable.getBinding()),
				"The external dataRequested event listener was called with the correct context");
			assert.ok(sinon.calledInOrder(oOnBindingDataRequested, oExternalDataRequestedSpy),
				"The dataRequested event listener of the table was called before the external dataRequested spy");
			assert.ok(oOnBindingDataReceived.calledOnce, "The dataReceived event listener was called once");
			assert.ok(oOnBindingDataReceived.calledOn(oTable), "The dataReceived event listener was called with the correct context");
			assert.ok(oExternalDataReceivedSpy.calledOnce, "The external dataReceived event listener was called once");
			assert.ok(oExternalDataReceivedSpy.calledOn(oTable.getBinding()),
				"The external dataReceived event listener was called with the correct context");
			assert.ok(sinon.calledInOrder(oOnBindingDataReceived, oExternalDataReceivedSpy),
				"The dataReceived event listener of the table was called before the external dataReceived spy");

			oBindAggregationOfControl.restore();
		},
		testBindRowsLegacy: function(oTable, fnBind, assert) {
			var oInnerBindRows = sinon.spy(oTable, "_bindRows");
			var oBindAggregationOfControl = sinon.spy(Control.prototype, "bindAggregation");
			var oSorter = new Sorter({
				path: "modelData>money",
				descending: true
			});
			var oFilter = new Filter({
				path: "modelData>money",
				operator: "LT",
				value1: 5
			});
			var oTemplate = new Label({
				text: "Last Name"
			});

			// (sPath)
			fnBind("/modelData");
			assert.ok(oInnerBindRows.calledOnce, "_bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oTable.getBindingInfo("rows")), "_bindRows was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOnce, "bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oTable.getBindingInfo("rows")),
				"bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable), "bindAggregation of Control was called with the correct context");
			this.assertBindingInfo(assert, "(sPath)", oTable.getBindingInfo("rows"), {
				path: "/modelData"
			});
			oInnerBindRows.reset();
			oBindAggregationOfControl.reset();

			// (sPath, oSorter)
			fnBind("/modelData", oSorter);
			assert.ok(oInnerBindRows.calledOnce, "_bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oTable.getBindingInfo("rows")), "_bindRows was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOnce, "bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oTable.getBindingInfo("rows")),
				"bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable), "bindAggregation of Control was called with the correct context");
			this.assertBindingInfo(assert, "(sPath, oSorter)", oTable.getBindingInfo("rows"), {
				path: "/modelData",
				sorter: oSorter
			});
			oInnerBindRows.reset();
			oBindAggregationOfControl.reset();

			// (sPath, oSorter, aFilters)
			fnBind("/modelData", oSorter, [oFilter]);
			assert.ok(oInnerBindRows.calledOnce, "_bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oTable.getBindingInfo("rows")), "_bindRows was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOnce, "bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oTable.getBindingInfo("rows")),
				"bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable), "bindAggregation of Control was called with the correct context");
			this.assertBindingInfo(assert, "(sPath, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
				path: "/modelData",
				sorter: oSorter,
				filters: [oFilter]
			});
			oInnerBindRows.reset();
			oBindAggregationOfControl.reset();

			// (sPath, vTemplate, oSorter, aFilters)
			fnBind("/modelData", oTemplate, oSorter, [oFilter]);
			assert.ok(oInnerBindRows.calledOnce, "_bindRows was called once");
			assert.ok(oInnerBindRows.calledWith(oTable.getBindingInfo("rows")), "_bindRows was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOnce, "bindAggregation of Control was called once");
			assert.ok(oBindAggregationOfControl.calledWithExactly("rows", oTable.getBindingInfo("rows")),
				"bindAggregation of Control was called with the correct parameters");
			assert.ok(oBindAggregationOfControl.calledOn(oTable), "bindAggregation of Control was called with the correct context");
			this.assertBindingInfo(assert, "(sPath, vTemplate, oSorter, aFilters)", oTable.getBindingInfo("rows"), {
				path: "/modelData",
				sorter: oSorter,
				filters: [oFilter],
				template: oTemplate
			});

			oBindAggregationOfControl.restore();
		}
	});

	QUnit.test("Bind rows with \"bindRows\" method", function(assert) {
		this.testBindRows(oTable, oTable.bindRows.bind(oTable), assert);
	});

	QUnit.test("Bind rows with \"bindAggregation\" method", function(assert) {
		this.testBindRows(oTable, oTable.bindAggregation.bind(oTable, "rows"), assert);
	});

	QUnit.test("Bind rows with \"bindRows\" method - legacy API", function(assert) {
		this.testBindRowsLegacy(oTable, oTable.bindRows.bind(oTable), assert);
	});

	QUnit.test("Bind rows with \"bindAggregation\" method - legacy API", function(assert) {
		this.testBindRowsLegacy(oTable, oTable.bindAggregation.bind(oTable, "rows"), assert);
	});

	QUnit.test("Bind rows in the constructor", function(assert) {
		var oInnerBindRows = sinon.spy(Table.prototype, "_bindRows");
		var oTable;

		/*eslint-disable no-new */
		oTable = new Table({
			rows: {path: "/modelData"},
			columns: [new Column()],
			models: new JSONModel()
		});
		/*eslint-enable no-new */

		assert.ok(oInnerBindRows.calledOnce, "With model - _bindRows was called");
		assert.ok(oInnerBindRows.calledWithExactly(oTable.getBindingInfo("rows")),
			"With model - _bindRows was called with the correct parameters");
		oInnerBindRows.reset();

		/*eslint-disable no-new */
		oTable = new Table({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});
		/*eslint-enable no-new */

		assert.ok(oInnerBindRows.calledOnce, "Without model - _bindRows was called");
		assert.ok(oInnerBindRows.calledWithExactly(oTable.getBindingInfo("rows")),
			"Without model - _bindRows was called with the correct parameters");

		oInnerBindRows.restore();
	});

	QUnit.test("Unbind rows with \"unbindRows\" method", function(assert) {
		var oDestroyRows = sinon.spy(oTable, "destroyRows");
		var oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
		var oUnbindAggregationOfControl = sinon.spy(Control.prototype, "unbindAggregation");

		oTable.unbindRows();
		assert.ok(oInnerUnbindRows.calledOnce, "_unbindRows was called once");
		assert.ok(oDestroyRows.notCalled, "destroyRows was not called");
		assert.ok(oUnbindAggregationOfControl.calledOnce, "unbindAggregation of Control was called once");
		assert.ok(oUnbindAggregationOfControl.calledWithExactly("rows", true), "unbindAggregation of Control was called with the correct parameters");
		assert.ok(oUnbindAggregationOfControl.calledOn(oTable), "unbindAggregation of Control was called with the correct context");

		oUnbindAggregationOfControl.restore();
	});

	QUnit.test("Unbind rows with \"unbindAggregation\" method", function(assert) {
		var oDestroyRows = sinon.spy(oTable, "destroyRows");
		var oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
		var oUnbindAggregationOfControl = sinon.spy(Control.prototype, "unbindAggregation");

		oTable.unbindAggregation("rows");
		assert.ok(oInnerUnbindRows.calledOnce, "_unbindRows was called once");
		assert.ok(oDestroyRows.notCalled, "destroyRows was not called");
		assert.ok(oUnbindAggregationOfControl.calledOnce, "unbindAggregation of Control was called once");
		assert.ok(oUnbindAggregationOfControl.calledWithExactly("rows", true), "unbindAggregation of Control was called with the correct parameters");
		assert.ok(oUnbindAggregationOfControl.calledOn(oTable), "unbindAggregation of Control was called with the correct context");

		oUnbindAggregationOfControl.restore();
	});

	QUnit.test("Virtual context handling", function(assert) {
		oTable.bindRows("namedModel>" + oTable.getBindingInfo("rows").path);
		oTable.setModel(oTable.getModel(), "namedModel");

		var iInitialRowCount = oTable.getRows().length;
		var oUpdateRowsHookSpy = sinon.spy();
		var oInvalidateSpy = sinon.spy(oTable, "invalidate");
		var oBinding = oTable.getBinding();

		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateRows, oUpdateRowsHookSpy);

		assert.notOk("_oVirtualRow" in oTable, "Virtual row does not exist");

		// Fake the virtual context process.

		oBinding.fireEvent("change", {
			detailedReason: "AddVirtualContext",
			reason: "change"
		});

		var oVirtualRow = oTable._oVirtualRow;

		assert.ok(oInvalidateSpy.notCalled, "AddVirtualContext: Table is not invalidated");
		assert.ok(oUpdateRowsHookSpy.notCalled, "AddVirtualContext: UpdateRows hook is not called");
		assert.ok(oTable.indexOfAggregation("_hiddenDependents", oVirtualRow) >= 0, "AddVirtualContext: Virtual row added to hidden dependents");
		assert.ok(oVirtualRow.getId().endsWith("-virtual"), "AddVirtualContext: Virtual row has the correct ID");
		assert.strictEqual(oTable.getRows().length, iInitialRowCount, "AddVirtualContext: Number of rows is correct");
		assert.strictEqual(oVirtualRow.getBindingContext("namedModel"), oBinding.getContexts(0, 1)[0],
			"AddVirtualContext: Virtual row has the correct context");
		assert.notOk(oVirtualRow.bIsDestroyed, "AddVirtualContext: Virtual row is not destroyed");
		oInvalidateSpy.reset();
		oUpdateRowsHookSpy.reset();

		oBinding.fireEvent("change", {
			detailedReason: "RemoveVirtualContext",
			reason: "change"
		});

		assert.ok(oInvalidateSpy.notCalled, "RemoveVirtualContext: Table is not invalidated");
		assert.ok(oUpdateRowsHookSpy.notCalled, "RemoveVirtualContext: UpdateRows hook is not called");
		assert.ok(oTable.indexOfAggregation("_hiddenDependents", oVirtualRow) === -1,
			"RemoveVirtualContext: Virtual row removed from hidden dependents");
		assert.strictEqual(oTable.getRows().length, iInitialRowCount, "RemoveVirtualContext: Number of rows is correct");
		assert.ok(oVirtualRow.bIsDestroyed, "RemoveVirtualContext: Virtual row is destroyed");
		assert.notOk("_oVirtualRow" in oTable, "RemoveVirtualContext: Reference to virtual row removed from table");

		oBinding.fireEvent("change", {
			detailedReason: "AddVirtualContext",
			reason: "change"
		});
		oVirtualRow = oTable._oVirtualRow;
		oTable.bindRows(oTable.getBindingInfo("rows"));

		assert.ok(oTable.indexOfAggregation("_hiddenDependents", oVirtualRow) === -1, "BindRows: Virtual row removed from hidden dependents");
		assert.ok(oVirtualRow.bIsDestroyed, "BindRows: Virtual row is destroyed");
		assert.notOk("_oVirtualRow" in oTable, "BindRows: Reference to virtual row removed from table");
	});

	QUnit.test("Filter", function(assert) {
		oTable.setFirstVisibleRow(1);
		oTable.getBinding().filter(new Filter({
			path: "modelData>money",
			operator: "LT",
			value1: 5
		}));
		assert.equal(oTable.getFirstVisibleRow(), 0, "'firstVisibleRow' set to 0 when filtering");
	});

	QUnit.test("Sort", function(assert) {
		oTable.setFirstVisibleRow(1);
		oTable.getBinding().sort(new Sorter({
			path: "modelData>money",
			descending: true
		}));
		assert.equal(oTable.getFirstVisibleRow(), 0, "'firstVisibleRow' set to 0 when sorting");
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
			oTable.attachEventOnce("rowsUpdated", fnTestScroll);
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

		oTable.attachEventOnce("rowsUpdated", fnTest);
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
		jQuery(oTable.getDomRef("selall")).trigger("click");
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).trigger("click");

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("click");
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("click");

		sTestCase = "APISetSelectedIndex";
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Select All on Binding Change", function(assert) {
		var done = assert.async();
		var oModel;
		oTable.attachRowSelectionChange(function() {
			assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");

			oTable.attachEventOnce("rowsUpdated", function() {
				assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

				oTable.attachEventOnce("rowsUpdated", function() {
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
		oTable.$("selall").trigger("click");
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
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
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
				models: TableQUnitUtils.createODataModel(),
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
		var rowsUpdatedSpy = sinon.spy(oTable, "fireRowsUpdated");
		var sTestReason = "test_reason";

		oTable.attachEventOnce("_rowsUpdated", function(oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), sTestReason, "The event has been fired with the correct reason");
			assert.ok(rowsUpdatedSpy.notCalled, "The public event rowsUpdated has not been fired yet");
		});

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.ok(rowsUpdatedSpy.calledOnce, "The public event rowsUpdated was fired");
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
		var oMockServer = TableQUnitUtils.startMockServer();

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
		var oMockServer = TableQUnitUtils.startMockServer();

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

		return this.oTable.qunit.whenRenderingFinished().then(function() {
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

		return this.oTable.qunit.whenRenderingFinished().then(function() {
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

		return this.oTable.qunit.whenRenderingFinished().then(function() {
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

		return this.oTable.qunit.whenRenderingFinished().then(function() {
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
		var oMockServer = TableQUnitUtils.startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding().attachEventOnce("change", function() {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.invalidate();
				oTable.getBinding().refresh(true);
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

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		var oMockServer = TableQUnitUtils.startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding().attachEventOnce("change", function() {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			}).then(function() {
				aFiredReasons = [];
				oTable.getBinding().refresh(true);

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

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		var oMockServer = TableQUnitUtils.startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding().attachEventOnce("change", function() {
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

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		var oMockServer = TableQUnitUtils.startMockServer();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTableWithODataModel(sVisibleRowCountMode);

			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});

			return new Promise(function(resolve) {
				oTable.getBinding().attachEventOnce("change", function() {
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

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.getRows()[0].collapse();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			aFiredReasons = [];
			oTable.getRows()[0].expand();

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

		return oTable.qunit.whenRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.getRows()[0].collapse();

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

		return oTable.qunit.whenRenderingFinished().then(function() {
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

		return oTable.qunit.whenRenderingFinished().then(function() {
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
		var oMockServer = TableQUnitUtils.startMockServer();

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

		return oTable.qunit.whenRenderingFinished().then(function() {
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

		return oTable.qunit.whenRenderingFinished().then(function() {
			aFiredReasons = [];
			oTable.setFirstVisibleRow(1);
			assert.strictEqual(oTable.getFirstVisibleRow(), 1, "Set to 1: Property value");
			assert.strictEqual(oTable._getFirstRenderedRowIndex(), 1, "Set to undefined: First rendered row index");

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]);
		}).then(function() {
			aFiredReasons = [];
			oTable.setFirstVisibleRow();
			assert.strictEqual(oTable.getFirstVisibleRow(), 0, "Set to undefined: Property value");
			assert.strictEqual(oTable._getFirstRenderedRowIndex(), 0, "Set to undefined: First rendered row index");

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]);
		}).then(function() {
			aFiredReasons = [];
			oTable.setFirstVisibleRow(null);
			assert.strictEqual(oTable.getFirstVisibleRow(), 0, "Set to null: Property value");
			assert.strictEqual(oTable._getFirstRenderedRowIndex(), 0, "Set to null: First rendered row index");

			return that.checkRowsUpdated(assert, aFiredReasons, []);
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

		return oTable.qunit.whenRenderingFinished().then(function() {
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

		return oTable.qunit.whenRenderingFinished().then(function() {
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
			oTable.getBinding().fireEvent("dataRequested");

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

		return oTable.qunit.whenRenderingFinished().then(function() {
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

		return oTable.qunit.whenRenderingFinished().then(function() {
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

	QUnit.test("#_onPersoApplied", function(assert) {
		var oColumn = oTable.getColumns()[0];
		var oBinding = oTable.getBinding();
		var oBindingSort = sinon.spy(oBinding, "sort");
		var iTimeout;

		oColumn.setSorted(true);
		oTable._onPersoApplied();

		assert.ok(oBindingSort.calledOnce, "Binding#sort was called");

		if (oBindingSort.called) {
			var aSorters = oBindingSort.getCall(0).args[0];

			assert.equal(aSorters.length, 1, "One sorter was passed to Binding#sort");
			assert.strictEqual(aSorters[0].sPath, oColumn.getSortProperty(), "The sorter has the correct path");
			assert.strictEqual(aSorters[0].bDescending, oColumn.getSortOrder() === SortOrder.Descending, "The sorter has the correct sort order");
		}

		return Promise.race([
			new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", function() {
					assert.ok(true, "rowsUpdated event was fired");
					clearTimeout(iTimeout);
					resolve();
				});
			}), new Promise(function(resolve) {
				iTimeout = setTimeout(function() {
					assert.ok(false, "rowsUpdated event should have been fired");
					resolve();
				}, 1000);
			})
		]).then(function() {
			oColumn.setVisible(false);
			oTable._onPersoApplied();

			return Promise.race([
				new Promise(function(resolve) {
					oTable.attachEventOnce("rowsUpdated", function() {
						assert.ok(true, "rowsUpdated event was fired");
						clearTimeout(iTimeout);
						resolve();
					});
				}), new Promise(function(resolve) {
					iTimeout = setTimeout(function() {
						assert.ok(false, "rowsUpdated event should have been fired");
						resolve();
					}, 1000);
				})
			]);
		});
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
		var oBinding = oTable.getBinding();
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
		sinon.stub(oTable, "getBinding").withArgs("rows").returns(undefined);
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

		sinon.stub(TableUtils, "canUsePendingRequestsCounter").returns(true);
		test(true, 1, true); // Data requested: Set busy state to true.
		test(true, 2, true); // Data requested: Keep busy state.
		test(false, 1, true); // Data received: Keep busy state.
		test(false, 0, false); // Data received: Set busy state to false.

		TableUtils.canUsePendingRequestsCounter.returns(false);
		test(true, true, true); // Data requested: Set busy state to true.
		test(true, true, true); // Data requested: Keep busy state.
		test(false, false, false); // Data received: Set busy state to false.
		test(false, false, false); // Data received: Keep busy state.

		// Handling of a "dataRequested" event after multiple "dataReceived" events if the pending requests counter cannot be used.
		oTable._onBindingDataReceived.call(oTable, oEvent);
		oTable._onBindingDataReceived.call(oTable, oEvent);
		oTable._onBindingDataRequested.call(oTable, oEvent);
		clock.tick(1);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTable.getBusy(), true, "The busy state of the table is: true");

		// Cleanup
		oTable.detachEvent("busyStateChanged", onBusyStateChangedEventHandler);
		clock.restore();
		TableUtils.canUsePendingRequestsCounter.restore();
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

	QUnit.test("_getTotalRowCount with client binding", function(assert){
		oTable.bindRows({path: "/modelData"});
		assert.strictEqual(oTable._getTotalRowCount(), 200, "Binding#getLength defines the total row count in the table");

		oTable.bindRows({path: "/modelData", length: 5});
		assert.strictEqual(oTable._getTotalRowCount(), 5, "The \"length\" parameter in the binding info overrides Binding#getLength");

		var oModel = oTable.getModel();
		oTable.setModel(null);
		assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding the total row count is 0, regardless of the binding info");
		oTable.setModel(oModel);

		oTable.unbindRows();
		assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding or binding info the total row count is 0");
	});

	QUnit.test("_getTotalRowCount with OData binding", function(assert){
		var oMockServer = TableQUnitUtils.startMockServer();

		oTable.bindRows({path: "/Products"});
		oTable.setModel(TableQUnitUtils.createODataModel());
		assert.strictEqual(oTable._getTotalRowCount(), 200, "On rebind, the last known binding length of the previous binding is returned");

		return new Promise(function(resolve) {
			oTable.getBinding().attachEventOnce("change", function() {
				assert.strictEqual(oTable._getTotalRowCount(), 16, "After rebind, the new binding length is returned");
				resolve();
			});
		}).then(function() {
			return new Promise(function(resolve) {
				oTable.getBinding().refresh();
				assert.strictEqual(oTable._getTotalRowCount(), 16, "On refresh, the last known binding length is returned");
				oTable.getBinding().attachEventOnce("change", function() {
					assert.strictEqual(oTable._getTotalRowCount(), 16, "After refresh, the new binding length is returned");
					resolve();
				});
			});
		}).then(function() {
			return new Promise(function(resolve) {
				oTable.getBinding().filter(new Filter({
					path: "Category",
					operator: "EQ",
					value1: "GC"
				}));
				assert.strictEqual(oTable._getTotalRowCount(), 16, "On filter, the last known binding length is returned");
				oTable.getBinding().attachEventOnce("change", function() {
					assert.strictEqual(oTable._getTotalRowCount(), 3, "After filter, the new binding length is returned");
					oTable.getBinding().refresh();
					resolve();
				});
			});
		}).then(function() {
			return new Promise(function(resolve) {
				oTable.bindRows({path: "/Products", length: 5});
				assert.strictEqual(oTable._getTotalRowCount(), 5, "The \"length\" parameter in the binding info overrides Binding#getLength");
				oTable.getBinding().attachEventOnce("change", function() {
					assert.strictEqual(oTable._getTotalRowCount(), 5, "After data is received, still the \"length\" parameter is returned");
					resolve();
				});
			});
		}).then(function() {
				return new Promise(function(resolve) {
					oTable.getBinding().refresh();
					assert.strictEqual(oTable._getTotalRowCount(), 5, "On refresh, still the \"length\" parameter is returned");
					oTable.getBinding().attachEventOnce("change", function() {
						assert.strictEqual(oTable._getTotalRowCount(), 5, "After refresh, still the \"length\" parameter is returned");
						resolve();
					});
				});
		}).then(function() {
			var oModel = oTable.getModel();
			oTable.setModel(null);
			assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding the total row count is 0, regardless of the binding info");

			oTable.setModel(oModel);
			oTable.unbindRows();
			assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding or binding info the total row count is 0");

			oMockServer.destroy();
		});
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

			return oTable.qunit.whenRenderingFinished().then(function() {
				assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

				oTable.destroy();

				oTable = TableQUnitUtils.createTable({
					visibleRowCountMode: sVisibleRowCountMode,
					visibleRowCount: 5,
					rows: {path: "/"},
					models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
				}, function(oTable) {
					assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
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
					models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
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

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

		}).then(function() {
			oTable.destroy();

			oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
			});
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
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
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
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
			assert.ok(oTable._getSelectionPlugin().isA("sap.ui.table.plugins.SelectionModelSelection"), "The legacy selection plugin is used");
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

	QUnit.module("Hidden dependents", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oTableInvalidate = sinon.spy(this.oTable, "invalidate");
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("insertAggregation", function(assert) {
		this.oTable.insertAggregation("_hiddenDependents", new Text(), 0);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when inserting a hidden dependent without suppressing invalidation");
		this.oTableInvalidate.reset();

		this.oTable.insertAggregation("_hiddenDependents", new Text(), 0, true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when inserting a hidden dependent and suppressing invalidation");
	});

	QUnit.test("addAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when adding a hidden dependent without suppressing invalidation");
		this.oTableInvalidate.reset();

		this.oTable.addAggregation("_hiddenDependents", new Text(), true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when adding a hidden dependent and suppressing invalidation");
	});

	QUnit.test("removeAggregation", function(assert) {
		var oText = new Text();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.reset();
		this.oTable.removeAggregation("_hiddenDependents", oText);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing a hidden dependent without suppressing invalidation");
		this.oTableInvalidate.reset();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.reset();
		this.oTable.removeAggregation("_hiddenDependents", oText, true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing a hidden dependent and suppressing invalidation");
	});

	QUnit.test("removeAllAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		this.oTableInvalidate.reset();

		this.oTable.removeAllAggregation("_hiddenDependents");
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing all hidden dependents without suppressing invalidation");
		this.oTableInvalidate.reset();

		this.oTable.removeAllAggregation("_hiddenDependents", true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing all hidden dependents and suppressing invalidation");
	});

	QUnit.test("destroyAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		this.oTableInvalidate.reset();

		this.oTable.destroyAggregation("_hiddenDependents");
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when destroying all hidden dependents without suppressing invalidation");
		this.oTableInvalidate.reset();

		this.oTable.destroyAggregation("_hiddenDependents", true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when destroying all hidden dependents and suppressing invalidation");
	});

	QUnit.test("destroy", function(assert) {
		var oText = new Text();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.reset();
		oText.destroy();
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when destroying a hidden dependent");
	});

	QUnit.module("Hooks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("BindRows", function(assert) {
		var oBindRowsSpy = sinon.spy();
		var oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.BindRows, oBindRowsSpy);

		this.oTable.bindRows(oBindingInfo);
		assert.equal(oBindRowsSpy.callCount, 1, "Bind: 'BindRows' hook was called once");
		assert.ok(oBindRowsSpy.calledWithExactly(oBindingInfo), "Bind: 'BindRows' hook was correctly called");
	});

	QUnit.test("RowsBound", function(assert) {
		var oRowsBoundSpy = sinon.spy();
		var oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.RowsBound, oRowsBoundSpy);

		this.oTable.bindRows(oBindingInfo);
		assert.ok(oRowsBoundSpy.notCalled, "Bind without model: 'RowsBound' hook was not called");
		oRowsBoundSpy.reset();

		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));
		assert.equal(oRowsBoundSpy.callCount, 1, "Set model: 'RowsBound' hook was called once");
		assert.ok(oRowsBoundSpy.calledWithExactly(this.oTable.getBinding()), "Set model: 'RowsBound' hook was correctly called");
	});

	QUnit.test("UnbindRows", function(assert) {
		var oUnbindRowsSpy = sinon.spy();
		var oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.UnbindRows, oUnbindRowsSpy);
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));

		this.oTable.bindRows(oBindingInfo);
		this.oTable.unbindRows();
		assert.equal(oUnbindRowsSpy.callCount, 1, "Unbind if bound: 'UnbindRows' hook was called once");
		assert.ok(oUnbindRowsSpy.calledWithExactly(oBindingInfo), "Unbind if bound: 'UnbindRows' hook was correctly called");
		oUnbindRowsSpy.reset();

		this.oTable.unbindRows();
		assert.ok(oUnbindRowsSpy.notCalled, "Unbind if not bound: 'UnbindRows' hook was not called");
		oUnbindRowsSpy.reset();

		this.oTable.bindRows(oBindingInfo);
		this.oTable.bindRows({path: "/other"});
		assert.equal(oUnbindRowsSpy.callCount, 1, "Bind rows if bound: 'UnbindRows' hook was called once");
		assert.ok(oUnbindRowsSpy.calledWithExactly(oBindingInfo), "Bind rows if bound: 'UnbindRows' hook was correctly called");
	});

	QUnit.test("RowsUnbound", function(assert) {
		var oRowsUnboundSpy = sinon.spy();
		var oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.RowsUnbound, oRowsUnboundSpy);
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));

		this.oTable.bindRows(oBindingInfo);
		this.oTable.unbindRows();
		assert.equal(oRowsUnboundSpy.callCount, 1, "Unbind if bound: 'RowsUnbound' hook was called once");
		assert.ok(oRowsUnboundSpy.calledWithExactly(), "Unbind if bound: 'RowsUnbound' hook was correctly called");
		oRowsUnboundSpy.reset();

		this.oTable.unbindRows();
		assert.ok(oRowsUnboundSpy.notCalled, "Unbind if not bound: 'RowsUnbound' hook was not called");
		oRowsUnboundSpy.reset();

		this.oTable.bindRows(oBindingInfo);
		this.oTable.bindRows({path: "/other"});
		assert.ok(oRowsUnboundSpy.notCalled, "Bind rows if bound: 'RowsUnbound' hook was not called");
		oRowsUnboundSpy.reset();

		this.oTable.bindRows(oBindingInfo);
		this.oTable.destroy();
		assert.ok(oRowsUnboundSpy.notCalled, "Table destroyed: 'RowsUnbound' hook was not called");
	});

	QUnit.test("RefreshRows", function(assert) {
		var oRefreshRowsSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.RefreshRows, oRefreshRowsSpy);
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));
		this.oTable.bindRows({path: "/"});

		this.oTable.getBinding().fireEvent("refresh", {reason: ChangeReason.Refresh});
		assert.equal(oRefreshRowsSpy.callCount, 1, "Binding refresh with reason: 'RefreshRows' hook was called once");
		assert.ok(oRefreshRowsSpy.calledWithExactly(ChangeReason.Refresh), "Binding refresh with reason: 'RefreshRows' hook was correctly called");
		oRefreshRowsSpy.reset();

		this.oTable.getBinding().fireEvent("refresh");
		assert.equal(oRefreshRowsSpy.callCount, 1, "Binding refresh without reason: 'RefreshRows' hook was called once");
		assert.ok(oRefreshRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.Unknown),
			"Binding refresh without reason: 'RefreshRows' hook was correctly called");
	});

	QUnit.test("UpdateRows", function(assert) {
		var oUpdateRowsSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.UpdateRows, oUpdateRowsSpy);
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(20));
		this.oTable.bindRows({path: "/"});
		oUpdateRowsSpy.reset();

		this.oTable.getBinding().fireEvent("change", {reason: ChangeReason.Change});
		assert.equal(oUpdateRowsSpy.callCount, 1, "Binding change with reason: 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(ChangeReason.Change), "Binding change with reason: 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.reset();

		this.oTable.getBinding().fireEvent("change");
		assert.equal(oUpdateRowsSpy.callCount, 1, "Binding change without reason: 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.Unknown),
			"Binding change without reason: 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.reset();

		this.oTable.setFirstVisibleRow(1);
		assert.equal(oUpdateRowsSpy.callCount, 1, "Change 'firstVisibleRow': 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.FirstVisibleRowChange),
			"Change 'firstVisibleRow': 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.reset();

		this.oTable._setFirstVisibleRowIndex(2, {
			onScroll: true
		});
		assert.equal(oUpdateRowsSpy.callCount, 1, "Change 'firstVisibleRow': 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.VerticalScroll),
			"Change 'firstVisibleRow': 'UpdateRows' hook was correctly called");
	});

	QUnit.test("UpdateSizes", function(assert) {
		var oUpdateSizesSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.UpdateSizes, oUpdateSizesSpy);

		this.oTable._updateTableSizes(TableUtils.RowsUpdateReason.Resize);
		assert.equal(oUpdateSizesSpy.callCount, 1, "'UpdateSizes' hook was called once");
		assert.ok(oUpdateSizesSpy.calledWithExactly(TableUtils.RowsUpdateReason.Resize), "'UpdateSizes' hook was correctly called");
	});

	QUnit.module("NoData", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn()
				]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("After rendering with data and showNoData=true", function(assert) {
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("After rendering without data and showNoData=true", function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable({
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
	});

	QUnit.test("After rendering without data and showNoData=false", function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable({
			showNoData: false,
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Change 'showNoData' property with data", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setShowNoData(true);
		assert.ok(this.oTable.getShowNoData(), "Change from true to true: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from true to true: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to true");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(false);
		assert.ok(!this.oTable.getShowNoData(), "Change from true to false: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from true to false: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(false);
		assert.ok(!this.oTable.getShowNoData(), "Change from false to false: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from false to false: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(true);
		assert.ok(this.oTable.getShowNoData(), "Change from false to true: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from false to true: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to true");
	});

	QUnit.test("Change 'showNoData' property without data", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.unbindRows();

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(true);
		assert.ok(this.oTable.getShowNoData(), "Change from true to true: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from true to true: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from true to true");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(false);
		assert.ok(!this.oTable.getShowNoData(), "Change from true to false without rows: Property value");
		assert.equal(oInvalidateSpy.callCount, 1, "Change from true to false without rows: Table invalidated");
		sap.ui.getCore().applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false without rows");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(false);
		assert.ok(!this.oTable.getShowNoData(), "Change from false to false: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from false to false: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(true);
		assert.ok(this.oTable.getShowNoData(), "Change from false to true: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from false to true: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from false to true");

		oInvalidateSpy.reset();
		this.oTable.setShowNoData(false);
		assert.ok(!this.oTable.getShowNoData(), "Change from true to false with rows: Property value");
		assert.ok(oInvalidateSpy.notCalled, "Change from true to false with rows: Table not invalidated");
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false with rows");
	});

	QUnit.test("Change 'noData' aggregation", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oTable, "invalidate");
		var oText1 = new Text();
		var oText2 = new Text();

		this.oTable.setNoData("Hello");
		assert.ok(oInvalidateSpy.notCalled, "Table not invalidated when changing NoData from default text to custom text");

		oInvalidateSpy.reset();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Table not invalidated when changing NoData from text to a different text");

		oInvalidateSpy.reset();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Table not invalidated when changing NoData from text to the same text");

		oInvalidateSpy.reset();
		this.oTable.setNoData(oText1);
		assert.equal(oInvalidateSpy.callCount, 1, "Table invalidated when changing NoData from text to control");

		oInvalidateSpy.reset();
		this.oTable.setNoData(oText2);
		assert.equal(oInvalidateSpy.callCount, 1, "Table invalidated when changing NoData from control to control");

		oInvalidateSpy.reset();
		this.oTable.setNoData("Hello2");
		assert.equal(oInvalidateSpy.callCount, 1, "Table invalidated when changing NoData from control to text");

		oText1.destroy();
		oText2.destroy();
	});

	QUnit.test("No columns", function (assert) {
		this.oTable.removeAllColumns();
		this.oTable.setShowNoData(false);
		sap.ui.getCore().applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
	});

	QUnit.test("Update visibility", function(assert) {
		var oBinding = this.oTable.getBinding();
		var oGetBindingLength = sinon.stub(oBinding, "getLength");
		var oBindingIsA = sinon.stub(oBinding, "isA");
		var oClock = sinon.useFakeTimers();
		var that = this;

		function testNoData(bVisible, sTestTitle) {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, bVisible, sTestTitle);
			assert.strictEqual(TableUtils.isNoDataVisible(that.oTable), bVisible, sTestTitle + " - NoData is visible: " + bVisible);
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

			that.oTable._onBindingDataReceived.call(that.oTable, oEvent);
			oClock.tick(1);
			sap.ui.getCore().applyChanges();

			testNoData(bNoDataVisible, sTestTitle);
		}

		function testUpdateTotalRowCount(bNoDataVisible, sTestTitle) {
			that.oTable._adjustToTotalRowCount();
			sap.ui.getCore().applyChanges();

			testNoData(bNoDataVisible, sTestTitle);
		}

		oGetBindingLength.returns(1);
		this.oTable.setShowNoData(true);

		// Data available: NoData area is not visible.
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Data available");
		assert.strictEqual(TableUtils.isNoDataVisible(this.oTable), false, "Data available - NoData is visible: false");

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
		this.oTable.unbindRows();
		testUpdateTotalRowCount(true, "Binding removed");

		// Cleanup
		oClock.restore();
		oGetBindingLength.restore();
	});

	QUnit.module("Row visualization", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					new Column({template: new TableQUnitUtils.TestControl()})
				]
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		setRowStates: function(aStates) {
			var i = 0;

			function updateRowState(oState) {
				Object.assign(oState, aStates[i]);
				i++;
			}

			TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState);
			this.oTable.getBinding().refresh(true);

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				TableUtils.Hook.deregister(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState);
			}.bind(this));
		},
		assertIndentation: function(assert, aIndentations) {
			var aRows = this.oTable.getRows();

			function getCSSPixelSize(iPixel) {
				return iPixel === 0 ? "" : iPixel + "px";
			}

			for (var i = 0; i < aIndentations.length; i++) {
				var oRow = aRows[i];
				var iRowIndex = oRow.getIndex();
				var bRTL = this.oTable._bRtlMode;
				var oRowDomRefs = oRow.getDomRefs();
				var oRowHeader = oRowDomRefs.rowHeaderPart;
				var oFirstCellContentInRow = oRowDomRefs.rowScrollPart.querySelector("td.sapUiTableCellFirst > .sapUiTableCellInner");
				var sMessagePrefix = (bRTL ? "RTL - " : "") + "Row #" + iRowIndex + ": ";

				if (TableUtils.Grouping.isGroupMode(this.oTable)) {
					var oGroupShield = oRowHeader.querySelector(".sapUiTableGroupShield");

					assert.equal(oRowHeader.style[bRTL ? "right" : "left"], getCSSPixelSize(aIndentations[i]),
						sMessagePrefix + "Row header");
					assert.equal(oGroupShield.style[bRTL ? "marginRight" : "marginLeft"], getCSSPixelSize(-aIndentations[i]),
						sMessagePrefix + "Group shield");
					assert.equal(oFirstCellContentInRow.style[bRTL ? "paddingRight" : "paddingLeft"],
						getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				} else if (TableUtils.Grouping.isTreeMode(this.oTable)) {
					var oTreeIcon = oRowDomRefs.rowScrollPart.querySelector(".sapUiTableTreeIcon");

					assert.equal(oTreeIcon.style[bRTL ? "marginRight" : "marginLeft"], getCSSPixelSize(aIndentations[i]),
						sMessagePrefix + "Tree icon");
				} else {
					assert.equal(oRowHeader.style[bRTL ? "right" : "left"], getCSSPixelSize(aIndentations[i]),
						sMessagePrefix + "Row header");
					assert.equal(oFirstCellContentInRow.style[bRTL ? "paddingRight" : "paddingLeft"],
						getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				}
			}
		}
	});

	QUnit.test("Group indentation", function(assert) {
		var oRow = this.oTable.getRows()[0];
		var aRowStates = [{
			type: oRow.Type.GroupHeader,
			level: 1
		}, {
			type: oRow.Type.GroupHeader,
			level: 2
		}, {
			type: oRow.Type.Standard,
			level: 3
		}, {
			type: oRow.Type.Summary,
			level: 2
		}, {
			type: oRow.Type.GroupHeader,
			level: 1
		}, {
			type: oRow.Type.Standard,
			level: 2
		}, {
			type: oRow.Type.Standard,
			level: 4
		}, {
			type: oRow.Type.GroupHeader,
			level: 4
		}, {
			type: oRow.Type.Summary,
			level: 5
		}, {
			type: oRow.Type.Summary,
			level: 1
		}];
		var aExpectedIndentations = [0, 24, 24, 24, 0, 0, 36, 44, 52, 0];
		var that = this;

		TableUtils.Grouping.setGroupMode(this.oTable);
		this.oTable.invalidate();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			return that.setRowStates(aRowStates);
		}).then(function() {
			that.assertIndentation(assert, aExpectedIndentations);
		}).then(TableQUnitUtils.$changeTextDirection(true)).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			return that.setRowStates(aRowStates);
		}).then(function() {
			that.assertIndentation(assert, aExpectedIndentations);
		}).then(TableQUnitUtils.$changeTextDirection(false));
	});

	QUnit.test("Tree indentation", function(assert) {
		var aRowStates = [
			{level: 1, expandable: true},
			{level: 2},
			{level: 3},
			{level: 4},
			{level: 5},
			{level: 1}
		];
		var aExpectedIndentations = [0, 17, 34, 51, 68, 0];
		var that = this;

		TableUtils.Grouping.setTreeMode(this.oTable);
		this.oTable.invalidate();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			return that.setRowStates(aRowStates);
		}).then(function() {
			that.assertIndentation(assert, aExpectedIndentations);
		}).then(TableQUnitUtils.$changeTextDirection(true)).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			return that.setRowStates(aRowStates);
		}).then(function() {
			that.assertIndentation(assert, aExpectedIndentations);
		}).then(TableQUnitUtils.$changeTextDirection(false));
	});

	QUnit.test("Indentation without group or tree mode", function(assert) {
		var oRow = this.oTable.getRows()[0];
		var aRowStates = [{
			type: oRow.Type.GroupHeader,
			level: 1
		}, {
			type: oRow.Type.GroupHeader,
			level: 2
		}, {
			type: oRow.Type.Standard,
			level: 3
		}, {
			type: oRow.Type.Summary,
			level: 4
		}];

		return this.setRowStates(aRowStates).then(function() {
			this.assertIndentation(assert, [0, 0, 0, 0]);
		}.bind(this));
	});
});