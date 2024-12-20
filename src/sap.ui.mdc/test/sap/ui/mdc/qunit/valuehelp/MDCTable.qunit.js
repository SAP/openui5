// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.
/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"delegates/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/ColumnListItem",
	"sap/m/ScrollContainer",
	"sap/m/Text",
	"sap/m/p13n/Engine"
], (
	qutils,
	nextUIUpdate,
	ValueHelpDelegateV4,
	MDCTable,
	Condition,
	ConditionValidated,
	OperatorName,
	TableSelectionMode,
	TableRowCountMode,
	Column,
	Table,
	GridTableType,
	ResponsiveTableType,
	StateUtil,
	JSONModel,
	mLibrary,
	ColumnListItem,
	ScrollContainer,
	Text,
	Engine
) => {
	"use strict";

	const ListItemType = mLibrary.ListType;

	let oMdcTableWrapper;
	let oModel;
	let oTable;
	let oItemTemplate;
	let bIsOpen = true;
	let bIsTypeahead = true;
	let iMaxConditions = -1;
	let oScrollContainer = null;
	const oContainer = { //to fake Container
		getScrollDelegate() {
			return null;
		},
		isOpen() {
			return bIsOpen;
		},
		isOpening() {
			return false;
		},
		isTypeahead() {
			return bIsTypeahead;
		},
		getValueHelpDelegate() {
			return ValueHelpDelegateV4;
		},
		getValueHelpDelegatePayload() {
			return {x: "X"};
		},
		awaitValueHelpDelegate() {
			return Promise.resolve();
		},
		isValueHelpDelegateInitialized() {
			return true;
		},
		invalidate() {},
		getUIArea() {
			return null;
		},
		getParent() {
			return null;
		},
		getId() {
			return "myFakeContainer";
		},
		getControl() {
			return "Control"; // just to test forwarding
		},
		getLocalFilterValue() {
			return undefined;
		},
		getFilterValue() {
			return undefined;
		}
	};
	const _init = (bTypeahead, sTableType, sSelectionMode) => {
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
			oType = new GridTableType({rowCountMode: TableRowCountMode.Fixed, rowCount: 20}); // otherwise no rows will be available
		}

		iMaxConditions = sSelectionMode?.startsWith("Single") ? 1 : -1;

		oTable = new Table("T1", {
			delegate: { name: "delegates/json/TableDelegate", payload: { collectionName: "items" } },
			type: oType,
			width: "26rem",
			selectionMode: sSelectionMode,
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
	const _teardown = () => {
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
		if (oScrollContainer) {
			oScrollContainer.getContent.restore();
			oScrollContainer.destroy();
			oScrollContainer = null;
			delete oContainer.getUIAreaForContent;
		}
	};

	// to fake rendering
	async function _renderScrollContainer() {

		oScrollContainer = new ScrollContainer(); // to test scrolling
		sinon.stub(oScrollContainer, "getContent").returns([oTable]); // to render table
		oContainer.getUIAreaForContent = () => {
			return oScrollContainer.getUIArea();
		};
		oScrollContainer.placeAt("content"); // render ScrollContainer
		await nextUIUpdate();
		sinon.spy(oTable, "scrollToIndex");

	}

	QUnit.module("General", {
		beforeEach() {
			bIsTypeahead = false;
			_init(false);
		},
		afterEach: _teardown
	});

	QUnit.test("getContent for dialog", (assert) => {
		oMdcTableWrapper.setFilterValue("X");
		oTable.getType().setRowCountMode(TableRowCountMode.Auto);
		const oContent = oMdcTableWrapper.getContent();
		return oContent?.then((oContent) => {

			sinon.spy(oTable, "scrollToIndex");
			sinon.stub(oTable, "isTableBound").returns(true);
			sinon.stub(StateUtil, "applyExternalState").returns(Promise.resolve(true));
			sinon.stub(StateUtil, "retrieveExternalState").returns(Promise.resolve({filter: {}}));
			sinon.stub(StateUtil, "diffState").returns(Promise.resolve({filter: {}}));

			return oTable.initialized().then(() => {
				return oMdcTableWrapper.onBeforeShow(true).then(() => {
					oMdcTableWrapper.onShow(true);
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
					assert.equal(oTableBox.getItems()[0], oTable, "Table found");
					assert.equal(oTable.getSelectionMode(), "Multi", "Table mode");
					assert.equal(oTable.getType().getRowCount(), 3, "Table RowCount");
					assert.ok(oTable.scrollToIndex.calledWith(0), "Table scrolled to top");
					assert.ok(oTable.hasStyleClass("sapUiSizeCozy"), "A density style is applied.");


					oTable.isTableBound.restore();
					oTable.scrollToIndex.restore();
					StateUtil.applyExternalState.restore();
					StateUtil.retrieveExternalState.restore();
					StateUtil.diffState.restore();

					oMdcTableWrapper.onHide();
				}); // to update selection and scroll
			});
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError.message || oError);
		});
	});
	QUnit.test("isQuickSelectSupported", (assert) => {
		assert.ok(oMdcTableWrapper.isQuickSelectSupported(), "quick select supported");
	});

	QUnit.test("isSingleSelect", (assert) => {
		oTable.setSelectionMode(TableSelectionMode.Multi);
		assert.notOk(oMdcTableWrapper.isSingleSelect(), "multi-selection taken from Table");

		oTable.setSelectionMode(TableSelectionMode.SingleMaster);
		assert.ok(oMdcTableWrapper.isSingleSelect(), "single-selection taken from Table");
	});

	QUnit.module("GridTableType", {
		beforeEach() {
			bIsTypeahead = false;
		},
		afterEach: _teardown
	});

	/*eslint max-nested-callbacks: [2, 20]*/

	QUnit.test("handleSelectionChange - Single Select", (assert) => {
		_init(false, "Table", TableSelectionMode.SingleMaster);
		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oContentPromise.then((oContent) => {
			return oMdcTableWrapper.onBeforeShow(true).then(() => {
				return oMdcTableWrapper.awaitListBinding().then(() => {
					oMdcTableWrapper.onShow(true);
					const oSelectionPlugin = oTable._oTable._getSelectionPlugin();

					return oSelectionPlugin.setSelectedIndex(2).then(() => {
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

						return oSelectionPlugin.setSelectedIndex(1).then(() => {
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

							oMdcTableWrapper._handleSelectionChange.reset();
							oMdcTableWrapper._fireSelect.reset();
							oMdcTableWrapper.onHide();
							return oSelectionPlugin.setSelectedIndex(0).then(() => {
								assert.ok(oMdcTableWrapper._handleSelectionChange.notCalled, "MDCTable _handleSelectionChange was not called");
								assert.ok(oMdcTableWrapper._fireSelect.notCalled, "MDCTable _fireSelect was not called");
							});
						});
					});
				});
			});
		});
	});

	QUnit.test("handleSelectionChange - Multi Select", (assert) => {
		_init(false, "Table", TableSelectionMode.Multi);
		const oPrepareContentPromise = oMdcTableWrapper.getContent().then(() => {
			return oMdcTableWrapper.onBeforeShow();
		});


		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");


		return oPrepareContentPromise.then((oContent) => {
			return oMdcTableWrapper.awaitListBinding().then(() => {
				const oSelectionPlugin = oTable._oTable._getSelectionPlugin();

				return oSelectionPlugin.addSelectionInterval(0,2).then(() => {
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

	QUnit.test("handleSelectionChange - Clone", (assert) => {
		_init(false, "Table", TableSelectionMode.SingleMaster);
		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");

		return oContentPromise.then((oContent) => {
			return oMdcTableWrapper.onBeforeShow(true).then(() => {
				return oMdcTableWrapper.awaitListBinding().then(() => {
					const oClone = oMdcTableWrapper.clone("MyClone");
					const oCloneTable = oClone.getTable();
					oCloneTable.fireSelectionChange();

					assert.notOk(oMdcTableWrapper._handleSelectionChange.called, "MDCTable _handleSelectionChange was not called");
					oClone.destroy();
				});
			});
		});
	});

	QUnit.skip("handleSelectionChange - noop", (assert) => {
		_init(false, "Table", TableSelectionMode.Single);
		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then((oContent) => {
			return oMdcTableWrapper.awaitListBinding().then(() => {

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
		beforeEach() {
			bIsTypeahead = false;
			//_init(false, "ResponsiveTableType", TableSelectionMode.Single);
		},
		afterEach: _teardown
	});

	QUnit.test("handleSelectionChange - SingleSelect", (assert) => {
		_init(false, "ResponsiveTableType", TableSelectionMode.SingleMaster);

		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then((oContent) => {
			return oMdcTableWrapper.onBeforeShow(true).then(() => {
				return oMdcTableWrapper.awaitListBinding().then(() => {
					oMdcTableWrapper.onShow(true);
					const oInnerTable = oTable._oTable;
					const aTableItems = oInnerTable?.getItems();

					oInnerTable?.setSelectedItem(aTableItems?.[2], true, true);
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

					const oTableBox = oContent.getFlexContent();
					assert.ok(oTableBox.isA("sap.m.VBox"), "TableBox is sap.m.VBox");
					assert.equal(oTableBox.getHeight(), "100%", "Panel height");
					assert.ok(oTableBox.hasStyleClass("sapMdcValueHelpPanelTableBox"), "Panel has style class sapMdcTablePanel");
					assert.equal(oTableBox.getItems().length, 1, "TableBox number of items");
					const oScrollContainer = oTableBox.getItems()[0];
					assert.ok(oScrollContainer.isA("sap.m.ScrollContainer"), "Panel item is ScrollContainer");
					assert.equal(oScrollContainer.getContent().length, 1, "ScrollContainer number of items");
					assert.equal(oScrollContainer.getContent()[0], oTable, "Table inside ScrollContainer");
					assert.equal(oMdcTableWrapper.getScrollDelegate(), oScrollContainer.getScrollDelegate(), "ScrollDelegate");

					oMdcTableWrapper.onHide();
				});
			});
		});
	});

	QUnit.test("handleSelectionChange - MultiSelect", (assert) => {
		_init(false, "ResponsiveTableType", TableSelectionMode.Multi);

		const oContentPromise = oMdcTableWrapper.getContent();

		sinon.spy(oMdcTableWrapper, "_handleSelectionChange");
		sinon.spy(oMdcTableWrapper, "_fireSelect");

		return oContentPromise.then((oContent) => {
			return oMdcTableWrapper.onBeforeShow(true).then(() => {
				return oMdcTableWrapper.awaitListBinding().then(async () => {
					oMdcTableWrapper.onShow(true);
					const oInnerTable = oTable._oTable;
					const aTableItems = oInnerTable?.getItems();

					oInnerTable?.setSelectedItem(aTableItems?.[2], true, true);
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

					// check item type changed while mouseover
					await _renderScrollContainer();
					const oItem = oTable._oTable.getItems()[0];
					qutils.triggerMouseEvent(oItem.getDomRef(), "mouseover", null, null, null, null, 0);
					assert.equal(oItem.getType(), ListItemType.Active, "ItemType");
					oMdcTableWrapper.onHide();
				});
			});
		});
	});
});
