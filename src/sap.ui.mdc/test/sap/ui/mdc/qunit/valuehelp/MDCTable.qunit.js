// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.
/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/ValueHelpDelegate",
	"delegates/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField", // to have it loaded when BasicSearch should be created
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/library",
	'sap/ui/mdc/table/Column',
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/ScrollContainer",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType"
], function (
		qutils,
		ValueHelpDelegate,
		ValueHelpDelegateV4,
		MDCTable,
		Condition,
		ConditionValidated,
		SelectType,
		FilterBar,
		FilterField,
		ParseException,
		FormatException,
		JSONModel,
		Filter,
		FilterType,
		FilterOperator,
		Sorter,
		mLibrary,
		Column,
		ColumnListItem,
		Label,
		Text,
		ScrollContainer,
		KeyCodes,
		coreLibrary,
		oCore,
		Engine,
		Table,
		GridTableType,
		ResponsiveTableType
	) {
	"use strict";
	var oMdcTableWrapper;
	var oModel;
	var oTable;
	var oItemTemplate;
	var bIsOpen = true;
	var bIsTypeahead = true;
	var iMaxConditions = -1;
	var oContainer = { //to fake Container
		getScrollDelegate: function() {
			return null;
		},
		isOpen: function() {
			return bIsOpen;
		},
		isOpening: function() {
			return false;
		},
		isTypeahead: function() {
			return bIsTypeahead;
		},
		getValueHelpDelegate: function () {
			return ValueHelpDelegate;
		},
		getValueHelpDelegatePayload: function () {
			return {x: "X"};
		},
		awaitValueHelpDelegate: function () {
			return Promise.resolve();
		},
		isValueHelpDelegateInitialized: function() {
			return true;
		},
		invalidate: function () {},
		getUIArea: function() {
			return null;
		},
		getParent: function() {
			return null;
		},
		getId: function() {
			return "myFakeContainer";
		},
		getControl: function () {
			return "Control"; // just to test forwarding
		},
		getLocalFilterValue: function () {
			return undefined;
		},
		getFilterValue: function () {
			return undefined;
		}
	};
	var _init = function(bTypeahead, sTableType, sSelectionMode) {
		var oType;

		oModel = new JSONModel({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1", inValue: "" },
				{ text: "Item 2", key: "I2", additionalText: "Text 2", inValue: null },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3" }
			]
		});
		oItemTemplate = new ColumnListItem("MyItem", {
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		if (sTableType === "ResponsiveTableType") {
			oType = new ResponsiveTableType({growingMode: "Scroll"});
		}
		if (!oType) {
			oType = new GridTableType({rowCountMode: "Fixed", rowCount: 20}); // otherwise no rows will be available
		}

		oTable = new Table("T1", {
			delegate: { name: "delegates/TableDelegate", payload: { collectionName: "items" } },
			type: oType,
			width: "26rem",
			selectionMode: sSelectionMode || "Multi",
			columns: [ new Column({
				header: "key", //Define the header text as present in the propertyinfo
				dataProperty: "key", //Reference the column with the according propertyinfo object
				template: new Text({ //Provide a cell template for the mdc Column
					text: "{key}"
				})
			}),
			new Column({
				header: "text",
				dataProperty: "text",
				template: new Text({
					text: "{text}"
				})
			}),
			new Column({
				header: "additionalText",
				dataProperty: "additionalText",
				template: new Text({
					text: "{additionalText}"
				})
			})]
		});
		oTable.setModel(oModel); // as ValueHelp is faked
		var aConditions = [Condition.createItemCondition("I2", "Item 2", {inParameter: null})];
		oMdcTableWrapper = new MDCTable("MT1", {
			table: oTable,
			keyPath: "key",
			descriptionPath: "text",
			filterFields: "*text,additionalText*",
			conditions: aConditions, // don't need to test the binding of Container here
			config: { // don't need to test the binding of Container here
				maxConditions: iMaxConditions,
				operators: ["EQ", "BT"]
			}
		}).setModel(oModel);
		sinon.stub(oMdcTableWrapper, "getParent").returns(oContainer);
		oMdcTableWrapper.setParent(); // just to fake call
		oMdcTableWrapper.oParent = oContainer; // fake
	};
	var _teardown = function() {
		oMdcTableWrapper.destroy();
		oMdcTableWrapper = null;
		oTable = undefined; // destroyed with MDCTable content
		oItemTemplate.destroy();
		oItemTemplate = undefined;
		oModel.destroy();
		oModel = undefined;
		bIsOpen = true;
		bIsTypeahead = true;
		iMaxConditions = -1;
	};

	QUnit.module("General", {
		beforeEach: function() {
			bIsTypeahead = false;
			_init(false);
		},
		afterEach: _teardown
	});

	QUnit.test("getContent for dialog", function(assert) {
		oMdcTableWrapper.setFilterValue("X");
		var oContent = oMdcTableWrapper.getContent();
		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oMdcTableWrapper.onShow(); // to update selection and scroll
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.ui.layout.FixFlex"), "Content is sap.m.FixFlex");
				assert.equal(oContent.getFixContent().length, 1, "FixFlex number of Fix items");
				var oFixContent = oContent.getFixContent()[0];
				assert.ok(oFixContent.isA("sap.m.VBox"), "FixContent is sap.m.VBox");
				assert.ok(oFixContent.hasStyleClass("sapMdcValueHelpPanelFilterbar"), "VBox has style class sapMdcValueHelpPanelFilterbar");
				assert.equal(oFixContent.getItems().length, 1, "VBox number of items");
				var oTableBox = oContent.getFlexContent();
				assert.ok(oTableBox.isA("sap.m.VBox"), "TableBox is sap.m.VBox");
				assert.equal(oTableBox.getHeight(), "100%", "Panel height");
				assert.ok(oTableBox.hasStyleClass("sapMdcValueHelpPanelTableBox"), "Panel has style class sapMdcTablePanel");
				assert.equal(oTableBox.getItems().length, 1, "TableBox number of items");
				//Test responsive mode
				/* var oScrollContainer = oTableBox.getItems()[0];
				assert.ok(oScrollContainer.isA("sap.m.ScrollContainer"), "Panel item is ScrollContainer");
				assert.equal(oScrollContainer.getContent().length, 1, "ScrollContainer number of items");
				assert.equal(oScrollContainer.getContent()[0], oTable, "Table inside ScrollContainer"); */
				assert.equal(oTableBox.getItems()[0], oTable, "Table found");
				assert.equal(oTable.getSelectionMode(), "Multi", "Table mode");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}
	});
	QUnit.test("isQuickSelectSupported", function(assert) {
		assert.ok(oMdcTableWrapper.isQuickSelectSupported(), "quick select supported");
	});

	QUnit.test("_isSingleSelect", function(assert) {
		assert.notOk(oMdcTableWrapper._isSingleSelect(), "multi-selection taken from Table");
	});

	QUnit.module("GridTableType", {
		beforeEach: function() {
			bIsTypeahead = false;
		},
		afterEach: _teardown
	});

	QUnit.test("handleSelectionChange - Single Select", function(assert) {
		_init(false, "Table", "Single");
		var oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper._retrievePromise("listBinding").then(function () {
				var oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				return oSelectionPlugin.setSelectedIndex(2).then(function () {
					assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
					assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"type": "Add",
						"conditions": [
							{
								"operator": "EQ",
								"values": [
									"I3",
									"X-Item 3"
								],
								"isEmpty": null,
								"validated": "Validated"
							}
						],
						"id": "MT1"
					}, "carries expected configuration");

					return oSelectionPlugin.setSelectedIndex(1).then(function () {
						assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
						assert.notOk(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was not called as this item is in conditions");
						oSelectionPlugin.removeSelectionInterval(1,1);
						assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
						assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called");
						assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
							"type": "Add", // Single Select should always trigger "Add"
							"conditions": [
								{
									"operator": "EQ",
									"values": [
										"I2",
										"Item 2"
									],
									"isEmpty": null,
									"validated": "Validated"
								}
							],
							"id": "MT1"
						}, "carries expected configuration");
					});
				});
			});
		});
	});

	QUnit.test("handleSelectionChange - Multi Select", function(assert) {
		_init(false, "Table", "Multi");
		var oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper._retrievePromise("listBinding").then(function () {
				var oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				return oSelectionPlugin.addSelectionInterval(0,2).then(function () {
					assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
					assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as some items are not yet in conditions");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"type": "Add",
						"conditions": [
							{
								"operator": "EQ",
								"values": [
									"I1",
									"Item 1"
								],
								"isEmpty": null,
								"validated": "Validated"
							},
							{
								"operator": "EQ",
								"values": [
									"I3",
									"X-Item 3"
								],
								"isEmpty": null,
								"validated": "Validated"
							}
						],
						"id": "MT1"
					}, "carries expected configuration");

					oSelectionPlugin.removeSelectionInterval(0,2);
					assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
					assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called as one item has to be removed");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"type": "Remove",
						"conditions": [
							{
								"operator": "EQ",
								"values": [
									"I2",
									"Item 2"
								],
								"isEmpty": null,
								"validated": "Validated"
							}
						],
						"id": "MT1"
					}, "carries expected configuration");
				});
			});
		});
	});

	QUnit.test("handleSelectionChange - noop", function(assert) {
		_init(false, "Table", "Single");
		var oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper._retrievePromise("listBinding").then(function () {
				var oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				oMdcTableWrapper._bScrolling = true;

				oSelectionPlugin.setSelectedIndex(2).then(function () {
					assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
					assert.notOk(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was not called as table is scrolling.");

					oMdcTableWrapper._bScrolling = false;
					oMdcTableWrapper._bBusy = true;

					return oSelectionPlugin.setSelectedIndex(0).then(function () {
						assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
						assert.notOk(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was not called as table is busy.");
					});
				});
			});
		});
	});

	QUnit.module("ResponsiveTableType", {
		beforeEach: function() {
			bIsTypeahead = false;
			//_init(false, "ResponsiveTableType", "Single");
		},
		afterEach: _teardown
	});

	QUnit.test("handleSelectionChange - SingleSelect", function(assert) {
		_init(false, "ResponsiveTableType", "Single");

		var oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper._retrievePromise("listBinding").then(function () {
				var oInnerTable = oTable._oTable;
				var aTableItems = oInnerTable && oInnerTable.getItems();

				oInnerTable.setSelectedItem(aTableItems[2], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Add",
					"conditions": [
						{
							"operator": "EQ",
							"values": [
								"I3",
								"X-Item 3"
							],
							"isEmpty": null,
							"validated": "Validated"
						}
					],
					"id": "MT1"
				}, "carries expected configuration");
				oInnerTable.setSelectedItem(aTableItems[1], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called");

				oInnerTable.setSelectedItem(aTableItems[1], false, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledThrice, "MDCTable _fireSelect was called");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Add", // Single Select should always trigger "Add"
					"conditions": [
						{
							"operator": "EQ",
							"values": [
								"I2",
								"Item 2"
							],
							"isEmpty": null,
							"validated": "Validated"
						}
					],
					"id": "MT1"
				}, "carries expected configuration");
			});
		});
	});

	QUnit.test("handleSelectionChange - MultiSelect", function(assert) {
		_init(false, "ResponsiveTableType", "Multi");

		var oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper._retrievePromise("listBinding").then(function () {
				var oInnerTable = oTable._oTable;
				var aTableItems = oInnerTable && oInnerTable.getItems();

				oInnerTable.setSelectedItem(aTableItems[2], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Add",
					"conditions": [
						{
							"operator": "EQ",
							"values": [
								"I3",
								"X-Item 3"
							],
							"isEmpty": null,
							"validated": "Validated"
						}
					],
					"id": "MT1"
				}, "carries expected configuration");
				oInnerTable.setSelectedItem(aTableItems[1], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called");

				oInnerTable.setSelectedItem(aTableItems[1], false, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledThrice, "MDCTable _fireSelect was called");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Remove",
					"conditions": [
						{
							"operator": "EQ",
							"values": [
								"I2",
								"Item 2"
							],
							"isEmpty": null,
							"validated": "Validated"
						}
					],
					"id": "MT1"
				}, "carries expected configuration");
			});
		});
	});
});
