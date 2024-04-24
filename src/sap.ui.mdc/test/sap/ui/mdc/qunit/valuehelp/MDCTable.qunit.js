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
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/valuehelp/FilterBar",
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
	"sap/m/p13n/Engine",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/p13n/StateUtil"
], function (
		qutils,
		ValueHelpDelegate,
		ValueHelpDelegateV4,
		MDCTable,
		Condition,
		ConditionValidated,
		OperatorName,
		ValueHelpSelectionType,
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
		Engine,
		Table,
		GridTableType,
		ResponsiveTableType,
		StateUtil
	) {
	"use strict";
	let oMdcTableWrapper;
	let oModel;
	let oTable;
	let oItemTemplate;
	let bIsOpen = true;
	let bIsTypeahead = true;
	let iMaxConditions = -1;
	const oContainer = { //to fake Container
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
	const _init = function(bTypeahead, sTableType, sSelectionMode) {
		let oType;

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
			delegate: { name: "delegates/json/TableDelegate", payload: { collectionName: "items" } },
			type: oType,
			width: "26rem",
			selectionMode: sSelectionMode || "Multi",
			columns: [ new Column({
				header: "key", //Define the header text as present in the propertyinfo
				propertyKey: "key", //Reference the column with the according propertyinfo object
				template: new Text({ //Provide a cell template for the mdc Column
					text: "{key}"
				})
			}),
			new Column({
				header: "text",
				propertyKey: "text",
				template: new Text({
					text: "{text}"
				})
			}),
			new Column({
				header: "additionalText",
				propertyKey: "additionalText",
				template: new Text({
					text: "{additionalText}"
				})
			})]
		});
		oTable.setModel(oModel); // as ValueHelp is faked
		oMdcTableWrapper = new MDCTable("MT1", {
			table: oTable,
			keyPath: "key",
			descriptionPath: "text",
			filterFields: "*text,additionalText*",
			conditions: [Condition.createItemCondition("I2", "Item 2", {inParameter: null})], // don't need to test the binding of Container here
			config: { // don't need to test the binding of Container here
				maxConditions: iMaxConditions,
				operators: [OperatorName.EQ, OperatorName.BT]
			}
		}).setModel(oModel);
		sinon.stub(oMdcTableWrapper, "getParent").returns(oContainer);
		oMdcTableWrapper.setParent(); // just to fake call
		oMdcTableWrapper.oParent = oContainer; // fake
	};
	const _teardown = function() {
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
		const oContent = oMdcTableWrapper.getContent();
		if (oContent) {
			const fnDone = assert.async();
			oContent.then(function(oContent) {

				sinon.spy(oTable, "scrollToIndex");
				sinon.stub(oTable, "isTableBound").returns(true);
				sinon.stub(StateUtil, "applyExternalState").returns(Promise.resolve(true));
				sinon.stub(StateUtil, "retrieveExternalState").returns(Promise.resolve({filter: {}}));
				sinon.stub(StateUtil, "diffState").returns(Promise.resolve({filter: {}}));

				return oTable.initialized().then(function () {
					return oMdcTableWrapper.onBeforeShow(true).then(function () {
						//oMdcTableWrapper.onShow(true); // to update selection and scroll
						assert.ok(oContent, "Content returned");
						assert.ok(oContent.isA("sap.ui.layout.FixFlex"), "Content is sap.m.FixFlex");
						assert.equal(oContent.getFixContent().length, 1, "FixFlex number of Fix items");
						const oFixContent = oContent.getFixContent()[0];
						assert.ok(oFixContent.isA("sap.m.VBox"), "FixContent is sap.m.VBox");
						assert.ok(oFixContent.hasStyleClass("sapMdcValueHelpPanelFilterbar"), "VBox has style class sapMdcValueHelpPanelFilterbar");
						assert.equal(oFixContent.getItems().length, 1, "VBox number of items");
						const oTableBox = oContent.getFlexContent();
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
						assert.ok(oTable.scrollToIndex.calledWith(0), "Table scrolled to top");

						oTable.isTableBound.restore();
						oTable.scrollToIndex.restore();
						StateUtil.applyExternalState.restore();
						StateUtil.retrieveExternalState.restore();
						StateUtil.diffState.restore();

						fnDone();
					}); // to update selection and scroll
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}
	});
	QUnit.test("isQuickSelectSupported", function(assert) {
		assert.ok(oMdcTableWrapper.isQuickSelectSupported(), "quick select supported");
	});

	QUnit.test("isSingleSelect", function(assert) {
		assert.notOk(oMdcTableWrapper.isSingleSelect(), "multi-selection taken from Table");
	});

	QUnit.module("GridTableType", {
		beforeEach: function() {
			bIsTypeahead = false;
		},
		afterEach: _teardown
	});

	QUnit.test("handleSelectionChange - Single Select", function(assert) {
		_init(false, "Table", "Single");
		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper.awaitListBinding().then(function () {
				const oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				return oSelectionPlugin.setSelectedIndex(2).then(function () {
					assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called twice"); // Once by Table._setSelectedContexts, second time by setSelectedIndex
					assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"type": "Set",
						"conditions": [
							{
								"operator": OperatorName.EQ,
								"values": [
									"I3",
									"X-Item 3"
								],
								"isEmpty": null,
								"validated": ConditionValidated.Validated
							}
						],
						"id": "MT1"
					}, "carries expected configuration");

					return oSelectionPlugin.setSelectedIndex(1).then(function () {
						assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
						assert.notOk(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was not called as this item is in conditions");
						oSelectionPlugin.removeSelectionInterval(1,1);
						assert.equal(oMdcTableWrapper._handleSelectionChange.callCount, 4, "MDCTable _handleSelectionChange was called");
						assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called");
						assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
							"type": "Set",
							"conditions": [],
							"id": "MT1"
						}, "carries expected configuration");
					});
				});
			});
		});
	});

	QUnit.test("handleSelectionChange - Multi Select", function(assert) {
		_init(false, "Table", "Multi");
		const oPrepareContentPromise = oMdcTableWrapper.getContent().then(function () {
			return oMdcTableWrapper.onBeforeShow();
		});


		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oPrepareContentPromise.then(function (oContent) {
			return oMdcTableWrapper.awaitListBinding().then(function () {
				const oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				return oSelectionPlugin.addSelectionInterval(0,2).then(function () {
					assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
					assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as some items are not yet in conditions");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"conditions": [
						  {
							"inParameters": {
							  "inParameter": null
							},
							"isEmpty": null,
							"operator": OperatorName.EQ,
							"validated": ConditionValidated.Validated,
							"values": [
							  "I2",
							  "Item 2"
							]
						  },
						  {
							"isEmpty": null,
							"operator": OperatorName.EQ,
							"validated": ConditionValidated.Validated,
							"values": [
							  "I1",
							  "Item 1"
							]
						  },
						  {
							"isEmpty": null,
							"operator": OperatorName.EQ,
							"validated": ConditionValidated.Validated,
							"values": [
							  "I3",
							  "X-Item 3"
							]
						  }
						],
						"id": "MT1",
						"type": "Set"
					  }, "carries expected configuration");

					oSelectionPlugin.removeSelectionInterval(0,2);
					assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
					assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called as one item has to be removed");
					assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
						"conditions": [],
						"id": "MT1",
						"type": "Set"
					  }, "carries expected configuration");
				});
			});
		});
	});

	QUnit.skip("handleSelectionChange - noop", function(assert) {
		_init(false, "Table", "Single");
		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper.awaitListBinding().then(function () {

				oTable._oTable._getSelectionPlugin().fireSelectionChange({
					rowIndices: [2],
					limitReached: false,
					_internalTrigger: true
				});

				assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
				assert.notOk(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect wasn't called as multiselectionplugin selectionchangeevent is not user induced");

				oTable._oTable.fireRowSelectionChange({
					rowIndex: 2,
					rowContext: oTable._oTable.getContextByIndex(2),
					rowIndices: [2],
					selectAll: false,
					userInteraction: false
				});

				assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
				assert.notOk(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect wasn't called as table rowselectionevent is not user induced");
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

		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper.awaitListBinding().then(function () {
				const oInnerTable = oTable._oTable;
				const aTableItems = oInnerTable && oInnerTable.getItems();

				oInnerTable.setSelectedItem(aTableItems[2], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Set",
					"conditions": [
						{
							"operator": OperatorName.EQ,
							"values": [
								"I3",
								"X-Item 3"
							],
							"isEmpty": null,
							"validated": ConditionValidated.Validated
						}
					],
					"id": "MT1"
				}, "carries expected configuration");

				//We simulate the conditions update from the container to the content resulting from the contents _fireSelect:
				oMdcTableWrapper.setConditions([Condition.createItemCondition("I3", "X-Item 3", {inParameter: null})]);

				oInnerTable.setSelectedItem(aTableItems[1], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called"); // as aConditions is never updated opposed in this unit test scenario

				//We simulate the conditions update from the container to the content resulting from the contents _fireSelect:
				oMdcTableWrapper.setConditions([Condition.createItemCondition("I2", "Item 2", {inParameter: null})]);

				oInnerTable.setSelectedItem(aTableItems[1], false, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledThrice, "MDCTable _fireSelect was called"); // as aConditions is never updated opposed in this unit test scenario
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Set", // Single Select should always trigger "Add"
					"conditions": [],
					"id": "MT1"
				}, "carries expected configuration");
			});
		});
	});

	QUnit.test("handleSelectionChange - MultiSelect", function(assert) {
		_init(false, "ResponsiveTableType", "Multi");

		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then(function (oContent) {
			return oMdcTableWrapper.awaitListBinding().then(function () {
				const oInnerTable = oTable._oTable;
				const aTableItems = oInnerTable && oInnerTable.getItems();

				oInnerTable.setSelectedItem(aTableItems[2], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.called, "MDCTable _fireSelect was called as this item is not in conditions");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"conditions": [
					  {
						"inParameters": {
						  "inParameter": null
						},
						"isEmpty": null,
						"operator": OperatorName.EQ,
						"validated": ConditionValidated.Validated,
						"values": [
						  "I2",
						  "Item 2"
						]
					  },
					  {
						"isEmpty": null,
						"operator": OperatorName.EQ,
						"validated": ConditionValidated.Validated,
						"values": [
						  "I3",
						  "X-Item 3"
						]
					  }
					],
					"id": "MT1",
					"type": "Set"
				}, "carries expected configuration");

				//We simulate the conditions update from the container to the content resulting from the contents _fireSelect:
				oMdcTableWrapper.setConditions([Condition.createItemCondition("I3", "X-Item 3", {inParameter: null}), Condition.createItemCondition("I2", "Item 2", {inParameter: null})]);

				oInnerTable.setSelectedItem(aTableItems[1], true, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledTwice, "MDCTable _handleSelectionChange was called");
				assert.notOk(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was not called, as this item is already in our conditions");

				oInnerTable.setSelectedItem(aTableItems[1], false, true);
				assert.ok(oMdcTableWrapper._handleSelectionChange.calledThrice, "MDCTable _handleSelectionChange was called");
				assert.ok(oMdcTableWrapper._fireSelect.calledTwice, "MDCTable _fireSelect was called");
				assert.deepEqual(oMdcTableWrapper._fireSelect.lastCall.args[0], {
					"type": "Set",
					"conditions": [
						{
							"inParameters": {
								"inParameter": null
							},
							"isEmpty": null,
							"operator": OperatorName.EQ,
							"validated": ConditionValidated.Validated,
							"values": [
							  "I3",
							  "X-Item 3"
							]
						  }
					],
					"id": "MT1"
				}, "carries expected configuration");
			});
		});
	});
});
