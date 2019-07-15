/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Icon",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnHeader",
	"sap/m/ViewSettingsPopover",
	"sap/m/ViewSettingsItem",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/Label",
	"sap/m/ColumnListItem"
], function(createAndAppendDiv, qutils, Icon, coreLibrary, JSONModel, Table, Column, ColumnHeader, ViewSettingsPopover, ViewSettingsItem, ViewSettingsFilterItem, Label, ColumnListItem) {
	"use strict";

	createAndAppendDiv("content").setAttribute("style", "height:100%;");


	function createSUT() {
		var oData = {
			items: [
				{ id: Math.random(), name: "Michelle", color: "orange", number: 3.14 },
				{ id: Math.random(), name: "Joseph", color: "blue", number: 1.618 },
				{ id: Math.random(), name: "David", color: "green", number: 0 }
			],
			cols: ["Name", "Color", "Number"]
		};
		// sap.m.Table is the system under test
		var sut = new Table();

		var aColumns = oData.cols.map(function (colname) {
				if (colname === "Name") {
					return new Column({
						header: new ColumnHeader({
							text: "Name",
							viewSettingsPopover: new ViewSettingsPopover({
								sortItems: [
									new ViewSettingsItem({
										text: "Name",
										key: "name"
									})
								],
								filterItems: [
									new ViewSettingsFilterItem({
										text: "Name",
										key: "name",
										items: [
											new ViewSettingsItem({
												text: "David",
												key: "david"
											})
										]
									})
								],
								groupItems: [
									new ViewSettingsItem({
										text: "Name",
										key: "name"
									})
								]
							})
						}),
						demandPopin: true,
						minScreenWidth: "Phone",
						popinDisplay: "Inline"
					});
				}
				return new Column({ header: new Label({ text: colname })});
			}),
			i = aColumns.length;
		while (i--) {
			sut.addColumn(aColumns[aColumns.length - i - 1]);
		}

		sut.setModel(new JSONModel(oData));
		sut.bindItems({
			 path: "/items",
			 template: new ColumnListItem({
				cells: oData.cols.map(function (colname) {
					return new Label({ text: "{" + colname.toLowerCase() + "}" });
				})
			}),
			key: "id"
		});

		return sut;
	}

	QUnit.module("ColumnHeader DOM");

	QUnit.test("Basic properties and DOM checks", function(assert) {
		var sut = createSUT();
		var oCustomTableAdapter = {
			interactive: false,
			rowAggregation: "items",
			name: "CustomTableAdapter"
		};
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oColumnHeader = sut.getColumns()[0].getHeader();
		var $oColumnHeader = oColumnHeader.$();

		assert.ok(oColumnHeader instanceof ColumnHeader, "ColumnHeader object created");
		assert.ok(oColumnHeader.getDomRef(), "ColumnHeader is in DOM tree");
		assert.ok(oColumnHeader.$().hasClass("sapMColumnHeader"), "ColumnHeader style class is set correctly");
		assert.equal(oColumnHeader.getText(), "Name", "ColumnHeader text set correctly");
		assert.ok(oColumnHeader.getTableAdapter().interactive, "ColumnHeader is interactive as configured by the table adapter");
		assert.equal($oColumnHeader.attr("tabindex"), "0", "ColumnHeader is interactive, hence it is added to tab chain");
		assert.ok(oColumnHeader.getViewSettingsPopover() instanceof ViewSettingsPopover, "ViewSettingsPopover aggregration found");

		oColumnHeader.setTableAdapter(oCustomTableAdapter);
		assert.equal(oColumnHeader.getTableAdapter().name, "CustomTableAdapter", "Table adapter was set correctly");
		assert.ok(!oColumnHeader.getAccessibilityInfo().role, "interactive=false hence no role as assigned to the control");

		sut.destroy();
	});

	QUnit.test("ColumnHeader behaviour when sorted and filtered is set explicitly during configuration", function(assert) {
		var oColumn = new Column({
			header: new ColumnHeader({
				text: "Test",
				sortOrder: "Ascending",
				sorted: true,
				filtered: true
			}),
			demandPopin: true,
			minScreenWidth : "Tablet",
			popinDisplay: "Inline"
		});
		var oItem = new ColumnListItem({});
		var sut = new Table({
			columns: oColumn,
			items: oItem
		});
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oColumn.getHeader().getAggregation("_sortIcon").getSrc(), "sap-icon://sort-ascending", "Ascending sort icon added correctly.");
		assert.equal(oColumn.getHeader().getAggregation("_filterIcon").getSrc(), "sap-icon://filter", "Filter icon is set correctly");

		sut.destroy();
	});

	QUnit.test("ColumnHeader behaviour without viewSettingsPopover", function(assert) {
		var oColumn = new Column({
			header: new ColumnHeader({
				text: "Test"
			}),
			demandPopin: true,
			minScreenWidth : "Tablet",
			popinDisplay: "Inline"
		});
		var oItem = new ColumnListItem({});
		var sut = new Table({
			columns: oColumn,
			items: oItem
		});
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(!oColumn.getHeader()._isInteractive(), "ViewSettingPopover is not defined, hence the control is not interactive");

		sut.destroy();
	});

	QUnit.test("Test for setSorted", function(assert) {
		var oColumn = new Column({
			header: new ColumnHeader({
				text: "Test"
			}),
			demandPopin: true,
			minScreenWidth : "Tablet",
			popinDisplay: "Inline"
		});
		var oItem = new ColumnListItem({});
		var sut = new Table({
			columns: oColumn,
			items: oItem
		});
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oColumnHeader = oColumn.getHeader();
		assert.ok(!oColumnHeader.getSorted(), "Default value is false");
		oColumnHeader.setSorted(false);
		assert.ok(!oColumnHeader.getSorted(), "Default value is false");
		oColumnHeader.setSortOrder("Ascending");
		assert.ok(oColumnHeader.getAggregation("_sortIcon"), "Sort icon is initialised");
		oColumnHeader.setSorted(false);
		assert.ok(!oColumnHeader.getAggregation("_sortIcon").getVisible(), "Icon is initialised but not visible as sorted=false");

		sut.destroy();
	});

	QUnit.test("ColumnHeader behavior for sorting", function(assert) {
		var sut = createSUT();
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oColumnHeader = sut.getColumns()[0].getHeader();
		var oViewSettingsPopover = oColumnHeader.getViewSettingsPopover();
		var oSortButton;

		assert.ok(!oColumnHeader.getAggregation("_sortIcon"), "Sort icon not renderered");
		assert.ok(!oColumnHeader.getSorted(), "Property sorted = false");
		assert.equal(oColumnHeader.getSortOrder(), "", "Initial value of sortOrder");

		qutils.triggerEvent("click", oColumnHeader);

		oViewSettingsPopover._segmentedButton.getItems().forEach(function(button) {
			if (button.getIcon() == "sap-icon://sort") {
				oSortButton = button;
			}
		});

		// check for Ascending
		oSortButton.firePress();
		sap.ui.getCore().applyChanges();
		assert.equal(oColumnHeader.getSortOrder(), "Ascending", "onSortSelected() executed and sortOrder = Ascending");
		assert.equal(oColumnHeader.getAggregation("_sortIcon").getSrc(), "sap-icon://sort-ascending", "Ascending sort icon added correctly.");
		assert.equal(oColumnHeader.getAccessibilityInfo().description, "Name Sorted Ascending Access column actions", "Accessibility information set correctly");

		// check for Descending
		oSortButton.firePress();
		sap.ui.getCore().applyChanges();
		assert.ok(oColumnHeader.getSorted(), "Property sorted = true");
		assert.ok(oColumnHeader.getAggregation("_sortIcon") instanceof Icon, "Sort icon aggregation found");
		assert.equal(oColumnHeader.getSortOrder(), "Descending", "onSortSelected() executed and sortOrder = Descending");
		assert.equal(oColumnHeader.getAggregation("_sortIcon").getSrc(), "sap-icon://sort-descending", "Descending sort icon added correctly.");
		assert.equal(oColumnHeader.getAccessibilityInfo().description, "Name Sorted Descending Access column actions", "Accessibility information set correctly");

		sut.destroy();
	});

	QUnit.test("ColumnHeader behavior for filtering", function(assert) {
		var sut = createSUT();
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oColumnHeader = sut.getColumns()[0].getHeader();
		var oViewSettingsPopover = oColumnHeader.getViewSettingsPopover();
		var oFilterButton, aFilterItems;

		assert.ok(!oColumnHeader.getAggregation("_filterIcon"), "Filter icon not renderered");
		assert.ok(!oColumnHeader.getFiltered(), "Initial value of filtered = false");

		oColumnHeader.setFiltered(false);
		assert.ok(!oColumnHeader.getFiltered(), "filtered property set to false");
		assert.ok(!oColumnHeader.getAggregation("_filterIcon"), "Filter icon aggregation was not affected when setFiltered(false) is called");

		qutils.triggerEvent("click", oColumnHeader);

		oViewSettingsPopover._segmentedButton.getItems().forEach(function(button) {
			if (button.getIcon() == "sap-icon://filter") {
				oFilterButton = button;
			}
		});

		oFilterButton.firePress();
		aFilterItems = oViewSettingsPopover.getFilterItems()[0].getItems();
		aFilterItems.forEach(function(item) {
			item.setSelected(true);
		});

		oViewSettingsPopover._confirmFilterDetail();
		sap.ui.getCore().applyChanges();

		assert.ok(oColumnHeader.getFiltered(), "fitlered = true, onFilterSeleted() executed");
		assert.ok(oColumnHeader.getAggregation("_filterIcon") instanceof Icon, "Filter icon aggregation found");
		assert.equal(oColumnHeader.getAggregation("_filterIcon").getSrc(), "sap-icon://filter", "Filter icon is set correctly");
		assert.equal(oColumnHeader.getAccessibilityInfo().description, "Name Filtered Access column actions", "Accessibility information set correctly");

		oColumnHeader.setFiltered(true);
		assert.ok(oColumnHeader.getAggregation("_filterIcon").getVisible(), "Filter icon is visible when setFiltered(true) is called");

		oColumnHeader.setFiltered(false);
		assert.ok(!oColumnHeader.getAggregation("_filterIcon").getVisible(), "Filter icon is not visible when setFiltered(false) is called");

		sut.destroy();
	});

	QUnit.test("ColumnHeader behavior in case of popin", function(assert) {
		var oColumn = new Column({
			header: new ColumnHeader({
				text: "Test"
			}),
			demandPopin: true,
			minScreenWidth : "48000px",
			popinDisplay: "Inline"
		});
		var oItem = new ColumnListItem({});
		var sut = new Table({
			columns: oColumn,
			items: oItem
		});

		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oColumnHeader = sut.getColumns()[0].getHeader();
		var oClonedHeader = sut.getItems()[0]._aClonedHeaders[0];
		assert.ok(sut.getColumns()[0].isPopin(), "Column rendered as popin");
		assert.equal(oColumnHeader.getText(), oClonedHeader.getText(), "ColumnHeader text is correctly set to sap.m.Label");

		sut.destroy();
	});

});