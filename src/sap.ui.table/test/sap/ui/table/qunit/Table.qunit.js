/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
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
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/rowmodes/Interactive",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/plugins/PluginBase",
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
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/library",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/message/Message",
	"sap/m/IllustratedMessage"
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
	RowModeType,
	FixedRowMode,
	InteractiveRowMode,
	AutoRowMode,
	TableUtils,
	library,
	PluginBase,
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
	Title,
	Toolbar,
	MLibrary,
	Menu,
	MenuItem,
	Log,
	jQuery,
	oCore,
	Message,
	IllustratedMessage
) {
	"use strict";

	var SortOrder = CoreLibrary.SortOrder;
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
		var sTitle;

		if (oConfig) {
			sTitle = oConfig.title;
			delete oConfig.title;
		}
		oTable = new Table(oConfig);
		if (sTitle) {
			oTable.addExtension(new Title({text: sTitle}));
		}

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
		oCore.applyChanges();
	}

	function destroyTable() {
		if (oTable) {
			oTable.destroy();
			oTable = null;
		}
	}

	function createSortingTableData() {
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
				rowMode: new FixedRowMode({
					rowCount: 7
				}),
				extension: [
					new Toolbar({
						content: [
							new Title({text: "TABLEHEADER"}),
							new Button({
								text: "Modify Table Properties..."
							})
						]
					})
				],
				footer: "Footer",
				selectionMode: SelectionMode.Single
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

	QUnit.test("Properties and Extensions", function(assert) {
		assert.equal(oTable.$().find(".sapMTitle").text(), "TABLEHEADER", "Title of Table is correct!");
		assert.equal(oTable.getExtension()[0].$().find("button").text(), "Modify Table Properties...", "Toolbar and toolbar button are correct!");
		assert.equal(oTable.$().find(".sapUiTableFtr").text(), "Footer", "Title of Table is correct!");
		assert.equal(oTable.getSelectionMode(), "Single", "Selection mode is Single!");
		assert.equal(oTable.$().find(".sapUiTableCtrl tr.sapUiTableTr").length, oTable._getRowCounts().count, "Visible Row Count correct!");
		assert.equal(oTable.$().find(".sapUiTableRowSelectionCell").length, oTable._getRowCounts().count, "Visible Row Count correct!");
		assert.equal(oTable.getFirstVisibleRow(), 5, "First Visible Row correct!");
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.test("Properties and Extensions - Old", function(assert) {
		assert.equal(oTable.getSelectedIndex(), -1, "Selected Index is -1!");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Filter field in ColumnMenu", function(assert) {
		var done = assert.async();
		var oColFirstName = oTable.getColumns()[1];

		assert.equal(oTable.getBinding().iLength, 200, "RowCount beforeFiltering ok");
		oTable.filter(oColFirstName, "M*");

		oColFirstName.attachEventOnce("columnMenuOpen", function() {
			// check that the column menu filter input field was updated
			var oMenu = oColFirstName.getMenu();
			// open and close the menu to let it generate its items
			oMenu.close();

			var oFilterField = oCore.byId(oMenu.getId() + "-filter");
			if (oFilterField) {
				assert.equal(oFilterField.getValue(), "M*", "Filter value is M* in column menu");
				oTable.filter(oColFirstName, "D*");
				assert.equal(oFilterField.getValue(), "D*", "Filter value is M* in column menu");
			}
			done();
		});

		oColFirstName._openHeaderMenu(oColFirstName.getDomRef());
	});

	QUnit.test("Filter", function(assert) {
		var oColFirstName = oTable.getColumns()[1];
		var oColMoney = oTable.getColumns()[7];

		assert.equal(oTable.getBinding().iLength, 200, "RowCount beforeFiltering ok");
		oTable.filter(oColFirstName, "M*");
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
		oTable.filter(oColMoney, "9,35");
		assert.equal(oTable.getBinding().iLength, 10, "RowCount after filtering money 9,35");
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
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("SelectionMode-legacyMultiSelection", function(assert) {
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

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.test("SelectedIndex - Old", function(assert) {
		oTable.setSelectedIndex(8);
		assert.equal(oTable.getSelectedIndex(), 8, "selectedIndex is 8");
		var aRows = oTable.getRows();
		var $Row = aRows[3].getDomRefs(true);

		$Row.rowSelector.trigger("tap");
		assert.equal(oTable.getProperty("selectedIndex"), -1, "selectedIndex is -1");
	});

	QUnit.test("SelectedIndex", function(assert) {
		oTable.setSelectedIndex(8);
		assert.equal(oTable.getSelectedIndices().length, 1, "selectedIndex is set");
		assert.equal(oTable.getSelectedIndices()[0], 8, "selectedIndex is 8");
	});

	QUnit.test("Check Selection of Last fixedBottomRow", function(assert) {
		oTable.getRowMode().setFixedBottomRowCount(3);

		var aRows = oTable.getRows();
		var oLastRow = aRows[aRows.length - 1];
		var $LastRow = oLastRow.getDomRefs(true);

		if ($LastRow.rowSelector) {
			$LastRow.rowSelector.trigger("tap");
			assert.equal(oTable.getSelectedIndices()[0], 199, "Selected Index is 199");
		}
	});

	QUnit.test("SelectAll", function(assert) {
		oTable.setSelectionMode(SelectionMode.MultiToggle);
		oCore.applyChanges();

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

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("VisibleRowCount", function(assert) {
		var done = assert.async();
		var fnError = sinon.spy(Log, "error");
		oTable.destroyRowMode();
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

	/**
	 * @deprecated As of version 1.119
	 */
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
		var iMaxRowIndex = aData.length - oTable._getRowCounts().count;

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
				var iRowCount = oTable._getRowCounts().count;
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
					oSpy.resetHistory();
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
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), false, "ColumnHeaderVisible ok");
		oTable.setColumnHeaderVisible(true);
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), true, "ColumnHeaderVisible ok");
	});

	QUnit.test("Column headers active state styling", function(assert) {
		var aColumns = oTable.getColumns();
		oTable.setEnableColumnReordering(false);
		oCore.applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"),
			"Column has active state styling because of the column header popup");
		assert.ok(!aColumns[4].$().hasClass("sapUiTableHeaderCellActive"),
			"Column has no active state styling because the reordering is disabled and the column doesn't have a column header popup");

		oTable.setEnableColumnReordering(true);
		oCore.applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
		assert.ok(aColumns[4].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");

		oTable.attachColumnSelect(function(oEvent) {
			oEvent.preventDefault();
		});
		oTable.setEnableColumnReordering(false);
		oCore.applyChanges();
		assert.ok(aColumns[3].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
		assert.ok(aColumns[4].$().hasClass("sapUiTableHeaderCellActive"), "Column has active state styling");
	});

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("Row height; After binding context update", function(assert) {
		oTable.destroyRowMode();
		oTable.removeAllColumns();
		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.addColumn(new Column({template: new HeightTestControl({height: "{height}"})}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());
		oCore.applyChanges();

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
		});
	});

	QUnit.test("Skip _updateTableSizes if table has no width", function(assert) {
		var oDomRef = oTable.getDomRef();
		var oResetRowHeights = sinon.spy(oTable, "_resetRowHeights"); // _resetRowHeights is used to check if a layout update was performed

		oDomRef.style.width = "100px";
		oDomRef.style.height = "100px";
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
		assert.ok(oResetRowHeights.called, "The table has a height and width -> _updateTableSizes was executed");
		oResetRowHeights.resetHistory();

		oDomRef.style.height = "0px";
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
		assert.ok(oResetRowHeights.called, "The table has no height -> _updateTableSizes was executed");
		oResetRowHeights.resetHistory();

		oDomRef.style.width = "0px";
		oDomRef.style.height = "100px";
		oTable._updateTableSizes(TableUtils.RowsUpdateReason.Unknown);
		assert.ok(oResetRowHeights.notCalled, "The table has no width -> _updateTableSizes was not executed");
		oResetRowHeights.resetHistory();
	});

	QUnit.test("getCellControl", function(assert) {
		oTable.getColumns()[2].setVisible(false);
		oCore.applyChanges();

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
		oCore.applyChanges();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No row action template: No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No row action template: No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "No row action template: No action area");

		oTable.setRowActionTemplate(new RowAction());
		oCore.applyChanges();
		assert.ok(oTable.$().hasClass("sapUiTableRAct"), "CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");

		oTable.setRowActionCount(1);
		oCore.applyChanges();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "RowActionCount is 1: No CSS class sapUiTableRAct");
		assert.ok(oTable.$().hasClass("sapUiTableRActS"), "RowActionCount is 1: CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");
		assert.notOk(oTable.$().hasClass("sapUiTableRActFlexible"), "The RowActions column is positioned right");

		oTable.getColumns().forEach(function(oCol) {
			oCol.setWidth("150.23999999px");
		});
		oCore.applyChanges();
		assert.notOk(oTable.$().hasClass("sapUiTableRActFlexible"), "The RowActions column is positioned right");

		oTable.getColumns().forEach(function(oCol) {
			oCol.setWidth("50px");
		});
		oCore.applyChanges();
		assert.ok(oTable.$().hasClass("sapUiTableRActFlexible"), "The position of the RowActions column is calculated based on the table content");
		var oTableSizes = oTable._collectTableSizes();
		assert.ok(oTable.$("sapUiTableRowActionScr").css("left") === 400 + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth + "px",
			"The RowActions column is positioned correctly");

		oTable.setFixedColumnCount(2);
		oCore.applyChanges();
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
		oCore.applyChanges();
		assert.ok(oTable.getRowSettingsTemplate() != null, "The table has a row settings template");
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Setting the row settings template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.ok(oRowSettings != null, "The rows have a settings template clone");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.getRowSettingsTemplate().setHighlight(CoreLibrary.MessageType.Success);
		oCore.applyChanges();
		assert.ok(oOnAfterRenderingEventListener.notCalled, "Changing the highlight property of the template did not cause the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.None,
			"Changing the highlight property of the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.getRowSettingsTemplate().invalidate();
		oCore.applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Invalidating the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.None,
			"Invalidating the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: CoreLibrary.MessageType.Warning
		}));
		oCore.applyChanges();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Changing the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), CoreLibrary.MessageType.Warning,
			"Changing the template changed the highlight property of the template clones in the rows");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("ColumnMenu invalidation when localization changes", function(assert) {
		var pAdaptLocalization;
		var done = assert.async();

		oTable.getColumns().slice(1).forEach(function(oColumn) {
			oTable.removeColumn(oColumn);
		});
		oCore.applyChanges();

		oTable._adaptLocalization = function(bRtlChanged, bLangChanged) {
			pAdaptLocalization = Table.prototype._adaptLocalization.apply(this, arguments);
			return pAdaptLocalization;
		};

		function assertLocalizationUpdates(bRTLChanged, bLanguageChanged) {
			assert.strictEqual(oTable.getColumns()[0].getMenu()._bInvalidated, bLanguageChanged,
				"The column menu was " + (bLanguageChanged ? "" : " not") + " invalidated");
		}

		function test(bChangeTextDirection, bChangeLanguage) {
			var mChanges = {changes: {}};

			oTable._bRtlMode = null;
			TableUtils.Menu.openContextMenu(oTable, getCell(0, 0, null, null, oTable));
			oTable.getColumns()[0].getMenu()._bInvalidated = false;

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

		oTable.getColumns()[0].attachEventOnce("columnMenuOpen", function() {
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

		var oColumn = oTable.getColumns()[0];
		oColumn._openHeaderMenu(oColumn.getDomRef());
	});

	QUnit.test("Localization Change", function(assert) {
		var oInvalidateSpy = sinon.spy(oTable, "invalidate");
		var pAdaptLocalization;
		var done = assert.async();

		oTable.getColumns().slice(1).forEach(function(oColumn) {
			oTable.removeColumn(oColumn);
		});
		oCore.applyChanges();

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
		}

		function test(bChangeTextDirection, bChangeLanguage) {
			var mChanges = {changes: {}};

			oTable._bRtlMode = null;
			TableUtils.Menu.openContextMenu(oTable, {target: getCell(0, 0, null, null, oTable)[0]});
			oInvalidateSpy.resetHistory();

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

		/**
		 * @deprecated As of Version 1.117
		 */
		(function() {
			oTable.getColumns()[0].attachEventOnce("columnMenuOpen", function() {
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

			var oColumn = oTable.getColumns()[0];
			oColumn._openHeaderMenu(oColumn.getDomRef());
		}());
	});

	QUnit.test("AlternateRowColors", function(assert) {
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "By default there is no alternating rows");

		var isAlternatingRow = function() {
			return this.getAttribute("data-sap-ui-rowindex") % 2;
		};

		oTable.setSelectionMode("None");
		oTable.setAlternateRowColors(true);
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
					 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
					 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row headers
		oTable.setSelectionMode("MultiToggle");
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed columns
		oTable.setFixedColumnCount(2);
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed rows
		oTable.getRowMode().setFixedTopRowCount(2);
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed bottom rows
		oTable.getRowMode().setFixedBottomRowCount(2);
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row actions
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction({
			items: new RowActionItem()
		}));
		oCore.applyChanges();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check tree mode
		sinon.stub(TableUtils.Grouping, "isInTreeMode").returns(false);
		oTable.invalidate();
		oCore.applyChanges();
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "No alternating rows for tree mode");
		TableUtils.Grouping.isInTreeMode.restore();
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

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("ColumnMenu", function(assert) {
		var done = assert.async();
		var oColumn = oTable.getColumns()[1];
		var oCellDomRef = oColumn.getDomRef();

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				assert.ok(oMenu !== null, "Column menu is not null");
				assert.ok(oMenu instanceof ColumnMenu, "Column menu is instance of sap.ui.table.ColumnMenu");
				assert.ok(oMenu.getItems().length > 0, "Column menu has more than one item");
				oMenu.close();

				//Check column without sort
				oColumn = oTable.getColumns()[5];
				oColumn._openHeaderMenu(oCellDomRef);
				oMenu = oColumn.getMenu();
				assert.equal(oMenu.getItems().length, 1, "Column menu without sort has only one filter item");
				oMenu.close();

				//Check column without filter
				oColumn = oTable.getColumns()[6];
				oColumn._openHeaderMenu(oCellDomRef);
				oMenu = oColumn.getMenu();
				assert.equal(oMenu.getItems().length, 2, "Column menu without filter has only two sort items");
				oMenu.close();

				var oRemoveAggregationSpy = sinon.spy(ColumnMenu.prototype, "removeAggregation");
				oTable.setShowColumnVisibilityMenu(true);
				oCore.applyChanges();
				oColumn = oTable.getColumns()[5];
				oColumn._openHeaderMenu(oCellDomRef);
				oMenu = oColumn.getMenu();
				assert.equal(oMenu.getItems().length, 2, "Column menu has one filter item and one column visibility item");
				assert.ok(oRemoveAggregationSpy.notCalled, "Initial creation of the column visibility submenu");
				oMenu.close();

				oColumn = oTable.getColumns()[6];
				oColumn._openHeaderMenu(oCellDomRef);
				oMenu = oColumn.getMenu();
				assert.ok(oRemoveAggregationSpy.withArgs("items", oTable._oColumnVisibilityMenuItem, true).notCalled,
					"The items aggregation is not removed, the visibility submenu is only updated");
				oMenu.close();
				done();
			});
		});

		oColumn._openHeaderMenu(oCellDomRef);
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("ColumnMenuOpen Event", function(assert) {
		var done = assert.async();
		var oColumn = oTable.getColumns()[1];

		oColumn.attachEventOnce("columnMenuOpen", function(oEvent) {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				assert.deepEqual(oEvent.getSource(), oColumn, "Correct Event Source");
				assert.deepEqual(oEvent.getParameter("menu"), oMenu, "Correct Column Menu Parameter");
				assert.equal(oMenu.getPopup().getOpenState(), CoreLibrary.OpenState.OPEN, "ColumnMenu open");
				oMenu.close();
				done();
			});
		});

		oColumn._openHeaderMenu(oColumn.getDomRef());
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("ColumnVisibilityEvent", function(assert) {
		var done = assert.async();
		oTable.setShowColumnVisibilityMenu(true);

		var oColumn0 = oTable.getColumns()[0];
		var oColumn1 = oTable.getColumns()[1];
		var oCellDomRef = oColumn1.getDomRef();

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

		oColumn1.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var sVisibilityMenuItemId = oColumn1.getMenu().getId() + "-column-visibilty";
				qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
				var aSubmenuItems = oTable._oColumnVisibilityMenuItem.getSubmenu().getItems();
				qutils.triggerMouseEvent(aSubmenuItems[0].$(), "click");

				assert.equal(oColumn0.getVisible(), true, "lastName column is still visible (preventDefault)");

				oColumn1._openHeaderMenu(oCellDomRef);
				qutils.triggerMouseEvent(sVisibilityMenuItemId, "click");
				qutils.triggerMouseEvent(aSubmenuItems[1].$(), "click");

				assert.equal(oColumn1.getVisible(), false, "firstName column is invisible (no preventDefault)");
				done();
			});
		});

		oColumn1._openHeaderMenu(oCellDomRef);
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Column Visibility Submenu: Icons, Enabled State and Accessibility", function(assert) {
		var done = assert.async();
		function checkSubmenuIcons(oTable, assert) {
			var aColumns = oTable.getColumns();
			var aVisibleColumns = oTable._getVisibleColumns();
			var oSubmenu = oTable._oColumnVisibilityMenuItem.getSubmenu();
			var aSubmenuItems = oSubmenu.getItems();
			var sTableId = oTable.getId();

			for (var i = 0; i < aColumns.length; i++) {
				var oColumn = aColumns[i];
				var bVisible = aVisibleColumns.indexOf(oColumn) > -1;
				assert.equal(aSubmenuItems[i].getIcon(), bVisible ? "sap-icon://accept" : "",
					"The column visibility is correctly displayed in the submenu");
				assert.deepEqual(aSubmenuItems[i].getAriaLabelledBy(), bVisible ? [sTableId + '-ariahidecolmenu'] : [sTableId + "-ariashowcolmenu"],
					"ariaLabelledBy is set correctly");
			}
		}

		oTable.setShowColumnVisibilityMenu(true);
		var aColumns = oTable.getColumns();
		var oColumn = aColumns[0];

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
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
				done();
			});
		});

		oColumn._openHeaderMenu(oColumn.getDomRef());
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Column Visibility Submenu: Add/Remove/Reorder Columns", function(assert) {
		var done = assert.async();
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
		var oColumn = aColumns[0];
		var oCellDomRef = oColumn.getDomRef();

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				oColumn._openHeaderMenu(oCellDomRef);
				checkSubmenuItemsOrder(oTable, assert);

				for (var i = 7; i > 0; i = i - 2) {
					oTable.removeColumn(aColumns[i]);
				}
				oColumn._openHeaderMenu(oCellDomRef);
				checkSubmenuItemsOrder(oTable, assert);

				oTable.addColumn(aColumns[1]);
				oTable.addColumn(aColumns[3]);
				oTable.insertColumn(aColumns[5], 0);
				oTable.insertColumn(aColumns[7], 3);

				oColumn._openHeaderMenu(oCellDomRef);
				checkSubmenuItemsOrder(oTable, assert);
				oMenu.close();
				done();
			});
		});

		oColumn._openHeaderMenu(oCellDomRef);
	});

	/**
	 * @deprecated As of version 1.117
	 */
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
				rowMode: new FixedRowMode({
					rowCount: 5
				})
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

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Menu initialization", function(assert) {
		var done = assert.async();
		var oColumn = oTable.getColumns()[0];

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				assert.ok(oMenu !== null, "Column menu is not null");
				assert.ok(oMenu instanceof ColumnMenu, "Column menu is instance of ColumnMenu");
				assert.ok(oMenu._getColumn() instanceof Column, "_getColumn returns an instance of Column");
				assert.ok(oMenu._getTable() instanceof Table, "_getTable returns an instance of Table");
				done();
			});
		});

		oColumn._openHeaderMenu(oColumn.getDomRef());
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
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH").length, 2, "Table has two sapUiTableFirstVisibleColumnTH class");
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH")[0], $table.find(".sapUiTableCHA th")[0], "sapUiTableFirstVisibleColumnTH class is set on the first th element of header table");
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH")[1], $table.find(".sapUiTableCCnt th")[0], "sapUiTableFirstVisibleColumnTH class is set on the first th element of content table");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("computedFixedColumnCount invalidation", function(assert) {
		var invalidationSpy = sinon.spy(oTable, "_invalidateComputedFixedColumnCount");
		var oCol = oTable.getColumns()[2];
		oTable.setFixedColumnCount(1);
		assert.equal(invalidationSpy.callCount, 1, "value is being invalidated");
		oCol.setHeaderSpan([2, 1]);
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

		aColumns[0].setHeaderSpan([2, 1]);
		oTable.setFixedColumnCount(1);
		assert.equal(oTable.getComputedFixedColumnCount(), 2,
			"The computed fixed column count is 2 because of the header span");
		assert.equal(aColumns[1]._iFixWidth, 100, "The _iFixWidth of the second fixed columns is set");

		oTable.setWidth("400px");
		oCore.applyChanges();
		assert.equal(oTable.getComputedFixedColumnCount(), 0,
			"The table width is too small for using fixed columns, getComputedFixedColumnCount returns 0");
		oTable.setWidth("500px");
		oCore.applyChanges();
		assert.equal(oTable.getComputedFixedColumnCount(), 2,
			"The table width allows displaying of the fixed columns again");
	});

	QUnit.test("Fixed column count and column spans", function(assert) {
		oTable.removeAllColumns();
		oCore.applyChanges();
		oTable.setFixedColumnCount(1);

		var oCol1 = new Column({
			headerSpan: [3, 1],
			multiLabels: [new Label({text: "A"}), new Label({text: "AA"})],
			template: new Label()
		});
		oTable.addColumn(oCol1);
		assert.equal(oTable.getComputedFixedColumnCount(), 1, "The computed fixedColumCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 0, "The lastFixedColumIndex is correct");

		var oCol2 = new Column({
			headerSpan: [2, 1],
			multiLabels: [new Label({text: "A"}), new Label({text: "AB"})],
			template: new Label()
		});
		oTable.addColumn(oCol2);
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "The computed fixedColumnCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 1, "The lastFixedColumIndex is correct");

		var oCol3 = new Column({
			headerSpan: [1, 1],
			multiLabels: [new Label({text: "A"}), new Label({text: "AC"})],
			template: new Label()
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
		oCore.applyChanges();
		assert.strictEqual(oTable.getDomRef("table-fixed").getBoundingClientRect().width, 160, "Fixed column table has the correct width");
	});

	QUnit.test("Hide one column in fixed area", function(assert) {
		var iVisibleRowCount = oTable._getRowCounts().count;
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
		oCore.applyChanges();
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
		oCore.applyChanges();
		checkCellsFixedBorder(oTable, 0, "When one of the fixed columns is not visible, the fixed border is displayed on the last visible column in fixed area");
	});

	QUnit.test("Hide one column in scroll area", function(assert) {
		oTable.getColumns()[5].setVisible(false);
		oCore.applyChanges();
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

		oCore.applyChanges();

		assert.equal(oTable.getComputedFixedColumnCount(), 0, "Computed Fixed column count correct - No Fixed Columns used");
		assert.equal(oTable.getFixedColumnCount(), 3, "Orignal fixed column count is 3");

		oTable.setWidth("500px");

		oCore.applyChanges();

		assert.equal(oTable.getFixedColumnCount(), 3, "Fixed Column Count is 3 again");
		assert.equal(oTable.getComputedFixedColumnCount(), 3, "Computed Fixed column count correct");
	});

	QUnit.module("API", {
		beforeEach: function() {
			createTable({
				rowMode: new FixedRowMode({
					rowCount: 10
				}),
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
		var fnFocusSpy = sinon.spy(oTable, "focus");
		var oFocusInfo = {
			targetInfo: new Message({
				message: "Error thrown",
				type: "Error"
			})
		};
		oTable.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		checkFocus(getColumnHeader(0, null, null, oTable), assert);

		oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		checkFocus(getColumnHeader(0, null, null, oTable), assert);

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();
		oTable.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		checkFocus(getCell(0, 0, null, null, oTable), assert);

		oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		checkFocus(getCell(0, 0, null, null, oTable), assert);

		oTable.unbindRows();
		oTable.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		checkFocus(oTable.getDomRef("noDataCnt"), assert);

		oTable.setShowOverlay(true);
		oTable.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		checkFocus(oTable.getDomRef("overlay"), assert);

		oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		checkFocus(oTable.getDomRef("overlay"), assert);

		oTable.setShowOverlay(false);
		oTable.removeAllColumns();
		oCore.applyChanges();
		oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		checkFocus(oTable.getDomRef("noDataCnt"), assert);
	});

	QUnit.test("#getFocusDomRef", function(assert) {
		assert.strictEqual(oTable.getFocusDomRef(), getColumnHeader(0, null, null, oTable)[0], "Column header visible");

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();
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

		oGetBinding.resetHistory();
		assert.strictEqual(oTable.getBinding(null), oRowsBinding, "With 'null': returned the rows binding");
		assert.ok(oGetBinding.calledOnce, "With 'null': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("rows"), "With 'null': Called with 'rows'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'null': Called with the correct context");

		oGetBinding.resetHistory();
		assert.strictEqual(oTable.getBinding("rows"), oRowsBinding, "With 'rows': returned the rows binding");
		assert.ok(oGetBinding.calledOnce, "With 'rows': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("rows"), "With 'rows': Called with 'rows'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'rows': Called with the correct context");

		oGetBinding.resetHistory();
		assert.strictEqual(oTable.getBinding("columns"), oColumnsBinding, "With 'columns': returned the columns binding");
		assert.ok(oGetBinding.calledOnce, "With 'columns': Called once on the base class");
		assert.ok(oGetBinding.calledWithExactly("columns"), "With 'columns': Called with 'columns'");
		assert.ok(oGetBinding.calledOn(oTable), "With 'columns': Called with the correct context");

		assert.notStrictEqual(oRowsBinding, oColumnsBinding, "Returned bindings for rows and columns are not the same object");

		oGetBinding.restore();
	});

	QUnit.test("#getContextByIndex", function(assert) {
		var oFakeBinding = {
			getContexts: sinon.stub()
		};

		sinon.stub(oTable, "getBinding").returns(undefined);
		assert.strictEqual(oTable.getContextByIndex(0), null, "Without a binding");

		oTable.getBinding.returns(oFakeBinding);

		oFakeBinding.getContexts.returns([]);
		assert.strictEqual(oTable.getContextByIndex(0), null, "With a binding that does not have a getContextByIndex method; No context found");
		oFakeBinding.getContexts.returns(["test"]);
		oFakeBinding.getContexts.resetHistory();
		assert.strictEqual(oTable.getContextByIndex(0), "test", "With a binding that does not have a getContextByIndex method");
		assert.ok(oFakeBinding.getContexts.calledOnceWithExactly(0, 1, 0, true), "Binding#getContexts called once with correct arguments");

		oFakeBinding.getContexts.resetHistory();
		oFakeBinding.getContextByIndex = sinon.stub();
		oFakeBinding.getContextByIndex.returns(undefined);
		assert.strictEqual(oTable.getContextByIndex(1), null, "With binding that does have a getContextByIndex method; No context found");
		oFakeBinding.getContextByIndex.returns("test2");
		oFakeBinding.getContextByIndex.resetHistory();
		assert.strictEqual(oTable.getContextByIndex(1), "test2", "With binding that does have a getContextByIndex method");
		assert.ok(oFakeBinding.getContexts.notCalled, "Binding#getContexts not called");
		assert.ok(oFakeBinding.getContextByIndex.calledOnceWithExactly(1), "Binding#getContextByIndex called once with correct arguments");

		assert.strictEqual(oTable.getContextByIndex(-1), null, "Negative index");

		oTable.getBinding.restore();
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("#getPlugin", function(assert) {
		const TestPlugin = PluginBase.extend("sap.ui.table.plugins.test.TestPlugin");
		const TestPluginSubclass = TestPlugin.extend("sap.ui.table.plugins.test.TestPluginSubclass");
		const oRelevantPlugin = new TestPluginSubclass();

		oTable.addDependent(new Text());
		oTable.addDependent(oRelevantPlugin);
		oTable.addDependent(new TestPlugin());

		assert.throws(() => {
			oTable.getPlugin();
		}, new Error("This method can only be used to get plugins of the sap.ui.table library"));

		assert.throws(() => {
			oTable.getPlugin("sap.ui.table.Table");
		}, new Error("This method can only be used to get plugins of the sap.ui.table library"));

		assert.equal(oTable.getPlugin("sap.ui.table.plugins.test.TestPlugin"), oRelevantPlugin,
			"Returns the first plugin in the dependents aggregation that is of the given type");

		assert.strictEqual(oTable.getPlugin("sap.ui.table.plugins.UnknownPlugin"), undefined,
			"Returns undefined if there is no plugin of the given type");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("#getPlugin (plugins aggregation)", function(assert) {
		const TestPlugin = SelectionPlugin.extend("sap.ui.table.plugins.test.TestSelectionPlugin");
		const TestPluginSubclass = TestPlugin.extend("sap.ui.table.plugins.test.TestSelectionPluginSubclass");
		const oRelevantPlugin = new TestPluginSubclass();

		oTable.addPlugin(oRelevantPlugin);
		oTable.addPlugin(new TestPlugin());

		assert.equal(oTable.getPlugin("sap.ui.table.plugins.test.TestSelectionPlugin"), oRelevantPlugin,
			"Returns the first plugin in the plugins aggregation that is of the given type");

		oTable.addDependent(new TestPlugin());
		assert.equal(oTable.getPlugin("sap.ui.table.plugins.test.TestSelectionPlugin"), oTable.getDependents()[0],
			"The depdendents aggregation has precedence");
	});

	QUnit.module("Fixed rows and columns", {
		beforeEach: function() {
			createTable({
				rowMode: new FixedRowMode({
					rowCount: 8,
					fixedTopRowCount: 2
				}),
				fixedColumnCount: 2
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		var $table = oTable.$();
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
		assert.equal($table.find(".sapUiTableVSb").css("top"), (2 * oTable._getBaseRowHeight() - 1) + "px",
			"Vertical scrollbar has correct top padding");
	});

	QUnit.module("Fixed top and bottom rows and columns", {
		beforeEach: function() {
			var TestControl = TableQUnitUtils.TestControl;

			createTable({
				rowMode: new FixedRowMode({
					rowCount: 8,
					fixedTopRowCount: 2,
					fixedBottomRowCount: 2
				}),
				fixedColumnCount: 2
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
		assert.equal($table.find(".sapUiTableVSb").css("top"), (2 * oTable._getBaseRowHeight() - 1) + "px",
			"Vertical scrollbar has correct top padding");
		assert.equal($table.find(".sapUiTableVSb").css("height"), (oTable.getDomRef("table").offsetHeight) + "px",
			"Vertical scrollbar has correct height");
	});

	/**
	 * @deprecated As of version 1.119
	 */
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

	QUnit.module("Column header", {
		beforeEach: function() {
			createTable({}, function(oTable) {
				oTable.addColumn(new Column({
					multiLabels: [
						new Label({text: "Last Name"}),
						new Label({text: "Second level header"})
					],
					template: new Text({text: "lastName"})
				}));
				oTable.addColumn(new Column({
					multiLabels: [
						new Label({text: "First Name", textAlign: "Right"}),
						new Label({text: "Name of the person"})
					],
					template: new Input({value: "name"})
				}));
				oTable.addColumn(new Column({
					label: new Label({text: "Checked (very long label text to show wrapping behavior)"}),
					template: new CheckBox({selected: true}),
					hAlign: "Center"
				}));
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Row and cell count", function(assert) {
		assert.equal(oTable.$().find(".sapUiTableColHdrTr").length, 2, "Header row count");
		assert.equal(oTable.$().find(".sapUiTableColHdrTr .sapUiTableHeaderCell").length, 6, "Cell count");
	});

	QUnit.test("Height", function(assert) {
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var pSequence = Promise.resolve();
		var iPadding = 14;

		oTable.removeAllColumns();
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.setRowMode(RowModeType.Fixed);
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);

				return new Promise(function(resolve) {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			}).then(function() {
				TableQUnitUtils.assertColumnHeaderHeights(assert, oTable, mTestSettings);
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height",
				density: sDensity,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity === "sapUiSizeCondensed" ? "sapUiSizeCompact" : sDensity]
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height with large content",
				density: sDensity,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (columnHeaderHeight)",
				density: sDensity,
				columnHeaderHeight: 55,
				expectedHeight: 55
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (columnHeaderHeight) with large content",
				density: sDensity,
				columnHeaderHeight: 55,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		pSequence = pSequence.then(function() {
			oTable.insertColumn(new Column({
				label: new Text({text: "a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a"}),
				template: new HeightTestControl(),
				width: "100px"
			}), 1);

			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			var aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
			var iHeightWithoutIcons = aRowDomRefs[0].getBoundingClientRect().height;
			var iFixedPartHeight;
			var iScrollablePartHeight;

			/** @deprecated As of version 1.120 */
			oTable.getColumns()[1].setSorted(true);
			oTable.getColumns()[1].setSortOrder(SortOrder.Ascending);
			oTable.getColumns()[1].setFiltered(true);
			iFixedPartHeight = aRowDomRefs[0].getBoundingClientRect().height;
			iScrollablePartHeight = aRowDomRefs[1].getBoundingClientRect().height;
			assert.ok(iFixedPartHeight > iHeightWithoutIcons, "Height increased after adding icons");
			assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after adding icons");

			/** @deprecated As of version 1.120 */
			oTable.getColumns()[1].setSorted(false);
			oTable.getColumns()[1].setSortOrder(SortOrder.None);
			oTable.getColumns()[1].setFiltered(false);
			iFixedPartHeight = aRowDomRefs[0].getBoundingClientRect().height;
			iScrollablePartHeight = aRowDomRefs[1].getBoundingClientRect().height;
			assert.strictEqual(iFixedPartHeight, iHeightWithoutIcons, "After removing the icons, the height is the same as before");
			assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after removing icons");
		}).then(function() {
			TableQUnitUtils.setDensity(oTable, "sapUiSizeCozy");
		});

		return pSequence;
	});

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("Height (legacy)", function(assert) {
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var pSequence = Promise.resolve();
		var iPadding = 14;

		oTable.removeAllColumns();
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.setRowHeight(mTestSettings.rowHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);

				return new Promise(function(resolve) {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			}).then(function() {
				TableQUnitUtils.assertColumnHeaderHeights(assert, oTable, mTestSettings);
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight)",
				density: sDensity,
				rowHeight: 55,
				expectedHeight: 56
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight = columnHeaderHeight)",
				density: sDensity,
				rowHeight: 55,
				columnHeaderHeight: 55,
				expectedHeight: 55
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight < columnHeaderHeight)",
				density: sDensity,
				rowHeight: 55,
				columnHeaderHeight: 80,
				expectedHeight: 80
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight > columnHeaderHeight)",
				density: sDensity,
				rowHeight: 80,
				columnHeaderHeight: 55,
				expectedHeight: 55
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight) with large content",
				density: sDensity,
				rowHeight: 55,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight = columnHeaderHeight) with large content",
				density: sDensity,
				rowHeight: 55,
				columnHeaderHeight: 55,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight < columnHeaderHeight) with large content",
				density: sDensity,
				rowHeight: 55,
				columnHeaderHeight: 80,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height (rowHeight > columnHeaderHeight) with large content",
				density: sDensity,
				rowHeight: 80,
				columnHeaderHeight: 55,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});
		});

		return pSequence.then(() => {
			TableQUnitUtils.setDensity(oTable, "sapUiSizeCozy");
		});
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
		assert.equal(oCore.byId($button.attr("id")).getText(), "Click me!", "The correct button is rendered");
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

	/**
	 * @deprecated As of version 1.56
	 */
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

	/**
	 * @deprecated As of version 1.38
	 */
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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		createSortingTableData();

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
		createSortingTableData();

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

				oTable.invalidate();
				oCore.applyChanges();
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

	QUnit.test("#sort, #getSortedColumns, and 'sort' event", function(assert) {
		var done = assert.async();
		var aColumns = oTable.getColumns();
		var aSortEventParameters = [];

		createSortingTableData();
		oTable.attachSort((oEvent) => {
			var mParameters = oEvent.getParameters();
			delete mParameters.id;
			aSortEventParameters.push(mParameters);
		});

		var fnHandler = function() {
			assert.deepEqual(oTable.getSortedColumns(), [aColumns[0], aColumns[1]], "Sorted columns");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[0].getSorted(), "First column sorted");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[1].getSorted(), "Second column sorted");
			assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
			assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");

			assert.deepEqual(aSortEventParameters, [{
				column: aColumns[0],
				sortOrder: SortOrder.Ascending,
				columnAdded: false
			}, {
				column: aColumns[1],
				sortOrder: SortOrder.Descending,
				columnAdded: true
			}], "Sort events");

			aSortEventParameters = [];
			oTable.detachRowsUpdated(fnHandler);
			oTable.attachRowsUpdated(fnHandler2);
			oTable.sort(aColumns[0], SortOrder.None);
		};

		var fnHandler2 = function() {
			assert.deepEqual(oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[0].getSorted() == false, "First column not sorted");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[1].getSorted() == true, "Second column sorted");
			assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
			assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");

			assert.deepEqual(aSortEventParameters, [{
				column: aColumns[0],
				sortOrder: SortOrder.None,
				columnAdded: false
			}], "Sort events");

			aSortEventParameters = [];
			oTable.detachRowsUpdated(fnHandler2);
			oTable.attachRowsUpdated(fnHandler3);
			oTable.sort(aColumns[0], SortOrder.Ascending);
		};

		var fnHandler3 = function() {
			assert.deepEqual(oTable.getSortedColumns(), [aColumns[0]], "Sorted columns");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[0].getSorted() == true, "First column sorted");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[1].getSorted() == false, "Second column not sorted");
			assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
			assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");

			assert.deepEqual(aSortEventParameters, [{
				column: aColumns[0],
				sortOrder: SortOrder.Ascending,
				columnAdded: false
			}], "Sort events");

			aSortEventParameters = [];
			oTable.detachRowsUpdated(fnHandler3);
			oTable.attachRowsUpdated(fnHandler4);
			oTable.sort(aColumns[1], SortOrder.Ascending);
			oTable.sort(aColumns[0], SortOrder.None, true); // The second parameter should have no effect if sortOrder=None.
		};

		var fnHandler4 = function() {
			assert.deepEqual(oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[0].getSorted() == false, "First column not sorted");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[1].getSorted() == true, "Second column sorted");
			assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
			assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Ascending, "Sort order of second column");

			assert.deepEqual(aSortEventParameters, [{
				column: aColumns[1],
				sortOrder: SortOrder.Ascending,
				columnAdded: false
			}, {
				column: aColumns[0],
				sortOrder: SortOrder.None,
				columnAdded: false
			}], "Sort events");

			aSortEventParameters = [];
			oTable.detachRowsUpdated(fnHandler4);
			oTable.attachRowsUpdated(fnHandler5);
			oTable.sort();
		};

		var fnHandler5 = function() {
			assert.deepEqual(oTable.getSortedColumns(), [], "Sorted columns");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[0].getSorted() == false, "First column not sorted");
			/** @deprecated As of version 1.120 */
			assert.ok(aColumns[1].getSorted() == false, "Second column not sorted");
			assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
			assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");

			assert.deepEqual(aSortEventParameters, [], "Sort events"); // Calling Table#sort without arguments does not fire the sort event.

			aSortEventParameters = [];
			oTable.detachRowsUpdated(fnHandler5);
			done();
		};

		oTable.attachRowsUpdated(fnHandler);
		oTable.sort(aColumns[0], SortOrder.Ascending);
		oTable.sort(aColumns[1], SortOrder.Descending, true);
	});

	QUnit.test("remove column", function(assert) {
		var done = assert.async();
		createSortingTableData();
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
		oCore.applyChanges();
	});

	QUnit.test("remove all columns", function(assert) {
		var done = assert.async();
		createSortingTableData();

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
		oCore.applyChanges();
	});

	QUnit.test("destroy columns", function(assert) {
		var done = assert.async();
		createSortingTableData();

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
		oCore.applyChanges();
	});

	QUnit.test("change column order", function(assert) {
		var done = assert.async();
		createSortingTableData();
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
		oCore.applyChanges();
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
		oCore.applyChanges();

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
				oDestroyRows.resetHistory();
				oInnerBindRows.resetHistory();
				oInnerUnbindRows.resetHistory();
				oOnBindingChange.resetHistory();
				oOnBindingDataRequested.resetHistory();
				oOnBindingDataReceived.resetHistory();
				oBindAggregationOfControl.resetHistory();
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
					path: "money",
					descending: true
				}),
				filters: [
					new Filter({
						path: "money",
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
			oExternalChangeSpy.resetHistory();
			oExternalDataRequestedSpy.resetHistory();
			oExternalDataReceivedSpy.resetHistory();

			oTable.getBinding().fireEvent("change");
			oTable.getBinding().fireEvent("dataRequested");
			oTable.getBinding().fireEvent("dataReceived");
			assert.ok(oOnBindingChange.calledOnce, "The change event listener was called once");
			assert.ok(oOnBindingChange.calledOn(oTable), "The change event listener was called with the correct context");
			assert.ok(oExternalChangeSpy.calledOnce, "The external change event listener was called once");
			assert.ok(oExternalChangeSpy.calledOn(oTable.getBinding()),
				"The external change event listener was called with the correct context");
			assert.ok(oOnBindingChange.calledBefore(oExternalChangeSpy),
				"The change event listener of the table was called before the external change spy");
			assert.ok(oOnBindingDataRequested.calledOnce, "The dataRequested event listener was called once");
			assert.ok(oOnBindingDataRequested.calledOn(oTable), "The dataRequested event listener was called with the correct context");
			assert.ok(oExternalDataRequestedSpy.calledOnce, "The external dataRequested event listener was called once");
			assert.ok(oExternalDataRequestedSpy.calledOn(oTable.getBinding()),
				"The external dataRequested event listener was called with the correct context");
			assert.ok(oOnBindingDataRequested.calledBefore(oExternalDataRequestedSpy),
				"The dataRequested event listener of the table was called before the external dataRequested spy");
			assert.ok(oOnBindingDataReceived.calledOnce, "The dataReceived event listener was called once");
			assert.ok(oOnBindingDataReceived.calledOn(oTable), "The dataReceived event listener was called with the correct context");
			assert.ok(oExternalDataReceivedSpy.calledOnce, "The external dataReceived event listener was called once");
			assert.ok(oExternalDataReceivedSpy.calledOn(oTable.getBinding()),
				"The external dataReceived event listener was called with the correct context");
			assert.ok(oOnBindingDataReceived.calledBefore(oExternalDataReceivedSpy),
				"The dataReceived event listener of the table was called before the external dataReceived spy");

			oBindAggregationOfControl.restore();
		},
		testBindRowsLegacy: function(oTable, fnBind, assert) {
			var oInnerBindRows = sinon.spy(oTable, "_bindRows");
			var oBindAggregationOfControl = sinon.spy(Control.prototype, "bindAggregation");
			var oSorter = new Sorter({
				path: "money",
				descending: true
			});
			var oFilter = new Filter({
				path: "money",
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
			oInnerBindRows.resetHistory();
			oBindAggregationOfControl.resetHistory();

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
			oInnerBindRows.resetHistory();
			oBindAggregationOfControl.resetHistory();

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
			oInnerBindRows.resetHistory();
			oBindAggregationOfControl.resetHistory();

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
		oInnerBindRows.resetHistory();

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
		oInvalidateSpy.resetHistory();
		oUpdateRowsHookSpy.resetHistory();

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
			path: "money",
			operator: "LT",
			value1: 5
		}));
		assert.equal(oTable.getFirstVisibleRow(), 0, "'firstVisibleRow' set to 0 when filtering");
	});

	QUnit.test("Sort", function(assert) {
		oTable.setFirstVisibleRow(1);
		oTable.getBinding().sort(new Sorter({
			path: "money",
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
		oCore.applyChanges();
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
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "userClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "APIClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, Array(200)).map(function(c, i) { return i; }),
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
		jQuery(oTable.getDomRef("selall")).trigger("tap");
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).trigger("tap");

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("tap");
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("tap");

		sTestCase = "APISetSelectedIndex";
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Select All on Binding Change", function(assert) {
		var done = assert.async();
		var oModel;

		oTable.attachEventOnce("rowSelectionChange", function() {
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
		oTable.$("selall").trigger("tap");
	});

	QUnit.module("Event: _rowsUpdated", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		createTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Last Name",
						text: "lastName",
						bind: true
					})
				]
			}, mSettings), (oTable) => {
				oTable.qunit.aRowsUpdatedEvents = [];
				oTable.attachEvent("_rowsUpdated", (oEvent) => {
					oTable.qunit.aRowsUpdatedEvents.push(oEvent.getParameter("reason"));
				});
			});

			return this.oTable;
		},
		checkRowsUpdated: function(assert, aExpectedReasons, iDelay) {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.deepEqual(this.oTable.qunit.aRowsUpdatedEvents, aExpectedReasons,
						aExpectedReasons.length > 0
							? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
							: "The event _rowsUpdated has not been fired"
					);
					resolve();
				}, iDelay == null ? 500 : iDelay);
			});
		},
		resetRowsUpdatedSpy: function() {
			this.oTable.qunit.aRowsUpdatedEvents = [];
		}
	});

	QUnit.test("_fireRowsUpdated", function(assert) {
		var done = assert.async();
		var oTable = new Table();
		var rowsUpdatedSpy = sinon.spy(oTable, "fireRowsUpdated");
		var sTestReason = "test_reason";

		assert.expect(3);

		oTable.attachEventOnce("_rowsUpdated", function(oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), sTestReason, "The private event _rowsUpdated was fired with the correct reason");
			assert.ok(rowsUpdatedSpy.notCalled, "The public event rowsUpdated was not fired yet");
		});

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.ok(rowsUpdatedSpy.calledOnce, "The public event rowsUpdated was fired");
			oTable.destroy();
			done();
		});

		oTable._fireRowsUpdated(sTestReason);
	});

	QUnit.test("Row count does not change when changing row mode", function(assert) {
		this.createTable({rowMode: new FixedRowMode({rowCount: 10})});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setRowMode(new InteractiveRowMode({rowCount: 10}));
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setRowMode(new AutoRowMode({minRowCount: 10, maxRowCount: 10}));
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setRowMode(new FixedRowMode({rowCount: 10}));
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("Expand", function(assert) {
		this.createTable({
			enableGrouping: true
		});
		this.oTable.setGroupBy(this.oTable.getColumns()[0]);

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oTable.getRows()[0].collapse();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRows()[0].expand();

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Unknown
			]);
		});
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("Collapse", function(assert) {
		this.createTable({
			enableGrouping: true
		});
		this.oTable.setGroupBy(this.oTable.getColumns()[0]);

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRows()[0].collapse();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Unknown
			]);
		});
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("Personalization", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
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
				table: this.oTable
			});
			oPersoController.refresh();
			this.oTable.getBinding().fireEvent("dataRequested");

			return new Promise((resolve) => {
				window.requestAnimationFrame(() => {
					this.checkRowsUpdated(assert, []).then(() => {
						oPersoController.destroy();
						resolve();
					});
				});
			});
		});
	});

	QUnit.module("Paste", {
		beforeEach: function() {
			var PasteTestControl = this.PasteTestControl;
			createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				fixedColumnCount: 1,
				selectionMode: SelectionMode.MultiToggle,
				rowActionCount: 1,
				rowActionTemplate: new RowAction({items: [new RowActionItem()]}),
				extension: [
					new Title({text: "TABLEHEADER"}),
					new Toolbar({active: true, content: [new PasteTestControl({tagName: "div", handleOnPaste: false})]}),
					new PasteTestControl({tagName: "div", handleOnPaste: false})
				],
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
			if (Device.browser.firefox || Device.browser.safari) {
				var oEvent = new Event("paste", {
					bubbles: true,
					cancelable: true
				});
				oEvent.clipboardData = {
					getData: function() { return sData; }
				};
				return oEvent;
			} else {
				var oClipboardData = new DataTransfer();

				oClipboardData.setData("text/plain", sData);

				return new ClipboardEvent("paste", {
					bubbles: true,
					cancelable: true,
					clipboardData: oClipboardData
				});
			}
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

			this.oPasteSpy.resetHistory();
		}
	});

	/**
	 * @deprecated As of version 1.72
	 */
	QUnit.test("Paste event should not be fired on the title", function(assert) {
		this.test(assert, "Title control", oTable.getExtension()[0].getDomRef(), false);
	});

	/**
	 * @deprecated As of version 1.38
	 */
	QUnit.test("Paste event should not be fired on the toolbar", function(assert) {
		this.test(assert, "Toolbar control", oTable.getExtension()[1].getDomRef(), false);
		this.test(assert, "Toolbar content control", oTable.getExtension()[1].getContent()[0].getDomRef(), false);
	});

	QUnit.test("Elements where the paste event should not be fired", function(assert) {
		this.test(assert, "Extension control", oTable.getExtension()[2].getDomRef(), false);
		this.test(assert, "Footer control", oTable.getFooter().getDomRef(), false);
	});

	QUnit.test("NoData", function(assert) {
		oTable.unbindRows();
		oCore.applyChanges();
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

	/**
	 * @deprecated As of version 1.28
	 */
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

	QUnit.test("AnalyticalTableRenderer", function(assert) {
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

	QUnit.test("Check for tooltip", function(assert) {
		oTable.setTooltip("Table Tooltip");
		assert.strictEqual(oTable.getTooltip(), "Table Tooltip", "Table tooltip set correctly");
	});

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("Check for Fixed Rows and Fixed Bottom Rows", function(assert) {
		var fnError = sinon.spy(Log, "error");
		assert.equal(oTable._getFixedTopRowContexts().length, 0, "fixedRowContexts returned an empty array");
		oTable.setFixedRowCount(5);
		assert.equal(oTable.getFixedRowCount(), 5, "fixedRowCount is set to 5");
		assert.equal(oTable._getFixedTopRowContexts().length, 5,
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
		oCore.applyChanges();
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

	/**
	 * @deprecated As of version 1.115
	 */
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

	QUnit.test("#setBusy", function(assert) {
		var oControlSetBusy = sinon.spy(Control.prototype, "setBusy");

		oTable.attachEvent("busyStateChanged", function(oEvent) {
			assert.step("busy: " + oEvent.getParameter("busy"));
		});

		oTable.setBusy(false);
		oTable.setBusy(true, "customBusySection");
		assert.ok(oControlSetBusy.calledWithExactly(true, "sapUiTableGridCnt"), "Control#setBusy");
		oTable.setBusy(true);
		oTable.setBusy(false);
		oTable.setBusy();
		oTable.setBusy(true);
		oTable.setBusy();

		assert.verifySteps(["busy: true", "busy: false", "busy: true", "busy: false"], "busyStateChanged event");

		oControlSetBusy.restore();
	});

	/**
	 * @deprecated As of version 1.110
	 */
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

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("Table Resize", function(assert) {
		oTable.setVisibleRowCountMode(VisibleRowCountMode.Auto);
		oCore.applyChanges();

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
				var oEvent = new Event("resize");
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

	QUnit.test("test _setLargeDataScrolling function", function(assert) {
		oTable._setLargeDataScrolling(true);
		assert.ok(oTable._bLargeDataScrolling, "Large data scrolling enabled");
		oTable._setLargeDataScrolling(false);
		assert.ok(!oTable._bLargeDataScrolling, "Large data scrolling disabled");
	});

	QUnit.test("#_getContexts", function(assert) {
		var oGetContexts = sinon.stub(oTable.getBinding(), "getContexts");
		var sReturnValue = "Binding#getContexts return value";

		oGetContexts.returns(sReturnValue);

		assert.strictEqual(oTable._getContexts(), sReturnValue, "Called without arguments: Return value");
		assert.equal(oGetContexts.callCount, 1, "Called without arguments: Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(undefined, undefined, undefined, undefined),
			"Called without arguments: Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1), sReturnValue, "Called with (1): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, undefined, undefined, undefined), "Called with (1): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1, 2), sReturnValue, "Called with (1, 2): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, undefined, undefined), "Called with (1, 2): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1, 2, 3), sReturnValue, "Called with (1, 2, 3): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, undefined), "Called with (1, 2, 3): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1, 2, 3, true), sReturnValue, "Called with (1, 2, 3, true): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3, true): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, true), "Called with (1, 2, 3, true): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1, 2, 3, false), sReturnValue, "Called with (1, 2, 3, false): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3, false): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, false), "Called with (1, 2, 3, false): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(oTable._getContexts(1, null, undefined, true), sReturnValue, "Called with (1, null, undefined, true): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, null, undefined, true): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, null, undefined, true),
			"Called with (1, null, undefined, true): Binding#getContexts call arguments");

		oTable.unbindRows();
		assert.deepEqual(oTable._getContexts(1, 2, 3), [], "Called without binding: Return value");
	});

	QUnit.test("test _getColumnsWidth function", function(assert) {
		assert.ok(oTable._getColumnsWidth() > 600 && oTable._getColumnsWidth() < 900, "Columns width returned");
	});

	QUnit.test("#_getBaseRowHeight", function(assert) {
		var oRowMode = new FixedRowMode();

		oTable.setRowMode(oRowMode);
		sinon.stub(oRowMode, "getBaseRowContentHeight");

		oRowMode.getBaseRowContentHeight.returns(98);
		assert.strictEqual(oTable._getBaseRowHeight(), 99, "The base row height is application defined (99)");

		oRowMode.getBaseRowContentHeight.returns(9);
		assert.strictEqual(oTable._getBaseRowHeight(), 10, "The base row height is application defined (10)");

		oRowMode.getBaseRowContentHeight.returns(0);
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCozy,
			"The base row height is correct in cozy density (49)");

		TableQUnitUtils.setDensity(oTable, "sapUiSizeCompact");
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCompact,
			"The base row height is correct in compact density (33)");

		TableQUnitUtils.setDensity(oTable, "sapUiSizeCondensed");
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCondensed,
			"The base row height is correct in condensed density (25)");

		TableQUnitUtils.setDensity(oTable);
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.undefined,
			"The base row height is correct in undefined density (33)");

		TableQUnitUtils.setDensity(oTable, "sapUiSizeCozy");
	});

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.test("#_getBaseRowHeight (legacy)", function(assert) {
		var oBody = document.body;

		oTable.setRowHeight(98);
		assert.strictEqual(oTable._getBaseRowHeight(), 99, "The base row height is application defined (99)");

		oTable.setRowHeight(9);
		assert.strictEqual(oTable._getBaseRowHeight(), 10, "The base row height is application defined (10)");

		oTable.setRowHeight(0);
		assert.strictEqual(oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCozy,
			"The base row height is correct in cozy size (49)");

		oBody.classList.add("sapUiSizeCozy");
	});

	QUnit.test("#_getTotalRowCount", function(assert) {
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

	QUnit.module("Performance", {
		beforeEach: function() {
			createTable({
				rowMode: new FixedRowMode()
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Row And Cell Pools", function(assert) {
		var aRows = oTable.getRows();
		var oLastRow = aRows[aRows.length - 1];
		var oLastRowFirstCell = oLastRow.getCells()[0];
		var iInitialVisibleRowCount = oTable._getRowCounts().count;

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount - 1);
		oCore.applyChanges();

		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] === undefined, "Row was removed from aggregation");
		assert.ok(!oLastRow.bIsDestroyed, "Removed row was not destroyed");
		assert.ok(!oLastRowFirstCell.bIsDestroyed, "Cells of the removed row were not destroyed");
		assert.ok(oLastRow.getParent() === null, "Removed row has no parent");

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount);
		oCore.applyChanges();

		aRows = oTable.getRows();
		var oLastRowAfterRowsUpdate = aRows[aRows.length - 1];
		var oLastRowFirstCellAfterRowsUpdate = oLastRowAfterRowsUpdate.getCells()[0];
		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] !== undefined, "Row was added to the aggregation");
		assert.ok(oLastRow === oLastRowAfterRowsUpdate, "Old row was recycled");
		assert.ok(oLastRowFirstCell === oLastRowFirstCellAfterRowsUpdate, "Old cells recycled");
		assert.ok(oLastRowFirstCell.getParent() === oLastRowAfterRowsUpdate, "Recycled cells have the last row as parent");

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount - 1);
		oCore.applyChanges();
		oTable.invalidateRowsAggregation();
		oTable.getRowMode().setRowCount(iInitialVisibleRowCount);
		oCore.applyChanges();

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
			getIndex: function() { return -1; }
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
			getIndex: function() { return -1; }
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
			getIndex: function() { return -1; }
		};
		var oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.destroyAggregation("rows");
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Lazy row creation; RowMode = Fixed & Interactive", function(assert) {
		destroyTable();

		function test(sRowMode) {
			var oTable = TableQUnitUtils.createTable({
				rowMode: {Type: "sap.ui.table.rowmodes." + sRowMode, rowCount: 5}
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

				oTable.destroy();

				oTable = TableQUnitUtils.createTable({
					rowMode: {Type: "sap.ui.table.rowmodes." + sRowMode, rowCount: 5},
					rows: {path: "/"},
					models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
				}, function(oTable) {
					assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
				});
				return oTable.qunit.whenRenderingFinished();
			}).then(function() {
				assert.strictEqual(oTable.getRows().length, 5, "After rendering with binding: The table has the correct number of rows");

				oTable.unbindRows();
				assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

				oTable.bindRows({path: "/"});
				assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
				return oTable.qunit.whenRenderingFinished();
			}).then(function() {
				assert.strictEqual(oTable.getRows().length, 5, "After asynchronous row update: The table has the correct number of rows");

				oTable.destroy();

				oTable = TableQUnitUtils.createTable({
					rowMode: {Type: "sap.ui.table.rowmodes." + sRowMode, rowCount: 5},
					rows: {path: "/"},
					models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
					placeAt: false
				});
			}).then(oTable.qunit.whenBindingChange).then(TableQUnitUtils.$wait(100)).then(function() {
				assert.strictEqual(oTable.getRows().length, 5,
					"If the table is not rendered but bound, the table has the correct number of rows after an asynchronous row update");
			});
		}

		return test(RowModeType.Fixed).then(function() {
			return test(RowModeType.Interactive);
		});
	});

	QUnit.test("Lazy row creation; RowMode = Auto", function(assert) {
		destroyTable();

		oTable = TableQUnitUtils.createTable({
			rowMode: RowModeType.Auto
		}, function(oTable) {
			assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
		});

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");

		}).then(function() {
			oTable.destroy();

			oTable = TableQUnitUtils.createTable({
				rowMode: RowModeType.Auto,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
			});
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oTable.getRows().length > 0, "After rendering with binding: The table has rows");
		}).then(function() {
			oTable.unbindRows();
			assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

			oTable.bindRows({path: "/"});
			assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oTable.getRows().length > 0, "After asynchronous row update: The table has rows");

			oTable.destroy();

			oTable = TableQUnitUtils.createTable({
				rowMode: RowModeType.Auto,
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
				oTable.setRowMode(new FixedRowMode());
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
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Rows invalidation", function(assert) {
		oTable.invalidateRowsAggregation();
		oTable.invalidate();
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one row", function(assert) {
		oTable.getRowMode().setRowCount(oTable.getRowMode().getRowCount() - 1);
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one row", function(assert) {
		oTable.getRowMode().setRowCount(oTable.getRowMode().getRowCount() + 1);
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one column", function(assert) {
		oTable.removeColumn(oTable.getColumns()[0]);
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one column", function(assert) {
		oTable.addColumn(new Column({
			label: "Label",
			template: "Template"
		}));
		oCore.applyChanges();
		this.compareDOMStrings(assert);
	});

	QUnit.module("Extensions", {
		beforeEach: function() {
			createTable();
			this.aExpectedExtensions = [
				"sap.ui.table.extensions.Pointer",
				"sap.ui.table.extensions.Scrolling",
				"sap.ui.table.extensions.Keyboard",
				"sap.ui.table.extensions.AccessibilityRender",
				"sap.ui.table.extensions.Accessibility",
				"sap.ui.table.extensions.DragAndDrop"
			];
		},
		afterEach: function() {
			destroyTable();
		},
		testAppliedExtensions: function(assert, aExpectedExtensions) {
			var aActualExtensions = oTable._aExtensions.map(function(oExt) {
				return oExt.getMetadata()._sClassName;
			});

			assert.deepEqual(aActualExtensions, aExpectedExtensions || this.aExpectedExtensions, "The table has the expected extensions applied.");
		}
	});

	QUnit.test("Applied extensions", function(assert) {
		this.testAppliedExtensions(assert);
	});

	QUnit.test("Applied extensions (IOS)", function(assert) {
		var bOriginalDeviceOsIos = Device.os.ios;
		Device.os.ios = true;
		oTable.destroy();
		createTable();
		oCore.applyChanges();
		this.testAppliedExtensions(assert);

		return new Promise(function(resolve) {
			sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], function() {
				this.testAppliedExtensions(assert, this.aExpectedExtensions.concat("sap.ui.table.extensions.ScrollingIOS"));
				Device.os.ios = bOriginalDeviceOsIos;
				resolve();
			}.bind(this));
		}.bind(this));
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
		var oRM = oCore.createRenderManager();

		oTable.getRenderer().renderVSbExternal(oRM, oTable);
		oRM.flush(Div);

		assert.strictEqual(Div.childElementCount, 0, "Nothing should be rendered without synchronization enabled");
	});

	QUnit.test("renderHSbExternal", function(assert) {
		var Div = document.createElement("div");
		var oRM = oCore.createRenderManager();

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

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Initialization (legacy)", function(assert) {
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
			plugins: [this.oTestPlugin],
			dependents: [new this.TestSelectionPlugin()] // "plugins" aggregation should win.
		});

		assert.strictEqual(oTable._getSelectionPlugin(), this.oTestPlugin, "The selection plugin set to the table is used");
		assert.ok(oTable._hasSelectionPlugin(), "Table#_hasSelectionPlugin returns \"true\"");
		assert.ok(Table.prototype._createLegacySelectionPlugin.notCalled, "No legacy selection plugin was created on init");

		Table.prototype._createLegacySelectionPlugin.restore();
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

		oTable.addDependent(this.oTestPlugin);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.removeDependent(this.oTestPlugin);
		expectLegacyPlugin();

		oTable.insertDependent(this.oTestPlugin, 0);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.removeAllDependents();
		expectLegacyPlugin();

		oTable.addDependent(this.oTestPlugin);
		oTable.addDependent(oOtherTestPlugin);
		expectAppliedPlugin(this.oTestPlugin);
		oTable.removeDependent(this.oTestPlugin);
		expectAppliedPlugin(oOtherTestPlugin);
		oTable.insertDependent(this.oTestPlugin, 0);
		expectAppliedPlugin(this.oTestPlugin);

		oTable.destroyDependents();
		expectLegacyPlugin();

		this.oTestPlugin = new this.TestSelectionPlugin(); // The old one was destroyed.
		oTable = new Table({
			dependents: [this.oTestPlugin]
		});

		assert.strictEqual(oTable._getSelectionPlugin(), this.oTestPlugin, "The selection plugin set to the table is used");
		assert.ok(oTable._hasSelectionPlugin(), "Table#_hasSelectionPlugin returns \"true\"");
	});

	QUnit.test("Set selection mode", function(assert) {
		this.oTable.setSelectionMode(SelectionMode.Single);
		assert.strictEqual(this.oTable.getSelectionMode(), SelectionMode.Single,
			"If the default selection plugin is used, the selection mode can be set");

		this.oTable.addDependent(this.oTestPlugin);
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

			if (this.oTable[sMethodName]) {
				this.oTable[sMethodName]();
				assert.ok(oSpy.calledOnce, "Table#" + sMethodName + " calls LegacySelectionPlugin#" + sMethodName + " once");
			}
		}.bind(this));

		this.oTable.addDependent(this.oTestPlugin);
		oSelectionPlugin = this.oTable._getSelectionPlugin();

		aMethodNames.forEach(function(sMethodName) {
			var oSpy;

			if (sMethodName in oSelectionPlugin) {
				oSpy = sinon.spy(oSelectionPlugin, sMethodName);
			}

			assert.throws(this.oTable[sMethodName], "Table#" + sMethodName + " throws an error if a selection plugin is applied");

			if (oSpy) {
				assert.ok(oSpy.notCalled, "Table#" + sMethodName + " does not call SelectionPlugin#" + sMethodName);
			}
		}.bind(this));
	});

	/**
	 * @deprecated As of version 1.115
	 */
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
		this.oTableInvalidate.resetHistory();

		this.oTable.insertAggregation("_hiddenDependents", new Text(), 0, true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when inserting a hidden dependent and suppressing invalidation");
	});

	QUnit.test("addAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when adding a hidden dependent without suppressing invalidation");
		this.oTableInvalidate.resetHistory();

		this.oTable.addAggregation("_hiddenDependents", new Text(), true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when adding a hidden dependent and suppressing invalidation");
	});

	QUnit.test("removeAggregation", function(assert) {
		var oText = new Text();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.resetHistory();
		this.oTable.removeAggregation("_hiddenDependents", oText);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing a hidden dependent without suppressing invalidation");
		this.oTableInvalidate.resetHistory();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.resetHistory();
		this.oTable.removeAggregation("_hiddenDependents", oText, true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing a hidden dependent and suppressing invalidation");
	});

	QUnit.test("removeAllAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		this.oTableInvalidate.resetHistory();

		this.oTable.removeAllAggregation("_hiddenDependents");
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing all hidden dependents without suppressing invalidation");
		this.oTableInvalidate.resetHistory();

		this.oTable.removeAllAggregation("_hiddenDependents", true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when removing all hidden dependents and suppressing invalidation");
	});

	QUnit.test("destroyAggregation", function(assert) {
		this.oTable.addAggregation("_hiddenDependents", new Text());
		this.oTableInvalidate.resetHistory();

		this.oTable.destroyAggregation("_hiddenDependents");
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when destroying all hidden dependents without suppressing invalidation");
		this.oTableInvalidate.resetHistory();

		this.oTable.destroyAggregation("_hiddenDependents", true);
		assert.ok(this.oTableInvalidate.notCalled,
			"The table is not invalidated when destroying all hidden dependents and suppressing invalidation");
	});

	QUnit.test("destroy", function(assert) {
		var oText = new Text();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.resetHistory();
		oText.destroy();
		assert.ok(this.oTableInvalidate.notCalled, "The table is not invalidated when destroying a hidden dependent");
	});

	QUnit.test("clone", function(assert) {
		var oText = new Text("myHiddenDependentText");
		var oTableClone;

		sinon.spy(oText, "clone");
		this.oTable.addAggregation("_hiddenDependents", oText);
		oTableClone = this.oTable.clone();

		assert.ok(!oTableClone.getAggregation("_hiddenDependents").some((oElement) => {
			return oElement.getId().startsWith("myHiddenDependentText");
		}), "The clone does not contain clones of the hidden dependents of the original table");
		assert.ok(oText.clone.notCalled, "The 'clone' method of the hidden dependent was not called");

		oText.clone.restore();
		oTableClone.destroy();
	});

	QUnit.test("findAggregatedObjects / findElements", function(assert) {
		var oText = new Text("myHiddenDependentText");

		this.oTable.addAggregation("_hiddenDependents", oText);

		assert.ok(!this.oTable.findAggregatedObjects().includes(oText), "#findAggregatedObjects does not find hidden dependents");
		assert.ok(!this.oTable.findElements().includes(oText), "#findElements does not find hidden dependents");
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
		oRowsBoundSpy.resetHistory();

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
		oUnbindRowsSpy.resetHistory();

		this.oTable.unbindRows();
		assert.ok(oUnbindRowsSpy.notCalled, "Unbind if not bound: 'UnbindRows' hook was not called");
		oUnbindRowsSpy.resetHistory();

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
		oRowsUnboundSpy.resetHistory();

		this.oTable.unbindRows();
		assert.ok(oRowsUnboundSpy.notCalled, "Unbind if not bound: 'RowsUnbound' hook was not called");
		oRowsUnboundSpy.resetHistory();

		this.oTable.bindRows(oBindingInfo);
		this.oTable.bindRows({path: "/other"});
		assert.ok(oRowsUnboundSpy.notCalled, "Bind rows if bound: 'RowsUnbound' hook was not called");
		oRowsUnboundSpy.resetHistory();

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
		oRefreshRowsSpy.resetHistory();

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
		oUpdateRowsSpy.resetHistory();

		this.oTable.getBinding().fireEvent("change", {reason: ChangeReason.Change});
		assert.equal(oUpdateRowsSpy.callCount, 1, "Binding change with reason: 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(ChangeReason.Change), "Binding change with reason: 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.resetHistory();

		this.oTable.getBinding().fireEvent("change");
		assert.equal(oUpdateRowsSpy.callCount, 1, "Binding change without reason: 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.Unknown),
			"Binding change without reason: 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.resetHistory();

		this.oTable.setFirstVisibleRow(1);
		assert.equal(oUpdateRowsSpy.callCount, 1, "Change 'firstVisibleRow': 'UpdateRows' hook was called once");
		assert.ok(oUpdateRowsSpy.calledWithExactly(TableUtils.RowsUpdateReason.FirstVisibleRowChange),
			"Change 'firstVisibleRow': 'UpdateRows' hook was correctly called");
		oUpdateRowsSpy.resetHistory();

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

	QUnit.test("TotalRowCountChanged", function(assert) {
		var oTotalRowCountChangedSpy = sinon.spy();
		var that = this;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, oTotalRowCountChangedSpy);

		this.oTable.bindRows({path: "/"});
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oTotalRowCountChangedSpy.callCount, 1, "Bind: 'TotalRowCountChanged' hook called once");
			assert.ok(oTotalRowCountChangedSpy.calledWithExactly(), "Bind: 'TotalRowCountChanged' hook parameters");

			oTotalRowCountChangedSpy.resetHistory();
			that.oTable.getBinding().filter(new Filter({path: "something", operator: "EQ", value1: "something"}));
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTotalRowCountChangedSpy.callCount, 1, "Filter: 'TotalRowCountChanged' hook called once");
			assert.ok(oTotalRowCountChangedSpy.calledWithExactly(), "Filter: 'TotalRowCountChanged' hook parameters");

			oTotalRowCountChangedSpy.resetHistory();
			that.oTable.getBinding().filter();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTotalRowCountChangedSpy.callCount, 1, "Remove filter: 'TotalRowCountChanged' hook called once");
			assert.ok(oTotalRowCountChangedSpy.calledWithExactly(), "Remove filter: 'TotalRowCountChanged' hook parameters");

			oTotalRowCountChangedSpy.resetHistory();
			that.oTable.getBinding().sort(new Sorter({path: "something"}));
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTotalRowCountChangedSpy.callCount, 0, "Sort: 'TotalRowCountChanged' hook not called");

			oTotalRowCountChangedSpy.resetHistory();
			that.oTable.unbindRows();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTotalRowCountChangedSpy.callCount, 1, "Unbind: 'TotalRowCountChanged' hook called once");
			assert.ok(oTotalRowCountChangedSpy.calledWithExactly(), "Unbind: 'TotalRowCountChanged' hook parameters");
		});
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
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertNoContentMessage: function(assert, oTable, vExpectedContent) {
			var sTitlePrefix = "The content in the NoData container is: ";

			if (TableUtils.isA(vExpectedContent, "sap.ui.core.Control")) {
				assert.strictEqual(oTable.getDomRef("noDataCnt").firstChild, vExpectedContent.getDomRef(), sTitlePrefix + vExpectedContent);
			} else {
				assert.strictEqual(oTable.getDomRef("noDataCnt").innerText, vExpectedContent, sTitlePrefix + "\"" + vExpectedContent + "\"");
			}
		},
		waitForNoColumnsMessage: function(oTable) {
			return new Promise(function(resolve) {
				var oNoColumnsMessage = oTable.getAggregation("_noColumnsMessage");

				if (oNoColumnsMessage) {
					resolve(oNoColumnsMessage);
				} else {
					var fnSetAggregation = oTable.setAggregation;
					oTable.setAggregation = function(sAggregationName, oElement) {
						fnSetAggregation.apply(oTable, arguments);
						if (sAggregationName === "_noColumnsMessage") {
							resolve(oElement);
						}
					};
				}
			});
		}
	});

	QUnit.test("With data and showNoData=true", function(assert) {
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Without data and showNoData=true", function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable({
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_DATA"));
	});

	QUnit.test("Without data and showNoData=false", function(assert) {
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

	QUnit.test("Without columns and showNoData=true", function(assert) {
		this.oTable.destroyColumns();
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));
	});

	QUnit.test("Without columns and showNoData=false", function(assert) {
		this.oTable.destroyColumns();
		this.oTable.setShowNoData(false);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));
	});

	QUnit.test("Without columns and noData=sap.m.IllustratedMessage", function(assert) {
		var oTable = this.oTable;

		oTable.setNoData(new IllustratedMessage());
		oTable.destroyColumns();
		oCore.applyChanges();
		assert.strictEqual(oTable.getAggregation("_noColumnsMessage"), null, "The NoColumns IllustratedMessage is not created synchronously");
		this.assertNoContentMessage(assert, oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));

		return this.waitForNoColumnsMessage(oTable).then(function(oIllustratedMessage) {
			oCore.applyChanges();
			assert.ok(oIllustratedMessage.isA("sap.m.IllustratedMessage"), "The NoColumns element is a sap.m.IllustratedMessage");
			assert.strictEqual(oIllustratedMessage.getEnableVerticalResponsiveness(), true, "Value of the 'enableVerticalResponsiveness' property");
			this.assertNoContentMessage(assert, oTable, oIllustratedMessage);
		}.bind(this));
	});

	QUnit.test("Change 'showNoData' property with data", function(assert) {
		this.oTable.setShowNoData(true);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to true");

		this.oTable.setShowNoData(false);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false");

		this.oTable.setShowNoData(false);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		this.oTable.setShowNoData(true);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to true");
	});

	QUnit.test("Change 'showNoData' property without data", function(assert) {
		this.oTable.unbindRows();
		this.oTable.setShowNoData(true);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from true to true");

		this.oTable.setShowNoData(false);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false");

		this.oTable.setShowNoData(false);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		this.oTable.setShowNoData(true);
		oCore.applyChanges();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from false to true");
	});

	QUnit.test("Change 'noData' aggregation", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oTable, "invalidate");
		var oText1 = new Text();
		var oText2 = new Text();
		var oIllustratedMessage = new IllustratedMessage();

		this.oTable.setNoData("Hello");
		assert.ok(oInvalidateSpy.notCalled, "Change from default text to custom text: Table not invalidated");
		this.assertNoContentMessage(assert, this.oTable, "Hello");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Change from text to a different text: Table not invalidated");
		this.assertNoContentMessage(assert, this.oTable, "Hello2");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Change from text to the same text: Table not invalidated");
		this.assertNoContentMessage(assert, this.oTable, "Hello2");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oText1);
		assert.equal(oInvalidateSpy.callCount, 1, "Change from text to control: Table invalidated");
		oCore.applyChanges();
		this.assertNoContentMessage(assert, this.oTable, oText1);

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oText2);
		assert.equal(oInvalidateSpy.callCount, 1, "Change from control to control: Table invalidated");
		oCore.applyChanges();
		this.assertNoContentMessage(assert, this.oTable, oText2);

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.equal(oInvalidateSpy.callCount, 1, "Change from control to text: Table invalidated");
		oCore.applyChanges();
		this.assertNoContentMessage(assert, this.oTable, "Hello2");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oIllustratedMessage);
		assert.equal(oInvalidateSpy.callCount, 1, "Change from text to sap.m.IllustratedMessage: Table invalidated");
		oInvalidateSpy.resetHistory();

		return this.waitForNoColumnsMessage(this.oTable).then(function() {
			assert.ok(oInvalidateSpy.notCalled,
				"Change from text to sap.m.IllustratedMessage: Table not invalidated after loading default NoColumns IllustratedMessage");

			oText1.destroy();
			oText2.destroy();
			oIllustratedMessage.destroy();
		});
	});

	QUnit.test("Change 'noData' aggregation when the table does not have columns", function(assert) {
		var oInvalidateSpy = sinon.spy(this.oTable, "invalidate");
		var oText1 = new Text();
		var oText2 = new Text();
		var oIllustratedMessage = new IllustratedMessage();

		this.oTable.destroyColumns();

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello");
		assert.ok(oInvalidateSpy.notCalled, "Change from default text to custom text: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Change from text to a different text: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Change from text to the same text: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oText1);
		assert.ok(oInvalidateSpy.notCalled, "Change from text to control: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oText2);
		assert.ok(oInvalidateSpy.notCalled, "Change from control to control: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.ok(oInvalidateSpy.notCalled, "Change from control to text: Table not invalidated");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oIllustratedMessage);
		this.oTable.setNoData(oIllustratedMessage); // To check whether multiple async loadings of the NoColumns message causes issues.
		assert.ok(oInvalidateSpy.notCalled, "Change from text to sap.m.IllustratedMessage: Table not invalidated");

		return this.waitForNoColumnsMessage(this.oTable).then(TableQUnitUtils.$wait() /* If NoColumns is fetched twice */).then(function() {
			assert.equal(oInvalidateSpy.callCount, 1,
				"Change from text to sap.m.IllustratedMessage: Table invalidated after loading default NoColumns IllustratedMessage");

			oInvalidateSpy.resetHistory();
			this.oTable.setNoData("Hello");
			assert.equal(oInvalidateSpy.callCount, 1, "Change from sap.m.IllustratedMessage to text: Table invalidated");
			oCore.applyChanges();
			this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));

			this.oTable.setNoData(oIllustratedMessage);
			this.oTable.setNoData("Hello");
		}.bind(this)).then(TableQUnitUtils.$wait(100)).then(function() {
			oCore.applyChanges();
			this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));

			oText1.destroy();
			oText2.destroy();
			oIllustratedMessage.destroy();
		}.bind(this));
	});

	QUnit.test("Binding change", function(assert) {
		var oBindingInfo = this.oTable.getBindingInfo("rows");
		var that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oTable.getBinding().filter(new Filter({
				path: "something",
				operator: "LT",
				value1: 5
			}));
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Filter");
			that.oTable.getBinding().filter();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Remove filter");
			that.oTable.unbindRows();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.oTable.bindRows(oBindingInfo);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
		});
	});

	QUnit.module("Hierarchy modes", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(12),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				rowMode: new FixedRowMode({
					rowCount: 12
				})
			});
			this.iCurrentState = 0;

			TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, function(oState) {
				Object.assign(oState, this.aRowStates[this.iCurrentState]);
				this.iCurrentState++;
			}, this);

			this.oTable.attachRowsUpdated(function() {
				this.iCurrentState = 0;
			}, this);

			this.oTable.bindRows({
				path: "/"
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		aRowStates: [{
			title: "Non-expandable standard row",
			type: Row.prototype.Type.Standard,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed standard row",
			type: Row.prototype.Type.Standard,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded standard row",
			type: Row.prototype.Type.Standard,
			level: 3,
			expandable: true,
			expanded: true
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 4
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 5
		}, {
			title: "Non-expandable group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 3,
			expandable: true,
			expanded: true
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 4
		}, {
			title: "Non-expandable summary row",
			type: Row.prototype.Type.Summary,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed summary row",
			type: Row.prototype.Type.Summary,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded summary row",
			type: Row.prototype.Type.Summary,
			level: 5,
			expandable: true,
			expanded: true
		}],
		assertRowIndentation: function(assert, aIndentations) {
			var aRows = this.oTable.getRows();

			function getCSSPixelSize(iPixel) {
				return iPixel === 0 ? "" : iPixel + "px";
			}

			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var mRowDomRefs = oRow.getDomRefs();
				var oRowHeader = mRowDomRefs.rowHeaderPart;
				var oFirstCellContentInRow = mRowDomRefs.rowScrollPart.querySelector("td.sapUiTableCellFirst > .sapUiTableCellInner");
				var sMessagePrefix = "Indentation; " + oRow.getTitle() + "; Level " + oRow.getLevel() + "; Index " + oRow.getIndex() + ": ";

				if (TableUtils.Grouping.isInGroupMode(this.oTable)) {
					var oGroupShield = oRowHeader.querySelector(".sapUiTableGroupShield");

					assert.equal(oRowHeader.style["left"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Row header");
					assert.equal(oGroupShield.style["marginLeft"], getCSSPixelSize(-aIndentations[i]), sMessagePrefix + "Group shield");
					assert.equal(oFirstCellContentInRow.style["paddingLeft"], getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				} else if (TableUtils.Grouping.isInTreeMode(this.oTable)) {
					var oTreeIcon = mRowDomRefs.rowScrollPart.querySelector(".sapUiTableTreeIcon");

					assert.equal(oTreeIcon.style["marginLeft"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Tree icon");
				} else {
					assert.equal(oRowHeader.style["left"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Row header");
					assert.equal(oFirstCellContentInRow.style["paddingLeft"], getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				}
			}
		},
		RowType: {
			Standard: 1 << 1,
			GroupHeaderLeaf: 1 << 2,
			GroupHeaderExpanded: 1 << 3,
			GroupHeaderCollapsed: 1 << 4,
			TreeNodeLeaf: 1 << 5,
			TreeNodeExpanded: 1 << 6,
			TreeNodeCollapsed: 1 << 7,
			Summary: 1 << 8
		},
		assertRowVisualization: function(assert, aExpectedRowTypes) {
			var aRows = this.oTable.getRows();
			var AnyGroupHeader = this.RowType.GroupHeaderLeaf | this.RowType.GroupHeaderExpanded | this.RowType.GroupHeaderCollapsed;
			var AnyTreeNode = this.RowType.TreeNodeLeaf | this.RowType.TreeNodeExpanded | this.RowType.TreeNodeCollapsed;

			function isType(type, matchingType) {
				return (type & matchingType) > 0;
			}

			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var iExpectedRowType = aExpectedRowTypes[i];
				var mRowDomRefs = oRow.getDomRefs();
				var oGroupIcon = mRowDomRefs.rowHeaderPart.querySelector(".sapUiTableGroupIcon");
				var bIsGroupHeader = mRowDomRefs.row.every(function(oRowElement) {
					return oRowElement.classList.contains("sapUiTableGroupHeaderRow");
				});
				var bIsGroupExpanded = bIsGroupHeader && oGroupIcon.classList.contains("sapUiTableGroupIconOpen");
				var bIsGroupCollapsed = bIsGroupHeader && oGroupIcon.classList.contains("sapUiTableGroupIconClosed");
				var bIsGroupLeaf = bIsGroupHeader && !bIsGroupExpanded && !bIsGroupCollapsed;
				var oTreeIcon = this.oTable.qunit.getDataCell(i, 0).querySelector(".sapUiTableTreeIcon");
				var bIsTreeNode = oTreeIcon !== null;
				var bIsTreeLeaf = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconLeaf");
				var bIsTreeExpanded = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconNodeOpen");
				var bIsTreeCollapsed = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconNodeClosed");
				var bIsSummary = mRowDomRefs.row.every(function(oRowElement) {
					return oRowElement.classList.contains("sapUiTableSummaryRow");
				});
				var sMessagePrefix = "Visualization: " + oRow.getTitle() + "; Index " + oRow.getIndex() + ": ";

				if (isType(iExpectedRowType, this.RowType.Standard)) {
					assert.ok(!bIsGroupHeader && !bIsTreeNode && !bIsSummary, sMessagePrefix + "Standard row");
				} else if (isType(iExpectedRowType, AnyGroupHeader)) {
					assert.ok(bIsGroupHeader && !bIsTreeNode && !bIsSummary, sMessagePrefix + "Group header row");
				} else if (isType(iExpectedRowType, AnyTreeNode)) {
					assert.ok(!bIsGroupHeader && bIsTreeNode && !bIsSummary, sMessagePrefix + "Tree row");
				} else if (isType(iExpectedRowType, this.RowType.Summary)) {
					assert.ok(!bIsGroupHeader && bIsSummary, sMessagePrefix + "Summary row");
				}

				if (isType(iExpectedRowType, this.RowType.GroupHeaderLeaf)) {
					assert.ok(bIsGroupLeaf && !bIsGroupExpanded && !bIsGroupCollapsed, sMessagePrefix + "Group header row is leaf");
				} else if (isType(iExpectedRowType, this.RowType.GroupHeaderExpanded)) {
					assert.ok(!bIsGroupLeaf && bIsGroupExpanded && !bIsGroupCollapsed, sMessagePrefix + "Group header row is expanded");
				} else if (isType(iExpectedRowType, this.RowType.GroupHeaderCollapsed)) {
					assert.ok(!bIsGroupLeaf && !bIsGroupExpanded && bIsGroupCollapsed, sMessagePrefix + "Group header row is collapsed");
				}

				if (isType(iExpectedRowType, this.RowType.TreeNodeLeaf)) {
					assert.ok(bIsTreeLeaf && !bIsTreeExpanded && !bIsTreeCollapsed, sMessagePrefix + "Tree row is leaf");
				} else if (isType(iExpectedRowType, this.RowType.TreeNodeExpanded)) {
					assert.ok(!bIsTreeLeaf && bIsTreeExpanded && !bIsTreeCollapsed, sMessagePrefix + "Tree row is expanded");
				} else if (isType(iExpectedRowType, this.RowType.TreeNodeCollapsed)) {
					assert.ok(!bIsTreeLeaf && !bIsTreeExpanded && bIsTreeCollapsed, sMessagePrefix + "Tree row is collapsed");
				}
			}
		}
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.Flat, function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Flat);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertRowIndentation(assert, new Array(12).fill(0));
			this.assertRowVisualization(assert, new Array(9).fill(this.RowType.Standard).concat(new Array(3).fill(this.RowType.Summary)));
		}.bind(this));
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.Group, function(assert) {
		var aExpectedIndentations = [0, 0, 24, 36, 44, 0, 24, 36, 36, 0, 0, 44];
		var that = this;

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.assertRowIndentation(assert, aExpectedIndentations);
			that.assertRowVisualization(assert, new Array(5).fill(that.RowType.Standard).concat([
				that.RowType.GroupHeaderLeaf,
				that.RowType.GroupHeaderCollapsed,
				that.RowType.GroupHeaderExpanded,
				that.RowType.Standard,
				that.RowType.Summary,
				that.RowType.Summary,
				that.RowType.Summary
			]));
		});
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.Tree, function(assert) {
		var aExpectedIndentations = [0, 17, 34, 51, 68, 0, 17, 34, 51, 0, 17, 68];
		var that = this;

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.assertRowIndentation(assert, aExpectedIndentations);
			that.assertRowVisualization(assert, [
				that.RowType.TreeNodeLeaf,
				that.RowType.TreeNodeCollapsed,
				that.RowType.TreeNodeExpanded,
				that.RowType.TreeNodeLeaf,
				that.RowType.TreeNodeLeaf,
				that.RowType.TreeNodeLeaf,
				that.RowType.TreeNodeCollapsed,
				that.RowType.TreeNodeExpanded,
				that.RowType.TreeNodeLeaf,
				that.RowType.Summary,
				that.RowType.Summary,
				that.RowType.Summary
			]);
		});
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.GroupedTree, function(assert) {
		var aExpectedIndentations = [0, 24, 36, 44, 52, 0, 24, 36, 44, 0, 24, 52];
		var that = this;

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.GroupedTree);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.assertRowIndentation(assert, aExpectedIndentations);
			that.assertRowVisualization(assert, new Array(5).fill(that.RowType.Standard).concat([
				that.RowType.GroupHeaderLeaf,
				that.RowType.GroupHeaderCollapsed,
				that.RowType.GroupHeaderExpanded,
				that.RowType.Standard,
				that.RowType.Summary,
				that.RowType.Summary,
				that.RowType.Summary
			]));
		});
	});

	QUnit.module("Hide content", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createTextColumn()
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
		}
	});

	QUnit.test("Row", function(assert) {
		var oTable = this.oTable;
		var oRow = oTable.getRows()[0];
		var aRowInfo = [{
			title: "Standard row",
			state: {type: oRow.Type.Standard},
			expectContentHidden: false
		}, {
			title: "Standard row with hidden content",
			state: {type: oRow.Type.Standard, contentHidden: true},
			expectContentHidden: true
		}, {
			title: "Group header row with hidden content",
			state: {type: oRow.Type.GroupHeader, contentHidden: true},
			expectContentHidden: true
		}, {
			title: "Summary row with hidden content",
			state: {type: oRow.Type.Summary, contentHidden: true},
			expectContentHidden: true
		}, {
			title: "Standard row without binding context",
			state: {type: oRow.Type.Standard, context: undefined},
			expectContentHidden: true
		}];

		function isRowContentHidden(oRow) {
			return oRow.getDomRefs().row.every(function(oRowElement) {
				return oRowElement.classList.contains("sapUiTableRowHidden") === true;
			});
		}

		oTable.qunit.addTextColumn();
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction({items: [new RowActionItem()]}));

		return oTable.qunit.whenRenderingFinished().then(function() {
			aRowInfo.forEach(function(mRowInfo, iIndex) {
				assert.ok(!isRowContentHidden(oTable.getRows()[iIndex]), "Default: " + mRowInfo.title);
			});

			return this.setRowStates(aRowInfo.map(function(mTestConfig) {
				return mTestConfig.state;
			}));
		}.bind(this)).then(function() {
			aRowInfo.forEach(function(mRowInfo, iIndex) {
				assert.equal(isRowContentHidden(oTable.getRows()[iIndex]), mRowInfo.expectContentHidden, mRowInfo.title);
			});
		});
	});

	QUnit.test("Cell", function(assert) {
		var oTable = this.oTable;
		var oRow = oTable.getRows()[0];
		var aRowInfo = [{
			title: "Standard row",
			state: {type: oRow.Type.Standard}
		}, {
			title: "Non-expandable group header row",
			state: {type: oRow.Type.GroupHeader}
		}, {
			title: "Expanded group header row",
			state: {type: oRow.Type.GroupHeader, expandable: true, expanded: true}
		}, {
			title: "Collapsed group header row",
			state: {type: oRow.Type.GroupHeader, expandable: true}
		}, {
			title: "Summary row",
			state: {type: oRow.Type.Summary}
		}];
		var aColumnInfo = [{
			title: "Default",
			template: new TableQUnitUtils.TestControl({text: "content"})
		}, {
			title: "All hidden",
			cellContentVisibilitySettings: {
				standard: false,
				groupHeader: {nonExpandable: false, expanded: false, collapsed: false},
				summary: {group: false, total: false}
			},
			template: new TableQUnitUtils.TestControl({text: "content"})
		}, {
			title: "No template",
			cellContentVisibilitySettings: {
				standard: false,
				groupHeader: {nonExpandable: false, expanded: false, collapsed: false},
				summary: {group: false, total: false}
			}
		}, {
			title: "Template invisible",
			cellContentVisibilitySettings: {
				standard: true,
				groupHeader: {nonExpandable: false, expanded: true, collapsed: false},
				summary: {group: false, total: true}
			},
			template: new TableQUnitUtils.TestControl({text: "content", visible: false})
		}, {
			title: "Mixed visibility",
			cellContentVisibilitySettings: {
				standard: true,
				groupHeader: {nonExpandable: false, expanded: true, collapsed: false},
				summary: {group: false, total: true}
			},
			template: new TableQUnitUtils.TestControl({text: "content"})
		}];

		function assertCellContentVisibility(oColumn, sTitle) {
			aRowInfo.forEach(function(mRowInfo, iIndex) {
				var oRow = oTable.getRows()[iIndex];
				var oCellElement = oRow.getDomRefs(true).row.find("td[data-sap-ui-colid=\"" + oColumn.getId() + "\"]")[0];
				var bCellContentHidden = oCellElement && oCellElement.classList.contains("sapUiTableCellHidden");
				var bExpectCellContentVisible;
				var mCellContentVisibilitySettings = oColumn._getCellContentVisibilitySettings();

				if (!oCellElement) {
					return;
				}

				if (oRow.isGroupHeader()) {
					if (oRow.isExpandable()) {
						if (oRow.isExpanded()) {
							bExpectCellContentVisible = mCellContentVisibilitySettings.groupHeader.expanded;
						} else {
							bExpectCellContentVisible = mCellContentVisibilitySettings.groupHeader.collapsed;
						}
					} else {
						bExpectCellContentVisible = mCellContentVisibilitySettings.groupHeader.nonExpandable;
					}
				} else if (oRow.isTotalSummary()) {
					bExpectCellContentVisible = mCellContentVisibilitySettings.summary.total;
				} else if (oRow.isGroupSummary()) {
					bExpectCellContentVisible = mCellContentVisibilitySettings.summary.group;
				} else {
					bExpectCellContentVisible = mCellContentVisibilitySettings.standard;
				}

				assert.equal(bCellContentHidden, !bExpectCellContentVisible, sTitle + ": " + mRowInfo.title);
			});
		}

		oTable.removeAllColumns();
		aColumnInfo.forEach(function(mColumnInfo) {
			var oColumn = new Column({
				label: mColumnInfo.title,
				template: mColumnInfo.template
			});
			oColumn._setCellContentVisibilitySettings(mColumnInfo.cellContentVisibilitySettings);
			oTable.addColumn(oColumn);
		});
		oTable.setFixedColumnCount(2);

		return oTable.qunit.whenRenderingFinished().then(function() {
			return this.setRowStates(aRowInfo.map(function(mRowInfo) {
				return mRowInfo.state;
			}));
		}.bind(this)).then(function() {
			aColumnInfo.forEach(function(mColumnInfo, iIndex) {
				assertCellContentVisibility(oTable.getColumns()[iIndex], mColumnInfo.title);
			});
		});
	});

	QUnit.module("Clear text selection on update", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				models: TableQUnitUtils.createJSONModel(2),
				columns: [
					TableQUnitUtils.createTextColumn({text: "name", bind: true, label: "Name"})
				],
				extension: new Text({text: "Title"}),
				footer: new Text({text: "Footer"})
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		selectTextInRow: function() {
			window.getSelection().selectAllChildren(this.oTable.getRows()[0].getCells()[0].getDomRef());
		},
		assertTextSelection: function(assert, sText, sTitle) {
			assert.strictEqual(window.getSelection().toString(), sText, "Selected text");
		}
	});

	QUnit.test("Change 'firstVisibleRow'", function(assert) {
		this.selectTextInRow();
		this.oTable.setFirstVisibleRow(1);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "");
		}.bind(this));
	});

	QUnit.test("Binding update", function(assert) {
		this.selectTextInRow();
		this.oTable.getBinding().refresh(true);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "");
		}.bind(this));
	});

	QUnit.test("Text selection is outside of rows", function(assert) {
		window.getSelection().selectAllChildren(this.oTable.getExtension()[0].getDomRef());
		this.oTable.getBinding().refresh(true);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "Title");
		}.bind(this));
	});

	QUnit.test("Text selection starts before rows and ends inside rows", function(assert) {
		window.getSelection().setBaseAndExtent(this.oTable.getExtension()[0].getDomRef(), 0, this.oTable.getRows()[0].getCells()[0].getDomRef(), 1);
		this.oTable.getBinding().refresh(true);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "");
		}.bind(this));
	});

	QUnit.test("Text selection starts inside rows and ends after rows", function(assert) {
		window.getSelection().setBaseAndExtent(this.oTable.getRows()[0].getCells()[0].getDomRef(), 0, this.oTable.getFooter().getDomRef(), 1);
		this.oTable.getBinding().refresh(true);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "");
		}.bind(this));
	});

	QUnit.test("Text selection starts before rows and ends after rows", function(assert) {
		window.getSelection().setBaseAndExtent(this.oTable.getExtension()[0].getDomRef(), 0, this.oTable.getFooter().getDomRef(), 1);
		this.oTable.getBinding().refresh(true);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.assertTextSelection(assert, "");
		}.bind(this));
	});

	QUnit.module("ContextMenu", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModel(11),
				columns: [
					TableQUnitUtils.createTextColumn({text: "name", bind: true, label: "Name"}).setFilterProperty("name")
				],
				enableCellFilter: true
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});
	QUnit.test("DefaultContextMenu", function(assert) {
		var oCell = this.oTable.qunit.getDataCell(0, 0);

		qutils.triggerMouseEvent(oCell, "mousedown", null, null, null, null, 2);
		oCell.dispatchEvent(new MouseEvent("contextmenu", {bubbles: true}));
		assert.ok(this.oTable._oCellContextMenu.isOpen(), "Context menu is open");
		this.oTable.setFirstVisibleRow(1);

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.notOk(this.oTable._oCellContextMenu.isOpen(), "Context menu is closed after scrolling");
		});
	});

	QUnit.test("CustomContextMenu", function(assert) {
		var oCell = this.oTable.qunit.getDataCell(0, 0);

		this.oTable.setContextMenu(new Menu({items: new MenuItem({text: "CustomMenu"})}));
		qutils.triggerMouseEvent(oCell, "mousedown", null, null, null, null, 2);
		oCell.dispatchEvent(new MouseEvent("contextmenu", {bubbles: true}));
		assert.ok(this.oTable.getContextMenu().isOpen(), "Context menu is open");
		this.oTable.setFirstVisibleRow(1);

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.notOk(this.oTable.getContextMenu().isOpen(), "Context menu is closed after scrolling");
		});
	});

	QUnit.module("Row Modes", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable?.destroy();
			this.oTable = TableQUnitUtils.createTable(mSettings);
		},
		getDefaultRowMode: function() {
			return this.oTable.getAggregation("_hiddenDependents").filter((oObject) => oObject.isA("sap.ui.table.rowmodes.RowMode"))[0];
		}
	});

	QUnit.test("Default", function(assert) {
		this.createTable();
		assert.strictEqual(this.oTable.getRowMode(), null, "value of 'rowMode' aggregation");
		assert.ok(TableUtils.isA(this.getDefaultRowMode(), "sap.ui.table.rowmodes.Fixed"),
			"A default instance of sap.ui.table.rowmodes.Fixed is applied");
		assert.ok(Object.keys(this.getDefaultRowMode().getMetadata().getAllProperties()).every((sPropertyName) => {
			return this.oTable.isPropertyInitial(sPropertyName);
		}), "All properties of the default row mode instance are initial");
	});

	QUnit.test("Enum value", function(assert) {
		Object.values(RowModeType).forEach((sRowMode) => {
			this.createTable({rowMode: sRowMode});
			assert.strictEqual(this.oTable.getRowMode(), sRowMode, "value of 'rowMode' aggregation");
			assert.ok(TableUtils.isA(this.getDefaultRowMode(), "sap.ui.table.rowmodes." + sRowMode),
				`A default instance of sap.ui.table.rowmodes.${sRowMode} is applied`);
			assert.ok(Object.keys(this.getDefaultRowMode().getMetadata().getAllProperties()).every((sPropertyName) => {
				return this.oTable.isPropertyInitial(sPropertyName);
			}), `All properties of the '${sRowMode}' row mode instance are initial`);
		});
	});

	QUnit.test("Avoid creation of a default instance", function(assert) {
		let bFailure = false;

		sinon.stub(FixedRowMode.prototype, "init").callsFake(function() {
			FixedRowMode.prototype.init.wrappedMethod.apply(this, arguments);
			bFailure = true;
		});

		this.createTable({rowMode: RowModeType.Auto});
		this.createTable({rowMode: new AutoRowMode()});
		assert.ok(!bFailure, "A default row mode instance (sap.ui.table.rowmodes.Fixed) was not created");

		FixedRowMode.prototype.init.restore();
	});

	/**
	 * BCP: 2370086821
	 * If a subclass binds the rows on init, the table wants to get the computed row counts from the row mode.
	 * @deprecated As of version 1.119
	 */
	QUnit.test("Create a default instance when bound on init", function(assert) {
		var bFailure = true;

		sinon.stub(FixedRowMode.prototype, "init").callsFake(function() {
			FixedRowMode.prototype.init.wrappedMethod.apply(this, arguments);
			bFailure = false;
		});

		sinon.stub(Table.prototype, "init").callsFake(function() {
			Table.prototype.init.wrappedMethod.apply(this, arguments);
			this.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));
			this.bindRows("/");
		});

		this.createTable({rowMode: FixedRowMode.Auto});
		assert.ok(!bFailure, "A default row mode instance (sap.ui.table.rowmodes.Fixed) was created");

		Table.prototype.init.restore();
	});
});