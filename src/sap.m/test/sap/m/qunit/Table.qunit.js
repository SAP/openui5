/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/m/ListBase",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/ScrollContainer",
	"sap/m/library",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/message/Message",
	"sap/ui/thirdparty/jquery",
	"sap/m/IllustratedMessage",
	"sap/m/ComboBox",
	"sap/m/CheckBox",
	"sap/m/RatingIndicator",
	"sap/ui/core/Item",
	"sap/m/TextArea",
	"sap/ui/core/Control"
], function(Localization, Element, Library, qutils, nextUIUpdate, KeyCodes, JSONModel, Device, Filter, Sorter, InvisibleText, DragDropInfo, ListBase, Table, Column, Label, Link, Toolbar, ToolbarSpacer, Button, Input, ColumnListItem, Text, Title, ScrollContainer, library, VerticalLayout, Message, jQuery, IllustratedMessage, ComboBox, CheckBox, RatingIndicator, Item, TextArea, Control) {
	"use strict";

	const TestControl = Control.extend("sap.m.test.TestControl", {
		metadata: {
			"final": true,
			aggregations: {
				label: { type: "sap.m.Label", multiple: false }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumnHeaderLabel) {
				oRm.openStart("div", oColumnHeaderLabel);
				oRm.style("width", "100%");
				oRm.openEnd();
				oRm.renderControl(oColumnHeaderLabel.getLabel());
				oRm.close("div");
			}
		},
		getRequired: function() {
			return this.getLabel().getRequired();
		},
		// Controls need to have required in their accessibility info to have it announced!
		getAccessibilityInfo: function() {
			return this.getLabel().getAccessibilityInfo();
		}
	});

	function createSUT(bCreateColumns, bCreateHeader, sMode, bNoDataIllustrated) {
		const oData = {
			items: [
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 }
			],
			cols: ["Name", "Color", "Number"]
		};
		// sap.m.Table is the system under test
		const sut = new Table();

		if (bCreateColumns) {

			const aColumns = oData.cols.map(function (colname) {
				return new Column({ header: new Label({ text: colname })});
				});
				let i = aColumns.length;
			while (i--){
				sut.addColumn(aColumns[aColumns.length - i - 1]);
			}
		}

		if (bCreateHeader) {
			sut.setHeaderToolbar(new Toolbar({
				content: [
							new Title({text: "Random Data"}),
							new ToolbarSpacer({}),
							new Button({
								icon: "sap-icon://person-placeholder"
							})
						]
			}));
		}

		if (sMode) {
			sut.setMode(sMode);
		}

		if (bNoDataIllustrated) {
			sut.setNoData(new IllustratedMessage("noDataIllustratedMessage", {
				illustrationType: library.IllustratedMessageType.NoSearchResults,
				title: "Custom Title",
				description: "This is a custom description."
			}));
		}

		sut.setModel(new JSONModel(oData));
		sut.bindAggregation("items", "/items", new ColumnListItem({
			cells: oData.cols.map(function (colname) {
				return new Label({ text: "{" + colname.toLowerCase() + "}" });
			})
		}));


		return sut;
	}

	function createVarietyTable() {
		const sut = new Table({
			columns: [
				new Column({header: new Label({text: "Last Name"})}),
				new Column({header: new Label({text: "First Name"})}),
				new Column({header: new Label({text: "Checked"})}),
				new Column({header: new Link({text: "Web Site"}), footer: new Label({text: "Web Site Footer"})}),
				new Column({header: new Label({text: "Rating"})}),
				new Column({header: new Label({text: "Text Area"})})
			]
		});
		sut.bindItems({
			path : "/modelData",
			template : new ColumnListItem({
				cells: [
					new Input({value: "{lastName}"}),
					new ComboBox({
						value: "{name}",
						items: {
							path: '/modelData',
							sorter: { path: 'name'},
							template: new Item({key:"{lastName}", text:"{name}"}),
							templateShareable: false
						}
					}),
					new CheckBox({selected:"{checked}"}),
					new Link({text:"{linkText}", href:"{href}"}),
					new RatingIndicator({value:"{rating}"}),
					new TextArea({value:"Test1\nTest2"})
				]
			})
		});

		const aData = [
			{lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", rating: 4},
			{lastName: "Friese", name: "Andy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", rating: 2},
			{lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", rating: 3}
		];

		const oModel = new JSONModel();
		oModel.setData({modelData: aData, editable: false});
		sut.setModel(oModel);

		return sut;
	}

	function createBiggerTable(){
		const oData = {
			items: [
				{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
				{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
				{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"}
			]
		};
		const aColumns = [
			new Column({
				header : new Label({
					text : "LastName"
				})
			}),
			new Column({
				header : new Label({
					text : "FirstName"
				})
			}),
			new Column({
				hAlign: "Center",
				header : new Label({
					text : "Available"
				})
			}),
			new Column({
				header : new Link({
					text : "Website"
				})
			}),
			new Column({
				header : new Label({
					text : "Rating"
				})
			}),
			new Column({
				header : new Label({
					text : "Birthday"
				}),
				minScreenWidth: "800px"
			}),
			new Column({
				hAlign: "End",
				header : new Label({
					text : "Salary"
				})
			})
		];
		const oTemplate = new ColumnListItem({
			vAlign: "Middle",
			type : "{type}",
			highlight: {
				path: "money",
				formatter: function(fSalary) {
					if (fSalary < 50) {
						return "Error";
					}
					if (fSalary < 1000) {
						return "Warning";
					}
					if (fSalary <= 10000) {
						return "Indication04";
					}
					if (fSalary > 10000 && fSalary < 50000) {
						return "Success";
					}
					return "None";
				}
			},
			cells : [
				new Text({text : "{lastName}", wrapping : false}),
				new Text({text : "{name}", wrapping : false}),
				new Text({text : "{checked}"}),
				new Text({text : "{linkText}"}),
				new Text({text : "{rating}"}),
				new Text({text : "{birthday}"}),
				new Text({text : "{money} EUR"})
			]
		});

		const oTable = new Table({
			columns: aColumns
		});

		oTable.setModel(new JSONModel(oData));
		oTable.bindItems({
			path: "/items",
			template: oTemplate,
			key: "id"
		});

		oTable.placeAt("qunit-fixture");
		return oTable;
	}

	function nextAnimationFrame() {
		return new Promise(function(resolve) {
			window.requestAnimationFrame(resolve);
		});
	}

	function timeout(iDuration) {
		return new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	QUnit.module("Display");

	QUnit.test("Basic Properties", async function(assert) {
		const sut = createSUT(false, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Check if table has been added to dom tree
		assert.ok(sut.$().length > 0, "Table in DOM tree");

		assert.ok(sut.$().find("th").hasClass("sapMTableTH"), ".sapMTableTH added to 'th' elements");

		assert.ok(!sut.$().children().hasClass("sapMTableOverlay"), "Table overlay is not rendered as showOverlay=false");
		sut.setShowOverlay(true);
		await nextUIUpdate();

		let $Overlay = sut.$("overlay");
		const sAriaLabelledBy = sut.getHeaderToolbar().getContent()[0].getId() + " " + InvisibleText.getStaticId("sap.m", "TABLE_INVALID");
		assert.ok($Overlay.hasClass("sapUiOverlay"), "Table overlay is rendered as showOverlay=true");
		assert.ok($Overlay.hasClass("sapMTableOverlay"), "Table overlay is rendered as showOverlay=true");
		assert.equal($Overlay.attr("role"), "region", "Table overlay role is correct");
		assert.equal($Overlay.attr("aria-labelledby"), sAriaLabelledBy, "aria-labelledby valid for overlay");

		sut.invalidate();
		await nextUIUpdate();

		$Overlay = sut.$("overlay");
		assert.ok($Overlay.attr("aria-labelledby"), "There is already aria-labelledby for overlay after rerendering.");
		assert.ok($Overlay.hasClass("sapUiOverlay"), "Table overlay is rerendered as showOverlay=true");
		assert.ok($Overlay.hasClass("sapMTableOverlay"), "Table overlay is rerendered as showOverlay=true");
		assert.equal($Overlay.attr("role"), "region", "Table overlay role is correct after rerendering");
		assert.equal($Overlay.attr("aria-labelledby"), sAriaLabelledBy, "aria-labelledby valid for overlay after rerendering");

		sut.setShowOverlay(false);
		await nextUIUpdate();

		assert.notOk(sut.getDomRef("overlay"), "Table overlay is removed as showOverlay=false");

		sut.setVisible(false);
		await nextUIUpdate();

		assert.ok(sut.$().length === 0, "Table has been removed from DOM");

		assert.equal(sut.getItemsContainerDomRef(), sut.$("tblBody")[0]);

		//clean up
		sut.destroy();
	});

	QUnit.test("Column Display", async function(assert) {
		const sut = createSUT(true),
			labelFilter = 'th>.sapMColumnHeader>.sapMLabel';
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Check table columns (should be three)
		let aLabels = sut.$().find(labelFilter);
		assert.ok(aLabels.length === 3, "Table has three columns rendered");
		assert.ok(aLabels[0].textContent == "Name", "First column named 'Name'");
		assert.ok(aLabels[1].textContent == "Color", "First column named 'Color'");
		assert.ok(aLabels[2].textContent == "Number", "First column named 'Number'");

		//Remove first column
		const oFirstColumn = sut.removeColumn("__column0");
		await nextUIUpdate();

		//Check table columns (should be two)
		aLabels = sut.$().find(labelFilter);

		assert.ok(aLabels.length === 2, "Table has three columns" );

		//Insert column again
		sut.insertColumn(oFirstColumn, 1);
		await nextUIUpdate();

		//Check table columns and their positions
		aLabels = sut.$().find(labelFilter);
		assert.ok(aLabels.length === 3, "Table has three columns rendered");
		assert.ok(aLabels[1].textContent == "Name", "First column named 'Name'");
		assert.ok(aLabels[0].textContent == "Color", "First column named 'Color'");
		assert.ok(aLabels[2].textContent == "Number", "First column named 'Number'");

		//remove all columns
		sut.removeAllColumns();
		await nextUIUpdate();

		aLabels = sut.$().find(labelFilter);
		assert.ok(aLabels.length === 0, "Table has no more columns rendered");

		//clean up
		sut.destroy();
	});

	QUnit.test("Header Toolbar Display", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Check if header toolbar is in DOM
		const oToolBar = sut.getHeaderToolbar();
		assert.ok(oToolBar.$().length > 0, "HeaderToolbar in DOM tree");

		//clean up
		sut.destroy();
	});


	QUnit.test("Empty Table", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();


		//Check if header toolbar is in DOM

		const oData = {
			items: [],
			cols: ["Name", "Color", "Number"]
		};
		sut.setModel(new JSONModel(oData));
		await nextUIUpdate();

		const aNoDataRow = sut.$().find("#" + sut.getId() + "-nodata");

		assert.ok(aNoDataRow.length === 1, "Table displays 'No Data'");
		assert.equal(aNoDataRow.text(), sut.getNoDataText());

		sut.removeAllColumns();
		await nextUIUpdate();

		assert.notEqual(aNoDataRow.text(), sut.getNoDataText()); // no columns message will be shown

		//clean up
		sut.destroy();
	});

	QUnit.test("Colspan and col count", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(sut.getColCount(), 5, "highlight, 3 visible columns, navigated columns");
		sut.setMode("MultiSelect");
		await nextUIUpdate();

		assert.strictEqual(sut.getColCount(), 6, "highlight, MultiSelect, 3 visible columns, navigated columns");
		sut.getItems()[0].setType("Navigation");
		await nextUIUpdate();

		assert.strictEqual(sut.getColCount(), 7, "highlight, MultiSelect, 3 visible columns, navigation, navigated columns");
		sut.setFixedLayout("Strict");
		sut.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("10rem");
		});
		await nextUIUpdate();

		assert.strictEqual(sut.getColCount(), 8, "highlight, MultiSelect, 3 visible columns, navigation, navigated & dummy columns");
		sut.addColumn(sut.removeAllColumns().pop());
		await nextUIUpdate();

		assert.strictEqual(sut.getColumns()[0].getDomRef().style.width, "10rem", "highlight, Single columns is not handled for the Strict layout");
		sut.destroy();
	});

	QUnit.test("colspan should update for popins when column visibility changes", async function(assert) {
		const sut = createSUT(true, true);
		const oColumn = sut.getColumns()[1];


		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("4444px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut.hasPopin(), "Table has popins");
		assert.equal(sut.getVisibleItems()[0].$Popin().attr("tabindex"), "-1", "Popin row has the tabindex=1. this is needed for the text selection");

		let aVisibleColumns = sut.getColumns().filter(function(oCol) {
			return oCol.getVisible() && !oCol.isPopin();
		});
		assert.strictEqual(aVisibleColumns.length, 2, "There are 2 visible columns that are not in the popin area");
		assert.strictEqual(parseInt(sut.getVisibleItems()[0].$Popin().find(".sapMListTblSubRowCell").attr("colspan")), aVisibleColumns.length, "Correct colspan=2 attribute set on the popin, since there are 2 visible columns");

		// hide a column
		sut.getColumns()[2].setVisible(false);
		await nextUIUpdate();

		aVisibleColumns = sut.getColumns().filter(function(oCol) {
			return oCol.getVisible() && !oCol.isPopin();
		});
		assert.strictEqual(aVisibleColumns.length, 1, "There is 1 visible column which is not in the popin area");
		assert.strictEqual(parseInt(sut.getVisibleItems()[0].$Popin().find(".sapMListTblSubRowCell").attr("colspan")), aVisibleColumns.length, "colspan=1, attribute updated correctly");

		sut.destroy();
	});

	QUnit.test("Fixed Layout", async function(assert) {
		const sut = createSUT();
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		// check initial rendering
		assert.strictEqual(sut.$().find("table").css("table-layout"), "fixed", "Table has fixed layout after initial rendering");
		sut.setFixedLayout(false);
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "auto", "Table has correct layout after disabling fix layout.");
		assert.strictEqual(sut.getFixedLayout(), false, "getter is returning the correct value");
		sut.setFixedLayout("true");
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "fixed", "Table has correct layout after fix layout is set.");
		assert.strictEqual(sut.getFixedLayout(), true, "getter is returning the boolean value");
		sut.setFixedLayout("false");
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "auto", "Table has correct layout after disabling fix layout.");
		assert.strictEqual(sut.getFixedLayout(), false, "getter is returning the boolean value");
		sut.setFixedLayout();
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "fixed", "Table has correct layout for the undefined value");
		assert.strictEqual(sut.getFixedLayout(), true, "getter is returning the default value");
		sut.setFixedLayout(false);
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "auto", "Table has correct layout after disabling fix layout.");
		assert.strictEqual(sut.getFixedLayout(), false, "getter is returning the boolean value");
		sut.setFixedLayout("Strict");
		await nextUIUpdate();

		assert.strictEqual(sut.$().find("table").css("table-layout"), "fixed", "Table has fixed layout for the Strict value");
		assert.strictEqual(sut.getFixedLayout(), "Strict", "getter is returning the correct string value");

		["strict", "sTrIcT", "False", "True", 5, new Date(), {}, [1], ""].forEach(function(value) {
			assert.throws(function() {
				sut.setFixedLayout(value);
			}, value + " is not a valid value");
		});

		//clean up
		sut.destroy();
	});

	QUnit.test("TablePopin hover test", async function(assert) {
		const sut = createSUT(true, false, "SingleSelectMaster");
		const oColumn = sut.getColumns()[1];
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("48000px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oItem = sut.getItems()[0];
		const oItemPopin = oItem.hasPopin();

		assert.ok(oItem.getDomRef().classList.contains("sapMLIBHoverable"), "Item is hoverable");
		assert.ok(oItemPopin, "Table contains popin");

		assert.notOk(oItem.getDomRef().classList.contains("sapMPopinHovered"), "sapMPopinHovered class not added to the item yet as there is no mouseover");
		oItemPopin.$().trigger("mouseenter");
		await nextUIUpdate();
		assert.ok(oItem.getDomRef().classList.contains("sapMPopinHovered"), "sapMPopinHovered class added to the ItemDomRef as popin is hovered");

		oItemPopin.$().trigger("mouseleave");
		await nextUIUpdate();
		assert.notOk(oItem.getDomRef().classList.contains("sapMPopinHovered"), "sapMPopinHovered class removed as mouse is out of the popin");

		sut.destroy();
	});

	QUnit.test("Popin column header must be rendered in a hidden DIV element", async function(assert) {
		const sut = createSUT(true, false, "SingleSelectMaster");
		const oColumn = sut.getColumns()[1];
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("48000px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut.getDomRef("popin-headers"), "DOM element found");
		oColumn.setDemandPopin(false);
		await nextUIUpdate();

		assert.notOk(sut.getDomRef("popin-headers"), "DOM element does not exist since there are no popins");

		sut.destroy();
	});

	QUnit.module("Modes");

	QUnit.test("MultiSelect", async function(assert) {
		const sut = createSUT(true, true, "MultiSelect");
		const oBundle = Library.getResourceBundleFor("sap.m");

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Check if multiselect checkboxes are visible
		const aSelectionChecks = sut.$().find(".sapMCb");
		assert.ok(aSelectionChecks.length === 4, "Table displays selection checkboxes");

		// Check if select all checkbox has aria-label attribute
		const $selectAllCheckBox = sut.$().find(".sapMListTblHeader .sapMCb").first();
		assert.strictEqual($selectAllCheckBox.attr('aria-label'), oBundle.getText("TABLE_CHECKBOX_SELECT_ALL"), "The select all checkbox has an aria-label assigned");

		// Check if select all checkbox has correct tooltip assigned
		assert.strictEqual(sut._selectAllCheckBox.getTooltip(), oBundle.getText("TABLE_SELECT_ALL_TOOLTIP"), "The select all checkbox has correct tooltip assigned");

		// Check if checkboxes are initially not selected
		let aSelectionChecksMarked = sut.$().find(".sapMCbMarkChecked");
		assert.ok(aSelectionChecksMarked.length === 0, "Selection checkboxes not checked");

		// Check if 'selectAll' marks all rows as selected
		sut.selectAll();
		await nextUIUpdate();

		aSelectionChecksMarked = sut.$().find(".sapMCbMarkChecked");
		assert.ok(aSelectionChecksMarked.length === 4, "Selection checkboxes ALL checked");

		// clean up
		sut.destroy();
	});

	QUnit.test("MultiSelect - selectAll checkbox enabled/selected behavior", async function(assert) {
		const sut = createSUT(true, true, "MultiSelect");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut._selectAllCheckBox.getEnabled(), "SelectAll checkbox is enabled since there are visible items");

		sut.selectAll();
		assert.ok(sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is selected");

		sut.getBinding("items").filter(new Filter("color", "EQ", "foo"));
		await nextUIUpdate();

		assert.ok(sut._selectAllCheckBox.getEnabled(), "SelectAll checkbox is enabled");
		assert.notOk(sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is deselected");

		sut.getBinding("items").filter();
		await nextUIUpdate();

		assert.ok(sut._selectAllCheckBox.getEnabled(), "SelectAll checkbox is enabled");
		assert.ok(sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is selected again");

		sut._selectAllCheckBox.setEnabled(false);
		await nextUIUpdate();

		assert.notOk(sut._selectAllCheckBox.getEnabled(), "SelectAll checkbox is disabled, only when explicitly enabled=false is set");

		sut.destroy();
	});

	QUnit.test("Range Selection - rangeSelection object should be cleared if the shift key is released on the table header row or footer row", async function(assert) {
		const sut = createSUT(true, false, "MultiSelect");
		sut.placeAt("qunit-fixture");
		const fnFireSelectionChangeEvent = this.spy(sut, "_fireSelectionChangeEvent");
		await nextUIUpdate();

		// test for table header row
		sut.getVisibleItems()[1].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that sut._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(sut._mRangeSelection, "Range selection mode enabled");
		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		assert.ok(sut.getVisibleItems()[0], "Item at position 1 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");

		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		assert.ok(document.activeElement.classList.contains("sapMListTblHeader"), "Table header row is focused");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event not fired, call count is the same");

		// sut._mRangeSelection object is cleared as focus reached the table header row and no selectable item is found
		assert.ok(!sut._mRangeSelection, "Range selection mode cleared");

		// clear sut._mRangeSelection object
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);

		// deselect all items
		sut.getItems().forEach(function(oItem) {
			oItem.setSelected(false);
		});
		await nextUIUpdate();

		// test for table footer row
		sut.getColumns()[2].setFooter(new Text({text: "4.758"}));
		await nextUIUpdate();
		fnFireSelectionChangeEvent.reset();

		assert.ok(!sut._mRangeSelection, "rangeSelection object not available");

		sut.getVisibleItems()[1].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that sut._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(sut._mRangeSelection, "Range selection mode enabled");
		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		assert.ok(sut.getVisibleItems()[2], "Item at position 3 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		assert.ok(document.activeElement.classList.contains("sapMListTblFooter"), "Table footer row is focused");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event not fired, call count is the same");

		// sut._mRangeSelection object is cleared as focus reached the table footer row and no selectable item is found
		assert.ok(!sut._mRangeSelection, "Range selection mode cleared");

		// clear sut._mRangeSelection object
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);

		sut.destroy();
	});

	QUnit.test("Container Padding Classes", async function (assert) {
		// System under Test + Act
		const oContainer = new Table();
		let sResponsiveSize;

		if (Device.resize.width <= 599) {
			sResponsiveSize = "0px";
		} else if (Device.resize.width <= 1023) {
			sResponsiveSize = "16px";
		} else {
			sResponsiveSize = "16px 32px";
		}

		const aResponsiveSize = sResponsiveSize.split(" ");

		// Act
		oContainer.placeAt("qunit-fixture");
		await nextUIUpdate();
		oContainer.addStyleClass("sapUiNoContentPadding");
		const $containerContent = oContainer.$();

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.test("Focus style class on tr element", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oTableHeader = sut.getDomRef("tblHeader");
		assert.ok(oTableHeader.classList.contains("sapMTableRowCustomFocus"), "sapMTableRowCustomFocus style class is added to the tr element");
		assert.ok(oTableHeader.classList.contains("sapMLIBFocusable"), "sapMLIBFocusable style class is added to the tr element");

		sut.destroy();
	});

	QUnit.module("TypeColumn");

	QUnit.test("TypeColumn visibility should updated correctly", async function(assert) {
		const oTable = createSUT(true);

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible by default");
		assert.strictEqual(oTable.$().find("th").last().attr("role"), "presentation", "role=presentation is set correctly");

		oTable.getItems()[0].setType("Navigation");
		await nextUIUpdate();
		assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible when an item type is Navigation");

		oTable.getItems()[0].setType("Active");
		await nextUIUpdate();
		assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since Active type does not need column");

		oTable.getItems()[0].setType("Detail");
		await nextUIUpdate();
		assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible when an item type is Detail");

		oTable.getItems()[0].setVisible(false);
		await nextUIUpdate();
		assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since item is not visible");

		const oClone = oTable.getItems()[1].clone().setType("DetailAndActive");
		oTable.addItem(oClone);
		await nextUIUpdate();
		assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible because new type is DetailAndActive");

		oClone.destroy();
		await nextUIUpdate();
		assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since new item is destroyed");

		oTable.getItems()[0].setVisible(true);
		await nextUIUpdate();
		assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible because first item with type detail is visible again");

		oTable.invalidate();
		await nextUIUpdate();
		assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible rerender did not change the visibility of the type column");

		oTable.destroy();
	});

	QUnit.module("Navigated indicator");

	QUnit.test("check DOM for Navigated column and cells", async function(assert) {
		const oTable = createSUT(true),
			oFirstItem = oTable.getItems()[0],
			oSecondItem = oTable.getItems()[1];
		oTable.placeAt("qunit-fixture");
		oFirstItem.setNavigated(true);
		await nextUIUpdate();

		assert.ok(oTable.$().find("table").hasClass("sapMListNavigated"), "Navigated class added");
		const $oNavigatedCol = oTable.$().find(".sapMListTblNavigatedCol");
		assert.ok($oNavigatedCol.length > 0, "Navigated column is visible");
		assert.equal($oNavigatedCol.attr("role"), "presentation", "presentation role is set correctly");

		const $oFirstItem = oFirstItem.$().find(".sapMListTblNavigatedCell");
		assert.ok($oFirstItem.length > 0, "Navigated cell class added");
		assert.equal($oFirstItem.attr("role"), "presentation", "presentation role is set correctly");
		assert.notOk($oFirstItem.attr("aria-hidden"), "aria-hidden attribute is not set since role=presentation is enough");
		assert.ok($oFirstItem.children().hasClass("sapMLIBNavigated"), "navigated indicator rendered");

		assert.equal(oSecondItem.$().find(".sapMListTblNavigatedCell").children().length, 0, "navigated indicator not added as navigated property is not enabled for the item");

		oFirstItem.setNavigated(false);
		await nextUIUpdate();

		assert.notOk(oTable.$().find("table").hasClass("sapMListNavigated"), "Navigated column is removed");

		oTable.destroy();
	});

	QUnit.test("check DOM for navigated indicator with popins", async function(assert) {
		const oTable = createSUT(true),
			oFirstItem = oTable.getItems()[0];
		oTable.placeAt("qunit-fixture");
		oFirstItem.setNavigated(true);

		const oLastColumn = oTable.getColumns()[oTable.getColumns().length - 1];
		oLastColumn.setDemandPopin(true);
		oLastColumn.setMinScreenWidth("48000px");
		await nextUIUpdate();

		const oNavigatedIndicator = oFirstItem.getPopin().getDomRef().childNodes[2];
		assert.equal(oNavigatedIndicator.getAttribute("role"), "presentation", "presentation role is set correctly");
		assert.notOk(oNavigatedIndicator.getAttribute("aria-hidden"), "aria-hidden attribute is not set since role=presentation is enough");
		assert.ok(oNavigatedIndicator.firstChild.classList.contains("sapMLIBNavigated"), "navigated indicator also rendered in popin row");

		oTable.destroy();
	});

	QUnit.module("Event");

	QUnit.test("SelectAll in selectionChange event", async function(assert) {
		const sut = createSUT(true, true, "MultiSelect");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		sut.attachEventOnce("selectionChange", function(e) {
			assert.ok(e.getParameter("selectAll"), "selectAll parameter is true when the 'selectAll' checkbox is pressed");
		});
		const $SelectAllCheckbox = sut.$().find(".sapMCb").first().trigger("tap");

		sut.attachEventOnce("selectionChange", function(e) {
			assert.ok(!e.getParameter("selectAll"), "selectAll parameter is false when the 'selectAll' checkbox is unpressed");
		});
		$SelectAllCheckbox.trigger("tap");

		//clean up
		sut.destroy();
	});

	QUnit.test("Test focus event", async function(assert) {
		const sut = createSUT(true, true);
		const fnFocusSpy = sinon.spy(sut, "focus");
		const oFocusInfo = {
			targetInfo: new Message({
				message: "Error thrown",
				type: "Error"
			})
		};

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $tblHeader = sut.$("tblHeader");

		sut.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		assert.ok(document.activeElement !== $tblHeader[0], "Table header is not focused");

		sut.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		assert.ok(document.activeElement === $tblHeader[0], "Table header is focused");

		sut.removeAllColumns();
		await nextUIUpdate();
		sut.focus(oFocusInfo);
		assert.notOk(sut.getColumns().length, "Columns removed from table");
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		assert.ok(document.activeElement === sut.$("nodata")[0], "Table nodata element is focused");

		//clean up
		sut.destroy();
	});

	QUnit.module("Functionality");

	QUnit.test("Test for removeAllItems", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut.getItems().length > 0, "Table contains items");
		sut.removeAllItems();
		assert.ok(sut.getItems().length === 0, "Items are removed from the Table");

		sut.destroy();
	});

	QUnit.test("Test for multiSelectMode", async function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		const sut = createSUT(true, false, "MultiSelect");

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut._selectAllCheckBox, "Table contains select all checkBox");
		assert.notOk(sut._clearAllButton, "Table does not contain clear all icon");
		sut.setMultiSelectMode("ClearAll");
		await nextUIUpdate();

		assert.ok(sut._clearAllButton, "Table contains select all clear all icon button");
		assert.ok(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "Clear selection icon is inactive by adding style class since no items selected");

		const $tblHeader = sut.$("tblHeader").trigger("focus");
		qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);
		assert.notOk(sut.getSelectedItems().length, "Select All is disabled with keyboard. Space on column header");

		// Check if clear all icon has aria-label attribute
		const $clearSelection = sut.$("clearSelection");
		const sText = $clearSelection.attr("aria-label");
		const sToolTip = sut._getClearAllButton().getTooltip();

		assert.strictEqual(sText, oResourceBundle.getText("TABLE_ICON_DESELECT_ALL"), "The clear all icon has an aria-label assigned");
		assert.strictEqual(sToolTip, oResourceBundle.getText("TABLE_CLEARBUTTON_TOOLTIP"), "The deselect all tooltip is set on the button");

		const oItem = sut.getItems()[0];

		oItem.setSelected(true);

		await timeout();

		assert.notOk(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "Clear selection icon is active by adding style class since items selected");
		sut.destroy();
	});

	QUnit.test("Test for multiSelectMode - Growing enabled", async function(assert) {
		const oData = {
			items: [
				{ name: "Michelle", color: "orange", number: 3.14 , selected:false},
				{ name: "Michelle", color: "orange", number: 3.14, selected:false},
				{ name: "Michelle", color: "orange", number: 3.14, selected:false},
				{ name: "Joseph", color: "blue", number: 1.618, selected:false},
				{ name: "Joseph", color: "blue", number: 1.618, selected:false},
				{ name: "Joseph", color: "blue", number: 1.618, selected:false},
				{ name: "David", color: "green", number: 0, selected:true},
				{ name: "David", color: "green", number: 0, selected:false},
				{ name: "David", color: "green", number: 0, selected:false},
				{ name: "Michelle", color: "orange", number: 3.14, selected:false},
				{ name: "Michelle", color: "orange", number: 3.14, selected:false},
				{ name: "Michelle", color: "orange", number: 3.14, selected:false}
			],
			cols: ["Name", "Color", "Number"]
		};

		const sut = new Table("idTblGrowing", {
			growing: true,
			growingThreshold: 5,
			multiSelectMode: "ClearAll",
			mode: "MultiSelect"
		});

		const aColumns = oData.cols.map(function (colname) {
			if (colname === "Name") {
				return new Column({ header: new Label({ text: colname })});
			}
			return new Column({ header: new Label({ text: colname })});
		});
		let i = aColumns.length;

		while (i--) {
			sut.addColumn(aColumns[aColumns.length - i - 1]);
		}

		sut.setModel(new JSONModel(oData));
		sut.bindAggregation("items", "/items", new ColumnListItem({
			selected: "{selected}",
			cells: oData.cols.map(function (colname) {
				return new Label({ text: "{" + colname.toLowerCase() + "}" });
			})
		}));

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut._clearAllButton, "Table contains clear all icon button");
		assert.ok(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "Clear selection icon is inactive by removing style class since no items selected");

		const $trigger = sut.$("trigger").trigger("focus");
		qutils.triggerKeydown($trigger, KeyCodes.ENTER);
		await timeout();

		assert.notOk(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "Clear selection icon is active by adding style class after growing");
		sut.destroy();
	});

	QUnit.test("Test for multiSelectMode - space key should trigger deselectAll when trigger on the table header", async function(assert) {
		const sut = createSUT(true, true, "MultiSelect");
		sut.setMultiSelectMode("ClearAll");
		sut.getItems()[1].setSelected(true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $tblHeader = sut.$("tblHeader").trigger("focus");
		assert.notOk(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "ClearAll button is enabled since an item is selected in the table");

		qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);
		await nextUIUpdate();
		assert.ok(sut._clearAllButton.hasStyleClass("sapMTableDisableClearAll"), "ClearAll button is disabled, since items are desected in the table via space key");
		sut.destroy();
	});

	QUnit.test("Test for SingleSelectMaster - enter key should trigger selectionChange event", async function(assert) {
		const sut = createSUT(true, true, "SingleSelectMaster");
		const fnSelectionChangeSpy = sinon.spy();
		sut.attachSelectionChange(fnSelectionChangeSpy);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		sut.getItems()[0].focus();
		qutils.triggerKeydown(document.activeElement, KeyCodes.ENTER);
		assert.ok(fnSelectionChangeSpy.calledOnce, "selectionChange event is triggered once");
		sut.destroy();
	});

	QUnit.test("Test for destroyItems", async function(assert) {
		const sut = createSUT(true, true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(sut.getItems().length > 0, "Table contains items");
		sut.destroyItems();
		assert.ok(sut.getItems().length === 0, "Items are removed from the Table");

		sut.destroy();
	});

	QUnit.test("Test for onColumnResize", async function(assert) {
		const oColumn = new Column({
			minScreenWidth : "tablet",
			demandPopin: true
		}),
		sut = new Table({
			columns : oColumn
		}),
		tableResizeSpy = sinon.spy(sut, "onColumnResize");

		// The table needs to be rendered for the column media object to be initialized
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const clock = sinon.useFakeTimers();
		oColumn._notifyResize({from: 600}); // this is the default value for minScreenWidth="phone"
		clock.tick(1);

		assert.ok(!tableResizeSpy.called, "Table resize not called, if media is the same");

		oColumn._notifyResize({from: 240});
		clock.tick(1);

		assert.ok(tableResizeSpy.called, "Table resize called, if media is different");

		clock.restore();
		sut.destroy();
	});

	QUnit.test("Test for onItemSelectedChange", async function(assert) {
		const sut = createSUT(true, false, "MultiSelect");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();
		const fnOnItemSelectedChange = sinon.spy(sut, "onItemSelectedChange");

		const oItem = sut.getItems()[0];
		oItem.setSelected(true);
		assert.ok(fnOnItemSelectedChange.called, "function called as the selection changed");

		sut.destroy();
	});

	QUnit.test("Test for accessibility content", async function(assert) {
		const sut = createSUT(true, false);
		sut.bActiveHeaders = true;
		const oColumn = sut.getColumns()[0];
		const oBinding = sut.getBinding("items");
		const oColumnHeader = oColumn.getHeader();
		oColumn.setFooter(new Label({text: "Greetings"}));
		oColumnHeader.setRequired(true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oResourceBundle = Library.getResourceBundleFor("sap.m");

		// accessibility role
		assert.equal(sut.getAccessibilityType(), oResourceBundle.getText("TABLE_ROLE_DESCRIPTION"), "Accessilitiy role correctly set");
		assert.equal(sut.getFocusDomRef().getAttribute("aria-roledescription"), oResourceBundle.getText("TABLE_ROLE_DESCRIPTION"), "Accessilitiy role description correctly set");

		// _setHeaderAnnouncement() test
		const $tblHeader = sut.$("tblHeader").trigger("focus");
		let oInvisibleText = document.getElementById($tblHeader.attr("aria-labelledby"));
		assert.equal(oInvisibleText.innerHTML, oResourceBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " Name " + oResourceBundle.getText("CONTROL_IN_COLUMN_REQUIRED") +  " . Color . Number .", "Text correctly assigned for screen reader announcement");
		assert.ok(oColumnHeader.hasListeners("_change"), "Property change event handler is added");
		assert.ok(oColumnHeader._isInColumnHeaderContext , "Label is marked as column header label");
		assert.equal(oColumn.$().attr("aria-describedby"), InvisibleText.getStaticId("sap.m", "CONTROL_IN_COLUMN_REQUIRED"), "Required state added as aria-describedby");

		oColumnHeader.setRequired(false);
		assert.notOk(oColumn.$().attr("aria-describedby"), "Label is not required any more so aria-describedby is removed");

		oColumn.setHeader(new Label({text: "Name"}));
		assert.notOk(oColumnHeader.hasListeners("_change"), "Property change event handler is removed from the old column header");
		assert.ok(!oColumnHeader._isInColumnHeaderContext , "Label is not marked as column header label");
		assert.ok(oColumn.getHeader().hasListeners("_change"), "Property change event handler is added for the new column header");

		// _setFooterAnnouncment() test
		const $tblFooter = sut.$("tblFooter").trigger("focus");
		oInvisibleText = document.getElementById($tblFooter.attr("aria-labelledby"));
		assert.equal(oInvisibleText.innerHTML, oResourceBundle.getText("ACC_CTR_TYPE_FOOTER_ROW") + " Name Greetings", "Text correctly assigned for screen reader announcement");

		// noDataText test
		oBinding.filter([new Filter("name", "Contains", "xxx")]);
		await nextUIUpdate();
		sut.$("nodata").trigger("focus");
		assert.equal(oInvisibleText.innerHTML, oResourceBundle.getText("LIST_NO_DATA"), "Text correctly assinged for screen reader announcement");

		sut.destroy();
	});

	// Test Case for general controls, but specifically MDC Table with its mdc.table.ColumnHeaderLabel
	QUnit.test("Test for required ACC with 'custom control'", async function(assert) {
		const sut = createSUT();
		sut.bActiveHeaders = true;
		const oColumn = new Column({
			header: new TestControl({label: new Label({text: "Column A", required: true})})
		});
		sut.addColumn(oColumn);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oResourceBundle = Library.getResourceBundleFor("sap.m");

		const $tblHeader = sut.$("tblHeader").trigger("focus");
		const oInvisibleText = document.getElementById($tblHeader.attr("aria-labelledby"));
		assert.equal(oInvisibleText.innerHTML, oResourceBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " Column A " + oResourceBundle.getText("CONTROL_IN_COLUMN_REQUIRED") + " .", "Text correctly assigned for screen reader announcement");

		// This is currently a gap, that is not covered yet, as the logic only handles sap.m.Label
		// assert.equal(oColumn.$().attr("aria-describedby"), InvisibleText.getStaticId("sap.m", "CONTROL_IN_COLUMN_REQUIRED"), "Required state added as aria-describedby");

		sut.destroy();
	});

	QUnit.test("_setHeaderAnnouncement with visible columns but hidden in popin", async function(assert) {
		const sut = createSUT(true, true);
		const oColumn = sut.getColumns()[0];
		oColumn.setDemandPopin(true);
		oColumn.setImportance("Low");
		sut.setHiddenInPopin(["Low"]);
		oColumn.setMinScreenWidth("480000px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $tblHeader = sut.$("tblHeader").trigger("focus");
		const oInvisibleText = document.getElementById($tblHeader.attr("aria-labelledby"));

		assert.ok(oInvisibleText.innerHTML.indexOf("Name") == -1, "Name column header is not part of the header annoucement");

		sut.destroy();
	});

	QUnit.test("ColumnListItem aria-labelledby reference to Accessibility Text", async function(assert) {
		const sut = createSUT(true, true);
		const oColumn = sut.getColumns()[1];

		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("4444px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRow = sut.getItems()[0];
		const oInvisibleText = ListBase.getInvisibleText();

		assert.equal(oRow.getDomRef().getAttribute("aria-labelledby"), null, "aria-labelledby is not set");
		oRow.$().trigger("focusin");
		assert.equal(oRow.getDomRef().getAttribute("aria-labelledby"), oInvisibleText.getId(), "reference to invisible text is added on focusin of row");
		oRow.$().trigger("focusout");
		assert.equal(oRow.getDomRef().getAttribute("aria-labelledby"), null, "reference to invisible text is removed on focusout of row");

		let oCellDomRef = oRow.getDomRef().querySelector(".sapMListTblCell");
		jQuery(oCellDomRef).trigger("focusin");
		assert.equal(oCellDomRef.getAttribute("aria-labelledby"), oInvisibleText.getId(), "reference to invisible text is added on focusin of cell");
		jQuery(oCellDomRef).trigger("focusout");
		assert.equal(oCellDomRef.getAttribute("aria-labelledby"), null, "reference to invisible text is removed on focusout of cell");

		oCellDomRef = oRow.getDomRef().nextElementSibling.querySelector(".sapMListTblSubCnt");
		jQuery(oCellDomRef).trigger("focusin");
		assert.equal(oCellDomRef.getAttribute("aria-labelledby"), oInvisibleText.getId(), "reference to invisible text is added on focusin of pop-in");
		jQuery(oCellDomRef).trigger("focusout");
		assert.equal(oCellDomRef.getAttribute("aria-labelledby"), null, "reference to invisible text is removed on focusout of pop-in");

		sut.destroy();
	});

	QUnit.test("Accessibility Test for ColumnListItem", function(assert) {
		const oListItem = new ColumnListItem({
			type: "Navigation",
			header: "header",
			cells: [
				new Label({required: true, text: "Max"}),
				new Label({text: "Mustermann"}),
				new CheckBox()
			]
		});
		const oBundle = Library.getResourceBundleFor("sap.m");
		const oTable = new Table({
			mode: "MultiSelect",
			header: "header",
			columns: [
				new Column({width: "15rem", header: new Label({text: "First Name"})}),
				new Column({width: "15rem", header: new Label({text: "Last Name"})}),
				new Column({width: "15rem", header: new Label({text: "Available"})})
			],
			items: oListItem
		});

		const aColumns = oTable.getColumns();
		const sRequired = oBundle.getText("ELEMENT_REQUIRED");

		assert.strictEqual(oListItem.getContentAnnouncement(),
							"First Name Max " + sRequired + " . Last Name Mustermann . Available Checkbox Not Checked",
							"Content announcement for ColumnListItem");
		assert.strictEqual(oListItem.getAccessibilityInfo().description,
							oBundle.getText("LIST_ITEM_NAVIGATION") + " . " + "First Name Max " + sRequired + " . Last Name Mustermann . Available Checkbox Not Checked",
							"Announcement of required state");

		aColumns[0].setOrder(1);
		aColumns[1].setOrder(0);
		assert.strictEqual(oListItem.getContentAnnouncement(),
							"Last Name Mustermann . First Name Max " + sRequired + " . Available Checkbox Not Checked",
							"Accessibility order is updated");

		assert.strictEqual(oListItem.getContentAnnouncementOfCell(aColumns[0]), "Max Required");
		assert.strictEqual(oListItem.getContentAnnouncementOfCell(aColumns[1]), "Mustermann");
		assert.strictEqual(oListItem.getContentAnnouncementOfCell(aColumns[2]), "Checkbox Not Checked");

		const oVisiblePopinStub = sinon.stub(oTable, "_getVisiblePopin").returns([aColumns[1], aColumns[2]]);
		assert.strictEqual(oListItem.getContentAnnouncementOfPopin(), "Last Name Mustermann . Available Checkbox Not Checked");
		oVisiblePopinStub.reset();
		oTable.destroy();
	});

	QUnit.test("Internal SelectAll checkbox should not be disabled by the EnabledPropagator", async function(assert) {
		const sut = createSUT(true, false, "MultiSelect"),
			oVerticalLayout = new VerticalLayout({
				enabled: false,
				content: [sut]
			});

		oVerticalLayout.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.strictEqual(sut._getSelectAllCheckbox().getEnabled(), true, "SelectAll checkbox control was not disabled by the EnabledPropagator");
		oVerticalLayout.destroy();
	});

	QUnit.test("ARIA Roles, Attributes, ...", async function(assert) {
		const sut = createSUT(true, true, "MultiSelect");
		sut.addAriaLabelledBy("idTitle");
		sut.getItems()[0].setType("Navigation");
		sut.getItems()[0].setHighlight("Error");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(sut.getAriaRole(), "grid", "Grid role attribute returned for table control");
		assert.equal(sut.$("listUl").attr("role"), "grid", "grid role attribute is applied in DOM");

		assert.ok(sut.$().length > 0, "Table in DOM tree");

		assert.notOk(sut.$().attr("role"), "Container has no ARIA role");

		const aLabels = sut.$("listUl").attr("aria-labelledby").split(" ");
		assert.ok(aLabels[0] === "idTitle" && aLabels[1] === sut.getHeaderToolbar().getTitleId(), "aria-labelledby set correctly");
		assert.equal(sut.$("listUl").attr("role"), "grid", "Table has the ARIA role grid");

		function checkCells(sCellType) {
			const $Scope = sCellType === "th" ? sut.$() : sut.getItems()[0].$();
			$Scope.find(sCellType).each(function(idx, cell) {
				const bHidden = idx < 1 || idx >= 3 + sut.getColumns().length;
				if (bHidden) {
					assert.equal(jQuery(cell).attr("role"), "presentation", sCellType + " has correct ARIA role: " + idx);
				} else {
					assert.equal(jQuery(cell).attr("role") || "", sCellType === "th" ? "columnheader" : "gridcell", sCellType + " has correct ARIA role: " + idx);
				}
			});
		}

		checkCells("th");
		checkCells("td");

		//clean up
		sut.destroy();
	});

	QUnit.test("Test for saptabnext", async function(assert) {
		const sut = createSUT(true);
		const oColumn = sut.getColumns()[0];
		const fnForwardTab = sinon.spy(sut, "forwardTab");
		oColumn.setFooter(new Label({text: "Greetings"}));
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		// forwardTab on tblHeader
		const $tblHeader = sut.$("tblHeader").trigger("focus");
		qutils.triggerKeydown($tblHeader, KeyCodes.TAB);
		assert.ok(fnForwardTab.getCall(0).calledWith(true), "forwardTab is called on the header");

		// forwardTab on tblFooter
		const $tblFooter = sut.$("tblFooter").trigger("focus");
		qutils.triggerKeydown($tblFooter, KeyCodes.TAB);
		assert.ok(fnForwardTab.getCall(1).calledWith(true), "forwardTab is called on the footer");

		sut.destroy();
	});

	QUnit.test("Test for onsaptabprevious", async function(assert) {
		const sut = createSUT(true, false, "MultiSelect");
		sut.setGrowing(true);
		sut.setGrowingThreshold(5);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $tblHeader = sut.$("tblHeader").trigger("focus");
		// shift-tab on header row
		qutils.triggerKeydown($tblHeader, KeyCodes.TAB, true, false, false);
		assert.equal(document.activeElement, sut.$("before")[0]);

		// trigger onsaptabnext
		qutils.triggerKeydown($tblHeader, KeyCodes.TAB);
		assert.equal(document.activeElement, sut.$("after")[0]);

		const $trigger = sut.$("trigger").first();
		assert.ok(!sut.bAnnounceDetails, "Focus is not in the table");

		// shift-tab on the trigger button
		$tblHeader.trigger("focus");
		qutils.triggerKeydown($trigger.trigger("focus"), KeyCodes.TAB, true, false, false);
		assert.ok(ListBase.getInvisibleText().getText().includes("Header Row"));
		assert.equal(document.activeElement, $tblHeader[0]);

		sut.setShowOverlay(true);
		assert.equal(document.activeElement, sut.getDomRef("overlay"));

		sut.setShowOverlay(false);
		assert.equal(document.activeElement, $tblHeader[0]);

		sut.setVisible(false).setShowOverlay(true);
		await nextUIUpdate();

		assert.notOk(sut.getDomRef("overlay"), "There is no overlay for invisible table");

		sut.setVisible(true);
		await nextUIUpdate();

		assert.ok(sut.getDomRef("overlay"), "Overlay is rendered for the visible table");

		sut.getItems()[0].focus();
		if (Device.browser.firefox) {
			// it looks like FF does not trigger the focus event because of the overlay
			sut.onfocusin(jQuery.Event("focusin", {
				target: sut.getItems()[0].getDomRef()
			}));
		}
		assert.equal(document.activeElement, sut.getDomRef("overlay"));

		const fnFocusSpy = sinon.spy(jQuery.fn, "trigger");
		qutils.triggerKeydown(sut.$("overlay"), KeyCodes.TAB, true, false, false);
		assert.ok(fnFocusSpy.calledWith("focus"), "table is focused");
		assert.equal(fnFocusSpy.getCalls().pop().thisValue[0].id, sut.getId(), "table is focused");
		assert.notOk(sut.$().attr("tabindex"), "tab index is reverted");

		fnFocusSpy.restore();
		sut.destroy();
	});

	QUnit.test("Test for checkGrowingFromScratch", async function(assert) {
		const oData = {
			items: [
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 }
			],
			cols: ["Name", "Color", "Number"]
		};

		const sut = new Table("idTblGrowing", {
			growing: true,
			growingThreshold: 5
		});

		const aColumns = oData.cols.map(function (colname) {
			if (colname === "Name") {
				return new Column({ header: new Label({ text: colname }), mergeDuplicates: true});
			}
			return new Column({ header: new Label({ text: colname })});
		});
		let i = aColumns.length;

		while (i--) {
			sut.addColumn(aColumns[aColumns.length - i - 1]);
		}

		sut.setModel(new JSONModel(oData));
		sut.bindAggregation("items", "/items", new ColumnListItem({
			cells: oData.cols.map(function (colname) {
				return new Label({ text: "{" + colname.toLowerCase() + "}" });
			})
		}));

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fnCheckGrowingFromScratch = sinon.spy(sut, "checkGrowingFromScratch");

		const iItemsLength = sut.getItems().length;
		assert.equal(iItemsLength, 5, "5 items are shown in the table, growing is not triggered");

		const $trigger = sut.$("trigger").trigger("focus");
		qutils.triggerKeydown($trigger, KeyCodes.SPACE);
		qutils.triggerKeyup($trigger, KeyCodes.SPACE);
		assert.ok(iItemsLength < sut.getItems().length, "Growing triggered via onsapspace event");
		assert.ok(fnCheckGrowingFromScratch.called, "checkGrowingFromScratch called in order to recalculate merging cells");
		fnCheckGrowingFromScratch.restore();
		sut.destroy();
	});

	QUnit.test("Test onsapspace on SelectAll checkbox", async function(assert) {
		const sut = createSUT(true, false, "MultiSelect");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $tblHeader = sut.$('tblHeader').trigger("focus");

		assert.ok(!sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is not selected");
		qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);
		assert.ok(sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is selected, relevant event for updating the checkboxes was triggered");
		sut.getItems().map(function(oItem) {
			assert.ok(oItem.getSelected());
		});

		sut.destroy();
	});

	QUnit.test("Alternate row colors", async function(assert) {
		const sut = createSUT(true);
		sut.setAlternateRowColors(true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		let oItem1 = sut.getItems()[0];
		let oItem2 = sut.getItems()[1];
		assert.ok(sut.getAlternateRowColors(), "alternateRowColors = true");
		assert.ok(oItem1.$().hasClass("sapMListTblRowAlternate"), "Alternating class added");
		assert.ok(oItem2.$().hasClass("sapMListTblRowAlternate"), "Alternating class added");
		assert.notEqual(oItem1.$().css("background-color"), oItem2.$().css("background-color"), "Background is alternating");

		// alternateRowColors in popin
		const oColumn = sut.getColumns()[1];
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("480000px");
		await nextUIUpdate();

		assert.equal(oItem1.$().css("background-color"), oItem1.$Popin().css("background-color"), "popin and item background is same");
		assert.equal(oItem2.$().css("background-color"), oItem2.$Popin().css("background-color"), "popin and item background is same");
		assert.notEqual(oItem1.$().css("background-color"), oItem2.$().css("background-color"), "Background is alternating for items");

		// alternate row colors when grouping is enabled
		const oGrouping = new Sorter("name", false, function() {
			return {
				key: "name",
				text: "name"
			};
		});
		sut.getBinding("items").sort(oGrouping);
		await nextUIUpdate();

		oItem1 = sut.getItems()[0];
		oItem2 = sut.getItems()[1];
		assert.notEqual(oItem1.$().css("background-color"), oItem2.$().css("background-color"), "Background is alternating for group rows");

		sut.destroy();
	});

	QUnit.test("Popin Layout Grid", async function(assert) {
		const sut = createSUT(true);
		const oColumn = sut.getColumns()[2];
		sut.setPopinLayout(library.PopinLayout.GridSmall);
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("400000px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(sut.getPopinLayout(), "GridSmall", "popinLayout=GridSmall, property is set correctly");
		assert.ok(jQuery(".sapMListTblSubCntGridSmall").length > 0, "DOM classes updated correctly");

		sut.setPopinLayout(library.PopinLayout.GridLarge);
		await nextUIUpdate();

		assert.equal(sut.getPopinLayout(), "GridLarge", "popinLayout=GridLarge, property is set correctly");
		assert.ok(jQuery(".sapMListTblSubCntGridLarge").length > 0, "DOM classes updated correctly");

		sut.setPopinLayout(library.PopinLayout.Block);
		await nextUIUpdate();

		assert.equal(sut.getPopinLayout(), "Block", "popinLayout=Block, property is set correctly");
		assert.equal(jQuery(".sapMListTblSubCntGridSmall").length, 0, "GridSmall style class not added");
		assert.equal(jQuery(".sapMListTblSubCntGridLarge").length, 0, "GridLarge style class not added");

		sut.destroy();
	});

	QUnit.test("Sticky Column Headers property check", async function(assert) {
		const sut = createSUT(true);
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(!sut.getSticky(), "No stickiness");
		assert.equal(sut.$().find(".sapMSticky").length, 0, "Sticky column header style class not rendered");

		sut.setSticky(["ColumnHeaders"]);
		await nextUIUpdate();
		assert.equal(sut.getSticky().length, 1, "Property set correctly");
		assert.equal(sut.getSticky()[0], "ColumnHeaders", "Stickiness set on ColumnHeaders");

		sut.destroy();
	});

	QUnit.test("Sticky class based on element visibility", async function(assert) {
		const sut = createSUT();
		sut.placeAt("qunit-fixture");
		sut.setSticky(["ColumnHeaders"]);
		await nextUIUpdate();

		assert.ok(!sut.getDomRef().classList.contains("sapMSticky4"), "Sticky column header class not added as columns are not available");

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		sut.setInfoToolbar(oInfoToolbar);

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		sut.setHeaderToolbar(oHeaderToolbar);

		sut.setSticky(["ColumnHeaders", "InfoToolbar", "HeaderToolbar"]);
		await nextUIUpdate();

		assert.ok(sut.getDomRef().classList.contains("sapMSticky3"), "Only sticky infoToolbar style class added");
		sut.getInfoToolbar().setVisible(false);
		await nextUIUpdate();
		assert.ok(sut.getDomRef().classList.contains("sapMSticky1"), "sticky infoToolbar style class removed as infoToolbar is not visible");

		sut.destroy();
	});

	QUnit.test("Initial focus position calculation", async function(assert) {
		const oButtonBefore = new Button({text: "Before"});
		const sut = createSUT(true);
		const fnSetNavigationItems = sinon.spy(sut, "setNavigationItems");

		oButtonBefore.placeAt("qunit-fixture");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		oButtonBefore.focus();
		sut.focus();
		assert.ok(fnSetNavigationItems.calledOnce);
		assert.equal(sut._oItemNavigation.getFocusedIndex(), sut.getColumns().length + 1);
		fnSetNavigationItems.reset();

		oButtonBefore.focus();
		sut.getItems().forEach(function(oItem) {
			oItem.setProperty("type", "Navigation");
		});
		await nextUIUpdate();

		sut.focus();
		assert.ok(fnSetNavigationItems.calledOnce);
		assert.equal(sut._oItemNavigation.getFocusedIndex(), sut.getColumns().length + 2);
		sut.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky column headers", async function(assert) {
		this.stub(Device.system, "desktop", false);

		const sut = createSUT(true);
		const oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["ColumnHeaders"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		const aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky4"), "Sticky class added for sticky column headers only");

		const fnGetDomRef = sut.getDomRef;
		this.stub(sut, "getDomRef", function() {
			return {
				firstChild: {
					getBoundingClientRect : function() {
						return {
							bottom: 68,
							height: 48
						};
					}
				}
			};
		});

		const oFocusedItem = sut.getItems()[2];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
			return {
				top: 50
			};
		});

		oFocusedItemDomRef.focus();
		await nextAnimationFrame();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -48], true), "scrollToElement function called");

		// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
		sut.getDomRef = fnGetDomRef;

		oScrollContainer.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky infoToolbar", async function(assert) {
		this.stub(Device.system, "desktop", false);

		const sut = createSUT(true);

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		sut.setInfoToolbar(oInfoToolbar);
		const oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["InfoToolbar"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky class added for sticky infoToolbar only");

		sut.getInfoToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky2"), "Sticky classes removed");

		sut.getInfoToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky classes added");

		const oInfoToolbarContainer = oInfoToolbar.$().parent()[0];
		this.stub(oInfoToolbarContainer, "getBoundingClientRect", function() {
			return {
				bottom: 72,
				height: 32
			};
		});

		const oFocusedItem = sut.getItems()[2];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
			return {
				top: 70
			};
		});

		oFocusedItemDomRef.focus();
		await nextAnimationFrame();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -32], true), "scrollToElement function called");

		oScrollContainer.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky headerToolbar", async function(assert) {
		this.stub(Device.system, "desktop", false);

		const sut = createSUT(true);

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		sut.setHeaderToolbar(oHeaderToolbar);
		const oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["HeaderToolbar"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky class added for sticky headerToolbar only");

		sut.getHeaderToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky1"), "Sticky classes removed as no element is sticky");

		sut.getHeaderToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky classes added");

		const oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
		const fnGetDomRef = sut.getDomRef;
		this.stub(oHeaderDomRef, "getBoundingClientRect", function() {
			return {
				bottom: 88,
				height: 48
			};
		});

		this.stub(sut, "getDomRef", function() {
			return {
				querySelector: function() {
					return oHeaderDomRef;
				}
			};
		});

		const oFocusedItem = sut.getItems()[2];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
			return {
				top: 80
			};
		});

		oFocusedItemDomRef.focus();
		await nextAnimationFrame();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -48], true), "scrollToElement function called");

		// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
		sut.getDomRef = fnGetDomRef;

		oScrollContainer.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky headerToolbar, infoToolbar, Column headers", async function(assert) {
		this.stub(Device.system, "desktop", false);

		const sut = createSUT(true);

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		sut.setHeaderToolbar(oHeaderToolbar);

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		sut.setInfoToolbar(oInfoToolbar);

		const oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["HeaderToolbar", "InfoToolbar", "ColumnHeaders"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky7"), "Sticky class added for sticky headerToolbar, infoToolbar and column headers");

		sut.getHeaderToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky6"), "Sticky class updated for sticky infoToolbar and column headers");

		sut.getInfoToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky4"), "Sticky class updated for column headers");

		sut.getHeaderToolbar().setVisible(true);
		sut.getInfoToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky7"), "Sticky class added for sticky headerToolbar, infoToolbar and column headers");

		const oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
		const fnGetDomRef = sut.getDomRef;
		this.stub(oHeaderDomRef, "getBoundingClientRect", function() {
			return {
				bottom: 48,
				height: 48
			};
		});

		const oInfoToolbarContainer = sut.getDomRef().querySelector(".sapMListInfoTBarContainer");
		this.stub(oInfoToolbarContainer, "getBoundingClientRect", function() {
			return {
				bottom: 80,
				height: 32
			};
		});

		this.stub(sut, "getDomRef", function() {
			return {
				firstChild: {
					getBoundingClientRect : function() {
						return {
							bottom: 152,
							height: 48
						};
					}
				},
				querySelector: function(sSelector) {
					if (sSelector === ".sapMListHdr") {
						return oHeaderDomRef;
					} else if (sSelector === ".sapMListInfoTBarContainer") {
						return oInfoToolbarContainer;
					}
				}
			};
		});

		const oFocusedItem = sut.getItems()[2];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
			return {
				top: 140
			};
		});

		oFocusedItemDomRef.focus();
		await nextAnimationFrame();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -128], true), "scrollToElement function called");

		// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
		sut.getDomRef = fnGetDomRef;

		oScrollContainer.destroy();
	});

	QUnit.test("Column alignment", async function(assert) {
		const oHeader1 = new Text({ text: "Header1" });
		const oHeader2 = new Button({ text: "Header2" });
		const oColumn1 = new Column({ header: oHeader1 });
		const oColumn2 = new Column({ header: oHeader2, hAlign: "Center" });
		const oTable = new Table({ columns: [oColumn1, oColumn2] });
		oTable.placeAt("qunit-fixture");

		await nextUIUpdate();

		// column alignment in LTR mode
		assert.equal(oColumn1.getDomRef().firstChild.style.justifyContent, "flex-start", "Column header content is aligned to the left");
		assert.equal(oColumn2.getDomRef().firstChild.style.justifyContent, "center", "Center text alignment style class applied");

		const fnGetRTLStub = sinon.stub(Localization, "getRTL").returns(true);
		oTable.invalidate();
		await nextUIUpdate();

		// column alignment in RTL mode
		assert.equal(oColumn1.getDomRef().firstChild.style.justifyContent, "flex-end", "Column header content is aligned to the right");
		assert.equal(oColumn2.getDomRef().firstChild.style.justifyContent, "center", "Center text alignment style class applied");

		// clean up
		fnGetRTLStub.restore();
		oTable.destroy();
	});

	QUnit.test("Active Headers", async function(assert) {
		const oHeader1 = new Text({ text: "Header1" });
		const oHeader2 = new Button({ text: "Header2" });
		const oInvisibleHeader = new InvisibleText({ text: "Invisible header"});
		const oColumn1 = new Column({ header: oHeader1 });
		const oColumn2 = new Column({ header: oHeader2, hAlign: "Center" });
		const oColumn3 = new Column({ header: oInvisibleHeader});
		oColumn1.setFooter(new Label({ text: "Footer Text" }));
		const oTable = new Table({ columns: [oColumn1, oColumn2, oColumn3] });
		const fnFireEventSpy = sinon.spy(oTable, "fireEvent");

		oTable.bActiveHeaders = true;
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oColumn1.$().attr("role"), "columnheader", "role=columnheader applied to the columns");
		assert.equal(oColumn2.$().attr("role"), "columnheader", "role=columnheader applied to the columns");
		assert.equal(oColumn3.$().attr("role"), "columnheader", "role=columnheader applied to the columns");
		assert.equal(oTable.getDomRef("tblFooter").getAttribute("role"), "row", "role=row is applied to the table footer");

		assert.ok(oHeader1.$().hasClass("sapMColumnHeaderContent"), "Content class is set for the 1st header");
		assert.ok(oHeader2.$().hasClass("sapMColumnHeaderContent"), "Content class is set for the 2nd header");
		assert.ok(oInvisibleHeader.$().hasClass("sapMColumnHeaderContent"), "Content class is set for the 3rd header");

		assert.ok(oHeader1.$().parent().hasClass("sapMColumnHeader sapMColumnHeaderActive"), "1st Header wrapper has the correct classes");
		assert.equal(oHeader1.getParent().$().attr("aria-haspopup"), "dialog", "1st ColumnHeader cell has the correct aria settings");
		assert.equal(oHeader1.getParent().$().attr("tabindex"), "-1", "1st ColumnHeader cell has the correct tabindex");
		assert.equal(oHeader1.getParent().$().attr("role"), "columnheader", "1st ColumnHeader cell has the correct role");

		assert.ok(oHeader2.$().parent().hasClass("sapMColumnHeader sapMColumnHeaderActive"), "2nd Header wrapper has the correct classes");
		assert.equal(oHeader2.getParent().$().attr("aria-haspopup"), "dialog", "2nd ColumnHeader cell has the correct aria settings");
		assert.equal(oHeader2.getParent().$().attr("tabindex"), "-1", "2nd ColumnHeader cell has the correct tabindex");
		assert.equal(oHeader2.getParent().$().attr("role"), "columnheader", "2nd ColumnHeader cell has the correct role");

		const $oInvisibleTextColumn = oInvisibleHeader.$().parent();
		assert.ok($oInvisibleTextColumn.hasClass("sapMColumnHeader"), "InvisibleText header wrapper has the corrent class");
		assert.notOk($oInvisibleTextColumn.hasClass("sapMColumnHeaderActive"), "ActiveHeader class is not added to the wrapper when invisible text is used");
		assert.notOk($oInvisibleTextColumn.attr("tabindex"), "tabindex attribute is not added to the wrapper when invisible text is used");
		assert.notOk($oInvisibleTextColumn.attr("role"), "role attribute is not added to the wrapper when invisible text is used");

		oHeader1.$().trigger("tap");
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn1)), "Clicking on non-interactive header fires the columnPress event");

		oHeader1.$().parent().trigger("tap");
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn1)), "Clicking on 1st header wrapper fires the columnPress event");

		qutils.triggerKeydown(oHeader1.$().parent(), KeyCodes.SPACE);
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn1)), "Pressing space on the 1st header wrapper fires the columnPress event");

		qutils.triggerKeydown(oHeader1.$().parent(), KeyCodes.ENTER);
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn1)), "Pressing enter on the 1st header wrapper fires the columnPress event");

		fnFireEventSpy.reset();

		oHeader2.$().trigger("tap");
		assert.ok(fnFireEventSpy.notCalled, "Clicking on interactive header does not fire the columnPress event");

		oHeader2.$().parent().trigger("tap");
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn2)), "Clicking on 2nd header wrapper fires the columnPress event");

		qutils.triggerKeydown(oHeader2.$().parent(), KeyCodes.SPACE);
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn2)), "Pressing space on the 2nd header wrapper fires the columnPress event");

		qutils.triggerKeydown(oHeader2.$().parent(), KeyCodes.ENTER);
		assert.ok(fnFireEventSpy.lastCall.calledWith("columnPress", sinon.match.has("column", oColumn2)), "Pressing enter on the 2nd header wrapper fires the columnPress event");

		oTable.destroy();
	});

	QUnit.test("Active headers keyboard handling - F2 & F7", async function(assert) {
		const oTable = new Table({
			columns: [
				new Column({
					header: new Label({text: "Column 1"})
				}),
				new Column({
					header: new Button({text: "Column 2"})
				})
			]
		});

		oTable.bActiveHeaders = true;

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oTblHeader = oTable.getDomRef("tblHeader");
		const oFirstColumnHeaderCell = oTable.getColumns()[0].getDomRef();
		const oSecondColumnHeaderCell = oTable.getColumns()[1].getDomRef();
		const oSecondColumnHeader = oTable.getColumns()[1].getHeader().getDomRef();

		oFirstColumnHeaderCell.focus();
		qutils.triggerEvent("keydown", oFirstColumnHeaderCell, {code: "F2"});
		assert.strictEqual(document.activeElement, oFirstColumnHeaderCell, "focus is not changed since the header is not editable");

		oSecondColumnHeaderCell.focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.strictEqual(document.activeElement, oSecondColumnHeader, "focus is on the column header button");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.strictEqual(document.activeElement, oSecondColumnHeaderCell, "focus is on the 2nd column header cell");

		oTblHeader.focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.strictEqual(document.activeElement, oSecondColumnHeader, "focus is on the column header button");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.strictEqual(document.activeElement, oTblHeader, "focus is set on the table header row");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.strictEqual(document.activeElement, oSecondColumnHeader, "focus is on the column header button");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.strictEqual(document.activeElement, oSecondColumnHeaderCell, "focus is on the 2nd column header cell");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.strictEqual(document.activeElement, oTblHeader, "focus is set on the table header row");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.strictEqual(document.activeElement, oSecondColumnHeaderCell, "focus is on the 2nd column header cell");

		oTable.destroy();
	});

	QUnit.test("Test for ContextualWidth", async function(assert) {
		const sut = createSUT(true);
		sut.setPopinLayout(library.PopinLayout.GridSmall);

		const oColumn = sut.getColumns()[2];
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("phone");
		const oTableResizeSpy = sinon.spy(sut, "_onResize");

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(sut.getContextualWidth(), "Inherit", "ContextualWidth with initial size has been applied.");
		assert.equal(jQuery(".sapMListTblSubRow").length, 0, "by default no popin for table");

		// CSS size
		sut.setContextualWidth("200px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(sut.getContextualWidth(), "200px", "ContextualWidth with css size has been applied.");
		assert.ok(jQuery(".sapMListTblSubRow").length > 0, "popin is correct when contextualWidth is set to fixed pixel value.");

		// auto, resizeHandler
		sut.setContextualWidth("auto");

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(sut.getContextualWidth(), "auto", "ContextualWidth with auto has been applied.");

		sut._onResize({size: {width: 500}});
		assert.ok(oTableResizeSpy.called, "onresize is called");
		// inherit
		sut.setContextualWidth("Inherit");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(sut.getContextualWidth(), "Inherit", "ContextualWidth with inherit has been applied.");
		assert.equal(jQuery(".sapMListTblSubCntGridSmall").length, 0, "no popin for table when contextualWidth is set to inherit");

		sut.destroy();

	});

	QUnit.module("Paste data into the Table");

	QUnit.test("Paste to the table on input-enabled cell", async function(assert) {
		assert.expect(1);

		const table = new Table({
			columns: [
				new Column({header: new Label({text: "Last Name"})}),
				new Column({header: new Label({text: "First Name"})})
			],
			items : new ColumnListItem({
				cells: [
					new Label(),
					new Input()
				]
			})
		});
		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		const sTest = "Aa\tBb b\nCc\tDd";
		const aTestResult = [["Aa", "Bb b"],["Cc", "Dd"]];

		table.attachPaste(function(e) {
			assert.deepEqual(e.getParameter("data"), aTestResult);
		});

		table.focus();
		table.$().trigger(jQuery.Event("paste", {originalEvent:{clipboardData: {getData : function () { return sTest;}}}}));
		table.getItems()[0].getCells()[1].focus();
		table.getItems()[0].getCells()[1].$("inner").trigger(jQuery.Event("paste", {originalEvent:{clipboardData: {getData : function () { return sTest;}}}}));

		table.destroy();
	});

	QUnit.module("Forced columns");

	QUnit.test("The one column must stay in the tabular layout", async function(assert) {
		const sut = new ColumnListItem(),
			column0 = new Column({
				demandPopin : true,
				// make the column bigger than the screen
				minScreenWidth : "48000px"
			}),
			table = new Table({
				columns : column0,
				items : sut
			});

		table.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.notOk(sut.hasPopin(), "Item do not have a popin even though the column is configured to be shown as popin");
		assert.notOk(table.hasPopin(), "Table do not have a popin even though the column is configured to be shown as popin");
		assert.ok(column0._bForcedColumn, "Column0 is a forced column");

		// Act for smaller minScreenWidth property
		const column1 = new Column({
			demandPopin : true,
			minScreenWidth : "47000px",
			header: new Text({text: "Column1"})
		});
		table.addColumn(column1);
		await nextUIUpdate();

		// Assert
		assert.ok(sut.hasPopin(), "Item now has popin");
		assert.ok(table.hasPopin(), "Table now has popin");
		assert.ok(column1._bForcedColumn, "Column1 is a forced column");
		assert.notOk(column0._bForcedColumn, "Column0 is not a forced column any longer");
		assert.ok(column0.isPopin(), "Column0 is in the popin");
		assert.equal(table.$("tblHeader").text(), "Column1", "Column1 shown as a physical column even though it is configured to be shown as popin");

		// Act for no column forcing case
		const column2 = new Column({
			header: new Text({text: "Column2"})
		});
		table.addColumn(column2);
		await nextUIUpdate();

		// Assert
		assert.ok(sut.hasPopin(), "Item still has popin");
		assert.ok(table.hasPopin(), "Table still has popin");
		assert.notOk(column0._bForcedColumn, "Column0 is not a forced column any longer");
		assert.notOk(column1._bForcedColumn, "Column1 is not a forced column any longer");
		assert.ok(column0.isPopin(), "Column0 is in the popin");
		assert.ok(column1.isPopin(), "Column1 is in the popin");
		assert.equal(table.$("tblHeader").text(), "Column2", "Column2 shown as a physical column since it is not configured for being shown as popin");

		// Act for if first column visibility is set to false
		column0.setVisible(false);
		column2.setMinScreenWidth("46000px");
		column2.setDemandPopin(true);
		await nextUIUpdate();

		// Assert
		assert.equal(column0.getVisible(), false, "Column0 is not visible");
		assert.equal(column2.getMinScreenWidth(), "46000px", "Column2 minScreenWidth = 46000px");
		assert.equal(column2.getDemandPopin(), true, "Column2 getDemandPopin = true");
		assert.ok(sut.hasPopin(), "Table still has popin");
		assert.ok(column2._bForcedColumn, "Due Column0 is not visible, Column1 is in popin due its minScreenWidth is higher then of Column2, Column2 becomes as forced column");

		//Cleanup
		table.destroy();
	});

	QUnit.module("autoPopinMode", {
		beforeEach: function() {
			this.oTable = createBiggerTable();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oTable = null;
		},
		groupColumnsInfo: function(aColumns){
			const aColumnsInPopin = [];
			const aColumnsNotInPopin = [];
			const aPopinHigh = [];
			const aPopinMed = [];
			const aPopinLow = [];
			const aNoPopinHigh = [];
			const aNoPopinMed = [];
			const aNoPopinLow = [];

			aColumns.forEach(function(oColumn) {
				const bIsPopin = oColumn.isPopin();
				const sImportance = oColumn.getImportance();

				if (bIsPopin) {
					aColumnsInPopin.push(oColumn);
					if (sImportance === "High") {
						aPopinHigh.push(oColumn);
					} else if (sImportance === "Medium" || sImportance === "None") {
						aPopinMed.push(oColumn);
					} else if (sImportance === "Low") {
						aPopinLow.push(oColumn);
					}
				} else {
					aColumnsNotInPopin.push(oColumn);
					if (sImportance === "High") {
						aNoPopinHigh.push(oColumn);
					} else if (sImportance === "Medium" || sImportance === "None") {
						aNoPopinMed.push(oColumn);
					} else if (sImportance === "Low") {
						aNoPopinLow.push(oColumn);
					}
				}
			});

			return {
				"ColumnsInPopin": aColumnsInPopin,
				"ColumnsNotInPopin": aColumnsNotInPopin,
				"PopinHigh": aPopinHigh,
				"PopinMed": aPopinMed,
				"PopinLow": aPopinLow,
				"NoPopinHigh": aNoPopinHigh,
				"NoPopinMed": aNoPopinMed,
				"NoPopinLow": aNoPopinLow
			};
		},
		validateColumns: function(aColumnsInPopin, aColumnsNotInPopin){
			const oImportanceIdx = {
				"Low"    : 1,
				"None"   : 2,
				"Medium" : 2,
				"High"   : 3
			};
			let bValidation = true;

			// check if column is in pop-in area and if it is correct
			for (let i = 0; i < aColumnsInPopin.length; i++) {
				const iIndexColumnI = oImportanceIdx[aColumnsInPopin[i].getImportance()];

				for (let j = 0; j < aColumnsNotInPopin.length; j++) {
					const iIndexColumnJ = oImportanceIdx[aColumnsInPopin[i].getImportance()];

					if (iIndexColumnI > iIndexColumnJ) {
						bValidation = false;
						break;
					}
				}

				if (!bValidation) {break;}
			}
			return bValidation;
		}
	});

	QUnit.test("Set table autoPopinMode", async function (assert) {
		const oTable = this.oTable;
		assert.strictEqual(oTable.getAutoPopinMode(), false, "Default value for autoPopinMode property is false");
		oTable.setAutoPopinMode(true);
		await nextUIUpdate();
		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");
	});

	QUnit.test("Table's contextualWidth is set to 'Desktop'", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		oTable.setContextualWidth("Desktop");
		oTable.setAutoPopinMode(true);
		await nextUIUpdate();

		oTable.getColumns().forEach(function(oColumn) {
			assert.strictEqual(oColumn.getImportance(), "None", "column importance=None by default");
			assert.strictEqual(oColumn.getAutoPopinWidth(), 8, "column autoPopinWidth=8 by default");
		});

		// set random property 'importance' on table columns
		const aImportance = [ "None", "Low", "Medium", "High" ];
		aColumns.forEach(function (oColumn) {
			const sImportance = aImportance[Math.floor(Math.random() * aImportance.length)];
			oColumn.setImportance(sImportance);
		});
		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");

		const oColumnsInfo = this.groupColumnsInfo(aColumns);
		const bValidation = this.validateColumns(oColumnsInfo.ColumnsInPopin, oColumnsInfo.ColumnsNotInPopin);
		assert.strictEqual(bValidation, true,
			" Total columns: " + aColumns.length +
			" Columns not in pop-in area (H/M/L): " + oColumnsInfo.NoPopinHigh.length + "/" + oColumnsInfo.NoPopinMed.length + "/" + oColumnsInfo.NoPopinLow.length +
			" Columns in pop-in area (H/M/L): " + oColumnsInfo.PopinHigh.length + "/" + oColumnsInfo.PopinMed.length + "/" + oColumnsInfo.PopinLow.length);
	});

	QUnit.test("Table's contextualWidth is set to 'Tablet'", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		oTable.setAutoPopinMode(true);
		oTable.setContextualWidth("Tablet");
		await nextUIUpdate();
		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");

		const oColumnsInfo = this.groupColumnsInfo(aColumns);
		const bValidation = this.validateColumns(oColumnsInfo.ColumnsInPopin, oColumnsInfo.ColumnsNotInPopin);
		assert.strictEqual(bValidation, true,
			" Total columns: " + aColumns.length +
			" Columns not in pop-in area (H/M/L): " + oColumnsInfo.NoPopinHigh.length + "/" + oColumnsInfo.NoPopinMed.length + "/" + oColumnsInfo.NoPopinLow.length +
			" Columns in pop-in area (H/M/L): " + oColumnsInfo.PopinHigh.length + "/" + oColumnsInfo.PopinMed.length + "/" + oColumnsInfo.PopinLow.length);
	});

	QUnit.test("Table's contextualWidth is set to 'Phone'", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		oTable.setAutoPopinMode(true);
		oTable.setContextualWidth("Phone");
		await nextUIUpdate();
		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");

		const oColumnsInfo = this.groupColumnsInfo(aColumns);
		const bValidation = this.validateColumns(oColumnsInfo.ColumnsInPopin, oColumnsInfo.ColumnsNotInPopin);
		assert.strictEqual(bValidation, true,
			" Total columns: " + aColumns.length +
			" Columns not in pop-in area (H/M/L): " + oColumnsInfo.NoPopinHigh.length + "/" + oColumnsInfo.NoPopinMed.length + "/" + oColumnsInfo.NoPopinLow.length +
			" Columns in pop-in area (H/M/L): " + oColumnsInfo.PopinHigh.length + "/" + oColumnsInfo.PopinMed.length + "/" + oColumnsInfo.PopinLow.length);
	});

	QUnit.test("Table's contextualWidth is set to 'Small' and only the first and last column are set to high importance", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		// reset property 'importance' on table columns
		aColumns.forEach(function (oColumn) {
			oColumn.setImportance("None");
		});

		// set property 'importance' to 'High' for first and last column
		aColumns[0].setImportance("High");
		aColumns[aColumns.length - 1].setImportance("High");

		oTable.setContextualWidth("Small");
		oTable.setAutoPopinMode(true);
		await nextUIUpdate();
		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");

		assert.notOk(oTable.getColumns()[0].isPopin(), "First column is not in the popin area");
		assert.notOk(oTable.getColumns()[oTable.getColumns().length - 1].isPopin(), "last column is not in the pop-in area");
	});

	QUnit.test("Test _getInitialAccumulatedWidth and _updateAccumulatedWidth", async function(assert) {
		const sBaseFontSize = parseFloat(library.BaseFontSize) || 16;
		const oTable = new Table({
			mode: "MultiSelect",
			columns: [
				new Column({width: "125px", header: new Label({text: "First Name"})}),
				new Column({width: "auto", header: new Label({text: "Last Name"})})
			],
			items: new ColumnListItem({
				type: "Navigation",
				cells: [
					new Label({text: "Max"}),
					new Label({text: "Mustermann"})
				]
			})
		});
		await nextUIUpdate();
		const aColumns = oTable.getColumns();
		const aItems = oTable.getItems();

		// expected value is 6, 3(rem) for selection column and 3(rem) for the navigation column
		let fInitAccumulatedWidth = oTable._getInitialAccumulatedWidth(aItems);
		assert.strictEqual(fInitAccumulatedWidth, 6.25, "Initial accumulated width based on table setup is " + fInitAccumulatedWidth + "rem");

		const fAccumulatedWidth = Table._updateAccumulatedWidth(aColumns, false, fInitAccumulatedWidth);
		const fAutoPopinWidth = (parseFloat((parseFloat(aColumns[0].getWidth()).toFixed(2) / sBaseFontSize).toFixed(2))) + (fInitAccumulatedWidth + aColumns[1].getAutoPopinWidth());
		assert.ok(parseFloat(parseFloat(fAccumulatedWidth).toFixed(2)) === fAutoPopinWidth, "Expected autoPopinWidth for next column in pop-in area is " + fAccumulatedWidth + "rem");

		oTable.setInset(true);
		await nextUIUpdate();
		fInitAccumulatedWidth = oTable._getInitialAccumulatedWidth(aItems);
		assert.strictEqual(fInitAccumulatedWidth, 10.25, "Initial accumulated width is " + fAccumulatedWidth + "rem");

		document.getElementById("qunit-fixture").classList.add("sapUiSizeCompact");
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		fInitAccumulatedWidth = oTable._getInitialAccumulatedWidth(aItems);
		assert.strictEqual(fInitAccumulatedWidth, 8.25, "Initial accumulated width is " + fInitAccumulatedWidth + "rem. Since compact theme density is applied");
		oTable.destroy();
	});

	QUnit.test("Spy on _configureAutoPopin - autoPopinMode=true", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		oTable.setContextualWidth("Desktop");
		oTable.setAutoPopinMode(true);
		await nextUIUpdate();

		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");

		const fnConfigureAutoPopin = sinon.spy(oTable, "_configureAutoPopin");
		aColumns[0].setWidth("8rem");
		await nextUIUpdate();
		assert.strictEqual(fnConfigureAutoPopin.callCount, 1, "_configureAutoPopin called since column width property changed");

		aColumns[1].setVisible(false);
		await nextUIUpdate();
		assert.strictEqual(fnConfigureAutoPopin.callCount, 2, "_configureAutoPopin called since column visible property changed");

		aColumns[2].setImportance("High");
		await nextUIUpdate();
		assert.strictEqual(fnConfigureAutoPopin.callCount, 3, "_configureAutoPopin called since column importance property changed");

		aColumns[3].setAutoPopinWidth(10);
		await nextUIUpdate();
		assert.strictEqual(fnConfigureAutoPopin.callCount, 4, "_configureAutoPopin called since column autoPopinWidth property changed");
	});

	QUnit.test("Spy on _configureAutoPopin - autoPopinMode=false", async function (assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();

		oTable.setContextualWidth("Desktop");
		await nextUIUpdate();

		assert.strictEqual(oTable.getAutoPopinMode(), false, "autoPopinMode is set to false");

		const fnConfigureAutoPopin = sinon.spy(oTable, "_configureAutoPopin");
		aColumns[0].setWidth("8rem");
		aColumns[1].setVisible(false);
		aColumns[2].setImportance("High");
		aColumns[3].setAutoPopinWidth(10);

		assert.ok(aColumns[0].getWidth() === "8rem", "Width for column[0] is set to 8rem");
		assert.notOk(aColumns[1].getVisible(), "Visibility for column[1] is set to false");
		assert.ok(aColumns[2].getImportance() === "High", "Importance of column[2] is 'High'");
		assert.ok(aColumns[3].getAutoPopinWidth() === 10, "AutPopinWidth of column[3] is set to 10");
		assert.ok(fnConfigureAutoPopin.getCalls().length === 0, "Function _configureAutoPopin has been called zero times");
	});

	QUnit.test("Recalculations with autoPopinMode=true", async function(assert) {
		const oTable = this.oTable;
		// if the below function is called, then its an indicator that the recalulation for the autoPopinMode was done
		const fnGetInitialAccumulatedWidth = sinon.spy(oTable, "_getInitialAccumulatedWidth");
		const aColumns = oTable.getColumns();

		oTable.setContextualWidth("Desktop");
		oTable.setAutoPopinMode(true);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 1, "autoPopinMode calculation performed");

		oTable.setAutoPopinMode(false);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 1, "autoPopinMode=false, hence recalculation was not necessary");

		oTable.setAutoPopinMode(true);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 2, "autoPopinMode=true, hence recalculation was done");

		aColumns[1].setVisible(false);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 3, "column visibility changed, hence autoPopinMode required recalculation");

		aColumns[1].setVisible(true);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 4, "column visibility changed, hence autoPopinMode required recalculation");

		const fnOnBeforeRendering = sinon.spy(oTable, "onBeforeRendering");
		aColumns.forEach(function(oColumn) {
			oColumn.setWidth("10rem");
		});
		await nextUIUpdate();
		assert.strictEqual(fnOnBeforeRendering.callCount, 1, "onBeforeRendering of the Table is only called once");
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 5, "multiple columns width changed, but the recalulation was perfromed only once");

		aColumns.forEach(function(oColumn) {
			oColumn.setWidth("15rem");
		});
		await nextUIUpdate();
		assert.strictEqual(fnOnBeforeRendering.callCount, 2, "onBeforeRendering of the Table is only called once");
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 6, "multiple columns width changed, but the recalulation was perfromed only once");

		aColumns[2].setImportance("Low");
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 7, "column importance changed, autoPopinMode recalculation done");

		aColumns[2].setAutoPopinWidth(11);
		await nextUIUpdate();
		assert.strictEqual(fnGetInitialAccumulatedWidth.callCount, 8, "column autoPopinWidth changed, autoPopinMode recalculation done");

		oTable.getColumns().forEach(function(oColumn, iIndex) {
			if (iIndex > 1) {
				oColumn.setImportance("Low");
			}
		});
		await nextUIUpdate();

		fnOnBeforeRendering.reset();
		fnGetInitialAccumulatedWidth.reset();

		const clock = sinon.useFakeTimers();
		oTable.setContextualWidth("Phone");
		clock.tick(10);
		assert.ok(fnOnBeforeRendering.calledOnce, "Table rerendered to update popin-area");
		assert.ok(fnGetInitialAccumulatedWidth.calledOnce, "autoPopinMode recalculation happens since the rendering is started");
		clock.restore();
	});

	QUnit.test("Hide columns based on their importance", async function(assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns();
		const fnPopinChangedEvent = sinon.spy(oTable, "_firePopinChangedEvent");

		aColumns[0].setImportance("High");
		aColumns[1].setImportance("Medium");
		aColumns[2].setImportance("None");
		aColumns[3].setImportance("Low");
		aColumns[4].setImportance("Low");
		aColumns[5].setImportance("Medium");
		aColumns[6].setImportance("High");

		oTable.setAutoPopinMode(true);
		oTable.setContextualWidth("Desktop");
		await nextUIUpdate();
		await timeout();

		assert.strictEqual(oTable.getAutoPopinMode(), true, "autoPopinMode is set to true");
		assert.strictEqual(oTable._getHiddenInPopin().length, 0, "All columns are rendered as regular columns");

		oTable.setContextualWidth("Tablet");
		await nextUIUpdate();
		await timeout();

		assert.strictEqual(oTable.hasPopin(), true, "Call oTable.hasPopin(): Table has Columns in the pop-in area");
		assert.strictEqual(fnPopinChangedEvent.callCount, 1, "popinChange event fired");

		oTable.setHiddenInPopin(["None", "Low", "Medium"]);
		await nextUIUpdate();
		await timeout();

		assert.strictEqual(oTable.hasPopin(), false, "Call oTable.hasPopin(): Table has no Columns in the pop-in area");
		assert.ok(oTable._getHiddenInPopin().length > 0, "Some Columns are hidden from the pop-in area by their importance");
		assert.strictEqual(fnPopinChangedEvent.callCount, 2, "popinChange event fired");
	});

	QUnit.test("test shouldGrowingSuppressInvalidation", async function(assert) {
		const oTable = this.oTable;
		oTable.setGrowing(true);
		await nextUIUpdate();
		assert.notOk(oTable.getAutoPopinMode(), "autoPopinMode=false");
		assert.strictEqual(oTable.shouldGrowingSuppressInvalidation(), true, "Growing will suppress invalidation since autoPopinMode=false");

		oTable.setAutoPopinMode(true);
		await nextUIUpdate();
		assert.ok(oTable.getAutoPopinMode(), "autoPopinMode=true");
		assert.strictEqual(oTable.shouldGrowingSuppressInvalidation(), false, "Growing will not suppress invalidation since autoPopinMode=true");
	});

	QUnit.module("Dummy column", {
		beforeEach: async function() {
			this.sut = createSUT(true, false, "MultiSelect");
			this.sut.setFixedLayout("Strict");
			this.sut.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.sut.destroy();
		}
	});

	QUnit.test("Check if dummy column should be rendered", async function(assert) {
		assert.notOk(this.sut.shouldRenderDummyColumn(), "no dummy column since dynamic column width is available");

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("15rem");
		});
		await nextUIUpdate();

		assert.equal(this.sut.shouldRenderDummyColumn(), true, "No Dynamic column available");
		assert.equal(this.sut.$("tblHeadDummyCell").length, 1, "DummyCol rendered");

		// Dummy column should be removed when a column width is changed to a dynamic width
		// remove the width
		this.sut.getColumns()[0].setWidth();
		await nextUIUpdate();

		assert.equal(this.sut.shouldRenderDummyColumn(), false, "Dynamic column is available");
		assert.equal(this.sut.$("tblHeadDummyCell").length, 0, "DummyCol rendered");

		this.sut.getColumns()[0].setWidth("10%");
		await nextUIUpdate();

		assert.equal(this.sut.shouldRenderDummyColumn(), true, "Dynamic column is available, since all the columns have a width defined");
		assert.equal(this.sut.$("tblHeadDummyCell").length, 1, "DummyCol rendered");

		// add static width back to the column
		this.sut.getColumns()[0].setWidth();
		await nextUIUpdate();

		assert.equal(this.sut.shouldRenderDummyColumn(), false, "Column found that does not have a width defined, hence dummy column not required");
		assert.equal(this.sut.$("tblHeadDummyCell").length, 0, "DummyCol not rendered");
	});

	QUnit.test("Dummy column should not be created with fixedLayout=false", async function(assert) {
		this.sut.setFixedLayout(false);

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("15rem");
		});
		await nextUIUpdate();

		assert.notOk(this.sut.shouldRenderDummyColumn(), "Dummy column should not render since fixedLayout=false");
	});

	QUnit.test("Dummy column should not be created when there is no visible column", async function(assert) {

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn) {
			oColumn.setVisible(false);
			oColumn.setWidth("15rem");
		});
		await nextUIUpdate();

		assert.notOk(this.sut.shouldRenderDummyColumn(), "Dummy column should not render since there is no visible column");
	});

	QUnit.test("Dummy column position when table does not have popins", async function(assert) {

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("15rem");
		});
		await nextUIUpdate();

		assert.notOk(this.sut.hasPopin(), "Table does not contain popins");
		const aTHElements = this.sut.$("tblHeader").children();
		assert.ok(aTHElements[aTHElements.length - 1].classList.contains("sapMListTblDummyCell"), "Dummy column rendered as the last TH element since table does not have popins");
	});

	QUnit.test("Dummy column position when table does has popins", async function(assert) {

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn, iIndex) {
			if (iIndex === 1) {
				oColumn.setMinScreenWidth("48000px");
				oColumn.setDemandPopin(true);
			} else {
				oColumn.setWidth("15rem");
			}
		});
		await nextUIUpdate();

		assert.ok(this.sut.hasPopin(), "Table has popins");
		const aTHElements = this.sut.$("tblHeader").children();
		assert.notOk(aTHElements[aTHElements.length - 1].classList.contains("sapMListTblDummyCell"), "Dummy column not rendered as the last TH element since table has popins");
	});

	QUnit.test("Dummy cell test for GroupHeaderListItem", async function(assert) {

		const oSorter = new Sorter("name", false, true);
		this.sut.getBinding("items").sort(oSorter);
		await nextUIUpdate();

		const oGHLI = this.sut.getItems()[0];
		assert.ok(oGHLI.isA("sap.m.GroupHeaderListItem"), "Table is grouped");

		// apply static widths to all columns
		this.sut.getColumns().forEach(function(oColumn) {
			oColumn.setWidth("15rem");
		});

		await nextUIUpdate();
		assert.ok(oGHLI.getDomRef().classList.contains("sapMTableRowCustomFocus"), "GroupHeaderListItem contains sapMTableRowCustomFocus class");
		assert.ok(oGHLI.getDomRef().querySelector(".sapMListTblHighlightCell"), "GroupHeaderListItem contains sapMListTblHighlightCell class");
	});

	QUnit.test("Column width should not be larger than table", async function(assert) {
		this.sut.destroy();

		const oColumn = new Column({
			width: "48000px",
			header: new Text({
				text: "Column1"
			})
		});

		this.sut = new Table({
			fixedLayout: "Strict",
			columns: [
				oColumn
			],
			items: [
				new ColumnListItem({
					cells: [
						new Text({
							text: "Cell1"
						})
					]
				})
			]
		});

		this.sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(this.sut._bCheckLastColumnWidth, "_bCheckLastColumnWidth=true");
		await nextAnimationFrame();

		assert.ok(this.sut.$().find(".sapMListTblCell:visible").hasClass("sapMTableForcedColumn"), "sapMTableForcedColumn class added");
		assert.strictEqual(oColumn.getDomRef().style.width, "", "column occupies the available width and not bigger than the table");
		assert.notOk(this.sut._bCheckLastColumnWidth, "_bCheckLastColumnWidth=false, since _checkLastColumnWidth has been processed");

		oColumn.setWidth("10px");
		await nextUIUpdate();

		assert.ok(this.sut._bCheckLastColumnWidth, "_bCheckLastColumnWidth=true");
		assert.notOk(this.sut.$().find(".sapMListTblCell:visible").hasClass("sapMTableForcedColumn"), "sapMTableForcedColumn class not added since column is smaller than table");
	});

	QUnit.test("Column width should not be larger than table - test setTableHeaderVisibility", async function(assert) {
		this.sut.destroy();

		const oBigColumn = new Column({
			width: "48000px",
			header: new Text({
				text: "Column1"
			})
		});

		const oSmallColumn = new Column({
			width: "10rem",
			header: new Text({
				text: "Column2"
			})
		});

		this.sut = new Table({
			fixedLayout: "Strict",
			columns: [
				oSmallColumn, oBigColumn
			],
			items: [
				new ColumnListItem({
					cells: [
						new Text({
							text: "Cell1"
						}),
						new Text({
							text: "Cell2"
						})
					]
				})
			]
		});

		this.sut.placeAt("qunit-fixture");
		oSmallColumn.setVisible(false);
		await nextUIUpdate();

		await nextAnimationFrame();
		assert.ok(this.sut.$().find(".sapMListTblCell:visible").hasClass("sapMTableForcedColumn"), "sapMTableForcedColumn class added to the column");
		assert.strictEqual(oBigColumn.getDomRef().style.width, "", "column occupies the available width and not bigger than the table");
	});

	QUnit.test("sapMTableForcedColumn should be cleared if there are other columns visible", async function(assert) {
		this.sut.destroy();

		const oBigColumn = new Column({
			width: "700px",
			header: new Text({
				text: "Column1"
			})
		});

		const oSmallColumn = new Column({
			width: "300px",
			header: new Text({
				text: "Column2"
			})
		});

		this.sut = new Table({
			contextualWidth: "1200px",
			fixedLayout: "Strict",
			autoPopinMode: true,
			hiddenInPopin: ["None"],
			columns: [
				oBigColumn, oSmallColumn
			],
			items: [
				new ColumnListItem({
					cells: [
						new Text({
							text: "Cell1"
						}),
						new Text({
							text: "Cell2"
						})
					]
				})
			]
		});

		this.sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(this.sut.$("tblHeadDummyCell").length, 1, "DummyCol rendered");
		// simulate changning of table width
		this.sut.setWidth("500px");
		this.sut.setContextualWidth("500px");
		await nextUIUpdate();
		await nextAnimationFrame();

		assert.ok(this.sut.$("tblHeader").find(".sapMTableForcedColumn").length > 0, "sapMTableForcedColumn class added to the column");
		assert.notOk(oSmallColumn.getDomRef(), "Small column is hidden due to the hiddenInPopin feature");
		// simulate changing of table width
		this.sut.setWidth();
		this.sut.setContextualWidth("1200px");
		await nextUIUpdate();
		await nextAnimationFrame();

		assert.notOk(this.sut.$("tblHeader").find(".sapMTableForcedColumn").length, "sapMTableForcedColumn not found and is removed from the column");
		assert.ok(oSmallColumn.getDomRef(), "Small column is visible again");
	});

	QUnit.test("Table should update trigger button width when columns are hidden via onColumnResize and hiddenInPopin", async function(assert) {
		const done = assert.async();
		this.sut.destroy();

		const data = [
			{firstName: "Peter", lastName: "Mueller", age: 10},
			{firstName: "Petra", lastName: "Maier", age: 20},
			{firstName: "Thomas", lastName: "Smith", age: 30},
			{firstName: "John", lastName: "Williams", age: 40},
			{firstName: "Maria", lastName: "Jones", age: 50}
		];

		const oModel = new JSONModel();
		oModel.setData(data);

		this.sut = new Table({
			growing: true,
			growingThreshold: 2,
			fixedLayout: "Strict",
			hiddenInPopin: ["None"],
			columns: [
				new Column({
					width: "100px"
				}),
				new Column({
					width: "100px",
					demandPopin: true,
					minScreenWidth: "700px"
				}),
				new Column({
					width: "100px",
					demandPopin: true,
					minScreenWidth: "900px"
				})
			]
		});

		this.sut.setModel(oModel);

		this.sut.bindItems({
			path: "/",
			template : new ColumnListItem({
				cells: [
					new Text({text: "{lastName}"}),
					new Text({text: "{firstName}"}),
					new Text({text: "{age}"})
				]
			})
		});

		const fOnColumnResizeSpy = sinon.spy(this.sut, "onColumnResize");

		this.sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oTriggerDomRef = this.sut.getDomRef("trigger");
		assert.ok(fOnColumnResizeSpy.notCalled, "onColumnResize is not called yet");
		let oOldTriggerClientWidth = oTriggerDomRef.clientWidth;

		this.sut.setContextualWidth("800px");
		await nextUIUpdate();
		await timeout();

		assert.ok(fOnColumnResizeSpy.called, "onColumnResize is called since the contextualWidth changed");
		await nextAnimationFrame();

		assert.ok(oTriggerDomRef.clientWidth < oOldTriggerClientWidth, "Trigger width was adapted via onColumnResize");
		oOldTriggerClientWidth = oTriggerDomRef.clientWidth;
		this.sut.setContextualWidth("600px");
		await nextUIUpdate();
		await timeout();

		assert.ok(fOnColumnResizeSpy.called, "onColumnResize is called since the contextualWidth changed");
		await nextAnimationFrame();

		assert.ok(oTriggerDomRef.clientWidth < oOldTriggerClientWidth, "Trigger width was adapted via onColumnResize");
		done();

	});

	QUnit.module("popinChanged event", {
		beforeEach: async function() {
			this.iPopinChangedEventCounter = 0;
			this.sut = createSUT(true, true);
			this.sut.attachPopinChanged(function() {
				this.iPopinChangedEventCounter++;
			}, this);
			this.sut.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.sut.destroy();
		}
	});

	QUnit.test("Fired when filtering leads to no data and then filtering leads from no data to visible items", function(assert) {
		const clock = sinon.useFakeTimers();

		this.sut.getBinding("items").filter(new Filter("color", "EQ", "aaaa"));
		clock.tick(1);
		assert.strictEqual(this.iPopinChangedEventCounter, 1, "popinChanged event fired since filtering led to no data");

		this.sut.getBinding("items").filter(new Filter("color", "EQ", "blue"));
		clock.tick(1);
		assert.strictEqual(this.iPopinChangedEventCounter, 2, "popinChanged event fired since filtering led to visible items from no data");

		clock.restore();
	});

	QUnit.test("Not fired when filter leads to visible items", function(assert) {
		const clock = sinon.useFakeTimers();

		this.sut.getBinding("items").filter(new Filter("color", "EQ", "blue"));
		clock.tick(1);
		assert.strictEqual(this.iPopinChangedEventCounter, 0, "popinChanged event not fired");

		this.sut.getBinding("items").filter();
		clock.tick(1);
		assert.strictEqual(this.iPopinChangedEventCounter, 0, "popinChanged event not fired");

		clock.restore();
	});

	QUnit.test("parameters", async function(assert) {
		const oColumn = this.sut.getColumns()[1];
		const oColumn1 = this.sut.getColumns()[2];

		assert.expect(8);
		oColumn.setDemandPopin(true);
		oColumn.setMinScreenWidth("1000px");
		oColumn.setImportance("Low");
		oColumn1.setDemandPopin(true);
		oColumn1.setMinScreenWidth("1000px");
		this.sut.setHiddenInPopin(["Low"]);

		const popinChanged = new Promise((fnResolve) => {
			this.sut.attachEventOnce("popinChanged", function(oEvent) {
				const aVisibleInPopin = oEvent.getParameter("visibleInPopin");
				const aHiddenInPopin = oEvent.getParameter("hiddenInPopin");
				const bHasPopin = oEvent.getParameter("hasPopin");
				assert.ok(bHasPopin, "Table has popins");
				assert.strictEqual(aHiddenInPopin.length, 1, "1 column is hidden in popin");
				assert.strictEqual(aHiddenInPopin[0], oColumn, "Correct column is provided the 'hiddenInPopin' parameter");
				assert.strictEqual(aVisibleInPopin.length, 1, "There is 1 column visible in popin");
				assert.ok(aVisibleInPopin.indexOf(oColumn1) > -1, "Correct column is provided by the 'visibleInPopin' parameter");
				fnResolve();
			});
		});

		this.sut.setContextualWidth("800px");
		await nextUIUpdate();
		await popinChanged;

		const popinChangedAgain = new Promise((fnResolve) => {
			this.sut.attachEventOnce("popinChanged", function(oEvent) {
				const aVisibleInPopin = oEvent.getParameter("visibleInPopin");
				const aHiddenInPopin = oEvent.getParameter("hiddenInPopin");
				const bHasPopin = oEvent.getParameter("hasPopin");
				assert.notOk(bHasPopin, "No popins");
				assert.notOk(aHiddenInPopin.length, "No hidden in popin");
				assert.notOk(aVisibleInPopin.length, "No popins");
				fnResolve();
			});
		});

		this.sut.setContextualWidth("1200px");
		await nextUIUpdate();
		await popinChangedAgain;
	});

	QUnit.test("Changes to hiddenInPopin", async function(assert) {
		const fnFirePopinChanged = sinon.spy(this.sut, "_firePopinChangedEvent");

		this.sut.setHiddenInPopin(["Low"]);
		await nextUIUpdate();
		assert.strictEqual(fnFirePopinChanged.callCount, 1, "hiddenInPopin=Low");

		this.sut.setHiddenInPopin(["Low", "Medium"]);
		await nextUIUpdate();
		assert.strictEqual(fnFirePopinChanged.callCount, 2, "hiddenInPopin=Low,Medium");

		this.sut.setHiddenInPopin(["Low", "None"]);
		await nextUIUpdate();
		assert.strictEqual(fnFirePopinChanged.callCount, 3, "hiddenInPopin=Low,None");

		this.sut.setHiddenInPopin();
		await nextUIUpdate();
		assert.strictEqual(fnFirePopinChanged.callCount, 4, "hiddenInPopin=undefined");
	});

	QUnit.module("No data aggregation");

	QUnit.test("No Data Illustrated Message", async function(assert) {
		const sut = createSUT(true, false, "None", true);
		const oData = {
			items: [],
			cols: ["Name", "Color", "Number"]
		};
		sut.setModel(new JSONModel(oData));
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $noData = sut.$("nodata");
		const $noDataText = sut.$("nodata-text");
		assert.ok(sut.getNoData().isA("sap.m.IllustratedMessage"), "noData aggregation is of type sap.m.IllustratedMessage");
		assert.strictEqual($noDataText.children().get(0), Element.getElementById("noDataIllustratedMessage").getDomRef(), "Table's nodata-text contains figure's DOM element");

		$noData.trigger("focus");
		const sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Illustrated Message Custom Title. This is a custom description.", "Accessbility text is set correctly");

		sut.destroy();
	});

	QUnit.test("No Column Illustrated Message", async function(assert) {
		const sut = createSUT(false, false, "None", true);
		const oBundle = Library.getResourceBundleFor("sap.m");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const sTitle = oBundle.getText("TABLE_NO_COLUMNS_TITLE");
		const sDescription = oBundle.getText("TABLE_NO_COLUMNS_DESCRIPTION");

		const oNoColumnsMessage = sut.getAggregation("_noColumnsMessage");
		assert.ok(oNoColumnsMessage, "_noColumnsMessage aggregation filled");
		assert.equal(oNoColumnsMessage.getTitle(), sTitle, "Correct title for illustrated message");
		assert.equal(oNoColumnsMessage.getDescription(), sDescription, "Correct description for illustrated message");

		const $noData = sut.$("nodata");
		const $noDataText = sut.$("nodata-text");
		assert.ok(sut.getNoData().isA("sap.m.IllustratedMessage"), "noData aggregation is of type sap.m.IllustratedMessage");
		assert.strictEqual($noDataText.children().get(0), oNoColumnsMessage.getDomRef(), "Table's nodata-text contains figure's DOM element");

		$noData.trigger("focus");
		const sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Illustrated Message " + sTitle + ". " + sDescription, "Accessbility text is set correctly");

		sut.setNoData(new Button({text: "Test Button"}));
		await nextUIUpdate();
		assert.ok(sut.getNoData().isA("sap.m.Button"), "noData aggregation is of type sap.m.Button");
		assert.strictEqual($noDataText.text(), oBundle.getText("TABLE_NO_COLUMNS"), "Table's nodata-text contains the text for no columns");

		sut.destroy();
	});

	QUnit.test("No Data String", async function(assert) {
		const sNoData = "Example No Data Text";
		const sut = createSUT(true, false, "None", false);
		const oData = {
			items: [],
			cols: ["Name", "Color", "Number"]
		};
		sut.setModel(new JSONModel(oData));
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $noData = sut.$().find("#" + sut.getId() + "-nodata");
		const $noDataText = sut.$().find("#" + sut.getId() + "-nodata-text");
		assert.strictEqual($noDataText.text(), "No data", "Table's standard nodata-text contains correct string");

		assert.ok($noData.find(".sapMListTblHighlightCell")[0], "Highlight cell is rendered for no-data row");
		assert.ok($noData.find(".sapMListTblNavigatedCell")[0], "Navigated cell is rendered for no-data row");

		$noData.trigger("focus");
		let sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "No data", "Accessbility text is set correctly");

		sut.setNoData(sNoData);
		await nextUIUpdate();

		assert.strictEqual(typeof sut.getNoData(), "string", "noData aggregation is of type string");
		assert.strictEqual($noDataText.text(), sNoData, "Table's nodata-text contains correct string");

		$noData.trigger("focus");
		sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), sNoData, "Accessbility text is set correctly");

		sut.destroy();
	});

	QUnit.test("No Columns String", async function (assert) {
		const sut = createSUT(false, false, "None", false);
		const oBundle = Library.getResourceBundleFor("sap.m");
		const oInvisibleMessage = ListBase.getInvisibleText();
		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $noData = sut.$().find("#" + sut.getId() + "-nodata");
		$noData.trigger("focus");

		assert.notOk($noData.find(".sapMListTblHighlightCell")[0], "Highlight cell is NOT rendered for no-data row since there is no column");
		assert.notOk($noData.find(".sapMListTblNavigatedCell")[0], "Navigated cell is NOT rendered for no-data row since there is no column");

		let $noDataText = sut.$().find("#" + sut.getId() + "-nodata-text");
		assert.strictEqual($noDataText.attr("colspan"), "2", "nodata cell covers 2 header cells(Higlight and Navigated) rendered");
		assert.strictEqual($noDataText.text(), oBundle.getText("TABLE_NO_COLUMNS"), "Table's no columns nodata-text contains correct string");
		assert.strictEqual(oInvisibleMessage.getText(), oBundle.getText("TABLE_NO_COLUMNS"), "Invisible Message is set correct.");
		await timeout();

		sut.setNoData();
		$noData.trigger("focus");

		$noDataText = sut.$().find("#" + sut.getId() + "-nodata-text");
		assert.strictEqual($noDataText.text(), oBundle.getText("TABLE_NO_COLUMNS"), "Table's no columns nodata-text contains correct string");
		assert.strictEqual(oInvisibleMessage.getText(), oBundle.getText("TABLE_NO_COLUMNS"), "Invisible Message is set correct.");

		sut.setNoData(new IllustratedMessage());
		await timeout();

		sut.setNoData();
		await nextUIUpdate();

		$noData.trigger("focus");
		const oNoColumnsMessage = sut.getAggregation("_noColumnsMessage");
		assert.strictEqual($noDataText.children().get(0), oNoColumnsMessage.getDomRef(), "Table's nodata-text contains figure's DOM element");
		assert.strictEqual(oInvisibleMessage.getText(), oBundle.getText("TABLE_NO_COLUMNS"), "Invisible Message is set correct.");

		sut.destroy();
	});

	QUnit.test("No Data Control", async function(assert) {
		const sut = createSUT(true, false, "None", false);
		const oData = {
			items: [],
			cols: ["Name", "Color", "Number"]
		};
		sut.setModel(new JSONModel(oData));
		sut.placeAt("qunit-fixture");

		let oControl = new Button({text: "Button 1"});
		sut.setNoData(oControl);
		await nextUIUpdate();

		const $noData = sut.$().find("#" + sut.getId() + "-nodata");
		const $noDataText = sut.$().find("#" + sut.getId() + "-nodata-text");
		assert.ok(sut.getNoData().isA("sap.m.Button"), "Table's no data aggregation is a button");
		assert.equal(sut.getNoData().getText(), oControl.getText(), "Table's no data aggregation has correct button text");
		assert.strictEqual($noDataText.children().get(0), oControl.getDomRef(), "Table's nodata-text contains button's DOM element");

		$noData.trigger("focus");
		let sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Button Button 1", "Accessbility text is set correctly");

		oControl = new Text({text: "Text 1"});
		sut.setNoData(oControl);
		await nextUIUpdate();

		assert.ok(sut.getNoData().isA("sap.m.Text"), "Table's changed no data aggregation is a text");
		assert.equal(sut.getNoData().getText(), oControl.getText(), "Table's changed no data aggregation has correct text");
		assert.strictEqual($noDataText.children().get(0), oControl.getDomRef(), "Table's changed nodata-text contains text's DOM element");

		$noData.trigger("focus");
		sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Text 1", "Accessbility text is set correctly");
	});

	QUnit.module("Keyboard Navigation for Cells", {
		beforeEach: async function() {
			this.vt = createVarietyTable();
			this.vt.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.vt.destroy();
		},
		testNavigation: function (assert, sKey, oSourceCell, oTargetCell, sSource, sTarget, bCtrlPressed) {
			oSourceCell.focus();
			qutils.triggerKeydown(document.activeElement, sKey, false, false, bCtrlPressed || false);
			assert.deepEqual(
				jQuery(document.activeElement).closest(".sapMListTblCell").get(0),
				oTargetCell.$().closest(".sapMListTblCell").get(0),
				"Navigation from Cell " + sSource + " to expected cell " + sTarget
			);
		}
	});

	QUnit.test("Tabbables", async function(assert) {
		this.vt.setMode("SingleSelectLeft");
		await nextUIUpdate();

		const o1stItem = this.vt.getItems()[0];
		assert.equal(o1stItem.getTabbables()[0], o1stItem.getModeControl().getFocusDomRef(), "the first tabbable element is checkbox");
		assert.equal(o1stItem.getTabbables(true)[0], o1stItem.getCells()[0].getFocusDomRef(), "the first tabbable element in the content is input");
	});

	QUnit.test("Navigate with CTRL + ARROW_UP", function(assert) {
		const sKey = "ARROW_UP";
		for (let iColumn = 0; iColumn < this.vt.getItems()[0].getCells().length - 1; iColumn++) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				0 + "," + iColumn,
				0 + "," + iColumn,
				true
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				1 + "," + iColumn,
				0 + "," + iColumn,
				true
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				2 + "," + iColumn,
				1 + "," + iColumn,
				true
			);
		}
		// No Navigation when TextArea is focused
		this.testNavigation(
			assert,
			sKey,
			this.vt.getItems()[1].getCells()[5],
			this.vt.getItems()[1].getCells()[5],
			1 + "," + 5,
			1 + "," + 5,
			true
		);
	});

	QUnit.test("Navigate with CTRL + ARROW_DOWN", function(assert) {
		const sKey = "ARROW_DOWN";
		for (let iColumn = 0; iColumn < this.vt.getItems()[0].getCells().length - 1; iColumn++) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				0 + "," + iColumn,
				1 + "," + iColumn,
				true
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				1 + "," + iColumn,
				2 + "," + iColumn,
				true
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				2 + "," + iColumn,
				2 + "," + iColumn,
				true
			);
		}
		// No Navigation when TextArea
		this.testNavigation(
			assert,
			sKey,
			this.vt.getItems()[1].getCells()[5],
			this.vt.getItems()[1].getCells()[5],
			1 + "," + 5,
			1 + "," + 5,
			true
		);
	});

	QUnit.test("Navigate with ARROW_UP", function(assert) {
		const sKey = "ARROW_UP";
		// Input, ComboBox, RatingIndicator, TextArea
		const aNoNavColumns = [0, 1, 4, 5];
		// CheckBox, Link
		const aNavColumns = [2, 3];

		aNoNavColumns.forEach(function (iColumn) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				0 + "," + iColumn,
				0 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				1 + "," + iColumn,
				1 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				2 + "," + iColumn,
				2 + "," + iColumn
			);
		}, this);

		aNavColumns.forEach(function (iColumn) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				0 + "," + iColumn,
				0 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				1 + "," + iColumn,
				0 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				2 + "," + iColumn,
				1 + "," + iColumn
			);
		}, this);
	});

	QUnit.test("Navigate with ARROW_DOWN", function(assert) {
		const sKey = "ARROW_DOWN";
		// Input, ComboBox, RatingIndicator, TextArea
		const aNoNavColumns = [0, 1, 4, 5];
		// CheckBox, Link
		const aNavColumns = [2, 3];

		aNoNavColumns.forEach(function (iColumn) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[0].getCells()[iColumn],
				0 + "," + iColumn,
				0 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				1 + "," + iColumn,
				1 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				2 + "," + iColumn,
				2 + "," + iColumn
			);
		}, this);

		aNavColumns.forEach(function (iColumn) {
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[0].getCells()[iColumn],
				this.vt.getItems()[1].getCells()[iColumn],
				0 + "," + iColumn,
				1 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[1].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				1 + "," + iColumn,
				2 + "," + iColumn
			);
			this.testNavigation(
				assert,
				sKey,
				this.vt.getItems()[2].getCells()[iColumn],
				this.vt.getItems()[2].getCells()[iColumn],
				2 + "," + iColumn,
				2 + "," + iColumn
			);
		}, this);
	});

	QUnit.module("ItemNavigation", {
		beforeEach: async function() {
			const oModel = new JSONModel({
				names: [
					{firstName: "Peter", lastName: "Mueller"},
					{firstName: "Petra", lastName: "Maier"},
					{firstName: "Thomas", lastName: "Smith"},
					{firstName: "John", lastName: "Williams"},
					{firstName: "Maria", lastName: "Jones"}
				]
			});

			this.oTable = new Table({
				columns: [
					// columns without "header" aggregation
					new Column(),
					new Column()
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.bindItems({
				path: "/names",
				template: new ColumnListItem({
					cells: [
						new Text({text: "{firstName}"}),
						new Text({text: "{lastName}"})
					]
				})
			});

			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("hidden column header row should not be included in the ItemNavigation items", function(assert) {
		const aItems = this.oTable.getItems(),
			oFirstItem = aItems[0],
			$tblHeader = this.oTable.$("tblHeader");

		oFirstItem.focus();
		assert.notOk($tblHeader.attr("tabindex"), "tabindex attribute is not added to hidden column header row");
		assert.ok($tblHeader.hasClass("sapMListTblHeaderNone"), "invisible table header has the correct css class");
		assert.equal($tblHeader.attr("aria-hidden"), "true", "table header has aria-hidden=true");
		assert.notOk(this.oTable._oItemNavigation.getItemDomRefs().includes($tblHeader[0]), "column header row is not in ItemNavigation items");

		qutils.triggerKeydown(document.activeElement, "END", false, false, false);
		assert.strictEqual(document.activeElement, aItems[aItems.length - 1].getFocusDomRef(), "Focus is set on the last row");

		qutils.triggerKeydown(document.activeElement, "HOME", false, false, false);
		assert.strictEqual(document.activeElement, oFirstItem.getDomRef(), "Focus is set on the first row");
	});

	QUnit.test("visible column header row should be included in the ItemNavigation items", async function(assert) {
		const oColumn = this.oTable.getColumns()[1];
		oColumn.setHeader(new Text({text: "Last Name"}));
		await nextUIUpdate();

		const $tblHeader = this.oTable.$("tblHeader");
		$tblHeader.trigger("focus");
		assert.ok($tblHeader.attr("tabindex"), "tabindex attribute is added to column header row");
		assert.notOk($tblHeader.hasClass("sapMListTblHeaderNone"), "invisible table header css class is not assigned");
		assert.notOk($tblHeader.attr("aria-hidden"), "aria-hidden is not assigned");
		assert.notOk(this.oTable._oItemNavigation.getItemDomRefs().indexOf($tblHeader[0]), "column header row is the first item of ItemNavigation");
	});

	QUnit.module("SelectAllLimit");
	QUnit.test("Test for SelectAllPopover", async function(assert) {
		const done = assert.async();

		const oData = {
			items: [
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 },
				{ name: "David", color: "green", number: 0 }
			],
			cols: ["Name", "Color", "Number"]
		};

		const Util = sap.ui.require("sap/m/table/Util");
		const sut = new Table("idTblGrowingSelectAll", {
			growing: true,
			growingThreshold: 5,
			mode: "MultiSelect",
			multiSelectMode: "SelectAll"
		});

		const aColumns = oData.cols.map(function (colname) {
			if (colname === "Name") {
				return new Column({ header: new Label({ text: colname }), mergeDuplicates: true});
			}
			return new Column({ header: new Label({ text: colname })});
		});
		let i = aColumns.length;
		while (i--) {
			sut.addColumn(aColumns[aColumns.length - i - 1]);
		}

		sut.setModel(new JSONModel(oData));
		sut.bindAggregation("items", "/items", new ColumnListItem({
			cells: oData.cols.map(function (colname) {
				return new Label({ text: "{" + colname.toLowerCase() + "}" });
			})
		}));

		sut.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fnShowSelectionLimitPopoverSpy = this.spy(Util, "showSelectionLimitPopover");
		const $trigger = sut.$("trigger").trigger("focus");
		const $tblHeader = sut.$('tblHeader').trigger("focus");
		const iItemsLength = sut.getItems().length;
		assert.equal(iItemsLength, 5, "5 items are shown in the table, growing is not triggered");
		qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);

		let oResult = await Util.getSelectAllPopover();
		let oPopover = oResult.oSelectAllNotificationPopover;
		const oResourceBundle = oResult.oResourceBundle;
		let sMessage = oResourceBundle.getText("TABLE_SELECT_LIMIT", [5]);

		await new Promise((fnResolve) => {
			oPopover.attachEventOnce("afterOpen", function() {
				assert.ok(oPopover.isOpen(), "Popover is opened since growing is enabled");
				assert.strictEqual(oPopover.getContent()[0].getText(), sMessage, "Warning message");
				assert.strictEqual(fnShowSelectionLimitPopoverSpy.callCount, 1, "Util#showSelectionLimitPopover is called when selectAll is triggerred");
				qutils.triggerKeydown($trigger, KeyCodes.SPACE);
				qutils.triggerKeyup($trigger, KeyCodes.SPACE);
				sut.attachEventOnce("updateFinished", function(){
					qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);
					fnResolve();
				});
			});
		});

		oResult = await Util.getSelectAllPopover();
		oPopover = oResult.oSelectAllNotificationPopover;

		const oBundle = oResult.oResourceBundle;
		oPopover.attachEventOnce("afterOpen", function() {
			sMessage = oBundle.getText("TABLE_SELECT_LIMIT", [10]);
			assert.ok(oPopover.isOpen(), "Popover since growing is enabled");
			assert.strictEqual(oPopover.getContent()[0].getText(), sMessage, "Warning message");
			oPopover.close();
			sut.destroy();
			done();
		});
	});

	QUnit.module("role=grid", {
		before: function() {
			this.oRB = Library.getResourceBundleFor("sap.m");
		},
		beforeEach: async function() {
			this.oTable = createVarietyTable();
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.o1stItem = this.oTable.getItems()[0];
			this.o2ndItem = this.oTable.getItems()[1];
			this.o3rdItem = this.oTable.getItems()[2];
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			delete this.oRB;
		},
		testAriaSelected: function(oDomRef) {
			QUnit.assert.equal(oDomRef.getAttribute("aria-selected"), "true");
		},
		testAriaNotSelected: function(oDomRef) {
			QUnit.assert.equal(oDomRef.getAttribute("aria-selected"), "false");
		},
		testHeaderCell: function(oHeaderCellDomRef, iColIndex, bSelected) {
			const assert = QUnit.assert;
			assert.equal(oHeaderCellDomRef.getAttribute("role"), "columnheader", oHeaderCellDomRef.id + " has the role columnheader");
			assert.equal(oHeaderCellDomRef.getAttribute("tabindex"), "-1", oHeaderCellDomRef.id + " has tabindex=-1");
			assert.ok(oHeaderCellDomRef.classList.contains("sapMTblCellFocusable"), "Focus class is set for the " + oHeaderCellDomRef.id);
			assert.equal(oHeaderCellDomRef.getAttribute("aria-colindex"), iColIndex, "aria-colindex is set correctly for the " + oHeaderCellDomRef.id);
			if (bSelected != undefined) {
				assert.equal(oHeaderCellDomRef.getAttribute("aria-selected"), bSelected.toString(), "aria-selected is set correctly for the " + oHeaderCellDomRef.id);
			}
		},
		testCell: function(oCellDomRef, iColIndex, bSelected) {
			const assert = QUnit.assert;
			assert.equal(oCellDomRef.getAttribute("role"), "gridcell", oCellDomRef.id + " has the role gridcell");
			assert.equal(oCellDomRef.getAttribute("tabindex"), "-1", oCellDomRef.id + " has tabindex=-1");
			assert.ok(oCellDomRef.classList.contains("sapMTblCellFocusable"), "Focus class is set for the " + oCellDomRef.id);
			assert.equal(oCellDomRef.getAttribute("aria-colindex"), iColIndex, "aria-colindex is set correctly for the " + oCellDomRef.id);
			if (bSelected != undefined) {
				assert.equal(oCellDomRef.getAttribute("aria-selected"), bSelected.toString(), "aria-selected is set correctly for the " + oCellDomRef.id);
			}
		},
		testAria: async function(FORMER_COLUMN_COUNT, LATTER_COLUMN_COUNT) {
			FORMER_COLUMN_COUNT = FORMER_COLUMN_COUNT || 0;
			LATTER_COLUMN_COUNT = LATTER_COLUMN_COUNT || 0;

			const assert = QUnit.assert;
			const oTable = this.oTable;

			const oNavigationRoot = oTable.getNavigationRoot();
			const oTableHeaderRow = oTable.getDomRef("tblHeader");
			const oTableFooterRow = oTable.getDomRef("tblFooter");
			const aColumns = oTable.getColumns(true);
			const aVisibleColumns = aColumns.filter((oColumn) => oColumn.getVisible());
			const aColumnsNotInPopin = aVisibleColumns.filter((oColumn) => !oColumn.isHidden());

			// navigation root
			assert.equal(oNavigationRoot.getAttribute("role"), "grid", "navigation root has the correct role");
			assert.equal(oNavigationRoot.getAttribute("aria-roledescription"), this.oRB.getText("TABLE_ROLE_DESCRIPTION"));
			assert.equal(oNavigationRoot.getAttribute("tabindex"), "0");
			assert.equal(oNavigationRoot.getAttribute("aria-colcount"), FORMER_COLUMN_COUNT + aVisibleColumns.length + LATTER_COLUMN_COUNT);
			assert.equal(oNavigationRoot.getAttribute("aria-rowcount"), oTable.getItems().length + !!oTableHeaderRow + !!oTableFooterRow);

			// header row
			assert.equal(oTableHeaderRow.getAttribute("role"), "row", "header row has the correct role");
			assert.equal(oTableHeaderRow.getAttribute("aria-rowindex"), "1");
			assert[this.oTable.hasPopin() ? "ok" : "notOk"](oTableHeaderRow.getAttribute("aria-owns"));
			assert.equal(oTableHeaderRow.getAttribute("tabindex"), "-1");
			assert.ok(oTableHeaderRow.classList.contains("sapMLIBFocusable"));
			assert.ok(oTableHeaderRow.classList.contains("sapMTableRowCustomFocus"));
			assert.equal(oTable.getDomRef("tblHeadHighlight").getAttribute("role"), "presentation");
			assert.equal(oTable.getDomRef("tblHeadNavigated").getAttribute("role"), "presentation");
			aColumnsNotInPopin.forEach((oColumn, iIndex) => {
				this.testHeaderCell(oColumn.getDomRef(), FORMER_COLUMN_COUNT + iIndex + 1);
			});

			// footer row
			assert.equal(oTableFooterRow.getAttribute("role"), "row", "footer has the correct role");
			assert.equal(oTableFooterRow.getAttribute("aria-rowindex"), oNavigationRoot.getAttribute("aria-rowcount"));
			assert.notOk(oTableFooterRow.getAttribute("aria-owns"));
			assert.equal(oTableFooterRow.getAttribute("tabindex"), "-1");
			assert.ok(oTableFooterRow.classList.contains("sapMLIBFocusable"));
			assert.ok(oTableFooterRow.classList.contains("sapMTableRowCustomFocus"));
			assert.equal(oTable.getDomRef("tblFootHighlight").getAttribute("role"), "presentation");
			assert.notOk(oTable.getDomRef("tblFootHighlight").hasAttribute("aria-hidden"));
			assert.equal(oTable.getDomRef("tblFootNavigated").getAttribute("role"), "presentation");
			assert.notOk(oTable.getDomRef("tblFootNavigated").hasAttribute("aria-hidden"));
			aColumnsNotInPopin.forEach((oColumn, iIndex) => {
				const oColumnFooterDomRef = document.getElementById(oTable.getId() + "-tblFoot" + oColumn.getId() + "-footer");
				this.testCell(oColumnFooterDomRef, FORMER_COLUMN_COUNT + iIndex + 1);
			});

			// items
			oTable.getItems().forEach((oItem) => {
				const oItemDomRef = oItem.getDomRef();
				assert.equal(oItemDomRef.getAttribute("role"), "row");
				assert.equal(oItemDomRef.getAttribute("tabindex"), "-1");
				assert.ok(oItemDomRef.classList.contains("sapMLIBFocusable"));
				assert[oTable.hasPopin() ? "ok" : "notOk"](oItemDomRef.getAttribute("aria-owns"));
				assert.equal(oItemDomRef.getAttribute("aria-rowindex"), oTable.indexOfItem(oItem) + !!oTableHeaderRow + 1);
				assert.equal(oItemDomRef.querySelector(".sapMListTblHighlightCell").getAttribute("role"), "presentation");
				assert.notOk(oItemDomRef.querySelector(".sapMListTblHighlightCell").hasAttribute("aria-hidden"));
				assert.equal(oItemDomRef.querySelector(".sapMListTblNavigatedCell").getAttribute("role"), "presentation");
				assert.notOk(oItemDomRef.querySelector(".sapMListTblNavigatedCell").hasAttribute("aria-hidden"));
				aColumns.forEach((oColumn, iIndex) => {
					if (!oColumn.isPopin() && oColumn.getVisible()) {
						const oCellDomRef = oItem.getDomRef("cell" + iIndex);
						this.testCell(oCellDomRef, oColumn.getIndex());
					}
				});
				if (oTable.hasPopin()) {
					const oCellDomRef = oItem.getDomRef("subcont");
					this.testCell(oCellDomRef, FORMER_COLUMN_COUNT + aColumnsNotInPopin.length + 1 + LATTER_COLUMN_COUNT);
				}
			});

			if (aColumns[2].getVisible()) {
				assert.ok(true, "*************** testing invisible 3rd column ***************");
				oTable.getColumns()[2].setVisible(false);
				await nextUIUpdate();
				return this.testAria.apply(this, arguments);
			}

			if (!oTable.hasPopin()) {
				assert.ok(true, "*************** testing table with popin ***************");
				oTable.getColumns()[0].setDemandPopin(true);
				oTable.getColumns()[0].setMinScreenWidth("10000px");
				await nextUIUpdate();
				return this.testAria.apply(this, arguments);
			}
		}
	});

	QUnit.test("aria - default", async function(assert) {
		await this.testAria();
	});

	QUnit.test("aria - selection", async function(assert) {
		this.oTable.setMode("MultiSelect");
		await nextUIUpdate();
		await this.testAria(1);

		this.testHeaderCell(this.oTable.getDomRef("tblHeadModeCol"), 1, false);
		this.testCell(this.o1stItem.getDomRef("ModeCell"), 1, false);
		this.testCell(this.oTable.getDomRef("tblFootModeCol"), 1);

		this.oTable.selectAll();
		this.oTable.getDomRef("tblHeader").querySelectorAll(".sapMLIBFocusable,.sapMTblCellFocusable").forEach(this.testAriaSelected);
		this.oTable.getDomRef("tblBody").querySelectorAll(".sapMLIBFocusable,.sapMTblCellFocusable").forEach(this.testAriaSelected);

		this.oTable.removeSelections();
		this.oTable.getDomRef("tblHeader").querySelectorAll(".sapMLIBFocusable,.sapMTblCellFocusable").forEach(this.testAriaNotSelected);
		this.oTable.getDomRef("tblBody").querySelectorAll(".sapMLIBFocusable,.sapMTblCellFocusable").forEach(this.testAriaNotSelected);
	});

	QUnit.test("aria - row actions", async function(assert) {
		this.o1stItem.setType("Navigation");
		this.oTable.setMode("Delete");
		await nextUIUpdate();
		await this.testAria(0, 2);

		const iColumnsLength = this.oTable.getColumns().filter(function(oColumn) {
			return oColumn.getVisible() && !oColumn.isPopin();
		}).length;

		this.testHeaderCell(this.oTable.getDomRef("tblHeadNav"), iColumnsLength + 1);
		this.testCell(this.o1stItem.getDomRef("TypeCell"), iColumnsLength + 1);
		this.testCell(this.oTable.getDomRef("tblFootNav"), iColumnsLength + 1);
		this.testHeaderCell(this.oTable.getDomRef("tblHeadModeCol"), iColumnsLength + 2);
		this.testCell(this.o1stItem.getDomRef("ModeCell"), iColumnsLength + 2);
		this.testCell(this.oTable.getDomRef("tblFootModeCol"), iColumnsLength + 2);

		assert.equal(this.oTable.getDomRef("tblHeadModeCol").getAttribute("aria-label"), this.oRB.getText("TABLE_ROW_ACTION"));
		assert.equal(this.oTable.getDomRef("tblHeadModeCol").getAttribute("aria-label"), this.oRB.getText("TABLE_ROW_ACTION"));
	});


	QUnit.test("Up/Down/Home/End/PageUp/PageDown/AltUp/AltDown", function(assert) {
		const oTable = this.oTable;

		oTable.focus();
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		assert.equal(document.activeElement, this.o2ndItem.getFocusDomRef(), "Focus is on the second row");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "PAGE_DOWN");
		assert.equal(document.activeElement, oTable.getDomRef("tblFooter"), "Focus is on the footer row");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP");
		assert.equal(document.activeElement, this.o3rdItem.getFocusDomRef(), "Focus is on the third row");

		qutils.triggerKeydown(document.activeElement, "PAGE_UP");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "PAGE_UP");
		assert.equal(document.activeElement, oTable.getDomRef("tblHeader"), "Focus is on the header row");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", false, true /* ALT */);
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", false, true /* ALT */);
		assert.equal(document.activeElement, oTable.getDomRef("tblFooter"), "Focus is on the footer row");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP", false, true /* ALT */);
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the fist row");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP", false, true /* ALT */);
		assert.equal(document.activeElement, oTable.getDomRef("tblHeader"), "Focus is on the header row");

		qutils.triggerKeydown(document.activeElement, "TAB");
		assert.equal(document.activeElement, oTable.getDomRef("after"), "Focus is left the table");
	});

	QUnit.test("Left/Right/Up/Down/End/Home/F2/F7/Enter", function(assert) {
		const oTable = this.oTable;
		const aColumns = oTable.getColumns(true);

		this.oTable.focus();
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "ARROW_RIGHT");
		assert.equal(document.activeElement,  this.o1stItem.getDomRef("cell0"), "Focus is on the first cell of the first row");

		qutils.triggerKeydown(document.activeElement, "END");
		assert.equal(document.activeElement, this.o1stItem.$().find(".sapMTblCellFocusable").last()[0], "Focus is on the last focusable DOM node of the 1st row");

		qutils.triggerKeydown(document.activeElement, "END");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the 1st row");

		qutils.triggerKeydown(document.activeElement, "ARROW_RIGHT");
		qutils.triggerKeydown(document.activeElement, "ARROW_RIGHT");
		assert.equal(document.activeElement, this.o1stItem.getDomRef("cell1"), "Focus is on the 2nd cell of the first row");

		qutils.triggerKeydown(document.activeElement, "HOME");
		assert.equal(document.activeElement, this.o1stItem.getDomRef("cell0"), "Focus is on the 1st cell of the first row");

		qutils.triggerKeydown(document.activeElement, "HOME");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the 1st row");

		qutils.triggerKeydown(document.activeElement, "HOME");
		assert.equal(document.activeElement, oTable.getDomRef("tblHeader"), "Focus is on the header row");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the 1st row");

		aColumns.forEach(function(oColumn, iIndex) {
			qutils.triggerKeydown(document.activeElement, "ARROW_RIGHT");
			assert.equal(document.activeElement, this.o1stItem.getDomRef("cell" + iIndex), "Focus is on the cell " + iIndex);
		}, this);

		aColumns.slice(0, -1).forEach(function(oColumn, iIndex) {
			const iCellIndex = aColumns.length - iIndex - 2;
			qutils.triggerKeydown(document.activeElement, "ARROW_LEFT");
			assert.equal(document.activeElement, this.o1stItem.getDomRef("cell" + iCellIndex), "Focus is on the cell " + iCellIndex);
		}, this);

		qutils.triggerKeydown(document.activeElement, "ARROW_LEFT");
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.equal(document.activeElement, this.o1stItem.getCells()[0].getFocusDomRef(), "Focus is on the first tabbable cell");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.equal(document.activeElement, this.o1stItem.getDomRef("cell0"), "Focus is on the first cell");

		qutils.triggerEvent("keydown", document.activeElement, {code: "Enter"});
		assert.equal(document.activeElement, this.o1stItem.getCells()[0].getFocusDomRef(), "Focus is on the first tabbable cell again");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.equal(document.activeElement, this.o1stItem.getFocusDomRef(), "Focus is on the first row");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
		assert.equal(document.activeElement, this.o2ndItem.getCells()[0].getFocusDomRef(), "Focus is on the first tabbable cell of 2nd item");

		qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
		assert.equal(document.activeElement, this.o2ndItem.getDomRef("cell0"), "Focus is on the first cell of the 2nd item");

		qutils.triggerKeydown(document.activeElement, "TAB", true);
		assert.equal(document.activeElement, oTable.getDomRef("before"), "Focus has left the table");
	});

	QUnit.test("Drag-and-Drop and text selection", function(assert) {
		const done = assert.async();
		const oCellDomRef = this.o1stItem.getDomRef("cell0");
		qutils.triggerMouseEvent(this.o1stItem.getCells()[0].getDomRef(), "mousedown");
		assert.notOk(oCellDomRef.getAttribute("tabindex"), "tabindex is removed on mousedown for the row");
		assert.ok(this.oTable._bMouseDown ,"mouse down flag is set on the table");

		oCellDomRef.focus();
		assert.equal(document.activeElement, this.o1stItem.getDomRef(), "focus is on the first row, not on the cell");

		setTimeout(function() {
			assert.equal(oCellDomRef.getAttribute("tabindex"), "-1", "tabindex is restored");
			assert.notOk(this.oTable._bMouseDown ,"mouse down flag is reset on the table");
			done();
		}.bind(this));
	});
});