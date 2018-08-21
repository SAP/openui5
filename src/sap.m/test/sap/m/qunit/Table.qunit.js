/*global QUnit, sinon */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/qunit/QUnitUtils",
		"sap/m/TablePersoDialog",
		"sap/ui/events/KeyCodes",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		"sap/m/Table",
		"sap/m/Column",
		"sap/m/Label",
		"sap/m/Toolbar",
		"sap/m/ToolbarSpacer",
		"sap/m/Button",
		"sap/m/ColumnListItem",
		"sap/m/Text",
		"sap/m/Title",
		"sap/m/ScrollContainer",
		"sap/m/library"
	], function(qutils, TablePersoDialog, KeyCodes, JSONModel, Device, Filter, Sorter, Table, Column, Label, Toolbar, ToolbarSpacer, Button, ColumnListItem, Text, Title, ScrollContainer, library) {

		function createSUT(sId, bCreateColumns, bCreateHeader, sMode) {
			var oData = {
				items: [
					{ name: "Michelle", color: "orange", number: 3.14 },
					{ name: "Joseph", color: "blue", number: 1.618 },
					{ name: "David", color: "green", number: 0 }
				],
				cols: ["Name", "Color", "Number"]
			};
			// sap.m.Table is the system under test
			var sut = new Table(sId);

			if (bCreateColumns) {

				var aColumns = oData.cols.map(function (colname) {
					return new Column({ header: new Label({ text: colname })});
					}),
					i = aColumns.length;
				while (i--){
					sut.addColumn(aColumns[aColumns.length - i - 1]);
				}
			}

			if (bCreateHeader) {
				sut.setHeaderToolbar(new Toolbar({
					content: [
								new Label({text: "Random Data"}),
								new ToolbarSpacer({}),
								new Button("idPersonalizationButton", {
									icon: "sap-icon://person-placeholder"
								})
							]
				}));
			}

			if (sMode) {
				sut.setMode(sMode);
			}

			sut.setModel(new JSONModel(oData));
			sut.bindAggregation("items", "/items", new ColumnListItem({
				cells: oData.cols.map(function (colname) {
					return new Label({ text: "{" + colname.toLowerCase() + "}" });
				})
			}));


			return sut;
		}


		QUnit.module("Display");

		QUnit.test("Basic Properties", function(assert) {
			var sut = createSUT('idBasicPropertiesTable');
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//Check if table has been added to dom tree
			assert.ok(sut.$().length > 0, "Table in DOM tree");

			assert.ok(sut.$().find("th").hasClass("sapMTableTH"), ".sapMTableTH added to 'th' elements");

			assert.ok(!sut.$().children().hasClass("sapMTableOverlay"), "Table overlay is not rendered as showOverlay=false");
			sut.setShowOverlay(true);
			sap.ui.getCore().applyChanges();
			assert.ok(sut.$().children().hasClass("sapMTableOverlay"), "Table overlay is rendered as showOverlay=true");

			sut.setVisible(false);
			sap.ui.getCore().applyChanges();
			assert.ok(sut.$().length === 0, "Table has been removed from DOM");

			assert.equal(sut.getItemsContainerDomRef(), sut.$("tblBody")[0]);

			//clean up
			sut.destroy();
		});

		QUnit.test("Column Display", function(assert) {
			var sut = createSUT('idColumnDisplayTable', true),
				labelFilter = 'th>.sapMLabel',
				aLabels;
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//Check table columns (should be three)
			aLabels = sut.$().find(labelFilter);
			assert.ok(aLabels.length === 3, "Table has three columns rendered");
			assert.ok(aLabels[0].textContent == "Name", "First column named 'Name'");
			assert.ok(aLabels[1].textContent == "Color", "First column named 'Color'");
			assert.ok(aLabels[2].textContent == "Number", "First column named 'Number'");

			//Remove first column
			var oFirstColumn = sut.removeColumn("__column0");
			sap.ui.getCore().applyChanges();

			//Check table columns (should be two)
			aLabels = sut.$().find(labelFilter);

			assert.ok(aLabels.length === 2, "Table has three columns" );

			//Insert column again
			sut.insertColumn(oFirstColumn, 1);
			sap.ui.getCore().applyChanges();

			//Check table columns and their positions
			aLabels = sut.$().find(labelFilter);
			assert.ok(aLabels.length === 3, "Table has three columns rendered");
			assert.ok(aLabels[1].textContent == "Name", "First column named 'Name'");
			assert.ok(aLabels[0].textContent == "Color", "First column named 'Color'");
			assert.ok(aLabels[2].textContent == "Number", "First column named 'Number'");

			//remove all columns
			sut.removeAllColumns();
			sap.ui.getCore().applyChanges();
			aLabels = sut.$().find(labelFilter);
			assert.ok(aLabels.length === 0, "Table has no more columns rendered");

			//clean up
			sut.destroy();
		});

		QUnit.test("Header Toolbar Display", function(assert) {
			var sut = createSUT('idHeaderToolbarDisplayTable', true, true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//Check if header toolbar is in DOM
			var oToolBar = sut.getHeaderToolbar();
			assert.ok(oToolBar.$().length > 0, "HeaderToolbar in DOM tree");

			//clean up
			sut.destroy();
		});


		QUnit.test("Empty Table", function(assert) {
			var sut = createSUT('idEmptyTable', true, true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();


			//Check if header toolbar is in DOM

			var oData = {
				items: [],
				cols: ["Name", "Color", "Number"]
			};
			sut.setModel(new JSONModel(oData));
			sap.ui.getCore().applyChanges();

			var aNoDataRow = sut.$().find("#" + sut.getId() + "-nodata");

			assert.ok(aNoDataRow.length === 1, "Table displays 'No Data'");

			//clean up
			sut.destroy();
		});

		QUnit.test("Fixed Layout", function(assert) {
			var sut = createSUT('FixedLayoutTestTable');
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// check initial rendering
			assert.strictEqual(sut.$().find("table").css("table-layout"), "fixed", "Table has fixed layout after initial rendering");

			sut.setFixedLayout(false);
			sap.ui.getCore().applyChanges();
			assert.strictEqual(sut.$().find("table").css("table-layout"), "auto", "Table has correct layout after disabling fix layout.");

			//clean up
			sut.destroy();
		});

		QUnit.module("Modes");

		QUnit.test("MultiSelect", function(assert) {
			var sut = createSUT('idMultiSelectTable', true, true, "MultiSelect");
			var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			//Check if multiselect checkboxes are visible
			var aSelectionChecks = sut.$().find(".sapMCb");
			assert.ok(aSelectionChecks.length === 4, "Table displays selection checkboxes");

			// Check if select all checkbox has aria-label attribute
	        var $selectAllCheckBox = sut.$().find(".sapMListTblHeader .sapMCb").first();
	        assert.strictEqual($selectAllCheckBox.attr('aria-label'), oBundle.getText("TABLE_CHECKBOX_SELECT_ALL"), "The select all checkbox has an aria-label assigned");

			//Check if checkboxes are initially not selected
			var aSelectionChecksMarked = sut.$().find(".sapMCbMarkChecked");
			assert.ok(aSelectionChecksMarked.length === 0, "Selection checkboxes not checked");

			//Check if 'selectAll' marks all rows as selected
			sut.selectAll();
			sap.ui.getCore().applyChanges();

			aSelectionChecksMarked = sut.$().find(".sapMCbMarkChecked");
			assert.ok(aSelectionChecksMarked.length === 4, "Selection checkboxes ALL checked");

			//clean up
			sut.destroy();
		});

		QUnit.test("Container Padding Classes", function (assert) {
			// System under Test + Act
			var oContainer = new Table(),
				$containerContent, sResponsiveSize;

			if (Device.resize.width <= 599) {
				sResponsiveSize = "0px";
			} else if (Device.resize.width <= 1023) {
				sResponsiveSize = "16px";
			} else {
				sResponsiveSize = "16px 32px";
			}

			var aResponsiveSize = sResponsiveSize.split(" ");

			// Act
			oContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			oContainer.addStyleClass("sapUiNoContentPadding");
			$containerContent = oContainer.$();

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

		QUnit.module("TypeColumn");

		QUnit.test("TypeColumn visibility should updated correctly", function(assert) {
			var oTable = createSUT('idTypeTable', true);
			oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible by default");
			assert.strictEqual(oTable.$().find("th").last().attr("aria-hidden"), "true", "Aria hidden set correctly");

			oTable.getItems()[0].setType("Navigation");
			sap.ui.getCore().applyChanges();
			assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible when an item type is Navigation");

			oTable.getItems()[0].setType("Active");
			sap.ui.getCore().applyChanges();
			assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since Active type does not need column");

			oTable.getItems()[0].setType("Detail");
			sap.ui.getCore().applyChanges();
			assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible when an item type is Detail");

			oTable.getItems()[0].setVisible(false);
			sap.ui.getCore().applyChanges();
			assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since item is not visible");

			var oClone = oTable.getItems()[1].clone().setType("DetailAndActive");
			oTable.addItem(oClone);
			sap.ui.getCore().applyChanges();
			assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible because new type is DetailAndActive");

			oClone.destroy();
			sap.ui.getCore().applyChanges();
			assert.notOk(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is not visible since new item is destroyed");

			oTable.getItems()[0].setVisible(true);
			sap.ui.getCore().applyChanges();
			assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible because first item with type detail is visible again");

			oTable.rerender();
			assert.ok(oTable.$().find("table").hasClass("sapMListTblHasNav"), "Type column is visible rerender did not change the visibility of the type column");

			oTable.destroy();
		});

		QUnit.module("Event");

		QUnit.test("SelectAll in selectionChange event", function(assert) {
			var sut = createSUT('idMultiSelectTable', true, true, "MultiSelect");
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			sut.attachEventOnce("selectionChange", function(e) {
				assert.ok(e.getParameter("selectAll"), "selectAll parameter is true when the 'selectAll' checkbox is pressed");
			});
			var $SelectAllCheckbox = sut.$().find(".sapMCb").first().trigger("tap");

			sut.attachEventOnce("selectionChange", function(e) {
				assert.ok(!e.getParameter("selectAll"), "selectAll parameter is false when the 'selectAll' checkbox is unpressed");
			});
			$SelectAllCheckbox.trigger("tap");

			//clean up
			sut.destroy();
		});

		QUnit.module("Functionality");

		QUnit.test("Test for removeAllItems", function(assert) {
			var sut = createSUT("idTableRemoveAllItems", true, true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(sut.getItems().length > 0, "Table contains items");
			sut.removeAllItems();
			assert.ok(sut.getItems().length === 0, "Items are removed from the Table");

			sut.destroy();
		});

		QUnit.test("Test for destroyItems", function(assert) {
			var sut = createSUT("idTableDestroyItems", true, true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(sut.getItems().length > 0, "Table contains items");
			sut.destroyItems();
			assert.ok(sut.getItems().length === 0, "Items are removed from the Table");

			sut.destroy();
		});

		QUnit.test("Test for onColumnResize", function(assert) {
			this.clock = sinon.useFakeTimers();
			var oColumn = new Column({
				minScreenWidth : "tablet",
				demandPopin: true
			}),
			sut = new Table({
				columns : oColumn
			}),
			tableResizeSpy = sinon.spy(sut, "onColumnResize");

			// The table needs to be rendered for the column media object to be initialized
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oColumn._notifyResize({from: 600}); // this is the default value for minScreenWidth="phone"
			this.clock.tick(1);

			assert.ok(!tableResizeSpy.called, "Table resize not called, if media is the same");

			oColumn._notifyResize({from: 240});
			this.clock.tick(1);

			assert.ok(tableResizeSpy.called, "Table resize called, if media is different");

			sut.destroy();
		});

		QUnit.test("Test for onItemSelectedChange", function(assert) {
			var sut = createSUT("idTableSelectedChange", true, false, "MultiSelect");
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var fnOnItemSelectedChange = sinon.spy(sut, "onItemSelectedChange");

			var oItem = sut.getItems()[0];
			oItem.setSelected(true);
			assert.ok(fnOnItemSelectedChange.called, "function called as the selection changed");

			sut.destroy();
		});

		QUnit.test("Test for accessibility content", function(assert) {
			var sut = createSUT("idTableAcc", true, false);
			var oColumn = sut.getColumns()[0];
			var oBinding = sut.getBinding("items");
			oColumn.setFooter(new Label({text: "Greetings"}));
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			// accessibility role
			assert.equal(sut.getAccessibilityType(), oResourceBundle.getText("ACC_CTR_TYPE_TABLE"), "Accessilitiy role correctly set");

			// _setHeaderAnnouncement() test
			var $tblHeader = sut.$("tblHeader").focus();
			sap.ui.getCore().applyChanges();
			var $invisibleText = document.getElementById($tblHeader.attr("aria-labelledBy"));
			assert.equal($invisibleText.innerHTML, oResourceBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " Name Color Number", "Text correctly assigned for screen reader announcement");

			// _setFooterAnnouncment() test
			sut.$("tblFooter").focus();
			sap.ui.getCore().applyChanges();
			$invisibleText = document.getElementById($tblHeader.attr("aria-labelledBy"));
			assert.equal($invisibleText.innerHTML, oResourceBundle.getText("ACC_CTR_TYPE_FOOTER_ROW") + " Name Greetings", "Text correctly assigned for screen reader announcement");

			// noDataText test
			oBinding.filter([new Filter("name", "Contains", "xxx")]);
			sap.ui.getCore().applyChanges();
			sut.$("nodata").focus();
			$invisibleText = document.getElementById($tblHeader.attr("aria-labelledBy"));
			assert.equal($invisibleText.innerHTML, oResourceBundle.getText("LIST_NO_DATA"), "Text correctly assinged for screen reader announcement");

			sut.destroy();
		});

		QUnit.test("Test for isHeaderRowEvent and isFooterRowEvent using saptabnext", function(assert) {
			var sut = createSUT("idHeaderFooterEvents", true);
			var oColumn = sut.getColumns()[0];
			var fnIsHeaderRowEvent = sinon.spy(sut, "isHeaderRowEvent");
			var fnIsFooterRowEvent = sinon.spy(sut, "isFooterRowEvent");
			oColumn.setFooter(new Label({text: "Greetings"}));
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// saptabnext event on tblHeader
			var $tblHeader = sut.$("tblHeader").focus();
			qutils.triggerKeydown($tblHeader, KeyCodes.TAB);
			assert.ok(fnIsHeaderRowEvent.called, "Event was triggered on the header");

			// saptabnext on tblFooter
			var $tblFooter = sut.$("tblFooter").focus();
			qutils.triggerKeydown($tblFooter, KeyCodes.TAB);
			assert.ok(fnIsFooterRowEvent.called, "Event was triggered on the footer");

			sut.destroy();
		});

		QUnit.test("Test for onsaptabprevious", function(assert) {
			var sut = createSUT("idTableKeyboardNavigation", true, false, "MultiSelect");
			sut.setGrowing(true);
			sut.setGrowingThreshold(5);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var $tblHeader = sut.$("tblHeader").focus();
			// shift-tab on header row
			qutils.triggerKeyboardEvent($tblHeader, KeyCodes.TAB, true, false, false);
			assert.equal(document.activeElement, sut.$("before")[0]);

			// trigger onsaptabnext
			qutils.triggerKeydown($tblHeader, KeyCodes.TAB);
			assert.equal(document.activeElement, sut.$("after")[0]);

			var $trigger = sut.$("trigger").first();
			assert.ok(!sut.bAnnounceDetails, "Focus is not in the table");

			// shift-tab on from the trigger button
			qutils.triggerKeyboardEvent($trigger, KeyCodes.TAB, true, false, false);
			window.setTimeout(function() {
				assert.ok(sut.bAnnounceDetails, "Focus in back in the table");
				assert.equal(document.activeElement, $tblHeader[0]);

				sut.destroy();
			}, 0);
		});

		QUnit.test("Test for checkGrowingFromScratch", function(assert) {
			var oData = {
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

			var sut = new Table("idTblGrowing", {
				growing: true,
				growingThreshold: 5
			});

			var aColumns = oData.cols.map(function (colname) {
				if (colname === "Name") {
					return new Column({ header: new Label({ text: colname }), mergeDuplicates: true});
				}
				return new Column({ header: new Label({ text: colname })});
			}),
			i = aColumns.length;
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
			sap.ui.getCore().applyChanges();

			var fnCheckGrowingFromScratch = sinon.spy(sut, "checkGrowingFromScratch");

			var iItemsLength = sut.getItems().length;
			assert.equal(iItemsLength, 5, "5 items are shown in the table, growing is not triggered");

			var $trigger = sut.$("trigger").focus();
			qutils.triggerKeydown($trigger, KeyCodes.SPACE);
			assert.ok(iItemsLength < sut.getItems().length, "Growing triggered via onsapspace event");
			assert.ok(fnCheckGrowingFromScratch.called, "checkGrowingFromScratch called in order to recalculate merging cells");

			sut.destroy();
		});

		QUnit.test("Test onsapspace on SelectAll checkbox", function(assert) {
			var sut = createSUT("idTblSelectAllEvents", true, false, "MultiSelect");
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var $tblHeader = sut.$('tblHeader').focus();

			assert.ok(!sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is not selected");
			qutils.triggerKeydown($tblHeader, KeyCodes.SPACE);
			assert.ok(sut._selectAllCheckBox.getSelected(), "SelectAll checkbox is selected, relevant event for updating the checkboxes was triggered");
			sut.getItems().map(function(oItem) {
				assert.ok(oItem.getSelected());
			});

			sut.destroy();
		});

		QUnit.test("Alternate row colors", function(assert) {
			var sut = createSUT("idAlternateRowColors", true);
			sut.setAlternateRowColors(true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(sut.$("tblBody").hasClass("sapMListTblAlternateRowColors"), "Alternate row color class added to tbody element of the table");

			var oItem1 = sut.getItems()[0];
			var oItem2 = sut.getItems()[1];
			assert.ok(sut.getAlternateRowColors(), "alternateRowColors = true");
			assert.ok(oItem1.$().hasClass("sapMListTblRowAlternate"), "Alternating class added");
			assert.ok(!oItem2.$().hasClass("sapMListTblRowAlternate"), "Alternating class not added");

			// alternateRowColors in popin
			var oColumn = sut.getColumns()[1];
			oColumn.setDemandPopin(true);
			oColumn.setMinScreenWidth("480000px");
			sap.ui.getCore().applyChanges();
			assert.ok(sut.$("tblBody").hasClass("sapMListTblAlternateRowColorsPopin"), "Popin class for alternate row colors added to tbody element of table");

			// alternate row colors when grouping is enabled
			var oGrouping = new Sorter("name", false, function() {
				return {
					key: "name",
					text: "name"
				};
			});
			sut.getBinding("items").sort(oGrouping);
			sap.ui.getCore().applyChanges();
			assert.ok(sut.$("tblBody").hasClass("sapMListTblAlternateRowColorsGrouped"), "Grouping class for alternate row colors added to tbody element of table");

			sut.destroy();
		});

		QUnit.test("Popin Layout Grid", function(assert) {
			var aBrowsers = [
				{browser: "msie", version: null, supported: false},
				{browser: "edge", version: 15, supported: false},
				{browser: "edge", version: 16, supported: true},
				{browser: "chrome", version: null, supported: true},
				{browser: "firefox", version: null, supported: true},
				{browser: "safari", version: null, supported: true}
			];
			var oOrigDeviceBrowser = Device.browser;

			for (var i = 0; i < aBrowsers.length; i++) {
				var oStub = {};
				var bNative = !!Device.browser[aBrowsers[i].browser];

				if (aBrowsers[i].version) {
					if (Math.floor(Device.browser.version) != aBrowsers[i].version) {
						bNative = false;
						oStub.version = aBrowsers[i].version;
					}
				}
				if (!bNative) {
					for (var j = 0; j < aBrowsers.length; j++) {
						oStub[aBrowsers[j].browser] = aBrowsers[j].browser === aBrowsers[i].browser;
					}
					Device.browser = oStub;
				}

				var sMessagePrefix = "[Browser = " + aBrowsers[i].browser + (aBrowsers[i].version ? "[" + aBrowsers[i].version + "]" : "") + (bNative ? " (Native)" : "") + ", Popin Layout Grid Support expected = " + aBrowsers[i].supported + "] ";

				var sut = createSUT("idPopinLayoutGrid", true);
				var oColumn = sut.getColumns()[2];
				sut.setPopinLayout(library.PopinLayout.GridSmall);
				oColumn.setDemandPopin(true);
				oColumn.setMinScreenWidth("400000px");
				sut.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				assert.equal(sut.getPopinLayout(), "GridSmall", sMessagePrefix + "popinLayout=GridSmall, property is set correctly");
				if (aBrowsers[i].supported) {
					assert.ok(jQuery(".sapMListTblSubCntGridSmall").length > 0, sMessagePrefix + "DOM classes updated correctly");
				} else {
					assert.equal(jQuery(".sapMListTblSubCntGridSmall").length, 0, sMessagePrefix + "GridSmall style class not added");
					assert.equal(jQuery(".sapMListTblSubCntGridLarge").length, 0, sMessagePrefix + "GridLarge style class not added");
				}

				sut.setPopinLayout(library.PopinLayout.GridLarge);
				sap.ui.getCore().applyChanges();

				assert.equal(sut.getPopinLayout(), "GridLarge", sMessagePrefix + "popinLayout=GridLarge, property is set correctly");
				if (aBrowsers[i].supported) {
					assert.ok(jQuery(".sapMListTblSubCntGridLarge").length > 0, sMessagePrefix + "DOM classes updated correctly");
				} else {
					assert.equal(jQuery(".sapMListTblSubCntGridSmall").length, 0, sMessagePrefix + "GridSmall style class not added");
					assert.equal(jQuery(".sapMListTblSubCntGridLarge").length, 0, sMessagePrefix + "GridLarge style class not added");
				}

				sut.setPopinLayout(library.PopinLayout.Block);
				sap.ui.getCore().applyChanges();

				assert.equal(sut.getPopinLayout(), "Block", sMessagePrefix + "popinLayout=Block, property is set correctly");
				assert.equal(jQuery(".sapMListTblSubCntGridSmall").length, 0, sMessagePrefix + "GridSmall style class not added");
				assert.equal(jQuery(".sapMListTblSubCntGridLarge").length, 0, sMessagePrefix + "GridLarge style class not added");

				sut.destroy();

				if (!bNative) {
					Device.browser = oOrigDeviceBrowser;
				}
			}
		});

		QUnit.test("Sticky Column Headers property check", function(assert) {
			var sut = createSUT("idStickyColHdr", true);
			sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(!sut.getSticky(), "No stickiness");
			assert.equal(sut.$().find(".sapMSticky").length, 0, "Sticky column header style class not rendered");

			sut.setSticky(["ColumnHeaders"]);
			sap.ui.getCore().applyChanges();
			assert.equal(sut.getSticky().length, 1, "Property set correctly");
			assert.equal(sut.getSticky()[0], "ColumnHeaders", "Stickiness set on ColumnHeaders");

			sut.destroy();
		});

		QUnit.test("Sticky class based on element visibility", function(assert) {
			if (Device.browser.msie) {
				assert.ok(true, "Feature is not supported in IE");
			} else {
				var sut = createSUT("idStickyVisibility");
				sut.placeAt("qunit-fixture");
				sut.setSticky(["ColumnHeaders"]);
				sap.ui.getCore().applyChanges();

				assert.ok(!sut.getDomRef().classList.contains("sapMSticky4"), "Sticky column header class not added as columns are not available");

				var oInfoToolbar = new Toolbar({
					active: true,
					content: [
						new Text({
							text : "The quick brown fox jumps over the lazy dog.",
							wrapping : false
						})
					]
				});

				sut.setInfoToolbar(oInfoToolbar);

				var oHeaderToolbar = new Toolbar({
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
				sap.ui.getCore().applyChanges();

				assert.ok(sut.getDomRef().classList.contains("sapMSticky3"), "Only sticky infoToolbar style class added");
				sut.getInfoToolbar().setVisible(false);
				sap.ui.getCore().applyChanges();
				assert.ok(sut.getDomRef().classList.contains("sapMSticky1"), "sticky infoToolbar style class removed as infoToolbar is not visible");

				sut.destroy();
			}
		});

		QUnit.test("Focus and scroll handling with sticky column headers", function(assert) {
			if (Device.browser.msie) {
				assert.ok(true, "Feature is not supported in IE");
			} else {
				this.stub(Device.system, "desktop", false);
				this.clock = sinon.useFakeTimers();

				var sut = createSUT("idSut", true);
				var oScrollContainer = new ScrollContainer({
					vertical: true,
					content: sut
				});
				sut.setSticky(["ColumnHeaders"]);
				oScrollContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				var aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky4"), "Sticky class added for sticky column headers only");

				var fnGetDomRef = sut.getDomRef;
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

				var oFocusedItem = sut.getItems()[2];
				var oFocusedItemDomRef = oFocusedItem.getDomRef();
				var fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

				this.stub(window, "requestAnimationFrame", window.setTimeout);
				this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
					return {
						top: 50
					};
				});

				oFocusedItemDomRef.focus();
				this.clock.tick(0);
				assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -48]), "scrollToElement function called");

				// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
				sut.getDomRef = fnGetDomRef;

				oScrollContainer.destroy();
				// reset stub
				this.stub().reset();
			}
		});

		QUnit.test("Focus and scroll handling with sticky infoToolbar", function(assert) {
			if (Device.browser.msie) {
				assert.ok(true, "Feature is not supported in IE");
			} else {
				this.stub(Device.system, "desktop", false);
				this.clock = sinon.useFakeTimers();

				var sut = createSUT("idStickyInfoToolbar", true);

				var oInfoToolbar = new Toolbar({
					active: true,
					content: [
						new Text({
							text : "The quick brown fox jumps over the lazy dog.",
							wrapping : false
						})
					]
				});

				sut.setInfoToolbar(oInfoToolbar);
				var oScrollContainer = new ScrollContainer({
					vertical: true,
					content: sut
				});
				sut.setSticky(["InfoToolbar"]);
				oScrollContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				var aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky class added for sticky infoToolbar only");

				sut.getInfoToolbar().setVisible(false);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky2"), "Sticky classes removed");

				sut.getInfoToolbar().setVisible(true);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky classes added");

				var oInfoToolbarContainer = oInfoToolbar.$().parent()[0];
				this.stub(oInfoToolbarContainer, "getBoundingClientRect", function() {
					return {
						bottom: 72,
						height: 32
					};
				});

				var oFocusedItem = sut.getItems()[2];
				var oFocusedItemDomRef = oFocusedItem.getDomRef();
				var fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

				this.stub(window, "requestAnimationFrame", window.setTimeout);
				this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
					return {
						top: 70
					};
				});

				oFocusedItemDomRef.focus();
				this.clock.tick(0);
				assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -32]), "scrollToElement function called");

				oScrollContainer.destroy();
				// reset stub
				this.stub().reset();
			}
		});

		QUnit.test("Focus and scroll handling with sticky headerToolbar", function(assert) {
			if (Device.browser.msie) {
				assert.ok(true, "Feature is not supported in IE");
			} else {
				this.stub(Device.system, "desktop", false);
				this.clock = sinon.useFakeTimers();

				var sut = createSUT("idStickyHdrToolbar", true);

				var oHeaderToolbar = new Toolbar({
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
				var oScrollContainer = new ScrollContainer({
					vertical: true,
					content: sut
				});
				sut.setSticky(["HeaderToolbar"]);
				oScrollContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				var aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky class added for sticky headerToolbar only");

				sut.getHeaderToolbar().setVisible(false);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky1"), "Sticky classes removed as no element is sticky");

				sut.getHeaderToolbar().setVisible(true);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky classes added");

				var oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
				var fnGetDomRef = sut.getDomRef;
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

				var oFocusedItem = sut.getItems()[2];
				var oFocusedItemDomRef = oFocusedItem.getDomRef();
				var fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

				this.stub(window, "requestAnimationFrame", window.setTimeout);
				this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
					return {
						top: 80
					};
				});

				oFocusedItemDomRef.focus();
				this.clock.tick(0);
				assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -48]), "scrollToElement function called");

				// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
				sut.getDomRef = fnGetDomRef;

				oScrollContainer.destroy();
				// reset stub
				this.stub().reset();
			}
		});

		QUnit.test("Focus and scroll handling with sticky headerToolbar, infoToolbar, Column headers", function(assert) {
			if (Device.browser.msie) {
				assert.ok(true, "Feature is not supported in IE");
			} else {
				this.stub(Device.system, "desktop", false);
				this.clock = sinon.useFakeTimers();

				var sut = createSUT("idStickyToolbars", true);

				var oHeaderToolbar = new Toolbar({
					content: [
						new sap.m.Title({
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

				var oInfoToolbar = new Toolbar({
					active: true,
					content: [
						new Text({
							text : "The quick brown fox jumps over the lazy dog.",
							wrapping : false
						})
					]
				});

				sut.setInfoToolbar(oInfoToolbar);

				var oScrollContainer = new ScrollContainer({
					vertical: true,
					content: sut
				});
				sut.setSticky(["HeaderToolbar", "InfoToolbar", "ColumnHeaders"]);
				oScrollContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				var aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky7"), "Sticky class added for sticky headerToolbar, infoToolbar and column headers");

				sut.getHeaderToolbar().setVisible(false);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky6"), "Sticky class updated for sticky infoToolbar and column headers");

				sut.getInfoToolbar().setVisible(false);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky4"), "Sticky class updated for column headers");

				sut.getHeaderToolbar().setVisible(true);
				sut.getInfoToolbar().setVisible(true);
				sap.ui.getCore().applyChanges();
				aClassList = sut.$()[0].classList;
				assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky7"), "Sticky class added for sticky headerToolbar, infoToolbar and column headers");

				var oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
				var fnGetDomRef = sut.getDomRef;
				this.stub(oHeaderDomRef, "getBoundingClientRect", function() {
					return {
						bottom: 48,
						height: 48
					};
				});

				var oInfoToolbarContainer = sut.getDomRef().querySelector(".sapMListInfoTBarContainer");
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

				var oFocusedItem = sut.getItems()[2];
				var oFocusedItemDomRef = oFocusedItem.getDomRef();
				var fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

				this.stub(window, "requestAnimationFrame", window.setTimeout);
				this.stub(oFocusedItemDomRef, "getBoundingClientRect", function() {
					return {
						top: 140
					};
				});

				oFocusedItemDomRef.focus();
				this.clock.tick(0);
				assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -128]), "scrollToElement function called");

				// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
				sut.getDomRef = fnGetDomRef;

				oScrollContainer.destroy();
				// reset stub
				this.stub().reset();
			}
		});

		QUnit.test("Active Headers", function(assert) {
			var oHeader1 = new Text({ text: "Header1" });
			var oHeader2 = new Button({ text: "Header2" });
			var oColumn1 = new Column({ header: oHeader1 });
			var oColumn2 = new Column({ header: oHeader2 });
			var oTable = new Table({ columns: [oColumn1, oColumn2] });
			var fnFireEventSpy = sinon.spy(oTable, "fireEvent");

			oTable.bActiveHeaders = true;
			oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(oColumn1.$().hasClass("sapMListTblCellCH"), "ColumnHeader class is set for the 1st column");
			assert.ok(oColumn2.$().hasClass("sapMListTblCellCH"), "ColumnHeader class is set for the 2nd column");

			assert.ok(oHeader1.$().hasClass("sapMColumnHeaderContent"), "Content class is set for the 1st header");
			assert.ok(oHeader2.$().hasClass("sapMColumnHeaderContent"), "Content class is set for the 2nd header");

			assert.ok(oHeader1.$().parent().hasClass("sapMColumnHeader sapMColumnHeaderActive"), "1st Header wrapper has the correct classes");
			assert.equal(oHeader1.$().parent().attr("aria-haspopup"), "dialog", "1st Header wrapper has the correct aria settings");
			assert.equal(oHeader1.$().parent().attr("tabindex"), "0", "1st Header wrapper has the correct tabindex");
			assert.equal(oHeader1.$().parent().attr("role"), "button", "1st Header wrapper has the correct role");

			assert.ok(oHeader2.$().parent().hasClass("sapMColumnHeader sapMColumnHeaderActive"), "2nd Header wrapper has the correct classes");
			assert.equal(oHeader2.$().parent().attr("aria-haspopup"), "dialog", "2nd Header wrapper has the correct aria settings");
			assert.equal(oHeader2.$().parent().attr("tabindex"), "0", "2nd Header wrapper has the correct tabindex");
			assert.equal(oHeader2.$().parent().attr("role"), "button", "2nd Header wrapper has the correct role");

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

		QUnit.start();
	});

})();