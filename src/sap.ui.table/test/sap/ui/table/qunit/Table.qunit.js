/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Table",
	"sap/ui/table/Row",
	"sap/ui/table/Column",
	"sap/ui/table/RowSettings",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/rowmodes/Interactive",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/plugins/SelectionPlugin",
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
	"sap/m/IllustratedMessage",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/type/Float",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/RenderManager",
	"sap/ui/core/message/Message",
	"sap/ui/core/util/PasteHelper",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	Table,
	Row,
	Column,
	RowSettings,
	RowModeType,
	FixedRowMode,
	InteractiveRowMode,
	AutoRowMode,
	TableUtils,
	library,
	SelectionPlugin,
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
	IllustratedMessage,
	Menu,
	MenuItem,
	JSONModel,
	Sorter,
	Filter,
	FilterType,
	ChangeReason,
	FloatType,
	Element,
	Control,
	Icon,
	RenderManager,
	Message,
	PasteHelper,
	CoreLibrary,
	MessageType,
	Device,
	jQuery,
	Log
) {
	"use strict";

	const SortOrder = CoreLibrary.SortOrder;
	const SelectionMode = library.SelectionMode;
	const SharedDomRef = library.SharedDomRef;

	// mapping of global function calls
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const checkFocus = window.checkFocus;

	const personImg = "../images/Person.png";
	const jobPosImg = "../images/JobPosition.png";
	let oTable;

	// TABLE TEST DATA
	let aData = [
		/* eslint-disable max-len */
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
		/* eslint-enable max-len */
	];

	const aOrgData = jQuery.extend(true, [], aData);
	for (let i = 0; i < 9; i++) {
		aData = aData.concat(jQuery.extend(true, [], aOrgData));
	}

	for (let i = 0, l = aData.length; i < l; i++) {
		aData[i].lastName += " - " + i;
	}

	const HeightTestControl = TableQUnitUtils.HeightTestControl;

	async function createTable(oConfig, fnCreateColumns, sModelName) {
		const sBindingPrefix = (sModelName ? sModelName + ">" : "");
		let sTitle;

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
				let oControl = new Text({text: "{" + sBindingPrefix + "lastName" + "}", wrapping: false});
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
				const floatType = new FloatType({
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

		const oModel = new JSONModel();
		oModel.setData({modelData: aData});
		oTable.setModel(oModel, sModelName);
		oTable.bindRows(sBindingPrefix + "/modelData");

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	function destroyTable() {
		if (oTable) {
			oTable.destroy();
			oTable = null;
		}
	}

	QUnit.module("Basic checks", {
		beforeEach: async function() {
			await createTable({
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
		const oTable = new Table();

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

	QUnit.test("Filter", function(assert) {
		const oColFirstName = oTable.getColumns()[1];
		const oColMoney = oTable.getColumns()[7];

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
		assert.equal(oTable.getSelectedIndices().length, 1, "selectedIndex is set");
		assert.equal(oTable.getSelectedIndices()[0], 8, "selectedIndex is 8");
	});

	QUnit.test("Check Selection of Last fixedBottomRow", function(assert) {
		oTable.getRowMode().setFixedBottomRowCount(3);

		const aRows = oTable.getRows();
		const oLastRow = aRows[aRows.length - 1];
		const $LastRow = oLastRow.getDomRefs(true);

		if ($LastRow.rowSelector) {
			$LastRow.rowSelector.trigger("tap");
			assert.equal(oTable.getSelectedIndices()[0], 199, "Selected Index is 199");
		}
	});

	QUnit.test("SelectAll", async function(assert) {
		oTable.setSelectionMode(SelectionMode.MultiToggle);
		await nextUIUpdate();

		const $SelectAll = oTable.$("selall");
		const sSelectAllTitleText = TableUtils.getResourceBundle().getText("TBL_SELECT_ALL");

		// Initially no rows are selected.
		assert.ok($SelectAll.hasClass("sapUiTableSelAll"), "Initial: The SelectAll checkbox is not checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Initial: The SelectAll title text is correct");

		// Select all rows. The SelectAll checkbox should be checked.
		oTable.selectAll();
		assert.ok(!$SelectAll.hasClass("sapUiTableSelAll"), "Called selectAll: The SelectAll checkbox is checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Called selectAll: The SelectAll title text is correct");

		// Deselect the first row. The SelectAll checkbox should not be checked.
		oTable.removeSelectionInterval(0, 0);
		assert.ok($SelectAll.hasClass("sapUiTableSelAll"), "Deselected the first row: The SelectAll checkbox is not checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Deselected the first row: The SelectAll title text is correct");

		// Select the first row again. The SelectAll checkbox should be checked.
		oTable.addSelectionInterval(0, 0);
		assert.ok(!$SelectAll.hasClass("sapUiTableSelAll"), "Selected the first row again: The SelectAll checkbox is checked");
		assert.strictEqual($SelectAll.attr("title"), sSelectAllTitleText, "Selected the first row again: The SelectAll title text is correct");
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
		const iMaxRowIndex = aData.length - oTable._getRowCounts().count;

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

		const oBindingInfo = oTable.getBindingInfo("rows");
		oTable.unbindRows();
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex + 1, "FirstVisibleRow is: " + (iMaxRowIndex + 1));

		oTable.bindRows(oBindingInfo);
		oTable.setFirstVisibleRow(iMaxRowIndex + 1);
		assert.equal(oTable.getFirstVisibleRow(), iMaxRowIndex, "FirstVisibleRow is: " + iMaxRowIndex);
	});

	QUnit.test("_setFocus", function(assert) {
		const oSpy = sinon.spy(oTable, "onRowsUpdated");

		function testFocus(iIndex, bFirstInteractiveElement) {
			return new Promise(function(resolve) {
				if (iIndex === -1) {
					iIndex = oTable._getTotalRowCount() - 1;
				}

				iIndex = Math.min(iIndex, oTable._getTotalRowCount() - 1);

				const iFirstVisibleRow = oTable.getFirstVisibleRow();
				const iRowCount = oTable._getRowCounts().count;
				let bScroll = true;
				if (iIndex > iFirstVisibleRow && iIndex < iFirstVisibleRow + iRowCount) {
					bScroll = false;
				}

				oTable._setFocus(iIndex, bFirstInteractiveElement).then(function() {
					assert.ok(bScroll ? oSpy.calledOnce : oSpy.notCalled, "The table was " + (bScroll ? "" : "not") + " scrolled");

					const oRow = oTable.getRows()[iIndex - oTable.getFirstVisibleRow()];
					const $Elem = (bFirstInteractiveElement && TableUtils.getFirstInteractiveElement(oRow)) ?
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

	QUnit.test("ColumnHeaderVisible", async function(assert) {
		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), false, "ColumnHeaderVisible ok");
		oTable.setColumnHeaderVisible(true);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableColHdrCnt").is(":visible"), true, "ColumnHeaderVisible ok");
	});

	QUnit.test("Column headers active state styling", async function(assert) {
		const oColumn = oTable.getColumns()[4];
		const oHeaderMenu = new TableQUnitUtils.ColumnHeaderMenu();

		oTable.setEnableColumnReordering(false);
		await nextUIUpdate();
		assert.notOk(oColumn.$().hasClass("sapUiTableHeaderCellActive"), "Reordering disabled and the column doesn't have a header menu");

		oColumn.setHeaderMenu(oHeaderMenu);
		await nextUIUpdate();
		assert.ok(oColumn.$().hasClass("sapUiTableHeaderCellActive"), "Column has a header menu that returns HasPopup.Menu");

		oHeaderMenu.getAriaHasPopupType = () => { return CoreLibrary.aria.HasPopup.None; };
		oTable.invalidate();
		await nextUIUpdate();
		assert.notOk(oColumn.$().hasClass("sapUiTableHeaderCellActive"), "Column has a header menu that returns HasPopup.None");

		oTable.setEnableColumnReordering(true);
		await nextUIUpdate();
		assert.ok(oColumn.$().hasClass("sapUiTableHeaderCellActive"), "Reordering is enabled");
	});

	QUnit.test("Skip _updateTableSizes if table has no width", function(assert) {
		const oDomRef = oTable.getDomRef();
		const oResetRowHeights = sinon.spy(oTable, "_resetRowHeights"); // _resetRowHeights is used to check if a layout update was performed

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

	QUnit.test("getCellControl", async function(assert) {
		oTable.getColumns()[2].setVisible(false);
		await nextUIUpdate();

		let oCell = oTable.getCellControl(0, 0, true);
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

	QUnit.test("Row Actions", async function(assert) {
		assert.equal(oTable.getRowActionCount(), 0, "RowActionCount is 0: Table has no row actions");
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "RowActionCount is 0: No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "RowActionCount is 0: No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "RowActionCount is 0: No action area");

		oTable.setRowActionCount(2);
		await nextUIUpdate();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "No row action template: No CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No row action template: No CSS class sapUiTableRActS");
		assert.ok(!oTable.$("sapUiTableRowActionScr").length, "No row action template: No action area");

		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await nextUIUpdate();
		assert.ok(oTable.$().hasClass("sapUiTableRAct"), "CSS class sapUiTableRAct");
		assert.ok(!oTable.$().hasClass("sapUiTableRActS"), "No CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");

		oTable.setRowActionCount(1);
		await nextUIUpdate();
		assert.ok(!oTable.$().hasClass("sapUiTableRAct"), "RowActionCount is 1: No CSS class sapUiTableRAct");
		assert.ok(oTable.$().hasClass("sapUiTableRActS"), "RowActionCount is 1: CSS class sapUiTableRActS");
		assert.ok(oTable.$("sapUiTableRowActionScr").length, "Action area exists");
		assert.notOk(oTable.$().hasClass("sapUiTableRActFlexible"), "The RowActions column is positioned right");

		oTable.getColumns().forEach(function(oCol) {
			oCol.setWidth("150.23999999px");
		});
		await nextUIUpdate();
		assert.notOk(oTable.$().hasClass("sapUiTableRActFlexible"), "The RowActions column is positioned right");

		oTable.getColumns().forEach(function(oCol) {
			oCol.setWidth("50px");
		});
		await nextUIUpdate();
		assert.ok(oTable.$().hasClass("sapUiTableRActFlexible"), "The position of the RowActions column is calculated based on the table content");
		let oTableSizes = oTable._collectTableSizes();
		assert.ok(oTable.$("sapUiTableRowActionScr").css("left") === 400 + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth + "px",
			"The RowActions column is positioned correctly");

		oTable.setFixedColumnCount(2);
		await nextUIUpdate();
		oTableSizes = oTable._collectTableSizes();
		assert.ok(oTable.$("sapUiTableRowActionScr").css("left") === 300 + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth + "px",
			"The RowActions column is positioned correctly");
	});

	QUnit.test("Row Settings Template", async function(assert) {
		const oOnAfterRenderingEventListener = sinon.spy();
		let oRowSettings;

		oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});

		assert.ok(oTable.getRowSettingsTemplate() == null, "Initially the table has no row settings template");
		assert.ok(oTable.getRows()[0].getAggregation("_settings") == null, "Initially the rows have no settings");

		oTable.setRowSettingsTemplate(new RowSettings());
		await nextUIUpdate();
		assert.ok(oTable.getRowSettingsTemplate() != null, "The table has a row settings template");
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Setting the row settings template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.ok(oRowSettings != null, "The rows have a settings template clone");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.getRowSettingsTemplate().setHighlight(MessageType.Success);
		await nextUIUpdate();
		assert.ok(oOnAfterRenderingEventListener.notCalled, "Changing the highlight property of the template did not cause the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), MessageType.None,
			"Changing the highlight property of the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.getRowSettingsTemplate().invalidate();
		await nextUIUpdate();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Invalidating the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), MessageType.None,
			"Invalidating the template did not change the highlight property of the template clones in the rows");

		oOnAfterRenderingEventListener.resetHistory();
		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.Warning
		}));
		await nextUIUpdate();
		assert.ok(oOnAfterRenderingEventListener.calledOnce, "Changing the template caused the table to re-render");

		oRowSettings = oTable.getRows()[0].getAggregation("_settings");
		assert.strictEqual(oRowSettings.getHighlight(), MessageType.Warning,
			"Changing the template changed the highlight property of the template clones in the rows");
	});

	QUnit.test("Localization Change", async function(assert) {
		const oInvalidateSpy = sinon.spy(oTable, "invalidate");
		let pAdaptLocalization;

		oTable.getColumns().slice(1).forEach(function(oColumn) {
			oTable.removeColumn(oColumn);
		});
		await nextUIUpdate();

		oTable._adaptLocalization = function(bRtlChanged, bLangChanged) {
			pAdaptLocalization = Table.prototype._adaptLocalization.apply(this, arguments);
			return pAdaptLocalization;
		};

		function assertLocalizationUpdates(bRTLChanged, bLanguageChanged) {
			let sChangesTestMessage;
			const bTableShouldBeInvalidated = bRTLChanged || bLanguageChanged;

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

			assert.strictEqual(oTable._oCellContextMenu == null, bLanguageChanged,
				"The cell context menu was " + (bLanguageChanged ? "" : " not") + " reset");
		}

		function test(bChangeTextDirection, bChangeLanguage) {
			const mChanges = {changes: {}};

			oTable._bRtlMode = null;
			TableUtils.Menu.openContextMenu(oTable, {target: getCell(0, 0, null, null, oTable)[0]});
			oInvalidateSpy.resetHistory();

			if (bChangeTextDirection) {
				mChanges.changes.rtl = "";
			}
			if (bChangeLanguage) {
				mChanges.changes.language = "";
			}

			oTable.onLocalizationChanged(mChanges);

			const pAssert = new Promise(function(resolve) {
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
		return test(true, true).then(function() {
			// RTL
			return test(true, false);
		}).then(function() {
			// Language
			return test(false, true);
		}).then(function() {
			// Other localization event
			return test(false, false);
		});
	});

	QUnit.test("AlternateRowColors", async function(assert) {
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "By default there is no alternating rows");

		const isAlternatingRow = function() {
			return this.getAttribute("data-sap-ui-rowindex") % 2;
		};

		oTable.setSelectionMode("None");
		oTable.setAlternateRowColors(true);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
					 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
					 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row headers
		oTable.setSelectionMode("MultiToggle");
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed columns
		oTable.setFixedColumnCount(2);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed rows
		oTable.getRowMode().setFixedTopRowCount(2);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for fixed bottom rows
		oTable.getRowMode().setFixedBottomRowCount(2);
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check for row actions
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await nextUIUpdate();
		assert.equal(oTable.$().find(".sapUiTableRowAlternate").length,
				 oTable.$().find(".sapUiTableRowAlternate").filter(isAlternatingRow).length,
				 "Every second element with data-sap-ui-rowindex attribute has the sapUiTableRowAlternate class");

		// check tree mode
		sinon.stub(TableUtils.Grouping, "isInTreeMode").returns(false);
		oTable.invalidate();
		await nextUIUpdate();
		assert.equal(oTable.$().find("sapUiTableRowAlternate").length, 0, "No alternating rows for tree mode");
		TableUtils.Grouping.isInTreeMode.restore();
	});

	QUnit.module("Column operations", {
		beforeEach: async function() {
			await createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Add / Insert / Remove", function(assert) {
		let aColumns = oTable.getColumns();
		let oColA = aColumns[2];
		let oColB = aColumns[3];

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

	QUnit.module("Fixed columns", {
		beforeEach: async function() {
			await createTable({
				fixedColumnCount: 2,
				width: "500px"
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	function getExpectedHScrollLeftMargin(iNumberOfFixedCols) {
		const iWidth = iNumberOfFixedCols * 100 /* Columns */ + TableUtils.BaseSize.sapUiSizeCozy; /* Default row header width in cozy */
		return iWidth + "px";
	}

	QUnit.test("After initialization", function(assert) {
		const $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 2, "Fixed table has 3 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll table has 7 Columns");
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH").length, 2, "Table has two sapUiTableFirstVisibleColumnTH class");
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH")[0], $table.find(".sapUiTableCHA th")[0],
			"sapUiTableFirstVisibleColumnTH class is set on the first th element of header table");
		assert.equal($table.find(".sapUiTableFirstVisibleColumnTH")[1], $table.find(".sapUiTableCCnt th")[0],
			"sapUiTableFirstVisibleColumnTH class is set on the first th element of content table");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("computedFixedColumnCount invalidation", function(assert) {
		const invalidationSpy = sinon.spy(oTable, "_invalidateComputedFixedColumnCount");
		const oCol = oTable.getColumns()[2];
		oTable.setFixedColumnCount(1);
		assert.equal(invalidationSpy.callCount, 1, "value is being invalidated");
		oCol.setHeaderSpan([2, 1]);
		assert.equal(invalidationSpy.callCount, 2, "value is being invalidated");
		oTable.removeColumn(oCol);
		assert.equal(invalidationSpy.callCount, 3, "value is being invalidated");
		oTable.insertColumn(oCol, 1);
		assert.equal(invalidationSpy.callCount, 4, "value is being invalidated");
		const aColumns = oTable.removeAllColumns();
		assert.equal(invalidationSpy.callCount, 5, "value is being invalidated");
		oTable.addColumn(oCol);
		assert.equal(invalidationSpy.callCount, 6, "value is being invalidated");
		oTable.destroyColumns();
		assert.equal(invalidationSpy.callCount, 7, "value is being invalidated");
		aColumns.forEach((oColumn) => oColumn.destroy());
	});

	QUnit.test("Fixed column count and table / column width", async function(assert) {
		const aColumns = oTable.getColumns();
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
		await nextUIUpdate();
		assert.equal(oTable.getComputedFixedColumnCount(), 0,
			"The table width is too small for using fixed columns, getComputedFixedColumnCount returns 0");
		oTable.setWidth("500px");
		await nextUIUpdate();
		assert.equal(oTable.getComputedFixedColumnCount(), 2,
			"The table width allows displaying of the fixed columns again");
	});

	QUnit.test("Fixed column count and column spans", async function(assert) {
		oTable.destroyColumns();
		await nextUIUpdate();
		oTable.setFixedColumnCount(1);

		const oCol1 = new Column({
			headerSpan: [3, 1],
			multiLabels: [new Label({text: "A"}), new Label({text: "AA"})],
			template: new Label()
		});
		oTable.addColumn(oCol1);
		assert.equal(oTable.getComputedFixedColumnCount(), 1, "The computed fixedColumCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 0, "The lastFixedColumIndex is correct");

		const oCol2 = new Column({
			headerSpan: [2, 1],
			multiLabels: [new Label({text: "A"}), new Label({text: "AB"})],
			template: new Label()
		});
		oTable.addColumn(oCol2);
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "The computed fixedColumnCount is correct");
		assert.equal(oTable.getRenderer().getLastFixedColumnIndex(oTable), 1, "The lastFixedColumIndex is correct");

		const oCol3 = new Column({
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

	QUnit.test("Content is wider than column", async function(assert) {
		oTable.getColumns()[0].setWidth("60px");
		await nextUIUpdate();
		assert.strictEqual(oTable.getDomRef("table-fixed").getBoundingClientRect().width, 160, "Fixed column table has the correct width");
	});

	QUnit.test("Hide one column in fixed area", async function(assert) {
		const iVisibleRowCount = oTable._getRowCounts().count;
		function checkCellsFixedBorder(oTable, iCol, sMsg) {
			const oColHeader = getColumnHeader(iCol, null, null, oTable)[0];
			assert.ok(oColHeader.classList.contains("sapUiTableCellLastFixed"), sMsg);
			for (let i = 0; i < iVisibleRowCount; i++) {
				const oCell = getCell(i, iCol, null, null, oTable)[0];
				assert.ok(oCell.classList.contains("sapUiTableCellLastFixed"), sMsg);
			}
		}

		checkCellsFixedBorder(oTable, 1, "The fixed border is displayed on the last fixed column");

		oTable.getColumns()[1].setVisible(false);
		await nextUIUpdate();

		const $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 1, "Fixed table has 2 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 6, "Scroll table has 7 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(2),
			"Horizontal scrollbar has correct left margin");

		checkCellsFixedBorder(oTable, 0,
			"When the last fixed column is not visible, the fixed border is displayed on the last visible column in fixed area");

		oTable.getColumns()[0].setVisible(false);
		oTable.getColumns()[1].setVisible(true);
		await nextUIUpdate();

		checkCellsFixedBorder(oTable, 0,
			"When one of the fixed columns is not visible, the fixed border is displayed on the last visible column in fixed area");
	});

	QUnit.test("Hide one column in scroll area", async function(assert) {
		oTable.getColumns()[5].setVisible(false);
		await nextUIUpdate();
		const $table = oTable.$();
		assert.equal(oTable.getFixedColumnCount(), 2, "Fixed column count correct");
		assert.equal(oTable.getComputedFixedColumnCount(), 2, "Computed Fixed column count correct");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlFixed .sapUiTableCtrlCol th").length, 2, "Fixed table has 6 Columns");
		assert.equal($table.find(".sapUiTableCCnt .sapUiTableCtrlScroll .sapUiTableCtrlCol th").length, 5, "Scroll table has 3 Columns");
		assert.equal(jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).css("margin-left"), getExpectedHScrollLeftMargin(3),
			"Horizontal scrollbar has correct left margin");
	});

	QUnit.test("No fixed column used, when table is too small.", async function(assert) {
		oTable.setFixedColumnCount(3);
		oTable.setWidth("400px");

		await nextUIUpdate();

		assert.equal(oTable.getComputedFixedColumnCount(), 0, "Computed Fixed column count correct - No Fixed Columns used");
		assert.equal(oTable.getFixedColumnCount(), 3, "Orignal fixed column count is 3");

		oTable.setWidth("500px");

		await nextUIUpdate();

		assert.equal(oTable.getFixedColumnCount(), 3, "Fixed Column Count is 3 again");
		assert.equal(oTable.getComputedFixedColumnCount(), 3, "Computed Fixed column count correct");
	});

	QUnit.module("API", {
		beforeEach: async function() {
			await createTable({
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
		const sScrollBarSuffix = "ScrollBar";
		const oHSb = oTable.getDomRef(SharedDomRef["Horizontal" + sScrollBarSuffix]);
		const oVSb = oTable.getDomRef(SharedDomRef["Vertical" + sScrollBarSuffix]);
		const done = assert.async();

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

	QUnit.test("#focus", async function(assert) {
		const fnFocusSpy = sinon.spy(oTable, "focus");
		const oFocusInfo = {
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
		await nextUIUpdate();
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
		oTable.destroyColumns();
		await nextUIUpdate();
		oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		checkFocus(oTable.getDomRef("noDataCnt"), assert);
	});

	QUnit.test("#getFocusDomRef", async function(assert) {
		assert.strictEqual(oTable.getFocusDomRef(), getColumnHeader(0, null, null, oTable)[0], "Column header visible");

		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();
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
		const oRowsBinding = oTable.getBinding("rows");
		const oColumnsBinding = oTable.bindColumns({path: "/", template: new Column()}).getBinding("columns");
		const oGetBinding = sinon.spy(Control.prototype, "getBinding");

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
		const oFakeBinding = {
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

	QUnit.module("Fixed rows and columns", {
		beforeEach: async function() {
			await createTable({
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
		const $table = oTable.$();
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
		beforeEach: async function() {
			const TestControl = TableQUnitUtils.TestControl;

			await createTable({
				rowMode: new FixedRowMode({
					rowCount: 8,
					fixedTopRowCount: 2,
					fixedBottomRowCount: 2
				}),
				fixedColumnCount: 2
			}, function(oTable) {
				for (let i = 0; i < 8; i++) {
					oTable.addColumn(new Column({label: new TestControl(), template: new TestControl()}));
				}
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		const $table = oTable.$();
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

	QUnit.module("Column header", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: [
					new Column({
						multiLabels: [
							new Label({text: "Last Name"}),
							new Label({text: "Second level header"})
						],
						template: new Text({text: "lastName"})
					}),
					new Column({
						multiLabels: [
							new Label({text: "First Name", textAlign: "Right"}),
							new Label({text: "Name of the person"})
						],
						template: new Input({value: "name"})
					}),
					new Column({
						label: new Label({text: "Checked (very long label text to show wrapping behavior)"}),
						template: new CheckBox({selected: true}),
						hAlign: "Center"
					})
				]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Row and cell count", function(assert) {
		assert.equal(this.oTable.$().find(".sapUiTableColHdrTr").length, 2, "Header row count");
		assert.equal(this.oTable.$().find(".sapUiTableColHdrTr .sapUiTableHeaderCell").length, 6, "Cell count");
	});

	QUnit.test("Height", async function(assert) {
		const aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		let pSequence = Promise.resolve();
		const iPadding = 14;
		let iFixedPartHeight;
		let iScrollablePartHeight;

		const test = (mTestSettings) => {
			pSequence = pSequence.then(async () => {
				this.oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				this.oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				await this.oTable.qunit.setDensity(mTestSettings.density);
				TableQUnitUtils.assertColumnHeaderHeights(assert, this.oTable, mTestSettings);
			});
		};

		this.oTable.destroyColumns();
		this.oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		this.oTable.addColumn(new Column({label: new HeightTestControl(), template: new HeightTestControl()}));
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowActionCount(1);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));

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

		await pSequence;

		this.oTable.insertColumn(new Column({
			label: new Text({text: "a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a"}),
			template: new HeightTestControl(),
			width: "100px"
		}), 1);
		await this.oTable.qunit.whenRenderingFinished();

		const aRowDomRefs = this.oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
		const iHeightWithoutIcons = aRowDomRefs[0].getBoundingClientRect().height;

		this.oTable.getColumns()[1].setSortOrder(SortOrder.Ascending);
		this.oTable.getColumns()[1].setFiltered(true);
		await this.oTable.qunit.whenRenderingFinished();

		iFixedPartHeight = aRowDomRefs[0].getBoundingClientRect().height;
		iScrollablePartHeight = aRowDomRefs[1].getBoundingClientRect().height;
		assert.ok(iFixedPartHeight > iHeightWithoutIcons, "Height increased after adding icons");
		assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after adding icons");

		this.oTable.getColumns()[1].setSortOrder(SortOrder.None);
		this.oTable.getColumns()[1].setFiltered(false);
		await this.oTable.qunit.whenRenderingFinished();

		iFixedPartHeight = aRowDomRefs[0].getBoundingClientRect().height;
		iScrollablePartHeight = aRowDomRefs[1].getBoundingClientRect().height;
		assert.strictEqual(iFixedPartHeight, iHeightWithoutIcons, "After removing the icons, the height is the same as before");
		assert.strictEqual(iFixedPartHeight, iScrollablePartHeight, "Fixed and scrollable part have the same height after removing icons");

		this.oTable.qunit.resetDensity();
	});

	QUnit.test("Equal widths", function(assert) {
		const $Table = this.oTable.$();
		const $Head1 = $Table.find(".sapUiTableColHdrTr:eq(0)");
		const $Head2 = $Table.find(".sapUiTableColHdrTr:eq(1)");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(0)").width(), $Head2.find(".sapUiTableHeaderCell:eq(0)").width(),
			"First column headers have equal width");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(1)").width(), $Head2.find(".sapUiTableHeaderCell:eq(1)").width(),
			"Second column headers have equal width");
		assert.equal($Head1.find(".sapUiTableHeaderCell:eq(2)").width(), $Head2.find(".sapUiTableHeaderCell:eq(2)").width(),
			"Third column headers have equal width");
	});

	QUnit.test("Equal heights", function(assert) {
		assert.expect(6);
		const $Table = this.oTable.$();

		$Table.find(".sapUiTableColHdrTr").each(function(index, row) {
			const rowIndex = index;
			const $row = jQuery(row);
			const rowHeight = $row.height();
			$row.children(".sapUiTableHeaderCell").each(function(index, cell) {
				assert.equal(cell.offsetHeight, rowHeight, "Cell [" + index + "," + rowIndex + "] has correct height");
			});
		});
	});

	QUnit.module("Table with extension", {
		beforeEach: async function() {
			await createTable({
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
		const $table = oTable.$();
		const $button = $table.find(".sapUiTableExt").find("#extensionButton");
		assert.equal(oTable.getExtension().length, 1, "Table has 1 extension");
		assert.equal($button.length, 1, "Button in extension is rendered");
		assert.equal(Element.getElementById($button.attr("id")).getText(), "Click me!", "The correct button is rendered");
	});

	QUnit.module("Invisible table", {
		beforeEach: async function() {
			await createTable({
				visible: false
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("After initialization", function(assert) {
		const $table = oTable.$();
		assert.equal($table.children().length, 0, "No table content is rendered");
	});

	QUnit.module("Sorting", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				columns: [
					TableQUnitUtils.createTextColumn({text: "LastName", bind: true}).setSortProperty("LastName"),
					TableQUnitUtils.createTextColumn({text: "FirstName", bind: true}).setSortProperty("FirstName"),
					TableQUnitUtils.createTextColumn({text: "City", bind: true})
				],
				models: TableQUnitUtils.createJSONModel(20)
			});
			this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Ascending);
			this.oTable.sort(this.oTable.getColumns()[1], SortOrder.Descending, true);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#sort, #getSortedColumns, and 'sort' event", function(assert) {
		const aColumns = this.oTable.getColumns();
		let aSortEventParameters = [];

		this.oTable.attachSort((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aSortEventParameters.push(mParameters);
		});

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0], aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("LastName", false),
			new Sorter("FirstName", true)
		], "Binding sorters");

		this.oTable.sort(aColumns[0], SortOrder.Descending, true);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0], aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Descending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("LastName", true),
			new Sorter("FirstName", true)
		], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.Descending,
			columnAdded: true
		}], "Sort events");

		aSortEventParameters = [];
		this.oTable.sort(aColumns[0], SortOrder.None);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [new Sorter("FirstName", true)], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.None,
			columnAdded: false
		}], "Sort events");

		aSortEventParameters = [];
		this.oTable.sort(aColumns[0]);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [new Sorter("LastName", false)], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.Ascending,
			columnAdded: false
		}], "Sort events");

		aSortEventParameters = [];
		this.oTable.sort(aColumns[1], SortOrder.Ascending);
		this.oTable.sort(aColumns[0], SortOrder.None, true); // The second parameter should have no effect if sortOrder=None.

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Ascending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [new Sorter("FirstName", false)], "Binding sorters");
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
		this.oTable.sort(aColumns[0], SortOrder.Descending, true);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[1], aColumns[0]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Descending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Ascending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("FirstName", false),
			new Sorter("LastName", true)
		], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.Descending,
			columnAdded: true
		}], "Sort events");

		aSortEventParameters = [];
		this.oTable.sort();

		assert.deepEqual(this.oTable.getSortedColumns(), [], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
		assert.equal(this.oTable.getBinding().aSorters, null, "Binding sorters");
		assert.deepEqual(aSortEventParameters, [], "Sort events"); // Calling Table#sort without arguments does not fire the sort event.

		aSortEventParameters = [];
		this.oTable.sort(aColumns[0], SortOrder.Ascending);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [new Sorter("LastName", false)], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.Ascending,
			columnAdded: false
		}], "Sort events");
	});

	QUnit.test("Sort column without 'sortProperty'", function(assert) {
		const aColumns = this.oTable.getColumns();
		const aSortEventParameters = [];

		this.oTable.attachSort((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aSortEventParameters.push(mParameters);
		});
		this.oTable.sort(aColumns[2]);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0], aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.strictEqual(aColumns[2].getSortOrder(), SortOrder.None, "Sort order of third column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("LastName", false),
			new Sorter("FirstName", true)
		], "Binding sorters");
		assert.deepEqual(aSortEventParameters, [], "Sort events");
	});

	QUnit.test("Rebind", function(assert) {
		const aColumns = this.oTable.getColumns();

		this.oTable.bindRows({path: "/"}); // Unbind/Rebind neither removes nor reapplies the sorting.
		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0], aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Ascending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [], "Binding sorters");
	});

	QUnit.test("Sort without binding", function(assert) {
		const aColumns = this.oTable.getColumns();
		const aSortEventParameters = [];

		this.oTable.attachSort((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aSortEventParameters.push(mParameters);
		});
		this.oTable.unbindRows();

		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Descending);
		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[0]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.Descending, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
		assert.deepEqual(aSortEventParameters, [{
			column: aColumns[0],
			sortOrder: SortOrder.Descending,
			columnAdded: false
		}], "Sort events");

		this.oTable.sort();
		assert.deepEqual(this.oTable.getSortedColumns(), [], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
	});

	QUnit.test("Custom sort handling", function(assert) {
		const aColumns = this.oTable.getColumns();
		let bAlwaysPreventDefault = false;

		this.oTable.sort();
		this.oTable.attachSort((oEvent) => {
			if (oEvent.getParameter("column").getSortProperty() === "LastName" || bAlwaysPreventDefault) {
				oEvent.preventDefault();
			}
		});
		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Ascending);
		this.oTable.sort(this.oTable.getColumns()[1], SortOrder.Descending, true);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("FirstName", true)
		], "Binding sorters");

		bAlwaysPreventDefault = true;
		this.oTable.sort(this.oTable.getColumns()[1], SortOrder.Ascending);
		this.oTable.sort(this.oTable.getColumns()[1], SortOrder.None);

		assert.deepEqual(this.oTable.getSortedColumns(), [aColumns[1]], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.Descending, "Sort order of second column");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("FirstName", true)
		], "Binding sorters");

		this.oTable.sort();
		assert.deepEqual(this.oTable.getSortedColumns(), [], "Sorted columns");
		assert.strictEqual(aColumns[0].getSortOrder(), SortOrder.None, "Sort order of first column");
		assert.strictEqual(aColumns[1].getSortOrder(), SortOrder.None, "Sort order of second column");
		assert.equal(this.oTable.getBinding().aSorters, null, "Binding sorters");
	});

	QUnit.test("Sort icon", async function(assert) {
		const aSortedColumns = this.oTable.getSortedColumns();
		const oFirstColumnClassList = aSortedColumns[0].getDomRef().classList;
		const oSecondColumnClassList = aSortedColumns[1].getDomRef().classList;

		assert.ok(oFirstColumnClassList.contains("sapUiTableColSorted"), "First column: Sort icon visibility");
		assert.ok(!oFirstColumnClassList.contains("sapUiTableColSortedD"), "First column: Sort icon is ascending");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColSorted"), "Second column: Sort icon visibility");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColSortedD"), "Second column: Sort icon is descending");

		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oFirstColumnClassList.contains("sapUiTableColSorted"), "First column: Sort icon visibility after rendering");
		assert.ok(!oFirstColumnClassList.contains("sapUiTableColSortedD"), "First column: Sort icon is ascending");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColSorted"), "Second column: Sort icon visibility after rendering");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColSortedD"), "Second column: Sort icon is descending");

		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Descending);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oFirstColumnClassList.contains("sapUiTableColSorted"), "First column: Sort icon visibility after sort change");
		assert.ok(oFirstColumnClassList.contains("sapUiTableColSortedD"), "First column: Sort icon is descending");
		assert.notOk(oSecondColumnClassList.contains("sapUiTableColSorted"), "Second column: Sort icon visibility after sort change");

		this.oTable.sort();
		await this.oTable.qunit.whenRenderingFinished();
		assert.notOk(oFirstColumnClassList.contains("sapUiTableColSorted"), "First column: Sort icon visibility after removing sorting");

		this.oTable.attachSort((oEvent) => { oEvent.preventDefault(); });
		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Descending);
		await this.oTable.qunit.whenRenderingFinished();
		assert.notOk(oFirstColumnClassList.contains("sapUiTableColSorted"), "First column: Sort icon visibility when default was prevented");
	});

	QUnit.test("Sort icon changed with Column#setSortOrder", async function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		const oClassList = oColumn.getDomRef().classList;

		oColumn.setSortOrder(SortOrder.Ascending);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oClassList.contains("sapUiTableColSorted"), "Icon visibility");
		assert.ok(!oClassList.contains("sapUiTableColSortedD"), "Ascending");

		oColumn.setSortOrder(SortOrder.None);
		await this.oTable.qunit.whenRenderingFinished();
		assert.notOk(oClassList.contains("sapUiTableColSorted"), "Icon visibility");
	});

	QUnit.test("Sort icon with multi column header", async function(assert) {
		const oColumn1 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl({text: "Person"}),
				new TableQUnitUtils.TestControl({text: "Name"}),
				new TableQUnitUtils.TestControl({text: "First Name"})
			],
			headerSpan: [3, 2],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			sortProperty: "sortProperty",
			sortOrder: SortOrder.Ascending
		});
		const oColumn2 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl({text: "Last Name"})
			],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			sortProperty: "sortProperty"
		});
		const oColumn3 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl({text: "Age"})
			],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			sortProperty: "sortProperty",
			sortOrder: SortOrder.Descending
		});

		this.oTable.destroyColumns();
		this.oTable.addColumn(oColumn1);
		this.oTable.addColumn(oColumn2);
		this.oTable.addColumn(oColumn3);

		await this.oTable.qunit.whenRenderingFinished();

		function assertCSSClasses(sElementId, sExpectedSortIcon, sTitle) {
			const oElement = document.getElementById(sElementId);

			switch (sExpectedSortIcon) {
				case SortOrder.Ascending:
					assert.ok(oElement.classList.contains("sapUiTableColSorted"), sTitle + "; Sort icon visibility");
					assert.ok(!oElement.classList.contains("sapUiTableColSortedD"), sTitle + "; Sort icon is ascending");
					break;
				case SortOrder.Descending:
					assert.ok(oElement.classList.contains("sapUiTableColSorted"), sTitle + "; Sort icon visibility");
					assert.ok(oElement.classList.contains("sapUiTableColSortedD"), sTitle + "; Sort icon is ascending");
					break;
				default:
					assert.notOk(oElement.classList.contains("sapUiTableColSorted"), sTitle + "; Sort icon visibility");
					break;
			}
		}

		// Check only visible cells.
		assertCSSClasses(oColumn1.getId(), SortOrder.None, "1st row, 1st cell (span 3)");
		assertCSSClasses(oColumn1.getId() + "_1", SortOrder.None, "2nd row, 1st cell (span 2)");
		assertCSSClasses(oColumn3.getId() + "_1", SortOrder.Descending, "2nd row, 2nd cell");
		assertCSSClasses(oColumn1.getId() + "_2", SortOrder.Ascending, "3rd row, 1st cell");
		assertCSSClasses(oColumn2.getId() + "_2", SortOrder.None, "3rd row, 2nd cell");
		assertCSSClasses(oColumn3.getId() + "_2", SortOrder.None, "3rd row, 3rd cell");
	});

	QUnit.test("Remove a sorted column", function(assert) {
		const oSortSpy = sinon.spy(this.oTable.getBinding(), "sort");
		const oRemovedColumn = this.oTable.removeColumn(this.oTable.getSortedColumns()[0]);
		const aSortedColumns = this.oTable.getSortedColumns();

		assert.ok(!aSortedColumns.includes(oRemovedColumn), "#getSortedColumns does not return the removed column");
		assert.deepEqual(aSortedColumns, [this.oTable.getColumns()[0]], "Sorted columns");
		assert.ok(oSortSpy.notCalled, "Binding#sort not called");

		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Ascending, true);
		assert.deepEqual(aSortedColumns, [this.oTable.getColumns()[0]], "Sorted columns");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("FirstName", false)
		], "Binding sorters");
	});

	QUnit.test("Remove all columns", function(assert) {
		const oSortSpy = sinon.spy(this.oTable.getBinding(), "sort");

		this.oTable.removeAllColumns();
		assert.deepEqual(this.oTable.getSortedColumns(), [], "#getSortedColumns");
		assert.ok(oSortSpy.notCalled, "Binding#sort not called");
	});

	QUnit.test("Destroy columns", function(assert) {
		const oSortSpy = sinon.spy(this.oTable.getBinding(), "sort");

		this.oTable.destroyColumns();
		assert.deepEqual(this.oTable.getSortedColumns(), [], "#getSortedColumns");
		assert.ok(oSortSpy.notCalled, "Binding#sort not called");
	});

	QUnit.test("Reorder a column", function(assert) {
		const oSortSpy = sinon.spy(this.oTable.getBinding(), "sort");

		TableUtils.Column.moveColumnTo(this.oTable.getSortedColumns()[1], 0);
		assert.deepEqual(this.oTable.getSortedColumns(), [this.oTable.getColumns()[1], this.oTable.getColumns()[0]], "#getSortedColumns");
		assert.ok(oSortSpy.notCalled, "Binding#sort not called");

		// Reordering columns should not change the order in which sorters are applied.
		this.oTable.sort(this.oTable.getColumns()[0], SortOrder.Ascending, true);
		assert.deepEqual(this.oTable.getSortedColumns(), [this.oTable.getColumns()[1], this.oTable.getColumns()[0]], "#getSortedColumns");
		assert.deepEqual(this.oTable.getBinding().aSorters, [
			new Sorter("LastName", false),
			new Sorter("FirstName", false)
		], "Binding sorters");
	});

	QUnit.module("Filtering", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				columns: [
					TableQUnitUtils.createTextColumn({text: "LastName", bind: true}).setFilterProperty("LastName"),
					TableQUnitUtils.createTextColumn({text: "FirstName", bind: true}).setFilterProperty("FirstName"),
					TableQUnitUtils.createTextColumn({text: "City", bind: true})
				],
				models: TableQUnitUtils.createJSONModel(20)
			});
			this.oTable.filter(this.oTable.getColumns()[0], "Bob");

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertFilters: function(assert, aExpectations) {
			assert.deepEqual(this.oTable.getBinding().getFilters(FilterType.Control).map((oFilter) => {
				return {
					path: oFilter.getPath(),
					operator: oFilter.getOperator(),
					value1: oFilter.getValue1(),
					value2: oFilter.getValue2()
				};
			}), aExpectations, "Binding filters");
		}
	});

	QUnit.test("#filter, and 'filter' event", function(assert) {
		const aColumns = this.oTable.getColumns();
		let aFilterEventParameters = [];

		this.oTable.attachFilter((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aFilterEventParameters.push(mParameters);
		});

		assert.ok(aColumns[0].getFiltered(), "First column filtered");
		assert.notOk(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "Bob", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "", "Filer value of second column");
		this.assertFilters(assert, [
			{path: "LastName", operator: "Contains", value1: "Bob", value2: undefined}
		], "Binding filters");

		this.oTable.filter(aColumns[1], "Jane");

		assert.ok(aColumns[0].getFiltered(), "First column filtered");
		assert.ok(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "Bob", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "Jane", "Filer value of second column");
		this.assertFilters(assert, [
			{path: "LastName", operator: "Contains", value1: "Bob", value2: undefined},
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined}
		], "Binding filters");
		assert.deepEqual(aFilterEventParameters, [{
			column: aColumns[1],
			value: "Jane"
		}], "Filter events");

		aFilterEventParameters = [];
		this.oTable.filter(aColumns[0]);

		assert.notOk(aColumns[0].getFiltered(), "First column filtered");
		assert.ok(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "Jane", "Filer value of second column");
		this.assertFilters(assert, [
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined}
		], "Binding filters");
		assert.deepEqual(aFilterEventParameters, [{
			column: aColumns[0],
			value: ""
		}], "Filter events");
	});

	QUnit.test("Filter column without 'filterProperty'", function(assert) {
		const aColumns = this.oTable.getColumns();
		const aFilterEventParameters = [];

		this.oTable.attachFilter((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aFilterEventParameters.push(mParameters);
		});
		this.oTable.filter(aColumns[2], "Munich");

		assert.ok(aColumns[0].getFiltered(), "First column filtered");
		assert.notOk(aColumns[1].getFiltered(), "Second column filtered");
		assert.notOk(aColumns[2].getFiltered(), "Third column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "Bob", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "", "Filer value of second column");
		assert.strictEqual(aColumns[2].getFilterValue(), "", "Filer value of third column");
		this.assertFilters(assert, [
			{path: "LastName", operator: "Contains", value1: "Bob", value2: undefined}
		], "Binding filters");
		assert.deepEqual(aFilterEventParameters, [], "Filter events");
	});

	QUnit.test("Rebind", function(assert) {
		const aColumns = this.oTable.getColumns();

		this.oTable.bindRows({path: "/"}); // Unbind/Rebind neither removes nor reapplies the filtering.
		assert.ok(aColumns[0].getFiltered(), "First column filtered");
		assert.notOk(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "Bob", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "", "Filer value of second column");
		this.assertFilters(assert, [], "Binding filters");
	});

	QUnit.test("Filter without binding", function(assert) {
		const aColumns = this.oTable.getColumns();
		const aFilterEventParameters = [];

		this.oTable.attachFilter((oEvent) => {
			const mParameters = oEvent.getParameters();
			delete mParameters.id;
			aFilterEventParameters.push(mParameters);
		});
		this.oTable.unbindRows();

		this.oTable.filter(this.oTable.getColumns()[1], "Jane");
		assert.ok(aColumns[0].getFiltered(), "First column filtered");
		assert.notOk(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "Bob", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "", "Filer value of second column");
		assert.deepEqual(aFilterEventParameters, [], "Filter events");
	});

	QUnit.test("Custom filter handling", function(assert) {
		const aColumns = this.oTable.getColumns();
		let bAlwaysPreventDefault = false;

		this.oTable.filter(aColumns[0]);
		this.oTable.attachFilter((oEvent) => {
			if (oEvent.getParameter("column").getFilterProperty() === "LastName" || bAlwaysPreventDefault) {
				oEvent.preventDefault();
			}
		});
		this.oTable.filter(this.oTable.getColumns()[0], "Bob");
		this.oTable.filter(this.oTable.getColumns()[1], "Jane");

		assert.notOk(aColumns[0].getFiltered(), "First column filtered");
		assert.ok(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "Jane", "Filer value of second column");
		this.assertFilters(assert, [
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined}
		], "Binding filters");

		bAlwaysPreventDefault = true;
		this.oTable.filter(this.oTable.getColumns()[1]);

		assert.notOk(aColumns[0].getFiltered(), "First column filtered");
		assert.ok(aColumns[1].getFiltered(), "Second column filtered");
		assert.strictEqual(aColumns[0].getFilterValue(), "", "Filter value of first column");
		assert.strictEqual(aColumns[1].getFilterValue(), "Jane", "Filer value of second column");
		this.assertFilters(assert, [
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined}
		], "Binding filters");
	});

	QUnit.test("Filter icon", async function(assert) {
		const aColumns = this.oTable.getColumns();
		const oFirstColumnClassList = aColumns[0].getDomRef().classList;
		const oSecondColumnClassList = aColumns[1].getDomRef().classList;

		assert.ok(oFirstColumnClassList.contains("sapUiTableColFiltered"), "First column: Filter icon visibility");
		assert.notOk(oSecondColumnClassList.contains("sapUiTableColFiltered"), "Second column: Filter icon visibility");

		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oFirstColumnClassList.contains("sapUiTableColFiltered"), "First column: Filter icon visibility after rendering");
		assert.notOk(oSecondColumnClassList.contains("sapUiTableColFiltered"), "Second column: Filter icon visibility after rendering");

		this.oTable.filter(aColumns[1], "Jane");
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oFirstColumnClassList.contains("sapUiTableColFiltered"), "First column: Filter icon visibility after filter change");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColFiltered"), "Second column: Filter icon visibility after filter change");

		this.oTable.filter(aColumns[0]);
		await this.oTable.qunit.whenRenderingFinished();

		assert.notOk(oFirstColumnClassList.contains("sapUiTableColFiltered"), "First column: Filter icon visibility after filter change");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColFiltered"), "Second column: Filter icon visibility after filter change");

		this.oTable.attachFilter((oEvent) => { oEvent.preventDefault(); });
		this.oTable.filter(aColumns[0], "Bob");
		await this.oTable.qunit.whenRenderingFinished();

		assert.notOk(oFirstColumnClassList.contains("sapUiTableColFiltered"), "First column: Filter icon visibility when default was prevented");
		assert.ok(oSecondColumnClassList.contains("sapUiTableColFiltered"), "Second column: Filter icon visibility when default was prevented");
	});

	QUnit.test("Filter icon changed with Column#setFiltered", async function(assert) {
		const oColumn = this.oTable.getColumns()[1];
		const oClassList = oColumn.getDomRef().classList;

		this.oTable.getColumns()[1].setFiltered(true);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oClassList.contains("sapUiTableColFiltered"), "Icon visibility");

		this.oTable.getColumns()[1].setFiltered(false);
		await this.oTable.qunit.whenRenderingFinished();
		assert.notOk(oClassList.contains("sapUiTableColFiltered"), "Icon visibility");
	});

	QUnit.test("Filter icon with multi column header", async function(assert) {
		const oColumn1 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl({text: "Person"}),
				new TableQUnitUtils.TestControl({text: "Name"}),
				new TableQUnitUtils.TestControl({text: "First Name"})
			],
			headerSpan: [3, 2],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			filterProperty: "filterProperty",
			filtered: true
		});
		const oColumn2 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl({text: "Last Name"})
			],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			filterProperty: "filterProperty"
		});
		const oColumn3 = new Column({
			multiLabels: [
				new TableQUnitUtils.TestControl(),
				new TableQUnitUtils.TestControl({text: "Age"})
			],
			hAlign: "Center",
			template: new TableQUnitUtils.TestControl(),
			filterProperty: "filterProperty",
			filtered: true
		});

		this.oTable.destroyColumns();
		this.oTable.addColumn(oColumn1);
		this.oTable.addColumn(oColumn2);
		this.oTable.addColumn(oColumn3);

		await this.oTable.qunit.whenRenderingFinished();

		function assertCSSClasses(sElementId, bExpectFilterIcon, sTitle) {
			const oElement = document.getElementById(sElementId);
			assert.equal(oElement.classList.contains("sapUiTableColFiltered"), bExpectFilterIcon, "Filter icon visibility");
		}

		// Check only visible cells.
		assertCSSClasses(oColumn1.getId(), false, "1st row, 1st cell (span 3)");
		assertCSSClasses(oColumn1.getId() + "_1", false, "2nd row, 1st cell (span 2)");
		assertCSSClasses(oColumn3.getId() + "_1", true, "2nd row, 2nd cell");
		assertCSSClasses(oColumn1.getId() + "_2", true, "3rd row, 1st cell");
		assertCSSClasses(oColumn2.getId() + "_2", false, "3rd row, 2nd cell");
		assertCSSClasses(oColumn3.getId() + "_2", false, "3rd row, 3rd cell");
	});

	QUnit.test("Remove a filtered column", function(assert) {
		const oFilterSpy = sinon.spy(this.oTable.getBinding(), "filter");

		this.oTable.removeColumn(this.oTable.getColumns()[0]);
		assert.ok(oFilterSpy.notCalled, "Binding#filter not called");

		this.oTable.filter(this.oTable.getColumns()[0], "Jane");
		assert.ok(this.oTable.getColumns()[0].getFiltered(), "First column filtered");
		assert.strictEqual(this.oTable.getColumns()[0].getFilterValue(), "Jane", "Filter value of first column");
		this.assertFilters(assert, [
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined}
		], "Binding filters");
	});

	QUnit.test("Remove all columns", function(assert) {
		const oFilterSpy = sinon.spy(this.oTable.getBinding(), "filter");

		this.oTable.removeAllColumns();
		assert.ok(oFilterSpy.notCalled, "Binding#filter not called");
	});

	QUnit.test("Destroy columns", function(assert) {
		const oFilterSpy = sinon.spy(this.oTable.getBinding(), "filter");

		this.oTable.destroyColumns();
		assert.ok(oFilterSpy.notCalled, "Binding#filter not called");
	});

	QUnit.test("Reorder a column", function(assert) {
		const oFilterSpy = sinon.spy(this.oTable.getBinding(), "filter");

		TableUtils.Column.moveColumnTo(this.oTable.getColumns()[1], 0);
		assert.ok(oFilterSpy.notCalled, "Binding#filter not called");

		this.oTable.filter(this.oTable.getColumns()[0], "Jane");
		this.assertFilters(assert, [
			{path: "FirstName", operator: "Contains", value1: "Jane", value2: undefined},
			{path: "LastName", operator: "Contains", value1: "Bob", value2: undefined}
		], "Binding filters");
	});

	QUnit.module("Performance improvements", {
		beforeEach: async function() {
			await createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Prevent re-rendering on setEnableBusyIndicator", async function(assert) {
		const spy = sinon.spy();
		oTable.addEventDelegate({onAfterRendering: spy});

		// act
		oTable.setEnableBusyIndicator(true);
		await nextUIUpdate();

		// assertions
		assert.ok(spy.notCalled, "onAfterRendering was not called");
		assert.ok(oTable.getEnableBusyIndicator(), "The overwritten function still works");
	});

	QUnit.module("Binding", {
		beforeEach: async function() {
			await createTable();
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
			const oDestroyRows = sinon.spy(oTable, "destroyRows");
			const oInnerBindRows = sinon.spy(oTable, "_bindRows");
			const oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
			const oOnBindingChange = sinon.spy(oTable, "_onBindingChange");
			const oOnBindingDataRequested = sinon.spy(oTable, "_onBindingDataRequested");
			const oOnBindingDataReceived = sinon.spy(oTable, "_onBindingDataReceived");
			const oBindAggregationOfControl = sinon.spy(Control.prototype, "bindAggregation");
			let oBindingInfo = oTable.getBindingInfo("rows");

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

			const oExternalChangeSpy = sinon.spy();
			const oExternalDataRequestedSpy = sinon.spy();
			const oExternalDataReceivedSpy = sinon.spy();
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
			const oInnerBindRows = sinon.spy(oTable, "_bindRows");
			const oBindAggregationOfControl = sinon.spy(Control.prototype, "bindAggregation");
			const oSorter = new Sorter({
				path: "money",
				descending: true
			});
			const oFilter = new Filter({
				path: "money",
				operator: "LT",
				value1: 5
			});
			const oTemplate = new Label({
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
		const oInnerBindRows = sinon.spy(Table.prototype, "_bindRows");
		let oTable;

		oTable = new Table({
			rows: {path: "/modelData"},
			columns: [new Column()],
			models: new JSONModel()
		});

		assert.ok(oInnerBindRows.calledOnce, "With model - _bindRows was called");
		assert.ok(oInnerBindRows.calledWithExactly(oTable.getBindingInfo("rows")),
			"With model - _bindRows was called with the correct parameters");
		oInnerBindRows.resetHistory();

		oTable = new Table({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});

		assert.ok(oInnerBindRows.calledOnce, "Without model - _bindRows was called");
		assert.ok(oInnerBindRows.calledWithExactly(oTable.getBindingInfo("rows")),
			"Without model - _bindRows was called with the correct parameters");

		oInnerBindRows.restore();
	});

	QUnit.test("Unbind rows with \"unbindRows\" method", function(assert) {
		const oDestroyRows = sinon.spy(oTable, "destroyRows");
		const oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
		const oUnbindAggregationOfControl = sinon.spy(Control.prototype, "unbindAggregation");

		oTable.unbindRows();
		assert.ok(oInnerUnbindRows.calledOnce, "_unbindRows was called once");
		assert.ok(oDestroyRows.notCalled, "destroyRows was not called");
		assert.ok(oUnbindAggregationOfControl.calledOnce, "unbindAggregation of Control was called once");
		assert.ok(oUnbindAggregationOfControl.calledWithExactly("rows", true), "unbindAggregation of Control was called with the correct parameters");
		assert.ok(oUnbindAggregationOfControl.calledOn(oTable), "unbindAggregation of Control was called with the correct context");

		oUnbindAggregationOfControl.restore();
	});

	QUnit.test("Unbind rows with \"unbindAggregation\" method", function(assert) {
		const oDestroyRows = sinon.spy(oTable, "destroyRows");
		const oInnerUnbindRows = sinon.spy(oTable, "_unbindRows");
		const oUnbindAggregationOfControl = sinon.spy(Control.prototype, "unbindAggregation");

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

		const iInitialRowCount = oTable.getRows().length;
		const oUpdateRowsHookSpy = sinon.spy();
		const oInvalidateSpy = sinon.spy(oTable, "invalidate");
		const oBinding = oTable.getBinding();

		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateRows, oUpdateRowsHookSpy);

		assert.notOk("_oVirtualRow" in oTable, "Virtual row does not exist");

		// Fake the virtual context process.

		oBinding.fireEvent("change", {
			detailedReason: "AddVirtualContext",
			reason: "change"
		});

		let oVirtualRow = oTable._oVirtualRow;

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

	QUnit.module("Events", {
		beforeEach: async function() {
			await createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("RowSelectionChange", function(assert) {
		assert.expect(42);
		let sTestCase = "";
		const fnHandler = function(oEvent) {
			// eslint-disable-next-line default-case
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

	QUnit.test("Select All on Binding Change", async function(assert) {
		const nextRowSelectionChange = TableQUnitUtils.nextEvent("rowSelectionChange", oTable);
		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
		oTable.$("selall").trigger("tap");
		await nextRowSelectionChange;

		assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");

		let nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", oTable);
		const oModel = new JSONModel();
		oModel.setData({modelData: []});
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");
		await nextRowsUpdated;

		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

		nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", oTable);
		oModel.setData({modelData: aData});
		await nextRowsUpdated;

		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
	});

	QUnit.module("Event: _rowsUpdated", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		createTable: async function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = await TableQUnitUtils.createTable(Object.assign({}, {
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
		const done = assert.async();
		const oTable = new Table();
		const rowsUpdatedSpy = sinon.spy(oTable, "fireRowsUpdated");
		const sTestReason = "test_reason";

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

	QUnit.test("Row count does not change when changing row mode", async function(assert) {
		await this.createTable({rowMode: new FixedRowMode({rowCount: 10})});

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

	QUnit.module("Paste", {
		beforeEach: async function() {
			const PasteTestControl = this.PasteTestControl;
			await createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				fixedColumnCount: 1,
				selectionMode: SelectionMode.MultiToggle,
				rowActionCount: 1,
				rowActionTemplate: TableQUnitUtils.createRowAction(),
				extension: [
					new Title({text: "TABLEHEADER"}),
					new Toolbar({active: true, content: [
						new PasteTestControl({tagName: "div", handleOnPaste: false}),
						new PasteTestControl({tagName: "div", handleOnPaste: true}),
						new PasteTestControl({tagName: "input", handleOnPaste: false})
					]}),
					new PasteTestControl({tagName: "div", handleOnPaste: false}),
					new PasteTestControl({tagName: "div", handleOnPaste: true}),
					new PasteTestControl({tagName: "input", handleOnPaste: false})
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
				const oEvent = new Event("paste", {
					bubbles: true,
					cancelable: true
				});
				oEvent.clipboardData = {
					getData: function() { return sData; }
				};
				return oEvent;
			} else {
				const oClipboardData = new DataTransfer();

				oClipboardData.setData("text/plain", sData);

				return new ClipboardEvent("paste", {
					bubbles: true,
					cancelable: true,
					clipboardData: oClipboardData
				});
			}
		},
		test: function(assert, sTestTitle, oHTMLElement, bShouldFireOnce, oEventSource) {
			const sData = "data";
			sTestTitle = sTestTitle == null ? "" : sTestTitle + ": ";
			oEventSource = oEventSource || oHTMLElement;

			oHTMLElement.focus();
			if (oHTMLElement === document.activeElement) {
				oEventSource.dispatchEvent(this.createPasteEvent(sData));
			}

			assert.strictEqual(this.oPasteSpy.callCount, bShouldFireOnce ? 1 : 0,
				sTestTitle + "The paste event was fired the correct number of times");

			if (this.oPasteSpy.callCount === 1 && bShouldFireOnce) {
				assert.deepEqual(this.oPasteSpy._mEventParameters.data, [[sData]], sTestTitle + "The data parameter has the correct value");
			}

			this.oPasteSpy.resetHistory();
		}
	});

	QUnit.test("Paste event should be fired on other table areas - the toolbar, its content, ...", function(assert) {
		this.test(assert, "Title control", oTable.getExtension()[0].getDomRef(), false);
		this.test(assert, "Toolbar control", oTable.getExtension()[1].getFocusDomRef(), true);
		this.test(assert, "Toolbar content control 1", oTable.getExtension()[1].getContent()[0].getDomRef(), true);
		this.test(assert, "Toolbar content control 2", oTable.getExtension()[1].getContent()[1].getDomRef(), false);
		this.test(assert, "Toolbar content control 3", oTable.getExtension()[1].getContent()[2].getDomRef(), false);
		this.test(assert, "Extension control 1", oTable.getExtension()[2].getDomRef(), true);
		this.test(assert, "Extension control 2", oTable.getExtension()[3].getDomRef(), false);
		this.test(assert, "Extension control 3", oTable.getExtension()[4].getDomRef(), false);
		this.test(assert, "Footer control", oTable.getFooter().getDomRef(), true);
	});

	QUnit.test("NoData", async function(assert) {
		oTable.unbindRows();
		await nextUIUpdate();
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
		this.test(assert, "Content cell when paste event target is inner input",
			getCell(0, 2, null, null, oTable)[0], true, oTable.getRows()[0].getCells()[2].getDomRef());
	});

	QUnit.test("Cell content", function(assert) {
		oTable.getColumns().forEach(function(oColumn) {
			const oControl = oColumn.getLabel();
			this.test(assert, "Header - Column " + oColumn.getIndex(), oControl.getDomRef(), oControl.allowsPasteOnTable());
		}.bind(this));
		oTable.getColumns().forEach(function(oColumn) {
			const oControl = oTable.getRows()[0].getCells()[oColumn.getIndex()];
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

	QUnit.module("Functions, properties", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createTextColumn()
				]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#onThemeChanged", function(assert) {
		const fnInvalidate = sinon.spy(this.oTable, "invalidate");
		this.oTable.onThemeChanged();
		assert.ok(fnInvalidate.called, "invalidate() called from onThemeChanged()");
	});

	QUnit.test("#_enableTextSelection", function(assert) {
		this.oTable._enableTextSelection(this.oTable.getDomRef());
		assert.ok(this.oTable.getDomRef().hasAttribute("unselectable", "off"), "_enableTextSelection is on");
	});

	QUnit.test("Mutators of the 'rows' aggregation", function(assert) {
		const fnError = sinon.spy(Log, "error");
		assert.equal(this.oTable.getRows().length, 10, "Row count before row operations is 10");
		assert.equal(fnError.callCount, 0, "Error was not logged so far");
		this.oTable.insertRow();
		assert.equal(this.oTable.getRows().length, 10, "insertRow() called, but it cannot be programmatically be used. No row inserted");
		assert.equal(fnError.args[0][0], "The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!",
			"Error message logged");
		this.oTable.addRow();
		assert.equal(this.oTable.getRows().length, 10, "addRow() called, but it cannot be programmatically be used. No row added");
		assert.equal(fnError.args[1][0], "The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!",
			"Error message logged");
		this.oTable.removeRow();
		assert.equal(this.oTable.getRows().length, 10, "removeRow() called, but it cannot be programmatically be used. No row removed");
		assert.equal(fnError.args[2][0], "The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!",
			"Error message logged");
		this.oTable.removeAllRows();
		assert.equal(this.oTable.getRows().length, 10,
			"removeAllRows() called, but it cannot be programmatically be used. None of the rows are removed");
		assert.equal(fnError.args[3][0], "The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!",
			"Error message logged");
		this.oTable.destroyRows();
		assert.equal(this.oTable.getRows().length, 10,
			"destroyRows() called, but it cannot be programmatically be used. None of the rows are destoryed");
		assert.equal(fnError.args[4][0], "The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!",
			"Error message logged");
		fnError.restore();
	});

	QUnit.test("#autoResizeColumn", function(assert) {
		const oColumn = this.oTable.getColumns()[0];
		const assertAutoResizeCalled = (bCalled) => {
			const sMessage = ` - resizable=${oColumn.getResizable()}, autoResizable=${oColumn.getAutoResizable()}, visible=${oColumn.getVisible()}`;

			if (bCalled) {
				assert.ok(oColumn.autoResize.calledOnceWithExactly(), "Column#autoResize called once with correct parameters" + sMessage);
			} else {
				assert.ok(oColumn.autoResize.notCalled, "Column#autoResize not called" + sMessage);
			}

			oColumn.autoResize.resetHistory();
		};

		sinon.spy(oColumn, "autoResize");

		oColumn.setResizable(false);
		oColumn.setAutoResizable(false);
		this.oTable.autoResizeColumn(0);
		assertAutoResizeCalled(false);

		oColumn.setAutoResizable(true);
		this.oTable.autoResizeColumn(0);
		assertAutoResizeCalled(false);

		oColumn.setResizable(true);
		this.oTable.autoResizeColumn(0);
		assertAutoResizeCalled(true);

		oColumn.setVisible(false);
		this.oTable.autoResizeColumn(0);
		assertAutoResizeCalled(false);
	});

	QUnit.test("#getFocusInfo, #applyFocusInfo", function(assert) {
		assert.strictEqual(this.oTable.getFocusInfo().id, this.oTable.getId(), "Table has focus");
		assert.ok(this.oTable.applyFocusInfo(this.oTable.getFocusInfo()), "Focus is applied on the table");
		//this.oTable.getFocusDomRef();
		assert.equal(this.oTable._getItemNavigation().getFocusedDomRef(), this.oTable.getColumns()[0].getDomRef());
	});

	QUnit.test("#setBusy", function(assert) {
		const oControlSetBusy = sinon.spy(Control.prototype, "setBusy");

		this.oTable.attachEvent("busyStateChanged", function(oEvent) {
			assert.step("busy: " + oEvent.getParameter("busy"));
		});

		this.oTable.setBusy(false);
		this.oTable.setBusy(true, "customBusySection");
		assert.ok(oControlSetBusy.calledWithExactly(true, "sapUiTableGridCnt"), "Control#setBusy");
		this.oTable.setBusy(true);
		this.oTable.setBusy(false);
		this.oTable.setBusy();
		this.oTable.setBusy(true);
		this.oTable.setBusy();

		assert.verifySteps(["busy: true", "busy: false", "busy: true", "busy: false"], "busyStateChanged event");

		oControlSetBusy.restore();
	});

	QUnit.test("Window Resize", function(assert) {
		const done = assert.async();
		const oUpdateTableSizesStub = sinon.spy(this.oTable, "_updateTableSizes");

		function fireResizeEvent() {
			return new Promise(function(resolve) {
				const oEvent = new Event("resize");
				window.dispatchEvent(oEvent);

				setTimeout(function() {
					resolve();
				}, 150);
			});
		}

		fireResizeEvent().then(() => {
			assert.ok(oUpdateTableSizesStub.notCalled, "Zoom factor did not change -> _updateTableSizes was not called");

			this.oTable._nDevicePixelRatio = 1.15; // Default should be 1.
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

	QUnit.test("#_setLargeDataScrolling", function(assert) {
		this.oTable._setLargeDataScrolling(true);
		assert.ok(this.oTable._bLargeDataScrolling, "Large data scrolling enabled");
		this.oTable._setLargeDataScrolling(false);
		assert.ok(!this.oTable._bLargeDataScrolling, "Large data scrolling disabled");
	});

	QUnit.test("#_getContexts", function(assert) {
		const oGetContexts = sinon.stub(this.oTable.getBinding(), "getContexts");
		const sReturnValue = "Binding#getContexts return value";

		oGetContexts.returns(sReturnValue);

		assert.strictEqual(this.oTable._getContexts(), sReturnValue, "Called without arguments: Return value");
		assert.equal(oGetContexts.callCount, 1, "Called without arguments: Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(undefined, undefined, undefined, undefined),
			"Called without arguments: Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1), sReturnValue, "Called with (1): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, undefined, undefined, undefined), "Called with (1): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1, 2), sReturnValue, "Called with (1, 2): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, undefined, undefined), "Called with (1, 2): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1, 2, 3), sReturnValue, "Called with (1, 2, 3): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, undefined), "Called with (1, 2, 3): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1, 2, 3, true), sReturnValue, "Called with (1, 2, 3, true): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3, true): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, true), "Called with (1, 2, 3, true): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1, 2, 3, false), sReturnValue, "Called with (1, 2, 3, false): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, 2, 3, false): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, 2, 3, false), "Called with (1, 2, 3, false): Binding#getContexts call arguments");

		oGetContexts.resetHistory();
		assert.strictEqual(this.oTable._getContexts(1, null, undefined, true), sReturnValue, "Called with (1, null, undefined, true): Return value");
		assert.equal(oGetContexts.callCount, 1, "Called with (1, null, undefined, true): Binding#getContexts called once");
		assert.ok(oGetContexts.calledWithExactly(1, null, undefined, true),
			"Called with (1, null, undefined, true): Binding#getContexts call arguments");

		this.oTable.unbindRows();
		assert.deepEqual(this.oTable._getContexts(1, 2, 3), [], "Called without binding: Return value");
	});

	QUnit.test("#_getBaseRowHeight", function(assert) {
		const oRowMode = new FixedRowMode();

		this.oTable.setRowMode(oRowMode);
		sinon.stub(oRowMode, "getBaseRowContentHeight");

		oRowMode.getBaseRowContentHeight.returns(98);
		assert.strictEqual(this.oTable._getBaseRowHeight(), 99, "The base row height is application defined (99)");

		oRowMode.getBaseRowContentHeight.returns(9);
		assert.strictEqual(this.oTable._getBaseRowHeight(), 10, "The base row height is application defined (10)");

		oRowMode.getBaseRowContentHeight.returns(0);
		assert.strictEqual(this.oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCozy,
			"The base row height is correct in cozy density (49)");

		this.oTable.qunit.setDensity("sapUiSizeCompact");
		assert.strictEqual(this.oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCompact,
			"The base row height is correct in compact density (33)");

		this.oTable.qunit.setDensity("sapUiSizeCondensed");
		assert.strictEqual(this.oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.sapUiSizeCondensed,
			"The base row height is correct in condensed density (25)");

		this.oTable.qunit.setDensity();
		assert.strictEqual(this.oTable._getBaseRowHeight(), TableUtils.DefaultRowHeight.undefined,
			"The base row height is correct in undefined density (33)");

		this.oTable.qunit.resetDensity();
	});

	QUnit.test("#_getTotalRowCount", function(assert) {
		assert.strictEqual(this.oTable._getTotalRowCount(), 10, "Binding#getLength defines the total row count in the table");

		this.oTable.bindRows({path: "/", length: 5});
		assert.strictEqual(this.oTable._getTotalRowCount(), 5, "The \"length\" parameter in the binding info overrides Binding#getLength");

		const oModel = this.oTable.getModel();
		this.oTable.setModel(null);
		assert.strictEqual(this.oTable._getTotalRowCount(), 0, "Without a binding the total row count is 0, regardless of the binding info");
		this.oTable.setModel(oModel);

		this.oTable.unbindRows();
		assert.strictEqual(this.oTable._getTotalRowCount(), 0, "Without a binding or binding info the total row count is 0");
	});

	QUnit.module("Performance", {
		beforeEach: async function() {
			await createTable({
				rowMode: new FixedRowMode()
			});
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("Row And Cell Pools", async function(assert) {
		let aRows = oTable.getRows();
		const oLastRow = aRows[aRows.length - 1];
		const oLastRowFirstCell = oLastRow.getCells()[0];
		const iInitialVisibleRowCount = oTable._getRowCounts().count;

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount - 1);
		await nextUIUpdate();

		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] === undefined, "Row was removed from aggregation");
		assert.ok(!oLastRow.bIsDestroyed, "Removed row was not destroyed");
		assert.ok(!oLastRowFirstCell.bIsDestroyed, "Cells of the removed row were not destroyed");
		assert.ok(oLastRow.getParent() === null, "Removed row has no parent");

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount);
		await nextUIUpdate();

		aRows = oTable.getRows();
		let oLastRowAfterRowsUpdate = aRows[aRows.length - 1];
		let oLastRowFirstCellAfterRowsUpdate = oLastRowAfterRowsUpdate.getCells()[0];
		assert.ok(oTable.getRows()[iInitialVisibleRowCount - 1] !== undefined, "Row was added to the aggregation");
		assert.ok(oLastRow === oLastRowAfterRowsUpdate, "Old row was recycled");
		assert.ok(oLastRowFirstCell === oLastRowFirstCellAfterRowsUpdate, "Old cells recycled");
		assert.ok(oLastRowFirstCell.getParent() === oLastRowAfterRowsUpdate, "Recycled cells have the last row as parent");

		oTable.getRowMode().setRowCount(iInitialVisibleRowCount - 1);
		await nextUIUpdate();
		oTable.invalidateRowsAggregation();
		oTable.getRowMode().setRowCount(iInitialVisibleRowCount);
		await nextUIUpdate();

		aRows = oTable.getRows();
		oLastRowAfterRowsUpdate = aRows[aRows.length - 1];
		oLastRowFirstCellAfterRowsUpdate = oLastRowAfterRowsUpdate.getCells()[0];
		assert.ok(oLastRow !== oLastRowAfterRowsUpdate, "Old row was replaced after row invalidation");
		assert.ok(oLastRowFirstCell === oLastRowFirstCellAfterRowsUpdate, "Old cells recycled");
		assert.ok(oLastRowFirstCell.getParent() === oLastRowAfterRowsUpdate, "Recycled cells have the last row as parent");
	});

	QUnit.test("Destruction of the table if showNoData = true", function(assert) {
		const oFakeRow = {
			destroy: function() {},
			getIndex: function() { return -1; }
		};
		const oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.destroy();
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Destruction of the table if showNoData = false", function(assert) {
		const oFakeRow = {
			destroy: function() {},
			getIndex: function() { return -1; }
		};
		const oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.setShowNoData(false);
		oTable.destroy();
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Destruction of the rows aggregation", function(assert) {
		const oFakeRow = {
			destroy: function() {},
			getIndex: function() { return -1; }
		};
		const oFakeRowDestroySpy = sinon.spy(oFakeRow, "destroy");

		oTable._aRowClones.push(oFakeRow);
		oTable.destroyAggregation("rows");
		assert.ok(oFakeRowDestroySpy.calledOnce, "Rows that are not in the aggregation were destroyed");
		assert.strictEqual(oTable._aRowClones.length, 0, "The row pool has been cleared");
		assert.strictEqual(oTable.getRows().length, 0, "The rows aggregation has been cleared");
	});

	QUnit.test("Lazy row creation; RowMode = Fixed & Interactive", async function(assert) {
		destroyTable();

		function createRowMode(bFixedMode) {
			if (bFixedMode) {
				return new FixedRowMode({rowCount: 5});
			} else {
				return new InteractiveRowMode({rowCount: 5});
			}
		}

		async function test(sRowMode) {
			let oTable = await TableQUnitUtils.createTable({
				rowMode: createRowMode(sRowMode === RowModeType.Fixed)
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
			});

			await oTable.qunit.whenRenderingFinished();
			assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");
			oTable.destroy();

			oTable = await TableQUnitUtils.createTable({
				rowMode: createRowMode(sRowMode === RowModeType.Fixed),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			}, function(oTable) {
				assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
			});
			await oTable.qunit.whenRenderingFinished();

			assert.strictEqual(oTable.getRows().length, 5, "After rendering with binding: The table has the correct number of rows");

			oTable.unbindRows();
			assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

			oTable.bindRows({path: "/"});
			assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
			await oTable.qunit.whenRenderingFinished();

			assert.strictEqual(oTable.getRows().length, 5, "After asynchronous row update: The table has the correct number of rows");

			oTable.destroy();

			oTable = await TableQUnitUtils.createTable({
				rowMode: createRowMode(sRowMode === RowModeType.Fixed),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				placeAt: false
			});

			await TableQUnitUtils.$wait(100);
			assert.strictEqual(oTable.getRows().length, 5,
					"If the table is not rendered but bound, the table has the correct number of rows after an asynchronous row update");
		}

		await test(RowModeType.Fixed);
		await test(RowModeType.Interactive);
	});

	QUnit.test("Lazy row creation; RowMode = Auto", async function(assert) {
		destroyTable();

		let oTable = await TableQUnitUtils.createTable({
			rowMode: RowModeType.Auto
		}, function(oTable) {
			assert.strictEqual(oTable.getRows().length, 0, "Before rendering without binding: The table has no rows");
		});

		await oTable.qunit.whenRenderingFinished();
		assert.strictEqual(oTable.getRows().length, 0, "After rendering without binding: The table has no rows");
		oTable.destroy();

		oTable = await TableQUnitUtils.createTable({
			rowMode: RowModeType.Auto,
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
		}, function(oTable) {
			assert.strictEqual(oTable.getRows().length, 0, "Before rendering with binding: The table has no rows");
		});

		await oTable.qunit.whenRenderingFinished();

		assert.ok(oTable.getRows().length > 0, "After rendering with binding: The table has rows");
		oTable.unbindRows();
		assert.strictEqual(oTable.getRows().length, 0, "After unbind: The table has no rows");

		oTable.bindRows({path: "/"});
		assert.strictEqual(oTable.getRows().length, 0, "After binding: The table has no rows. Rows will be created asynchronously");
		await oTable.qunit.whenRenderingFinished();

		assert.ok(oTable.getRows().length > 0, "After asynchronous row update: The table has rows");
		oTable.destroy();

		oTable = await TableQUnitUtils.createTable({
			rowMode: RowModeType.Auto,
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
			placeAt: false
		});

		await TableQUnitUtils.$wait(100);
		assert.strictEqual(oTable.getRows().length, 0, "If the table is not rendered and only bound, the table has no rows");
	});

	QUnit.module("Avoid DOM modification in onBeforeRendering", {
		beforeEach: async function() {
			await createTable(null, function() {
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

	QUnit.test("Table invalidation", async function(assert) {
		oTable.invalidate();
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Rows invalidation", async function(assert) {
		oTable.invalidateRowsAggregation();
		oTable.invalidate();
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one row", async function(assert) {
		oTable.getRowMode().setRowCount(oTable.getRowMode().getRowCount() - 1);
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one row", async function(assert) {
		oTable.getRowMode().setRowCount(oTable.getRowMode().getRowCount() + 1);
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Removing one column", async function(assert) {
		oTable.removeColumn(oTable.getColumns()[0]);
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.test("Adding one column", async function(assert) {
		oTable.addColumn(new Column({
			label: "Label",
			template: "Template"
		}));
		await nextUIUpdate();
		this.compareDOMStrings(assert);
	});

	QUnit.module("Extensions", {
		beforeEach: async function() {
			await createTable();
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
			const aActualExtensions = oTable._aExtensions.map(function(oExt) {
				return oExt.getMetadata()._sClassName;
			});

			assert.deepEqual(aActualExtensions, aExpectedExtensions || this.aExpectedExtensions, "The table has the expected extensions applied.");
		}
	});

	QUnit.test("Applied extensions", function(assert) {
		this.testAppliedExtensions(assert);
	});

	QUnit.test("Applied extensions (IOS)", async function(assert) {
		const bOriginalDeviceOsIos = Device.os.ios;
		Device.os.ios = true;
		oTable.destroy();
		await createTable();

		return new Promise(function(resolve) {
			sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], function() {
				this.testAppliedExtensions(assert, this.aExpectedExtensions.concat("sap.ui.table.extensions.ScrollingIOS"));
				Device.os.ios = bOriginalDeviceOsIos;
				resolve();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Lifecycle", function(assert) {
		const aExtensions = oTable._aExtensions;

		assert.ok(oTable._bExtensionsInitialized, "The _bExtensionsInitialized flag properly indicates that extensions are initialized");

		oTable.destroy();
		const bAllExtensionsDestroyed = aExtensions.every(function(oExtension) {
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
		const done = assert.async();

		oTable._enableSynchronization().then(function(oSyncInterface) {
			let bSyncExtensionIsAdded = false;
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
		beforeEach: async function() {
			await createTable();
		},
		afterEach: function() {
			destroyTable();
		}
	});

	QUnit.test("renderVSbExternal", function(assert) {
		const Div = document.createElement("div");
		const oRM = new RenderManager().getInterface();

		oTable.getRenderer().renderVSbExternal(oRM, oTable);
		oRM.flush(Div);

		assert.strictEqual(Div.childElementCount, 0, "Nothing should be rendered without synchronization enabled");
	});

	QUnit.test("renderHSbExternal", function(assert) {
		const Div = document.createElement("div");
		const oRM = new RenderManager().getInterface();

		oTable.getRenderer().renderHSbExternal(oRM, oTable, "id", 100);
		oRM.flush(Div);

		assert.strictEqual(Div.childElementCount, 0, "Nothing should be rendered without synchronization enabled");
	});

	QUnit.module("Selection plugin integration", {
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
		const oOtherTestPlugin = new (SelectionPlugin.extend("sap.ui.table.test.OtherTestSelectionPlugin"))();
		let oTable = this.oTable;

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

	QUnit.test("#getRenderConfig", async function(assert) {
		const sSelectAllTitleText = TableUtils.getResourceBundle().getText("TBL_SELECT_ALL");
		const sDeselectAllTitleText = TableUtils.getResourceBundle().getText("TBL_DESELECT_ALL");
		let Elem;

		this.oTable.addDependent(this.oTestPlugin);
		this.oTable.placeAt("qunit-fixture");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "none"}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.innerHTML.length === 0, "header selector is not rendered");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "custom", visible: true, enabled: false, selected: false, tooltip: sDeselectAllTitleText}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.firstChild.classList.contains("sapUiTableSelectAllCheckBox"), "header selector is rendered");
		assert.equal(Elem.getAttribute("title"), sDeselectAllTitleText, "Tooltip is correct");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "custom", visible: false, enabled: false, selected: false, tooltip: sDeselectAllTitleText}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.innerHTML.length === 0, "header selector is not rendered");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "toggle", visible: true, enabled: true, selected: false}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.firstChild.classList.contains("sapUiTableSelectAllCheckBox"), "header selector is rendered");
		assert.equal(Elem.getAttribute("title"), sSelectAllTitleText, "Tooltip is correct");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "toggle", visible: true, enabled: true, selected: true}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.firstChild.classList.contains("sapUiTableSelectAllCheckBox"), "header selector is rendered");
		assert.equal(Elem.getAttribute("title"), sSelectAllTitleText, "Tooltip is correct");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "custom", visible: true,	enabled: true, selected: false, tooltip: sDeselectAllTitleText}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.firstChild.classList.contains("sapUiTableSelectAllCheckBox"), "header selector is rendered");
		assert.equal(Elem.getAttribute("title"), sDeselectAllTitleText, "Tooltip is correct");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "custom", visible: false, enabled: true,	selected: false, tooltip: sDeselectAllTitleText}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.innerHTML.length === 0, "header selector is not rendered");

		this.oTestPlugin.getRenderConfig = function() {
			return {
				headerSelector: {type: "custom", icon: new Icon({src: "sap-icon://clear-all"}), visible: true, enabled: true, selected: false}
			};
		};
		this.oTable.invalidate();
		await nextUIUpdate();
		Elem = this.oTable.getDomRef("selall");
		assert.ok(Elem.firstChild.classList.contains("sapUiIcon"), "header selector icon is rendered");
		assert.equal(Element.closestTo(this.oTable.getDomRef("selall").firstChild).getSrc(), "sap-icon://clear-all", "The icon source is correct");
		assert.notEqual(Elem.getAttribute("title"), sDeselectAllTitleText, "Tooltip is not set through missing tooltip in render config");
	});

	QUnit.test("Selection API", function(assert) {
		const aMethodNames = [
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
		let oSelectionPlugin = this.oTable._getSelectionPlugin();

		aMethodNames.forEach(function(sMethodName) {
			const oSpy = sinon.spy(oSelectionPlugin, sMethodName);

			if (this.oTable[sMethodName]) {
				this.oTable[sMethodName]();
				assert.ok(oSpy.calledOnce, "Table#" + sMethodName + " calls LegacySelectionPlugin#" + sMethodName + " once");
			}
		}.bind(this));

		this.oTable.addDependent(this.oTestPlugin);
		oSelectionPlugin = this.oTable._getSelectionPlugin();

		aMethodNames.forEach(function(sMethodName) {
			let oSpy;

			if (sMethodName in oSelectionPlugin) {
				oSpy = sinon.spy(oSelectionPlugin, sMethodName);
			}

			assert.throws(this.oTable[sMethodName], "Table#" + sMethodName + " throws an error if a selection plugin is applied");

			if (oSpy) {
				assert.ok(oSpy.notCalled, "Table#" + sMethodName + " does not call SelectionPlugin#" + sMethodName);
			}
		}.bind(this));
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
		const oText = new Text();

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
		const oText = new Text();

		this.oTable.addAggregation("_hiddenDependents", oText);
		this.oTableInvalidate.resetHistory();
		oText.destroy();
		assert.ok(this.oTableInvalidate.notCalled, "The table is not invalidated when destroying a hidden dependent");
	});

	QUnit.test("clone", function(assert) {
		const oText = new Text("myHiddenDependentText");

		sinon.spy(oText, "clone");
		this.oTable.addAggregation("_hiddenDependents", oText);
		const oTableClone = this.oTable.clone();

		assert.ok(!oTableClone.getAggregation("_hiddenDependents").some((oElement) => {
			return oElement.getId().startsWith("myHiddenDependentText");
		}), "The clone does not contain clones of the hidden dependents of the original table");
		assert.ok(oText.clone.notCalled, "The 'clone' method of the hidden dependent was not called");

		oText.clone.restore();
		oTableClone.destroy();
	});

	QUnit.test("findAggregatedObjects / findElements", function(assert) {
		const oText = new Text("myHiddenDependentText");

		this.oTable.addAggregation("_hiddenDependents", oText);

		assert.ok(!this.oTable.findAggregatedObjects().includes(oText), "#findAggregatedObjects does not find hidden dependents");
		assert.ok(!this.oTable.findElements().includes(oText), "#findElements does not find hidden dependents");
	});

	QUnit.module("Hooks", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("BindRows", function(assert) {
		const oBindRowsSpy = sinon.spy();
		const oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.BindRows, oBindRowsSpy);

		this.oTable.bindRows(oBindingInfo);
		assert.equal(oBindRowsSpy.callCount, 1, "Bind: 'BindRows' hook was called once");
		assert.ok(oBindRowsSpy.calledWithExactly(oBindingInfo), "Bind: 'BindRows' hook was correctly called");
	});

	QUnit.test("RowsBound", function(assert) {
		const oRowsBoundSpy = sinon.spy();
		const oBindingInfo = {path: "/"};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.RowsBound, oRowsBoundSpy);

		this.oTable.bindRows(oBindingInfo);
		assert.ok(oRowsBoundSpy.notCalled, "Bind without model: 'RowsBound' hook was not called");
		oRowsBoundSpy.resetHistory();

		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(1));
		assert.equal(oRowsBoundSpy.callCount, 1, "Set model: 'RowsBound' hook was called once");
		assert.ok(oRowsBoundSpy.calledWithExactly(this.oTable.getBinding()), "Set model: 'RowsBound' hook was correctly called");
	});

	QUnit.test("UnbindRows", function(assert) {
		const oUnbindRowsSpy = sinon.spy();
		const oBindingInfo = {path: "/"};

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
		const oRowsUnboundSpy = sinon.spy();
		const oBindingInfo = {path: "/"};

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
		const oRefreshRowsSpy = sinon.spy();

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
		const oUpdateRowsSpy = sinon.spy();

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
		const oUpdateSizesSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.UpdateSizes, oUpdateSizesSpy);

		this.oTable._updateTableSizes(TableUtils.RowsUpdateReason.Resize);
		assert.equal(oUpdateSizesSpy.callCount, 1, "'UpdateSizes' hook was called once");
		assert.ok(oUpdateSizesSpy.calledWithExactly(TableUtils.RowsUpdateReason.Resize), "'UpdateSizes' hook was correctly called");
	});

	QUnit.test("TotalRowCountChanged", function(assert) {
		const oTotalRowCountChangedSpy = sinon.spy();
		const that = this;

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn()
				]
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertNoContentMessage: function(assert, oTable, vExpectedContent) {
			const sTitlePrefix = "The content in the NoData container is: ";

			if (TableUtils.isA(vExpectedContent, "sap.ui.core.Control")) {
				assert.strictEqual(oTable.getDomRef("noDataCnt").firstChild, vExpectedContent.getDomRef(), sTitlePrefix + vExpectedContent);
			} else {
				assert.strictEqual(oTable.getDomRef("noDataCnt").innerText, vExpectedContent, sTitlePrefix + "\"" + vExpectedContent + "\"");
			}
		},
		waitForNoColumnsMessage: function(oTable) {
			return new Promise(function(resolve) {
				const oNoColumnsMessage = oTable.getAggregation("_noColumnsMessage");

				if (oNoColumnsMessage) {
					resolve(oNoColumnsMessage);
				} else {
					const fnSetAggregation = oTable.setAggregation;
					oTable.setAggregation = async function(sAggregationName, oElement) {
						fnSetAggregation.apply(oTable, arguments);
						if (sAggregationName === "_noColumnsMessage") {
							await oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Without data and showNoData=true", async function(assert) {
		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable({
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_DATA"));
	});

	QUnit.test("Without data and showNoData=false", async function(assert) {
		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable({
			showNoData: false,
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Without columns and showNoData=true", async function(assert) {
		this.oTable.destroyColumns();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));
	});

	QUnit.test("Without columns and showNoData=false", async function(assert) {
		this.oTable.destroyColumns();
		this.oTable.setShowNoData(false);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true);
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));
	});

	QUnit.test("Without columns and noData=sap.m.IllustratedMessage", async function(assert) {
		const oTable = this.oTable;

		oTable.setNoData(new IllustratedMessage());
		oTable.destroyColumns();

		const oIllustratedMessage = await this.waitForNoColumnsMessage(oTable);
		assert.ok(oIllustratedMessage.isA("sap.m.IllustratedMessage"), "The NoColumns element is a sap.m.IllustratedMessage");
		assert.strictEqual(oIllustratedMessage.getEnableVerticalResponsiveness(), true, "Value of the 'enableVerticalResponsiveness' property");
		this.assertNoContentMessage(assert, oTable, oIllustratedMessage);
	});

	QUnit.test("Change 'showNoData' property with data", async function(assert) {
		this.oTable.setShowNoData(true);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to true");

		this.oTable.setShowNoData(false);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false");

		this.oTable.setShowNoData(false);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		this.oTable.setShowNoData(true);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to true");
	});

	QUnit.test("Change 'showNoData' property without data", async function(assert) {
		this.oTable.unbindRows();
		this.oTable.setShowNoData(true);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from true to true");

		this.oTable.setShowNoData(false);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from true to false");

		this.oTable.setShowNoData(false);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Change from false to false");

		this.oTable.setShowNoData(true);
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Change from false to true");
	});

	QUnit.test("Change 'noData' aggregation", async function(assert) {
		const oInvalidateSpy = sinon.spy(this.oTable, "invalidate");
		const oText1 = new Text();
		const oText2 = new Text();
		const oIllustratedMessage = new IllustratedMessage();

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
		await this.oTable.qunit.whenRenderingFinished();
		this.assertNoContentMessage(assert, this.oTable, oText1);

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oText2);
		assert.equal(oInvalidateSpy.callCount, 1, "Change from control to control: Table invalidated");
		await this.oTable.qunit.whenRenderingFinished();
		this.assertNoContentMessage(assert, this.oTable, oText2);

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello2");
		assert.equal(oInvalidateSpy.callCount, 1, "Change from control to text: Table invalidated");
		await this.oTable.qunit.whenRenderingFinished();
		this.assertNoContentMessage(assert, this.oTable, "Hello2");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData(oIllustratedMessage);
		assert.equal(oInvalidateSpy.callCount, 1, "Change from text to sap.m.IllustratedMessage: Table invalidated");
		oInvalidateSpy.resetHistory();

		await this.waitForNoColumnsMessage(this.oTable);
		assert.ok(oInvalidateSpy.notCalled,
			"Change from text to sap.m.IllustratedMessage: Table not invalidated after loading default NoColumns IllustratedMessage");

		oText1.destroy();
		oText2.destroy();
		oIllustratedMessage.destroy();
	});

	QUnit.test("Change 'noData' aggregation when the table does not have columns", async function(assert) {
		const oInvalidateSpy = sinon.spy(this.oTable, "invalidate");
		const oText1 = new Text();
		const oText2 = new Text();
		const oIllustratedMessage = new IllustratedMessage();

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

		await this.waitForNoColumnsMessage(this.oTable);
		assert.equal(oInvalidateSpy.callCount, 1,
			"Change from text to sap.m.IllustratedMessage: Table invalidated after loading default NoColumns IllustratedMessage");

		oInvalidateSpy.resetHistory();
		this.oTable.setNoData("Hello");
		assert.equal(oInvalidateSpy.callCount, 1, "Change from sap.m.IllustratedMessage to text: Table invalidated");
		await this.oTable.qunit.whenRenderingFinished();
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));

		this.oTable.setNoData(oIllustratedMessage);
		this.oTable.setNoData("Hello");
		await this.oTable.qunit.whenRenderingFinished();
		this.assertNoContentMessage(assert, this.oTable, TableUtils.getResourceText("TBL_NO_COLUMNS"));

		oText1.destroy();
		oText2.destroy();
		oIllustratedMessage.destroy();
	});

	QUnit.test("Binding change", function(assert) {
		const oBindingInfo = this.oTable.getBindingInfo("rows");
		const that = this;

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(12),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				rowMode: new FixedRowMode({
					rowCount: 12
				}),
				rows: "{/}"
			});
			this.oTable.qunit.setRowStates(this.aRowStates);

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
			const aRows = this.oTable.getRows();

			function getCSSPixelSize(iPixel) {
				return iPixel === 0 ? "" : iPixel + "px";
			}

			for (let i = 0; i < aRows.length; i++) {
				const oRow = aRows[i];
				const mRowDomRefs = oRow.getDomRefs();
				const oRowHeader = mRowDomRefs.rowHeaderPart;
				const oFirstCellContentInRow = mRowDomRefs.rowScrollPart.querySelector("td.sapUiTableCellFirst > .sapUiTableCellInner");
				const sMessagePrefix = "Indentation; " + oRow.getTitle() + "; Level " + oRow.getLevel() + "; Index " + oRow.getIndex() + ": ";

				if (TableUtils.Grouping.isInGroupMode(this.oTable)) {
					const oGroupShield = oRowHeader.querySelector(".sapUiTableGroupShield");

					assert.equal(oRowHeader.style["left"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Row header");
					assert.equal(oGroupShield.style["marginLeft"], getCSSPixelSize(-aIndentations[i]), sMessagePrefix + "Group shield");
					assert.equal(oFirstCellContentInRow.style["paddingLeft"], getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				} else if (TableUtils.Grouping.isInTreeMode(this.oTable)) {
					const oTreeIcon = mRowDomRefs.rowScrollPart.querySelector(".sapUiTableTreeIcon");

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
			const aRows = this.oTable.getRows();
			const AnyGroupHeader = this.RowType.GroupHeaderLeaf | this.RowType.GroupHeaderExpanded | this.RowType.GroupHeaderCollapsed;
			const AnyTreeNode = this.RowType.TreeNodeLeaf | this.RowType.TreeNodeExpanded | this.RowType.TreeNodeCollapsed;

			function isType(type, matchingType) {
				return (type & matchingType) > 0;
			}

			for (let i = 0; i < aRows.length; i++) {
				const oRow = aRows[i];
				const iExpectedRowType = aExpectedRowTypes[i];
				const mRowDomRefs = oRow.getDomRefs();
				const oGroupIcon = mRowDomRefs.rowHeaderPart.querySelector(".sapUiTableGroupIcon");
				const bIsGroupHeader = mRowDomRefs.row.every(function(oRowElement) {
					return oRowElement.classList.contains("sapUiTableGroupHeaderRow");
				});
				const bIsGroupExpanded = bIsGroupHeader && oGroupIcon.classList.contains("sapUiTableGroupIconOpen");
				const bIsGroupCollapsed = bIsGroupHeader && oGroupIcon.classList.contains("sapUiTableGroupIconClosed");
				const bIsGroupLeaf = bIsGroupHeader && !bIsGroupExpanded && !bIsGroupCollapsed;
				const oTreeIcon = this.oTable.qunit.getDataCell(i, 0).querySelector(".sapUiTableTreeIcon");
				const bIsTreeNode = oTreeIcon !== null;
				const bIsTreeLeaf = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconLeaf");
				const bIsTreeExpanded = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconNodeOpen");
				const bIsTreeCollapsed = bIsTreeNode && oTreeIcon.classList.contains("sapUiTableTreeIconNodeClosed");
				const bIsSummary = mRowDomRefs.row.every(function(oRowElement) {
					return oRowElement.classList.contains("sapUiTableSummaryRow");
				});
				const sMessagePrefix = "Visualization: " + oRow.getTitle() + "; Index " + oRow.getIndex() + ": ";

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
		const aExpectedIndentations = [0, 0, 24, 36, 44, 0, 24, 36, 36, 0, 0, 44];
		const that = this;

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
		const aExpectedIndentations = [0, 17, 34, 51, 68, 0, 17, 34, 51, 0, 17, 68];
		const that = this;

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
		const aExpectedIndentations = [0, 24, 36, 44, 52, 0, 24, 36, 44, 0, 24, 52];
		const that = this;

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		}
	});

	QUnit.test("Row", async function(assert) {
		const oRow = this.oTable.getRows()[0];
		const aRowInfo = [{
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

		this.oTable.qunit.addTextColumn();
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowActionCount(1);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));

		await this.oTable.qunit.whenRenderingFinished();
		aRowInfo.forEach((mRowInfo, iIndex) => {
			assert.ok(!isRowContentHidden(this.oTable.getRows()[iIndex]), "Default: " + mRowInfo.title);
		});

		await this.oTable.qunit.setRowStates(aRowInfo.map((mTestConfig) => mTestConfig.state));
		aRowInfo.forEach((mRowInfo, iIndex) => {
			assert.equal(isRowContentHidden(this.oTable.getRows()[iIndex]), mRowInfo.expectContentHidden, mRowInfo.title);
		});
	});

	QUnit.test("Cell", async function(assert) {
		const oTable = this.oTable;
		const oRow = oTable.getRows()[0];
		const aRowInfo = [{
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
		const aColumnInfo = [{
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
				const oRow = oTable.getRows()[iIndex];
				const oCellElement = oRow.getDomRefs(true).row.find("td[data-sap-ui-colid=\"" + oColumn.getId() + "\"]")[0];
				const bCellContentHidden = oCellElement && oCellElement.classList.contains("sapUiTableCellHidden");
				let bExpectCellContentVisible;
				const mCellContentVisibilitySettings = oColumn._getCellContentVisibilitySettings();

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

		oTable.destroyColumns();
		aColumnInfo.forEach(function(mColumnInfo) {
			const oColumn = new Column({
				label: mColumnInfo.title,
				template: mColumnInfo.template
			});
			oColumn._setCellContentVisibilitySettings(mColumnInfo.cellContentVisibilitySettings);
			oTable.addColumn(oColumn);
		});
		oTable.setFixedColumnCount(2);
		await oTable.qunit.setRowStates(aRowInfo.map((mRowInfo) => mRowInfo.state));
		await oTable.qunit.whenRenderingFinished();
		aColumnInfo.forEach(function(mColumnInfo, iIndex) {
			assertCellContentVisibility(oTable.getColumns()[iIndex], mColumnInfo.title);
		});
	});

	QUnit.module("Clear text selection on update", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		const oCell = this.oTable.qunit.getDataCell(0, 0);

		qutils.triggerMouseEvent(oCell, "mousedown", null, null, null, null, 2);
		oCell.dispatchEvent(new MouseEvent("contextmenu", {bubbles: true}));
		assert.ok(this.oTable._oCellContextMenu.isOpen(), "Context menu is open");
		this.oTable.setFirstVisibleRow(1);

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.notOk(this.oTable._oCellContextMenu.isOpen(), "Context menu is closed after scrolling");
		});
	});

	QUnit.test("CustomContextMenu", function(assert) {
		const oCell = this.oTable.qunit.getDataCell(0, 0);

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
		createTable: async function(mSettings) {
			this.oTable?.destroy();
			this.oTable = await TableQUnitUtils.createTable(mSettings);
		},
		getDefaultRowMode: function() {
			return this.oTable.getAggregation("_hiddenDependents").filter((oObject) => oObject.isA("sap.ui.table.rowmodes.RowMode"))[0];
		}
	});

	QUnit.test("Default", async function(assert) {
		await this.createTable();
		assert.strictEqual(this.oTable.getRowMode(), null, "value of 'rowMode' aggregation");
		assert.ok(TableUtils.isA(this.getDefaultRowMode(), "sap.ui.table.rowmodes.Fixed"),
			"A default instance of sap.ui.table.rowmodes.Fixed is applied");
		assert.ok(Object.keys(this.getDefaultRowMode().getMetadata().getAllProperties()).every((sPropertyName) => {
			return this.oTable.isPropertyInitial(sPropertyName);
		}), "All properties of the default row mode instance are initial");
	});

	QUnit.test("Enum value", async function(assert) {
		for (const sRowMode of Object.values(RowModeType)) {
			await this.createTable({rowMode: sRowMode});
			assert.strictEqual(this.oTable.getRowMode(), sRowMode, "value of 'rowMode' aggregation");
			assert.ok(TableUtils.isA(this.getDefaultRowMode(), "sap.ui.table.rowmodes." + sRowMode),
				`A default instance of sap.ui.table.rowmodes.${sRowMode} is applied`);
			assert.ok(Object.keys(this.getDefaultRowMode().getMetadata().getAllProperties()).every((sPropertyName) => {
				return this.oTable.isPropertyInitial(sPropertyName);
			}), `All properties of the '${sRowMode}' row mode instance are initial`);
		}
	});

	QUnit.test("Avoid creation of a default instance", async function(assert) {
		let bFailure = false;

		sinon.stub(FixedRowMode.prototype, "init").callsFake(function() {
			FixedRowMode.prototype.init.wrappedMethod.apply(this, arguments);
			bFailure = true;
		});

		await this.createTable({rowMode: RowModeType.Auto});
		await this.createTable({rowMode: new AutoRowMode()});
		assert.ok(!bFailure, "A default row mode instance (sap.ui.table.rowmodes.Fixed) was not created");

		FixedRowMode.prototype.init.restore();
	});
});