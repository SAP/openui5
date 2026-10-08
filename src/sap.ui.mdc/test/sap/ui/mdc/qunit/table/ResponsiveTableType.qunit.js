/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ColumnSettings",
	"sap/ui/mdc/table/TableTypeBase",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/m/Text",
	"sap/m/IllustratedMessage",
	"sap/m/Menu",
	"sap/m/plugins/ColumnResizer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Boolean",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/Icon",
	"sap/ui/model/Filter",
	"sap/ui/Device",
	"sap/ui/base/DataType",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/thirdparty/jquery",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	ColumnSettingsBase,
	TableTypeBase,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	RowSettings,
	RowActionItem,
	Text,
	IllustratedMessage,
	Menu,
	ColumnResizer,
	JSONModel,
	BooleanType,
	Element,
	Lib,
	Icon,
	Filter,
	Device,
	DataType,
	VariantManagement,
	PersonalizationUtils,
	jQuery,
	TestModificationHandler
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new ResponsiveTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", function(assert) {
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "Inner table type is sap.m.Table");
		assert.ok(this.oTable._oRowTemplate.isA("sap.m.ColumnListItem"), "Row template type is sap.m.ColumnListItem");
	});

	QUnit.test("Row template when changing type", function(assert) {
		this.spy(this.oTable._oRowTemplate, "destroy");
		const oRowTemplate = this.oTable._oRowTemplate;
		this.oTable.setType(new ResponsiveTableType());
		assert.ok(oRowTemplate.isDestroyed(), "Row template is destroyed when changing type");
		assert.notOk(this.oTable._oRowTemplate, "Reference to destroyed row template is removed");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getAutoPopinMode(), true, "autoPopinMode");
		assert.equal(oInnerTable.getContextualWidth(), "Auto", "contextualWidth");
		assert.equal(oInnerTable.getGrowing(), true, "growing");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "growingScrollToLoad");
		assert.equal(oInnerTable.getGrowingThreshold(), 20, "growingThreshold");
		assert.deepEqual(oInnerTable.getSticky(), ["ColumnHeaders", "GroupHeaders", "HeaderToolbar", "InfoToolbar"], "sticky");
		assert.equal(oInnerTable.getPopinLayout(), "Block", "popinLayout");
		assert.equal(oInnerTable.getHeaderToolbar(), this.oTable._oToolbar, "headerToolbar");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
	});

	QUnit.test("Column resizing", function(assert) {
		const oColumnResizer = ColumnResizer.findOn(this.oTable._oTable);

		assert.ok(oColumnResizer, "ColumnResizer plugin is found on inner table");
		assert.ok(oColumnResizer.getEnabled(), "ColumnResizer plugin is enabled");

		this.oTable.setEnableColumnResize(false);
		assert.notOk(oColumnResizer.getEnabled(), "Setting table's 'enableColumnResize' to false disables the ColumnResizer plugin");

		this.oTable.setEnableColumnResize(true);
		assert.ok(oColumnResizer.getEnabled(), "Setting table's 'enableColumnResize' to true enables the ColumnResizer plugin");
	});

	QUnit.test("Initial settings", async function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: new ResponsiveTableType({
				growingMode: "None",
				popinLayout: "GridSmall"
			}),
			threshold: 30
		});
		await this.oTable.initialized();

		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getAutoPopinMode(), true, "autoPopinMode");
		assert.equal(oInnerTable.getContextualWidth(), "Auto", "contextualWidth");
		assert.equal(oInnerTable.getGrowing(), false, "growingMode=None: growing");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "growingMode=None: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowingThreshold(), 30, "growingThreshold");
		assert.deepEqual(oInnerTable.getSticky(), ["ColumnHeaders", "GroupHeaders", "HeaderToolbar", "InfoToolbar"], "sticky");
		assert.equal(oInnerTable.getPopinLayout(), "GridSmall", "popinLayout");
		assert.equal(oInnerTable.getHeaderToolbar(), this.oTable._oToolbar, "headerToolbar");
	});

	QUnit.test("Change settings", function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = this.oTable._oTable;

		oType.setGrowingMode("Scroll");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), true, "Type.growingMode=Scroll: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowing(), true, "Type.growingMode=Scroll: growing");

		oType.setGrowingMode("None");
		assert.equal(oInnerTable.getGrowingScrollToLoad(), false, "Type.growingMode=None: growingScrollToLoad");
		assert.equal(oInnerTable.getGrowing(), false, "Type.growingMode=None: growing");

		oType.setPopinLayout("GridSmall");
		assert.equal(oInnerTable.getPopinLayout(), "GridSmall", "Type.popinLayout=GridSmall: popinLayout");

		this.oTable.setThreshold(30);
		assert.equal(oInnerTable.getGrowingThreshold(), 30, "Table.threshold=30: growingThreshold");
	});

	QUnit.module("Inner column", {
		beforeEach: async function() {
			this.oColumn = new Column();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				columns: [this.oColumn]
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.ok(oInnerColumn.isA("sap.m.Column"), "Inner column type is sap.m.Column");
		assert.equal(oInnerColumn.getHeader(), this.oColumn.getHeaderLabel(), "Inner column label is the columns header label instance");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.equal(oInnerColumn.getId(), this.oTable.getColumns()[0].getId() + "-innerColumn", "Id");
		assert.equal(oInnerColumn.getTooltip(), null, "tooltip");
		assert.equal(oInnerColumn.getHeader().getLabel().getTooltip(), null, "Label control: tooltip");
		assert.equal(oInnerColumn.getWidth(), "", "width");
		assert.equal(oInnerColumn.getAutoPopinWidth(), 8, "autoPopinWidth");
		assert.equal(oInnerColumn.getHeaderMenu(), this.oTable.getId() + "-columnHeaderMenu", "headerMenu");
		assert.equal(oInnerColumn.getHAlign(), "Begin", "hAlign");
		assert.equal(oInnerColumn.getImportance(), "None", "importance");
		assert.equal(oInnerColumn.getPopinDisplay(), "Inline", "popinDisplay");
		assert.equal(oInnerColumn.getMergeDuplicates(), false, "mergeDuplicates");
		assert.equal(oInnerColumn.getMergeFunctionName(), "getText", "mergeFunctionName");
		assert.equal(oInnerColumn.getHeader().getLabel().getWrapping(), false, "header: wrapping");
		assert.equal(oInnerColumn.getHeader().getLabel().getWrappingType(), "Hyphenated", "header: wrappingType");
	});

	QUnit.test("Initial settings", function(assert) {
		this.oTable.insertColumn(new Column({
			header: "MyHeaderText",
			headerVisible: false,
			width: "200px",
			minWidth: 10,
			tooltip: "MyColumnTooltip",
			hAlign: "Center",
			extendedSettings: new ResponsiveColumnSettings({
				importance: "High",
				mergeFunction: "myMergeFunction"
			})
		}), 0);

		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.equal(oInnerColumn.getId(), this.oTable.getColumns()[0].getId() + "-innerColumn", "Id");
		assert.equal(oInnerColumn.getTooltip(), null, "tooltip");
		assert.equal(oInnerColumn.getHeader().getLabel().getTooltip(), "MyColumnTooltip", "header: tooltip");
		assert.equal(oInnerColumn.getHeader().getLabel().getWrapping(), false, "header: wrapping");
		assert.equal(oInnerColumn.getWidth(), "200px", "width");
		assert.equal(oInnerColumn.getAutoPopinWidth(), 10, "autoPopinWidth");
		assert.equal(oInnerColumn.getHAlign(), "Center", "hAlign");
		assert.equal(oInnerColumn.getImportance(), "High", "importance");
		assert.equal(oInnerColumn.getPopinDisplay(), "WithoutHeader", "popinDisplay");
		assert.equal(oInnerColumn.getMergeDuplicates(), true, "mergeDuplicates");
		assert.equal(oInnerColumn.getMergeFunctionName(), "myMergeFunction", "mergeFunctionName");
	});

	QUnit.test("Change width", function(assert) {
		this.oColumn.setWidth("100px");
		assert.equal(this.oTable._oTable.getColumns()[0].getWidth(), "100px", "Set 'width': Inner column 'width'");

		this.oColumn.setWidth();
		assert.equal(this.oTable._oTable.getColumns()[0].getWidth(), "", "Remove 'width': Inner column 'width'");
	});

	QUnit.test("Change minWidth", function(assert) {
		this.oColumn.setMinWidth(10);
		assert.equal(this.oTable._oTable.getColumns()[0].getAutoPopinWidth(), 10, "Set 'minWidth': Inner column 'autoPopinWidth'");

		this.oColumn.setMinWidth();
		assert.equal(this.oTable._oTable.getColumns()[0].getAutoPopinWidth(), 8, "Remove 'minWidth': Inner column 'autoPopinWidth'");
	});

	QUnit.test("Change hAlign", function(assert) {
		this.oColumn.setHAlign("End");
		assert.equal(this.oTable._oTable.getColumns()[0].getHAlign(), "End", "Set 'hAlign': Inner column 'hAlign'");

		this.oColumn.setHAlign();
		assert.equal(this.oTable._oTable.getColumns()[0].getHAlign(), "Begin", "Remove 'hAlign': Inner column 'hAlign'");
	});

	QUnit.test("Change tooltip", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];
		const oInnerColumnHeaderLabel = oInnerColumn.getHeader().getLabel();

		this.oColumn.setTooltip("MyTooltip");
		assert.equal(oInnerColumn.getTooltip(), null, "Set 'tooltip': Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), "MyTooltip", "Set 'tooltip': header 'tooltip'");

		this.oColumn.setTooltip();
		assert.equal(oInnerColumn.getTooltip(), null, "Remove 'tooltip': Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), null, "Remove 'tooltip': header 'tooltip'");

		this.oColumn.setHeader("MyHeaderText");
		this.oTable.setUseColumnLabelsAsTooltips(true);
		assert.equal(oInnerColumn.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to true: Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), "MyHeaderText",
			"Set table's 'useColumnLabelsAsTooltips' to true: header 'tooltip'");

		this.oTable.setUseColumnLabelsAsTooltips(false);
		assert.equal(oInnerColumn.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to false: Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to false: header 'tooltip'");

		this.oColumn.setTooltip("MyTooltip");
		this.oTable.setUseColumnLabelsAsTooltips(true);
		assert.equal(oInnerColumn.getTooltip(), null, "'tooltip' takes precedence over 'header': Inner column 'tooltip");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), "MyTooltip", "'tooltip' takes precedence over 'header': header 'tooltip'");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oInnerColumn.getTooltip(), null,
			"tooltip is set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), "MyTooltip",
			"tooltip is set, headerVisible=false, useColumnLabelsAsTooltips=true: header 'tooltip'");

		this.oColumn.setTooltip();
		assert.equal(oInnerColumn.getTooltip(), null,
			"tooltip not set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");
		assert.equal(oInnerColumnHeaderLabel.getTooltip(), null,
			"tooltip not set, headerVisible=false, useColumnLabelsAsTooltips=true: header 'tooltip'");
	});

	QUnit.test("Change wrapping", function(assert) {
		const oInnerColumnHeaderLabel = this.oTable._oTable.getColumns()[0].getHeader().getLabel();

		this.oTable.setEnableColumnResize(false);
		assert.equal(oInnerColumnHeaderLabel.getWrapping(), true, "Set 'enableColumnResize' to false: header 'wrapping'");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oInnerColumnHeaderLabel.getWrapping(), false, "Set 'headerVisible' to false: header 'wrapping'");

		this.oTable.setEnableColumnResize(true);
		assert.equal(oInnerColumnHeaderLabel.getWrapping(), false, "Set 'enableColumnResize' to true: header 'wrapping'");

		this.oColumn.setHeaderVisible(true);
		assert.equal(oInnerColumnHeaderLabel.getWrapping(), false, "Set 'headerVisible' to true: header 'wrapping'");
	});

	QUnit.test("Change popinDisplay", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		this.oTable.getType().setPopinDisplay("Block");
		assert.equal(oInnerColumn.getPopinDisplay(), "Block", "Set 'popinDisplay': Inner column 'popinDisplay'");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oInnerColumn.getPopinDisplay(), "WithoutHeader", "Set 'headerVisible' to false: Inner column 'popinDisplay'");

		this.oColumn.setHeaderVisible(true);
		assert.equal(oInnerColumn.getPopinDisplay(), "Block", "Set 'headerVisible' to true: Inner column 'popinDisplay'");

		this.oTable.getType().setPopinDisplay();
		assert.equal(oInnerColumn.getPopinDisplay(), "Inline", "Remove 'popinDisplay' Inner column 'popinDisplay'");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oInnerColumn.getPopinDisplay(), "WithoutHeader", "Set 'headerVisible' to false: Inner column 'popinDisplay'");

		this.oColumn.setHeaderVisible(true);
		assert.equal(oInnerColumn.getPopinDisplay(), "Inline", "Set 'headerVisible' to true: Inner column 'popinDisplay'");
	});

	QUnit.test("Change extendedSettings.importance", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		this.oColumn.setExtendedSettings(new ResponsiveColumnSettings());
		assert.equal(oInnerColumn.getImportance(), "None", "Set extended settings without 'importance': Inner column 'importance'");

		this.oColumn.getExtendedSettings().setImportance("Medium");
		assert.equal(oInnerColumn.getImportance(), "Medium", "Set extended settings 'importance': Inner column 'importance'");

		this.oColumn.destroyExtendedSettings();
		assert.equal(oInnerColumn.getImportance(), "None", "After destroying extended settings: Inner column 'importance'");

		this.oColumn.setExtendedSettings(new (ColumnSettingsBase.extend("sap.ui.mdc.test.TestColumnSettings", {
			metadata: {
				properties: {
					importance: {type: "sap.ui.core.Priority", defaultValue: "Medium"}
				}
			}
		}))());
		assert.equal(oInnerColumn.getImportance(), "None", "Extended Settings not of type ResponsiveColumnSettings: Inner column 'importance'");
	});

	QUnit.test("Change extendedSettings.mergeFunction", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		this.oColumn.setExtendedSettings(new ResponsiveColumnSettings());
		assert.equal(oInnerColumn.getMergeDuplicates(), false,
			"Set extended settings without 'mergeFunction': Inner column 'mergeDuplicates'");
		assert.equal(oInnerColumn.getMergeFunctionName(), "getText",
			"Set extended settings without 'mergeFunction': Inner column 'mergeFunctionName'");

		this.oColumn.getExtendedSettings().setMergeFunction("myMergeFunction");
		assert.equal(oInnerColumn.getMergeDuplicates(), true,
			"Set extended settings 'mergeFunction': Inner column 'mergeDuplicates'");
		assert.equal(oInnerColumn.getMergeFunctionName(), "myMergeFunction",
			"Set extended settings 'mergeFunction': Inner column 'mergeFunctionName'");

		this.oColumn.destroyExtendedSettings();
		assert.equal(oInnerColumn.getMergeDuplicates(), false,
			"After destroying extended settings: Inner column 'mergeDuplicates'");
		assert.equal(oInnerColumn.getMergeFunctionName(), "getText",
			"After destroying extended settings: Inner column 'mergeFunctionName'");

		this.oColumn.setExtendedSettings(new (ColumnSettingsBase.extend("sap.ui.mdc.test.TestColumnSettings", {
			metadata: {
				properties: {
					mergeFunction: {type: "string", defaultValue: "someMergeFunction"}
				}
			}
		}))());
		assert.equal(oInnerColumn.getMergeDuplicates(), false,
			"Extended Settings not of type ResponsiveColumnSettings: Inner column 'mergeDuplicates'");
		assert.equal(oInnerColumn.getMergeFunctionName(), "getText",
			"Extended Settings not of type ResponsiveColumnSettings: Inner column 'mergeFunctionName'");
	});

	QUnit.module("API", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				...mSettings
			});
			return this.oTable;
		}
	});

	QUnit.test("#updateSortIndicators", async function(assert) {
		const oTable = this.createTable({
			columns: [
				new Column()
			]
		});

		await oTable.initialized();

		const oType = oTable.getType();
		const oColumn = oTable.getColumns()[0];
		const oInnerColumn = oTable._oTable.getColumns()[0];

		oType.updateSortIndicator(oColumn, "Ascending");
		assert.strictEqual(oInnerColumn.getSortIndicator(), "Ascending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "Descending");
		assert.strictEqual(oInnerColumn.getSortIndicator(), "Descending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "None");
		assert.strictEqual(oInnerColumn.getSortIndicator(), "None", "Inner table column sort order");
	});

	QUnit.module("Show Details", {
		beforeEach: async function() {
			this.createTable();
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: function() {
			this.oTable?.destroy();

			const oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

			this.oTable = new Table("table_test", {
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new ResponsiveTableType({
					showDetailsButton: true
				}),
				columns: [
					new Column({
						header: "Column A",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column B",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column C",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Medium"
						})
					}),
					new Column({
						header: "Column D",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column E",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column F",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
		}
	});

	QUnit.test("showXConfigState with showDetailsButton not visible and no xConfig", function(assert) {
		const oType = this.oTable.getType();

		assert.ok(oType.getShowDetailsButton(), "showDetails button is enabled");
		assert.notOk(oType._oShowDetailsButton.getVisible(), "showDetails button is not visible");
		assert.deepEqual(this.oTable._getXConfig(), {}, "xConfig is empty {}");

		assert.ok(oType.showXConfigState(), "showXConfigState() returns true even when xConfig is missing");
	});

	QUnit.test("Button creation", async function(assert) {
		const oRb = Lib.getResourceBundleFor("sap.ui.mdc");

		await TableQUnitUtils.waitForBinding(this.oTable);

		assert.ok(this.oType._oShowDetailsButton, "button is created");
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no popins");
		const aAriaLabelledBy = this.oType._oShowDetailsButton.getAriaLabelledBy();
		assert.strictEqual(aAriaLabelledBy.length, 1, "ariaLabelledBy contains one entry");
		assert.strictEqual(Element.getElementById(aAriaLabelledBy[0]).getText(), oRb.getText("table.TOGGLEDETAILS_TEXT"),
			"Correct ariaLabelledBy text for Show/Hide Details button");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getIcon(), "sap-icon://detail-more", "correct icon is set on the button");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getTooltip(), oRb.getText("table.SHOWDETAILS_TEXT"), "Correct tooltip");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getIcon(), "sap-icon://detail-less", "correct icon is set on the button");
		assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getTooltip(), oRb.getText("table.HIDEDETAILS_TEXT"), "Correct tooltip");

		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
		assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "hideDetails button selected");

		this.oType._oShowDetailsButton.getItems()[0].firePress();
		assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "showDetails", "showDetails button selected");

		this.oTable._oTable.setContextualWidth("4444px");
		await nextUIUpdate();
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden there are no popins");
	});

	QUnit.test("Button placement", async function(assert) {
		this.oTable._oTable.setContextualWidth("Tablet");
		await nextUIUpdate();
		let bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
			return oControl.getId() === this.oType._oShowDetailsButton.getId();
		}, this);
		assert.ok(bButtonAddedToToolbar, "Button is correctly added to the table header toolbar");

		this.oType.setShowDetailsButton(false);
		await nextUIUpdate();
		assert.notOk(this.oType.getShowDetailsButton(), "showDetailsButton = false");
		bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
			return this.oType._oShowDetailsButton && oControl.getId() === this.oType._oShowDetailsButton.getId();
		}, this);
		assert.notOk(bButtonAddedToToolbar, "Button is removed from the table header toolbar");
		assert.ok(!this.oType._oShowDetailsButton, "Button does not exist anymore");
	});

	QUnit.test("Inner table hiddenInPopin property in Desktop mode", function(assert) {
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 1, "getHiddenInPopin() contains only 1 value");
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
	});

	QUnit.test("Inner table hiddenInPopin property in Phone mode", async function(assert) {
		const oPhoneStub = sinon.stub(Device.system, "phone").value(true);

		this.createTable();
		await this.oTable.initialized();

		assert.deepEqual(this.oTable._oTable.getHiddenInPopin(), ["Low", "Medium"]);

		oPhoneStub.restore();
	});

	QUnit.test("Button should be hidden with filtering leads to no data and viceversa", async function(assert) {
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");

		this.oTable._oTable.getBinding("items").filter(new Filter("test", "EQ", "foo"));
		assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no visible items");

		this.oTable._oTable.getBinding("items").filter();
		assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has visible items and popins");
	});

	QUnit.test("The controller is registered and deregistered properly", function(assert) {
		assert.ok(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ShowDetails"), "ShowDetails controller is registered");
		this.oType.setShowDetailsButton(false);
		assert.notOk(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ShowDetails"), "ShowDetails controller is deregistered");
	});

	QUnit.test("detailsButtonSetting property", function(assert) {
		const bDesktop = Device.system.desktop;
		const bTablet = Device.system.tablet;
		const bPhone = Device.system.phone;

		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;

		this.oType.setDetailsButtonSetting(["Medium", "High"]);

		this.oType._oShowDetailsButton.getItems()[0].firePress();
		assert.strictEqual(this.oTable._oTable.getHiddenInPopin(), undefined, "Inner table property 'hiddenInPopin'");

		this.oType._oShowDetailsButton.getItems()[1].firePress();
		assert.deepEqual(this.oTable._oTable.getHiddenInPopin(), ["Medium", "High"], "Inner table property 'hiddenInPopin'");

		Device.system.desktop = bDesktop;
		Device.system.tablet = bTablet;
		Device.system.phone = bPhone;
	});

	QUnit.test("Show Details button lifecycle", async function(assert) {
		let oType = this.oTable.getType();
		let oShowDetailsButton;

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");

		oShowDetailsButton = oType._oShowDetailsButton;
		this.oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true, "Show Details button is destroyed when changing the type");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when changing the type");

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		oType = this.oTable.getType();
		oShowDetailsButton = oType._oShowDetailsButton;
		oType.destroy();
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true, "Show Details button is destroyed when the type is destroyed with Type#destroy");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when the type is destroyed Type#destroy");

		this.oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		oType = this.oTable.getType();
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		oType = this.oTable.getType();
		oShowDetailsButton = oType._oShowDetailsButton;
		this.oTable.destroyType();
		assert.strictEqual(oShowDetailsButton.isDestroyed(), true,
			"Show Details button is destroyed when the type is destroyed with Table#destroyType");
		assert.notOk(oType._oShowDetailsButton, "Reference to Show Details button is removed when the type is destroyed Table#destroyType");
	});

	QUnit.test("State is persisted", async function(assert) {
		const done = assert.async();

		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		let counter = 0;
		const oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = function(aChanges) {
			counter++;
			let bExpectedValue;
			let sExpectedName;
			let sAction;

			if (counter === 1) {
				bExpectedValue = true;
				sAction = "setShowDetails";
				sExpectedName = "ResponsiveTable";
			} else if (counter === 2) {
				bExpectedValue = false;
				sAction = "setShowDetails";
				sExpectedName = "ResponsiveTable";
			}

			assert.strictEqual(aChanges.length, 1, "One change is created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, sAction, "Change type is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.value, bExpectedValue, "Change content value is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.key, sExpectedName, "Key is correct");

			if (counter === 2) {
				done();
			}

			return Promise.resolve(aChanges);
		};

		this.oTable.getEngine()._setModificationHandler(this.oTable, oModificationHandler);

		const oType = this.oTable.getType();

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		oType._oShowDetailsButton.getItems()[0].firePress();
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown");

		oType._oShowDetailsButton.getItems()[0].firePress();
		await nextUIUpdate();

		sinon.stub(this.oTable, "getCurrentState").returns({
			xConfig: {aggregations: {type: {ResponsiveTable: {showDetails: true}}}}
		});

		assert.equal(counter, 1, "No modification happened since show/hide state did not change");

		oType._oShowDetailsButton.getItems()[1].firePress();
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");

		this.oTable.getCurrentState.restore();
	});

	QUnit.test("Add a new column to the table", async function(assert) {
		const oColumn = new Column({
			header: "Column F",
			hAlign: "Begin",
			template: new Text({
				text: "{test}"
			}),
			extendedSettings: new ResponsiveColumnSettings({
				importance: "High"
			})
		});
		this.oTable.addColumn(oColumn);
		const oType = this.oTable.getType();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		// Case 1: Adding a new column that will not be hidden in the popin
		this.oTable._bUserPersonalizationActive = true; // Emulate personalization
		sinon.stub(oColumn, "getInnerColumn").returns({
			getImportance: function() {
				return "High";
			}
		});
		sinon.stub(TableTypeBase.prototype, "insertColumn"); // Stub base to avoid inner table manipulation with mock column
		oType.insertColumn(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are not shown");

		// Case 2: Adding a new column that will be hidden in the popin
		oColumn.getInnerColumn.returns({
			getImportance: function() {
				return "Low";
			}
		});
		oType.insertColumn(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are shown");

		// Case 3: Adding a new column that will not be hidden in the popin, but state stays as before
		oColumn.getInnerColumn.returns({
			getImportance: function() {
				return "High";
			}
		});
		oType.insertColumn(oColumn);
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are still shown");

		oColumn.getInnerColumn.restore();
		TableTypeBase.prototype.insertColumn.restore();
	});

	QUnit.test("Switch variant (emulation)", async function(assert) {
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		const oType = this.oTable.getType();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		// State (none) => State (showDetails: true)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are shown");

		// State (showDetails: true) => State (showDetails: false)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": false
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");

		// State (showDetails=false) => State (showDetails=true)
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown again");

		// State (showDetails=true) => State (none)
		fnGetCurrentStateStub.returns({});
		oType.onModifications(); // Emulate change with ShowDetails
		await nextUIUpdate();

		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden as default");

		fnGetCurrentStateStub.restore();
	});

	QUnit.test("State is applied (emulation)", async function(assert) {
		const oType = this.oTable.getType();
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": true
					}
				}
			}
		});

		const fnOnModificationsSpy = sinon.spy(oType, "onModifications");
		const fnSetShowDetailsState = sinon.spy(oType, "_setShowDetailsState");

		await TableQUnitUtils.waitForBinding(this.oTable);
		this.oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "Show Details button is visible since table has popins");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are initially hidden");

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledOnce, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledOnce, "_setShowDetailsState is called");
		assert.ok(fnSetShowDetailsState.calledWith(true), "_setShowDetailsState is called with true");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "showDetails", "Details are now shown");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"ResponsiveTable": {
						"showDetails": false
					}
				}
			}
		});

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledTwice, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledTwice, "_setShowDetailsState is called");
		assert.ok(fnSetShowDetailsState.calledWith(false), "_setShowDetailsState is called with false");
		assert.equal(oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "Details are now hidden");
	});

	QUnit.module("extendedSettings");

	QUnit.test("Merge cell", async function(assert) {
		const oModel = new JSONModel();
		oModel.setData({
			testPath: [{
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "11"
			}, {
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "22"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "33"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "44"
			}]
		});

		const oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		oTable.addColumn(new Column({
			header: "Test 1",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getText"
				})
			],
			template: new Text({
				text: "{text1}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 2",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getSrc"
				})
			],
			template: new Icon({
				src: "{icon}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 3",
			template: new Text({
				text: "{text2}"
			})
		}));

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return TableQUnitUtils.waitForBindingInfo(oTable).then(function() {
			const aColumns = oTable._oTable.getColumns();

			assert.ok(aColumns[0].getMergeDuplicates(), "First column property mergeDuplicates = true");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText", "First column property mergeFunctionName = getText");

			assert.ok(aColumns[1].getMergeDuplicates(), "Second column property mergeDuplicates = true");
			assert.strictEqual(aColumns[1].getMergeFunctionName(), "getSrc", "Second column property mergeFunctionName = getSrc");

			assert.notOk(aColumns[2].getMergeDuplicates(), "Third column property mergeDuplicates = false");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText",
				"Third column property mergeFunctionName = getText as it's the default value");
		});
	});

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: [
							{type: "Navigation", visible: true},
							{type: "Delete", visible: true},
							{type: "Custom", text: "Custom", icon: "sap-icon://action", visible: false}
						]
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("RowActionItem loads TableRowActionType enum transitively", function(assert) {
		// Do NOT require the enum directly – we are validating transitive availability via RowActionItem
		const oEnumType = DataType.getType("sap.ui.mdc.enums.TableRowActionType");

		assert.ok(oEnumType, "Enum type is registered when RowActionItem is loaded");
		assert.ok(oEnumType.isEnumType(), "Registered type is an enum");

		const oItem = new RowActionItem();
		const oItem2 = new RowActionItem({type: "Navigation"});
		assert.strictEqual(oItem.getType(), "Custom", "Enum default value 'Custom' is set");
		assert.strictEqual(oItem2.getType(), "Navigation", "Enum value 'Navigation' is accepted");
		oItem.destroy();
		oItem2.destroy();
	});

	QUnit.test("Static row actions: Navigation, Delete, Custom", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"}),
					new RowActionItem({type: "Delete"}),
					new RowActionItem({
						type: "Custom",
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;
		const oRowTemplate = this.oTable._oRowTemplate;
		const aActions = oRowTemplate.getActions();

		assert.equal(oInnerTable.getItemActionCount(), 3, "Correct action count set on inner table");
		assert.ok(oRowTemplate.getAggregation("actions").length === 3, "Three actions added to row template");
		assert.strictEqual(oRowTemplate.getType(), "Inactive", "ListItem type set to 'Inactive'");
		assert.strictEqual(oRowTemplate.getEffectiveType(), "Navigation", "ListItem effectiveType set to 'Navigation'");
		assert.notOk(oRowTemplate.isBound("type"), "Inner table items template 'type' not bound");
		assert.strictEqual(aActions[2].getVisible(), false, "Third actionItem 'visible' property set to false");
	});

	QUnit.test("Row actions with bound settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;

		assert.deepEqual({
			model: oRowTemplate.getActions()[0].getBindingInfo("type").parts[0].model,
			path: oRowTemplate.getActions()[0].getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "type"
		}, "'type' property binding");

		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getEffectiveType(), "Navigation", "Item 1 effectiveType is 'Navigation'");
		assert.strictEqual(aItems[1].getEffectiveType(), "Inactive", "Item 2 effectiveType is 'Inactive'");
		assert.strictEqual(aItems[2].getEffectiveType(), "Inactive", "Item 3 effectiveType is 'Inactive'");

		assert.ok(oRowTemplate.getActions()[0].isBound("type"), "Inner table item Action property 'type' is bound");
		assert.ok(oRowTemplate.getActions()[0].isBound("text"), "Inner table item Action property 'text' is bound");
	});

	QUnit.test("Row actions with bound settings and custom formatters", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: {
							path: "namedModel>visible",
							formatter: function(sValue) {
								return sValue;
							}
						}
					})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;

		assert.deepEqual({
			model: oRowTemplate.getActions()[0].getBindingInfo("visible").parts[0].model,
			path: oRowTemplate.getActions()[0].getBindingInfo("visible").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'visible' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[2].getActions()[0].getVisible(), false, "Item 3 action 'visible' is false");
	});

	QUnit.test("Bound row actions", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					}),
					templateShareable: false
				}
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;

		assert.deepEqual({
			model: oRowTemplate.getBindingInfo('actions').template.getBindingInfo('type').parts[0].model,
			path: oRowTemplate.getBindingInfo('actions').template.getBindingInfo('type').parts[0].path
		}, {
			model: "namedModel",
			path: "type"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Inactive", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Inactive", "Item 3 type");

		assert.strictEqual(aItems[0].getEffectiveType(), "Navigation", "Item 1 effectiveType");
		assert.strictEqual(aItems[1].getEffectiveType(), "Navigation", "Item 2 effectiveType");
		assert.strictEqual(aItems[2].getEffectiveType(), "Navigation", "Item 3 effectiveType");

		assert.ok(oRowTemplate.getBindingInfo('actions').template.isBound("type"), "Inner table items template 'type' is bound");
		assert.ok(oRowTemplate.getBindingInfo('actions').template.isBound("text"), "Inner table items template 'text' is bound");
		assert.ok(oRowTemplate.getBindingInfo('actions').template.isBound("icon"), "Inner table items template 'icon' is bound");
		assert.ok(oRowTemplate.getBindingInfo('actions').template.isBound("visible"), "Inner table items template 'visible' is bound");
	});

	QUnit.test("Custom and Edit action types are supported", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;
		const aActions = oRowTemplate.getActions();
		assert.strictEqual(aActions[0].getType(), "Delete", "Delete action type is set");
		assert.strictEqual(aActions[1].getType(), "Custom", "Custom action type is set");
	});

	QUnit.test("Row action press event is fired with correct parameters", async function(assert) {
		const oRowActionItemPress = sinon.spy();
		const oRowPress = sinon.spy();
		const fnRowPress = (oEvent) => {
			oRowPress(oEvent.getParameters());
		};

		await this.createTable({
			rowPress: fnRowPress,
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "actionNav",
						type: "Navigation",
						press: function(oEvent) {
							oRowActionItemPress(oEvent);
						}
					}),
					new RowActionItem({
						id: "actionDel",
						type: "Delete",
						press: function(oEvent) {
							oRowActionItemPress(oEvent);
						}
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		// Simulate press on first row action (Navigation)
		const oFirstItem = this.oTable._oTable.getItems()[0];
		oFirstItem.$().trigger("tap");

		await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});

		let oEvent = oRowActionItemPress.getCall(0)?.args[0];
		assert.ok(oRowPress.called, "rowPress event handler is called when clicking on list row with 'Navigation' action");
		assert.ok(oRowActionItemPress.calledOnce, "ActionItem 'press' event handler is called once");
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oFirstItem.getBindingContext("namedModel")
		}, "ActionItem 'press' event handler is called with correct parameters for Navigation action");

		// Simulate press on 'Delete' row action item
		const oDeleteAction = oFirstItem.getActions().find((oAction) => oAction.getType() === "Delete");
		jQuery("#" + oDeleteAction.getId() + "-delete").trigger("tap");

		oEvent = oRowActionItemPress.getCall(1)?.args[0];
		assert.ok(oRowPress.calledOnce, "rowPress event handler is still called once");
		assert.ok(oRowActionItemPress.calledTwice, "ActionItem 'press' event handler called twice");
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oFirstItem.getBindingContext("namedModel")
		}, "Press event handler called with correct parameters for Delete action");

	});

	QUnit.test("Row action press without rowPress event attached on table", async function(assert) {
		const oRowActionItemPress = sinon.spy();

		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						press: function(oEvent) {
							oRowActionItemPress(oEvent);
						}
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		const oFirstItem = this.oTable._oTable.getItems()[0];

		assert.notOk(this.oTable.hasListeners("rowPress"), "Table has no 'rowPress' event listener");
		assert.strictEqual(oFirstItem.getType(), "Inactive", "Row type is Inactive");
		assert.strictEqual(oFirstItem.getEffectiveType(), "Navigation", "Row effectiveType is Navigation");

		// Simulate press on first list row item
		const clock = sinon.useFakeTimers();
		oFirstItem.$().trigger("tap");
		clock.tick(1);
		clock.restore();

		let oEvent = oRowActionItemPress.getCall(0)?.args[0];
		assert.ok(oRowActionItemPress.calledOnce, "RowActionItem 'press' event is fired via row tap when no rowPress is attached");
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oFirstItem.getBindingContext("namedModel")
		}, "Press event handler called with correct parameters for row tap");

		oRowActionItemPress.resetHistory();

		// Simulate direct press on Navigation action button (fires itemPress on the list)
		this.oTable._oTable.fireItemPress({listItem: oFirstItem});

		oEvent = oRowActionItemPress.getCall(0)?.args[0];
		assert.ok(oRowActionItemPress.calledOnce, "RowActionItem 'press' event is fired via direct Navigation button press");
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oFirstItem.getBindingContext("namedModel")
		}, "Press event handler called with correct parameters for direct Navigation button press");
	});

	QUnit.test("rowActionCount: overflow button and Navigation visibility", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActionCount: 2,
				rowActions: [
					new RowActionItem({type: "Navigation"}),
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		const oInnerTable = this.oTable._oTable;
		const oFirstItem = oInnerTable.getItems()[0];

		// rowActionCount = 2: effective itemActionCount = 1 (Navigation excluded).
		// Overflow button is rendered because visible non-Navigation actions (2) > effective itemActionCount (1)
		assert.strictEqual(oInnerTable.getItemActionCount(), 2, "itemActionCount property is 2");
		assert.strictEqual(oInnerTable._getItemActionCount(), 1, "effective itemActionCount is 1 (Navigation excluded)");
		assert.ok(oFirstItem.$("overflow").length > 0, "Overflow button is rendered when actions exceed effective itemActionCount");
		assert.strictEqual(oFirstItem.getDomRef("actions").childElementCount, 2,
			"Overflow button and 'Navigation' ActionItem are rendered in the actions cell");

		// rowActionCount = 0: actions area is not rendered, but Navigation type is still effective
		this.oTable.getRowSettings().setRowActionCount(0);
		this.oTable.getType().updateRowActions();
		await nextUIUpdate();
		assert.strictEqual(oInnerTable.getItemActionCount(), 0, "itemActionCount is 0");
		assert.notOk(oFirstItem.getDomRef("Actions"), "Actions cell is not rendered at itemActionCount 0");
		assert.ok(oFirstItem.getDomRef("imgNav"), "Navigation indicator is still rendered");
		assert.strictEqual(oFirstItem.getEffectiveType(), "Navigation",
			"effectiveType is still 'Navigation' even with itemActionCount 0");
	});

	QUnit.test("Effective itemActionCount excludes Navigation action", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"}),
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;

		assert.ok(oInnerTable.bUseActionsForNavigation, "bUseActionsForNavigation flag is set on the inner table");
		assert.strictEqual(oInnerTable.getItemActionCount(), 3, "itemActionCount property is 3");
		assert.strictEqual(oInnerTable._getItemActionCount(), 2,
			"Effective itemActionCount is 2 (Navigation action excluded)");

		// Without Navigation action, effective count equals property value
		this.destroyTable();
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oInnerTable2 = this.oTable._oTable;
		assert.strictEqual(oInnerTable2.getItemActionCount(), 2, "itemActionCount property is 2");
		assert.strictEqual(oInnerTable2._getItemActionCount(), 2,
			"Effective itemActionCount is 2 (no Navigation action, no adjustment)");
	});

	QUnit.test("Static row actions: No accumulation on repeated updateRowActions", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;
		const oType = this.oTable.getType();

		// Initial state: 2 actions
		const iActionsCount = oRowTemplate.getActions().length;
		assert.strictEqual(iActionsCount, 2, "Initial: 2 actions added to row template");

		// Call updateRowActions multiple times
		oType.updateRowActions();
		await nextUIUpdate();
		assert.strictEqual(oRowTemplate.getActions().length, iActionsCount,
			"After first updateRowActions: same number of actions (no accumulation)");

		oType.updateRowActions();
		await nextUIUpdate();
		assert.strictEqual(oRowTemplate.getActions().length, iActionsCount,
			"After second updateRowActions: same number of actions (no accumulation)");

		oType.updateRowActions();
		await nextUIUpdate();
		assert.strictEqual(oRowTemplate.getActions().length, iActionsCount,
			"After third updateRowActions: same number of actions (no accumulation)");
	});

	QUnit.test("Row actions: Transition from static to bound", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;
		const oType = this.oTable.getType();
		const oRowSettings = this.oTable.getRowSettings();

		// Initial: 2 static actions
		assert.strictEqual(oRowTemplate.getActions().length, 2, "Initial: 2 static actions");
		assert.notOk(oRowTemplate.isBound("actions"), "Initially: actions aggregation not bound");

		// Change to bound actions
		oRowSettings.bindAggregation("rowActions", {
			path: "namedModel>/testPath",
			template: new RowActionItem({
				type: "{namedModel>type}",
				visible: "{namedModel>visible}"
			}),
			templateShareable: false
		});

		oType.updateRowActions();
		await nextUIUpdate();

		// After transition: bound actions are set, old static actions are cleared
		assert.ok(oRowTemplate.isBound("actions"), "After transition: actions aggregation is bound");
		assert.ok(oRowTemplate.getBindingInfo("actions").template, "After transition: binding has a template");
		assert.strictEqual(oRowTemplate.getBindingInfo("actions").model, "namedModel", "After transition: correct binding model");
		assert.strictEqual(oRowTemplate.getBindingInfo("actions").path, "/testPath", "After transition: correct binding path");
	});

	QUnit.test("Row actions: Transition from bound to static", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						visible: "{namedModel>visible}"
					}),
					templateShareable: false
				}
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;
		const oType = this.oTable.getType();
		const oRowSettings = this.oTable.getRowSettings();

		// Initial: bound actions
		assert.ok(oRowTemplate.isBound("actions"), "Initially: actions aggregation is bound");

		// Change to static actions
		oRowSettings.unbindAggregation("rowActions");
		oRowSettings.addRowAction(new RowActionItem({type: "Delete"}));
		oRowSettings.addRowAction(new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"}));

		oType.updateRowActions();
		await nextUIUpdate();

		// After transition: static actions are added, old binding is unbound
		assert.notOk(oRowTemplate.isBound("actions"), "After transition: actions aggregation is not bound");
		assert.strictEqual(oRowTemplate.getActions().length, 2, "After transition: 2 static actions added");
	});

	QUnit.test("Row actions: Removal of all actions", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;
		const oType = this.oTable.getType();
		const oRowSettings = this.oTable.getRowSettings();

		// Initial: 2 static actions
		assert.strictEqual(oRowTemplate.getActions().length, 2, "Initial: 2 actions");

		// Remove all actions
		oRowSettings.destroyRowActions();
		oType.updateRowActions();
		await nextUIUpdate();

		// After removal: no actions
		assert.strictEqual(oRowTemplate.getActions().length, 0, "After removal: no actions");
		assert.notOk(oRowTemplate.isBound("actions"), "After removal: actions aggregation not bound");
	});

	QUnit.test("Row action clone is not destroyed when ColumnListItem is destroyed", async function(assert) {
		const oRowActionItemPress = sinon.spy();

		await this.createTable({
			rowPress: function() {},
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						press: function(oEvent) {
							oRowActionItemPress(oEvent);
						}
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		const oType = this.oTable.getType();
		const oFirstItem = this.oTable._oTable.getItems()[0];

		// Trigger row press to create and cache the RowActionItem clone
		oFirstItem.$().trigger("tap");

		await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});

		assert.ok(oRowActionItemPress.calledOnce, "Press event fired on first navigation");

		// Verify clone is cached and not a dependent of the ListItemAction
		const oCloneMap = oType._mRowActionItemClones;
		assert.strictEqual(oCloneMap.size, 1, "One clone is cached");
		const oCachedClone = oCloneMap.values().next().value;
		assert.notOk(oCachedClone.isDestroyed(), "Clone is not destroyed after first press");
		assert.notOk(oCachedClone.getParent(), "Clone has no parent after press (was removed as dependent)");

		// Destroy the ColumnListItem (simulates what happens during back-navigation/rebinding)
		oFirstItem.destroy();

		// Verify the cached clone survived the ColumnListItem destruction
		assert.notOk(oCachedClone.isDestroyed(), "Clone survives ColumnListItem destruction");
		assert.strictEqual(oCloneMap.size, 1, "Clone is still in cache");
	});

	QUnit.test("navigated and highlight - static values", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				navigated: true,
				highlight: "Error"
			})
		});

		const oInnerItem = this.oTable._oTable.getItems()[0];
		assert.strictEqual(oInnerItem.getNavigated(), true, "Static value for navigated is applied");
		assert.strictEqual(oInnerItem.getHighlight(), "Error", "Static value for highlight is applied");
	});

	QUnit.test("navigated and highlight - bound values with formatters", async function(assert) {
		this.destroyTable();
		this.oTable = new Table({
			type: new ResponsiveTableType(),
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "namedModel>/testPath"
				}
			},
			columns: new Column({
				id: "foo0",
				header: "Test0",
				template: new Text({text: "template0"})
			}),
			models: {
				namedModel: new JSONModel({
					testPath: [
						{description: "item 1"},
						{description: "item 2"}
					]
				})
			},
			rowSettings: new RowSettings({
				navigated: {
					path: "namedModel>description",
					type: BooleanType,
					formatter: (sDescription) => sDescription === "item 1"
				},
				highlight: {
					path: "namedModel>description",
					formatter: (sDescription) => (sDescription === "item 1" ? "Warning" : "Information")
				}
			})
		});
		this.oTable.placeAt("qunit-fixture");
		await TableQUnitUtils.waitForBinding(this.oTable);

		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getNavigated(), true, "Formatted value for navigated (item 1)");
		assert.strictEqual(aItems[0].getHighlight(), "Warning", "Formatted value for highlight (item 1)");
		assert.strictEqual(aItems[1].getNavigated(), false, "Formatted value for navigated (item 2)");
		assert.strictEqual(aItems[1].getHighlight(), "Information", "Formatted value for highlight (item 2)");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Table 'rowPress' event listener attached on init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			}
		});

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", resolve);
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.skip("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getItems()[1].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.test("Table 'rowPress' with non-Navigation row actions: ColumnListItem type is 'Active'", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			},
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oRowTemplate = this.oTable._oRowTemplate;

		assert.strictEqual(oRowTemplate.getType(), "Active",
		"ColumnListItem type is 'Active' when rowPress is attached but no Navigation action exists");
		assert.strictEqual(oRowTemplate.getEffectiveType(), "Active",
		"ColumnListItem effectiveType is 'Active' when no Navigation action exists");

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", resolve);
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					template: new Text()
				}),
				contextMenu: new Menu(),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				}
			});
			this.oTable.placeAt("qunit-fixture");
			await this.oTable.initialized();
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Standard context menu", function(assert) {
		const oContextMenu = this.oTable.getContextMenu();
		let oInnerTableEvent;

		this.spy(this.oTable, "_onBeforeOpenContextMenu");
		this.oTable._oTable.attachBeforeOpenContextMenu((oEvent) => {
			oInnerTableEvent = oEvent;
		});

		this.oTable._oTable.fireBeforeOpenContextMenu({
			column: this.oTable._oTable.getColumns()[0],
			listItem: this.oTable._oTable.getItems()[0]
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getItems()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		this.oTable._oTable.fireBeforeOpenContextMenu({
			column: undefined,
			listItem: this.oTable._oTable.getItems()[0]
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: this.oTable._oTable.getItems()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});
	});

	QUnit.module("Column insert and remove", {
		beforeEach: async function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new ResponsiveTableType(),
				columns: [
					new Column({
						header: "Test0",
						template: new Text({
							text: "template0"
						})
					}),
					new Column({
						header: "Test1",
						template: new Text({
							text: "template1"
						})
					})
				],
				models: new JSONModel({
					testPath: new Array(10).fill({})
				})
			});

			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial cell templates", function(assert) {
		const aInnerColumns = this.oTable._oTable.getColumns();
		const oRowTemplate = this.oTable._oRowTemplate;

		assert.equal(aInnerColumns[0].getHeader().getText(), "Test0", "Inner column 0 header");
		assert.equal(aInnerColumns[1].getHeader().getText(), "Test1", "Inner column 1 header");
		assert.equal(oRowTemplate.getCells()[0].getText(), "template0", "Cell template 0");
		assert.equal(oRowTemplate.getCells()[1].getText(), "template1", "Cell template 1");
	});

	QUnit.test("Insert column updates cell templates", function(assert) {
		const oRowTemplate = this.oTable._oRowTemplate;

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "template2"
			})
		}), 1);

		const aInnerColumns = this.oTable._oTable.getColumns();

		assert.equal(this.oTable.getColumns().length, aInnerColumns.length, "Column count matches");
		assert.equal(aInnerColumns[0].getHeader().getText(), "Test0", "Inner column 0 header");
		assert.equal(aInnerColumns[1].getHeader().getText(), "Test2", "Inner column 1 header (inserted)");
		assert.equal(aInnerColumns[2].getHeader().getText(), "Test1", "Inner column 2 header");
		assert.equal(oRowTemplate.getCells()[0].getText(), "template0", "Cell template 0");
		assert.equal(oRowTemplate.getCells()[1].getText(), "template2", "Cell template 1 (inserted)");
		assert.equal(oRowTemplate.getCells()[2].getText(), "template1", "Cell template 2");
	});

	QUnit.test("Remove column cleans up cells", async function(assert) {
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowTemplate = this.oTable._oRowTemplate;
		const oColumn0 = this.oTable.getColumns()[0];
		const oColumn1 = this.oTable.getColumns()[1];
		const oInnerColumn0 = oColumn0.getInnerColumn();
		const oInnerColumn0DomRef = oInnerColumn0.getDomRef();
		const aColumn0CellControls = this.oTable._oTable.getItems().map((oItem) => oItem.getCells()[0]);
		const aColumn0CellDomRefs = aColumn0CellControls.map((oCell) => oCell.getDomRef());
		const aColumn0CellDestroySpies = aColumn0CellControls.map((oCell) => sinon.spy(oCell, "destroy"));

		this.oTable.removeColumn(oColumn0);
		let aInnerColumns = this.oTable._oTable.getColumns();
		assert.equal(this.oTable.getColumns().length, aInnerColumns.length, "Column count matches after first remove");
		assert.notOk(aInnerColumns.includes(oInnerColumn0), "Inner column is no longer in the inner table's 'columns' aggregation");
		assert.equal(aInnerColumns[0].getHeader().getText(), "Test1", "Inner column 0 header");
		assert.equal(oRowTemplate.getCells()[0].getText(), "template1", "Cell template 0");
		this.oTable._oTable.getItems().forEach((oItem) => {
			assert.notOk(oItem.getCells().some((oCell) => aColumn0CellControls.includes(oCell)),
				"Cell of removed column is no longer in the item's cells aggregation");
		});
		aColumn0CellDestroySpies.forEach((oSpy, i) => {
			assert.ok(oSpy.calledOnceWithExactly("KeepDom"), "Row " + i + " cell destroyed with 'KeepDom'");
		});

		await new Promise((resolve) => { setTimeout(resolve, 0); });
		await nextUIUpdate();
		assert.notOk(document.body.contains(oInnerColumn0DomRef), "Inner column DOM is gone from the document after rerender");
		aColumn0CellDomRefs.forEach((oRef, i) => {
			assert.notOk(document.body.contains(oRef), "Row " + i + " cell DOM is gone from the document after rerender");
		});

		this.oTable.removeColumn(oColumn1);
		aInnerColumns = this.oTable._oTable.getColumns();
		assert.equal(this.oTable.getColumns().length, aInnerColumns.length, "Column count matches after second remove");
		assert.equal(aInnerColumns.length, 0, "No inner columns left");
		assert.equal(oRowTemplate.getCells().length, 0, "No cell templates left");

		oColumn0.destroy();
		oColumn1.destroy();
	});

	QUnit.test("Column move (remove + insert)", async function(assert) {
		const oTable = new Table({
			type: new ResponsiveTableType()
		});

		oTable.addColumn(new Column({
			header: "Test1",
			template: new Text({text: "Test1"})
		}));
		oTable.addColumn(new Column({
			header: "Test2",
			template: new Text({text: "Test2"})
		}));
		oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({text: "Test3"})
		}));

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		await oTable.initialized();

		const oTest3MDCColumn = oTable.getColumns()[2];
		const oTest3InnerColumn = oTest3MDCColumn.getInnerColumn();
		const oRowTemplate = oTable._oRowTemplate;

		assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 2, "Column index is 2");
		assert.strictEqual(oTest3InnerColumn.getOrder(), 2, "Inner column has the correct order");
		assert.strictEqual(oRowTemplate.getCells()[2].getText(), "Test3", "Correct cell template found");

		// move column - Test3 column is moved to index 0 (remove + insert as move)
		oTable.removeColumn(oTest3MDCColumn);
		oTable.insertColumn(oTest3MDCColumn, 0);
		assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 0, "Test3 column is moved to index 0");
		assert.strictEqual(oTable._oTable.indexOfColumn(oTest3InnerColumn), 0, "Inner table column aggregation also updated");
		assert.strictEqual(oTest3InnerColumn.getOrder(), 0, "Test3 inner column is updated with the correct column order");
		assert.strictEqual(oRowTemplate.getCells()[0].getText(), "Test3", "Cell template moved to index 0");

		oTable.destroy();
	});

	QUnit.test("Insert column with grouped items", async function(assert) {
		const oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "col0",
						path: "col0",
						label: "Column 0",
						dataType: "String"
					}, {
						key: "col1",
						path: "col1",
						label: "Column 1",
						dataType: "String"
					}, {
						key: "col2",
						path: "col2",
						label: "Column 2",
						dataType: "String"
					}]
				}
			},
			type: new ResponsiveTableType(),
			columns: [
				new Column({header: "Col0", template: new Text({text: "{col0}"}), propertyKey: "col0"}),
				new Column({header: "Col1", template: new Text({text: "{col1}"}), propertyKey: "col1"})
			],
			models: new JSONModel({
				testPath: new Array(10).fill({col0: "a", col1: "b", col2: "c"})
			})
		});

		await oTable._fullyInitialized();
		oTable.setGroupConditions({groupLevels: [{name: "col0"}]});
		await TableQUnitUtils.waitForBindingInfo(oTable);

		const aItems = oTable._oTable.getItems();
		assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "First item is a GroupHeaderListItem");

		const oRowTemplate = oTable._oRowTemplate;
		const iCellsBefore = oRowTemplate.getCells().length;

		oTable.insertColumn(new Column({
			header: "Col2", template: new Text({text: "template2"}), propertyKey: "col2"
		}), 1);

		assert.strictEqual(oRowTemplate.getCells().length, iCellsBefore + 1, "Cell added to row template");
		assert.strictEqual(oRowTemplate.getCells()[1].getText(), "template2", "Inserted cell template is at the correct position");

		oTable.destroy();
	});

	QUnit.test("Remove column with grouped items", async function(assert) {
		const oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "col0",
						path: "col0",
						label: "Column 0",
						dataType: "String"
					}, {
						key: "col1",
						path: "col1",
						label: "Column 1",
						dataType: "String"
					}]
				}
			},
			type: new ResponsiveTableType(),
			columns: [
				new Column({header: "Col0", template: new Text({text: "{col0}"}), propertyKey: "col0"}),
				new Column({header: "Col1", template: new Text({text: "{col1}"}), propertyKey: "col1"})
			],
			models: new JSONModel({
				testPath: new Array(10).fill({col0: "a", col1: "b"})
			})
		});

		await oTable._fullyInitialized();
		oTable.setGroupConditions({groupLevels: [{name: "col0"}]});
		await TableQUnitUtils.waitForBindingInfo(oTable);

		const aItems = oTable._oTable.getItems();
		assert.ok(aItems.some((oItem) => oItem.isA("sap.m.GroupHeaderListItem")), "Inner table contains a GroupHeaderListItem");

		const oRowTemplate = oTable._oRowTemplate;
		const iCellsBefore = oRowTemplate.getCells().length;
		const oColumn1 = oTable.getColumns()[1];

		oTable.removeColumn(oColumn1);

		assert.strictEqual(oRowTemplate.getCells().length, iCellsBefore - 1, "Cell removed from row template");
		assert.strictEqual(oTable._oTable.getColumns().length, 1, "Inner table column count updated");

		oColumn1.destroy();
		oTable.destroy();
	});

	QUnit.module("setContextMenu", {
		beforeEach: async function() {
			this.oType = new ResponsiveTableType();
			this.oTable = new Table({type: this.oType});
			await this.oTable.initialized();
			this.oInnerTable = this.oTable._oTable;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Context menu appears on the inner table", function(assert) {
		const oMenu = new Menu();

		this.oType.setContextMenu(oMenu);
		assert.strictEqual(this.oInnerTable.getContextMenu(), oMenu);
		oMenu.destroy();
	});

	QUnit.test("Context menu can be cleared", function(assert) {
		const oMenu = new Menu();

		this.oType.setContextMenu(oMenu);
		this.oType.setContextMenu();
		assert.strictEqual(this.oInnerTable.getContextMenu(), null);
		oMenu.destroy();
	});

	QUnit.test("setContextMenu is safe to call before the inner table is created", function(assert) {
		assert.expect(0);
		const oType = new ResponsiveTableType();

		oType.setContextMenu(new Menu());
		oType.destroy();
	});

	QUnit.module("setNoData", {
		beforeEach: async function() {
			this.oType = new ResponsiveTableType();
			this.oTable = new Table({type: this.oType});
			await this.oTable.initialized();
			this.oInnerTable = this.oTable._oTable;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("String noData appears on the inner table", function(assert) {
		this.oType.setNoData("No data");
		assert.strictEqual(this.oInnerTable.getNoData(), "No data");
	});

	QUnit.test("IllustratedMessage appears on the inner table with correct settings", function(assert) {
		const fnOpenSettingsDialog = sinon.stub(PersonalizationUtils, "openSettingsDialog");
		const oNoData = new IllustratedMessage();

		this.oType.setNoData(oNoData);

		assert.strictEqual(this.oInnerTable.getNoData(), oNoData, "inner table has the IllustratedMessage");
		assert.notOk(oNoData.getEnableVerticalResponsiveness(), "enableVerticalResponsiveness is false for ResponsiveTable");

		const oNoColumnsMessage = this.oInnerTable.getAggregation("_noColumnsMessage");
		assert.ok(oNoColumnsMessage, "a no-columns message is added");
		const oButton = oNoColumnsMessage.getAdditionalContent()[0];
		assert.ok(oButton.isA("sap.m.Button"), "the no-columns message has a settings button");
		assert.strictEqual(oButton.getIcon(), "sap-icon://action-settings", "button uses the settings icon");
		oButton.firePress();
		assert.ok(fnOpenSettingsDialog.calledOnceWith(this.oTable), "pressing the button opens the settings dialog");

		fnOpenSettingsDialog.restore();
	});

	QUnit.test("setNoData is safe to call before the inner table is created", function(assert) {
		assert.expect(0);
		const oType = new ResponsiveTableType();

		oType.setNoData("No data");
		oType.destroy();
	});

	QUnit.test("Default no data text is set on the inner table when setNoData is never called", function(assert) {
		assert.strictEqual(this.oInnerTable.getNoData(), this.oTable._getDefaultNoDataText(), "inner table has the default no data text");
	});
});