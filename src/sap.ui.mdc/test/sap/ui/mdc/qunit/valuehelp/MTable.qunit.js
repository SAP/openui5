// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/ValueHelpDelegate",
	"delegates/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/valuehelp/FilterBar",
	// to have it loaded when BasicSearch should be created
	"sap/ui/mdc/FilterField",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/ScrollContainer",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/p13n/Engine",
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment"
], function(
	Library,
	qutils,
	ValueHelpDelegate,
	ValueHelpDelegateV4,
	MTable,
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
	Table,
	Column,
	ColumnListItem,
	Label,
	Text,
	ScrollContainer,
	KeyCodes,
	coreLibrary,
	nextUIUpdate,
	Engine,
	createAppEnvironment
) {
	"use strict";

	const ListMode = mLibrary.ListMode;

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
	const oMResourceBundle = Library.getResourceBundleFor("sap.m");

	let oMTable;
	let oModel;
	let oTable;
	let oItemTemplate;
	let bIsOpen = true;
	let bIsTypeahead = true;
	let iMaxConditions = -1;
	let oScrollContainer = null;
	let sLocalFilterValue;

	const oValueHelp = {
		getPayload: function () {},
		getDisplay: function () {
			return "DescriptionValue";
		}
	};

	const oContainer = { //to fake Container
		getScrollDelegate: function() {
			return oScrollContainer;
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
		setLocalFilterValue: function(sFilterValue) {
			sLocalFilterValue = sFilterValue;
		},
		getLocalFilterValue: function() {
			return sLocalFilterValue;
		},
		getFilterValue: function () {
			return undefined;
		},
		hasDialog: function() {
			return true;
		},
		getDomRef: function() {
			return oTable?.getDomRef();
		},
		getValueHelp: function () {
			return oValueHelp;
		}
	};

	const _init = function(bTypeahead) {
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

		oTable = new Table("T1", {
			width: "26rem",
			mode: bTypeahead ? ListMode.SingleSelectMaster : ListMode.MultiSelect,
			columns: [ new Column({header: new Label({text: "Id"})}),
					   new Column({header: new Label({text: "Text"})}),
					   new Column({header: new Label({text: "Info"})})],
			items: {path: "/items", template: oItemTemplate}
		});

		oTable.setModel(oModel); // as ValueHelp is faked

		const aConditions = [Condition.createItemCondition("I2", "Item 2", {inParameter: null})];
		oMTable = new MTable("MT1", {
			table: oTable,
			keyPath: "key",
			descriptionPath: "text",
			conditions: aConditions, // don't need to test the binding of Container here
			config: { // don't need to test the binding of Container here
				maxConditions: iMaxConditions,
				operators: [OperatorName.EQ, OperatorName.BT]
			}
		}).setModel(oModel);
		sinon.stub(oMTable, "getParent").returns(oContainer);
		oMTable.setParent(); // just to fake call
		oMTable.oParent = oContainer; // fake
	};

	const _teardown = function() {
		oMTable.destroy();
		oMTable = null;
		oTable = undefined; // destroyed with MTable content
		oItemTemplate.destroy();
		oItemTemplate = undefined;
		oModel.destroy();
		oModel = undefined;
		bIsOpen = true;
		bIsTypeahead = true;
		iMaxConditions = -1;
		sLocalFilterValue = undefined;
		if (oScrollContainer) {
			oScrollContainer.getContent.restore();
			oScrollContainer.destroy();
			oScrollContainer = null;
			delete oContainer.getUIAreaForContent;
		}
	};

	async function _renderScrollContainer() {

		oScrollContainer = new ScrollContainer(); // to test scrolling
		sinon.stub(oScrollContainer, "getContent").returns([oTable]); // to render table
		oContainer.getUIAreaForContent = function() {
			return oScrollContainer.getUIArea();
		};
		oScrollContainer.placeAt("content"); // render ScrollContainer
		await nextUIUpdate();
		sinon.spy(oTable, "scrollToIndex");

	}

	const _fakeV4Binding = function (oListBinding) {
		oListBinding = oListBinding || oTable.getBinding("items");
		oListBinding.requestContexts = function() { return Promise.resolve([]);};
		oListBinding.changeParameters = function() {};
		oListBinding.mParameters = {};
		oListBinding.getRootBinding = function () { return undefined;};
		oListBinding.suspend = function() {};
		oListBinding.resume = function() {};
	};

	QUnit.module("Typeahead", {
		beforeEach: function() {
			bIsTypeahead = true;
			iMaxConditions = 1;
			_init(true);
		},
		afterEach: _teardown
	});

	QUnit.test("getContent for typeahead", function(assert) {

		let iSelect = 0;
		let aConditions;
		let sType;
		oMTable.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oMTable.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		const oContent = oMTable.getContent();

		if (oContent) {
			const sItemId = oMTable.onShow(); // to update selection and scroll
			assert.ok(oContent, "Content returned");
			assert.equal(oContent, oTable, "Content is given Table");
			assert.equal(oTable.getMode(), ListMode.SingleSelectMaster, "Table mode");
			// assert.equal(oMTable.getDisplayContent(), oTable, "Table stored in displayContent"); // TODO: overwrite getDisplayContent here?
			assert.ok(oTable.hasStyleClass("sapMComboBoxList"), "List has style class sapMComboBoxList");
			assert.notOk(oTable.hasStyleClass("sapMListFocus"), "Table has no style class sapMListFocus");

			oMTable.setVisualFocus();
			assert.ok(oTable.hasStyleClass("sapMListFocus"), "Table has style class sapMListFocus");

			const aItems = oTable.getItems();
			let oItem = aItems[0];
			assert.notOk(oItem.getSelected(), "Item0 not selected");
			oItem = aItems[1];
			assert.ok(oItem.getSelected(), "Item1 is selected");
			assert.notOk(oItem.hasStyleClass("sapMLIBFocused"), "Item1 is focused");
			assert.equal(sItemId, oItem.getId(), "OnShow returns selected itemId");
			oItem = aItems[2];
			assert.notOk(oItem.getSelected(), "Item2 not selected");

			const aNewConditions = [
				Condition.createItemCondition("I3", "X-Item 3")
			];

			oItem.setSelected(true); // In SingleSelectMaster MTable will not update the items selection, as the table already did it.
			oTable.fireItemPress({listItem: oItem});

			assert.equal(iSelect, 1, "select event fired");
			assert.deepEqual(aConditions, aNewConditions, "select event conditions");
			assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
			assert.equal(iConfirm, 1, "confirm event fired");
			// TODO: clarify if Conditions should really not be updated and items not selected - so it is somehow not in sync
			// assert.deepEqual(oMTable.getConditions(), aNewConditions, "MTable conditions");
			// oItem = aItems[1];
			// assert.notOk(oItem.getSelected(), "Item1 is not selected");
			// oItem = aItems[2];
			// assert.ok(oItem.getSelected(), "Item2 is selected");

			oMTable.onHide();
			assert.notOk(oTable.hasStyleClass("sapMComboBoxList"), "List style class sapMComboBoxList removed");
		}

	});

	QUnit.test("getContainerConfig - footer without length limitation", function(assert) {

		const oContainerConfig = oMTable.getContainerConfig();
		const oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];

		assert.ok(oContainerConfig, "Config returned");
		const oFooterContent = oPopupConfig.getFooter && oPopupConfig.getFooter();

		if (oFooterContent) {
			const fnDone = assert.async();
			oFooterContent.then(function(aFooterContent) {
				assert.notOk(aFooterContent, "no Content returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getContainerConfig - footer with length limitation", function(assert) {

		oTable.bindItems({path: "/items", template: oItemTemplate, length: 10});

		let iSwitchToDialog = 0;
		oMTable.attachEvent("requestSwitchToDialog", function(oEvent) {
			iSwitchToDialog++;
		});

		const oContainerConfig = oMTable.getContainerConfig();
		const oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];

		assert.ok(oContainerConfig, "Config returned");
		const oFooterContent = oPopupConfig.getFooter && oPopupConfig.getFooter();

		if (oFooterContent) {
			const fnDone = assert.async();
			oFooterContent.then(function(oFooterContent) {
				assert.ok(oFooterContent, "Content returned");
				assert.ok(oFooterContent.isA("sap.m.Toolbar"), "Content is sap.m.Toolbar");
				const aToolbarContent = oFooterContent.getContent();
				assert.equal(aToolbarContent.length, 2, "Tollbar content length");
				const oSpacer = aToolbarContent[0];
				assert.ok(oSpacer.isA("sap.m.ToolbarSpacer"), "First content is sap.m.ToolbarSpacer");
				const oButton = aToolbarContent[1];
				assert.ok(oButton.isA("sap.m.Button"), "Second content is sap.m.Button");
				assert.equal(oButton.getText(), oMResourceBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"), "Button text");
				assert.ok(oButton.getEnabled(), "Button enabled");
				assert.equal(oButton.getType(), mLibrary.ButtonType.Default, "Button type");

				oButton.firePress();
				assert.equal(iSwitchToDialog, 1, "requestSwitchToDialog event fired");

				oFooterContent.destroy();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("Filtering for InParameters", function(assert) {

		const oListBinding = oTable.getBinding("items");
		_fakeV4Binding(oListBinding);
		sinon.spy(oListBinding, "filter");
		const oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.NotValidated);
		const oInPromise = Promise.resolve({inValue: [oCondition]});
		sinon.stub(ValueHelpDelegate, "getFilterConditions").returns(oInPromise);

		const fnDone = assert.async();
		oMTable.onBeforeShow(true).then(function() {
			assert.ok(ValueHelpDelegate.getFilterConditions.calledWith(oValueHelp, oMTable), "ValueHelpDelegate.getFilterConditions called");
			oMTable.onShow(true); // to trigger filtering
			// compare arguments of filter as Filter object is changed during filtering
			assert.equal(oListBinding.filter.args.length, 1, "ListBinding filter called once");
			assert.equal(oListBinding.filter.args[0].length, 2, "ListBinding filter number of arguments");
			assert.equal(oListBinding.filter.args[0][0].length, 1, "ListBinding filter is array with one filter");
			assert.equal(oListBinding.filter.args[0][0][0].sPath, "inValue", "ListBinding filter path");
			assert.equal(oListBinding.filter.args[0][0][0].sOperator, FilterOperator.EQ, "ListBinding filter operator");
			assert.equal(oListBinding.filter.args[0][0][0].oValue1, "3", "ListBinding filter value1");
			assert.equal(oListBinding.filter.args[0][1], FilterType.Application, "ListBinding filter type");
			const aItems = oTable.getItems();
			assert.equal(aItems.length, 1, "number of items");
			assert.equal(aItems[0].getCells()[0].getText(), "I3", "Key of item");
			assert.notOk(aItems[0].hasStyleClass("sapMLIBFocused"), "Item has style no class sapMLIBFocused");
			assert.notOk(oTable.hasStyleClass("sapMListFocus"), "Table has style no class sapMListFocus");

			ValueHelpDelegate.getFilterConditions.restore();
			fnDone();
		});

	});

	QUnit.test("Filtering using $search", function(assert) {

		let iTypeaheadSuggested = 0;
		let oCondition;
		let sFilterValue;
		let sItemId;
		let iItems;
		let bTypeaheadCaseSensitive;
		oMTable.attachEvent("typeaheadSuggested", function(oEvent) {
			iTypeaheadSuggested++;
			oCondition = oEvent.getParameter("condition");
			sFilterValue = oEvent.getParameter("filterValue");
			sItemId = oEvent.getParameter("itemId");
			iItems = oEvent.getParameter("items");
			bTypeaheadCaseSensitive = oEvent.getParameter("caseSensitive");
		});

		sinon.stub(oContainer, "getValueHelpDelegate").returns(ValueHelpDelegateV4);
		sinon.spy(ValueHelpDelegateV4, "updateBinding"); //test V4 logic

		const oListBinding = oTable.getBinding("items");
		_fakeV4Binding(oListBinding);
		sinon.spy(oListBinding, "filter");
		sinon.spy(oListBinding, "changeParameters");
		oListBinding.suspend(); // check for resuming

		oMTable.setConditions(); // before filtering conditions should be cleared in typeahead for single-value
		oMTable._bContentBound = true;
		oMTable.setFilterValue("X");
		assert.ok(ValueHelpDelegateV4.updateBinding.called, "ValueHelpDelegateV4.updateBinding called");
		assert.ok(ValueHelpDelegateV4.updateBinding.calledWith(oValueHelp, oListBinding), "ValueHelpDelegateV4.updateBinding called parameters");
		assert.ok(oListBinding.changeParameters.calledWith({$search: "X"}), "ListBinding.changeParameters called with search string");
		assert.notOk(oListBinding.isSuspended(), "ListBinding is resumed");

		const fnDone = assert.async();
		setTimeout( function(){ // as waiting for Promise
			// as JSOM-Model does not support $search all items are returned, but test for first of result
			const oTable = oMTable.getTable();
			const aItems = oTable.getItems();
			assert.equal(iTypeaheadSuggested, 1, "typeaheadSuggested event fired");
			assert.deepEqual(oCondition, Condition.createItemCondition("I3", "X-Item 3"), "typeaheadSuggested event condition");
			assert.equal(sFilterValue, "X", "typeaheadSuggested event filterValue");
			assert.equal(sItemId, aItems[2].getId(), "typeaheadSuggested event itemId");
			assert.equal(iItems, 3, "typeaheadSuggested event items");
			assert.equal(bTypeaheadCaseSensitive, false, "typeaheadSuggested event caseSensitive");

			oMTable.setFilterValue("ABC");
			assert.ok(oListBinding.changeParameters.calledWith({$search: "ABC"}), "ListBinding.changeParameters called with search string");

			iTypeaheadSuggested = 0;
			setTimeout( function(){ // as waiting for Promise
				// as JSOM-Model does not support $search all items are returned, but test for first of result
				assert.equal(iTypeaheadSuggested, 1, "typeaheadSuggested event fired");
				assert.notOk(oCondition, "typeaheadSuggested event no condition");
				assert.equal(sFilterValue, "ABC", "typeaheadSuggested event filterValue");
				assert.notOk(sItemId, "typeaheadSuggested event no itemId");
				assert.equal(iItems, 3, "typeaheadSuggested event items");
				assert.equal(bTypeaheadCaseSensitive, false, "typeaheadSuggested event caseSensitive");

				oContainer.getValueHelpDelegate.restore();
				ValueHelpDelegateV4.updateBinding.restore();
				fnDone();
			}, 0);
		}, 0);

	});

	// Delegate seems to already be loaded in this test?
	/* QUnit.test("Filtering waiting for delegate", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fResolve) {
			fnResolve = fResolve;
		});
		sinon.stub(oContainer, "isValueHelpDelegateInitialized").returns(false);
		sinon.stub(oContainer, "awaitValueHelpDelegate").returns(oPromise);

		var oListBinding = oTable.getBinding("items");
		sinon.spy(oListBinding, "filter");
		var oCondition = Condition.createCondition(OperatorName.EQ", ["3"], undefined, undefined, ConditionValidated.NotValidated);
		oMTable.setProperty("inConditions", {inValue: [oCondition]});
		oMTable.onShow(); // to trigger filtering

		// compare arguments of filter as Filter object is changed during filtering
		assert.notOk(oListBinding.filter.called, "ListBinding filter not called before Delegate finished");

		var fnDone = assert.async();
		setTimeout( function(){ // as waiting for Promise
			assert.ok(oListBinding.filter.called, "ListBinding filter called after Delegate finished");
			fnDone();
		}, 0);

		fnResolve();
		oContainer.isValueHelpDelegateInitialized.restore();
		oContainer.awaitValueHelpDelegate.restore();

	}); */

	QUnit.test("isSearchSupported", function(assert) {
		const isSearchSupportedStub = sinon.stub(ValueHelpDelegate, "isSearchSupported").returns(false);
		assert.notOk(oMTable.isSearchSupported(), "not supported for filtering");
		isSearchSupportedStub.returns(true);
		assert.ok(oMTable.isSearchSupported(), "supported for filtering");
		isSearchSupportedStub.restore();
	});

	QUnit.test("getItemForValue: check for key - match", function(assert) {

		sinon.spy(ValueHelpDelegate, "getFilterConditions");
		sinon.stub(ValueHelpDelegate, "createConditionPayload").callsFake(function(oPayload, oContent, aValues, oContext) {
			if (aValues && aValues[0] === "I3") {
				return {inParameters: {inValue: "3"}, outParameters: null};
			}
		});

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.ok(ValueHelpDelegate.getFilterConditions.calledWith(oValueHelp, oMTable, oConfig), "ValueHelpDelegate.getFilterConditions called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: {inParameters: {inValue: "3"}, outParameters: null}}, "Item returned");
				ValueHelpDelegate.getFilterConditions.restore();
				ValueHelpDelegate.createConditionPayload.restore();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				ValueHelpDelegate.getFilterConditions.restore();
				ValueHelpDelegate.createConditionPayload.restore();
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key with InParameter - match", function(assert) {

		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", inValue: "3a" },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3" }
			]
		});

		const oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.NotValidated);
		const oInPromise = Promise.resolve({inValue: [oCondition]});
		sinon.stub(ValueHelpDelegate, "getFilterConditions").returns(oInPromise);

		sinon.stub(ValueHelpDelegate, "createConditionPayload").callsFake(function(oPayload, oContent, aValues, oContext) {
			if (aValues && aValues[0] === "I3") {
				return {inParameters: {inValue: "3"}, outParameters: null};
			}
		});

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			bindingContext: "BC", // just to test if used
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);

		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.ok(ValueHelpDelegate.getFilterConditions.calledWith(oValueHelp, oMTable, oConfig), "ValueHelpDelegate.getFilterConditions called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: {inParameters: {inValue: "3"}, outParameters: null}}, "Item returned");
				ValueHelpDelegate.getFilterConditions.restore();
				ValueHelpDelegate.createConditionPayload.restore();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				ValueHelpDelegate.getFilterConditions.restore();
				ValueHelpDelegate.createConditionPayload.restore();
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key - no unique match with setUseFirstMatch=false", function(assert) {

		oMTable.setUseFirstMatch(false);
		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", inValue: "3a" },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3b" }
			]
		});

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch called");
				assert.ok(oError instanceof ParseException, "ParseException returned");
				assert.equal(oError.message, oResourceBundle.getText("valuehelp.VALUE_NOT_UNIQUE", ["I3"]), "Error message");
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key - no unique match with setUseFirstMatch=true", function(assert) {

		oMTable.setUseFirstMatch(true);
		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", inValue: "3a" },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3b" }
			]
		});

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "Item 3", payload: undefined}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key - match from request", function(assert) {

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

/* 		sinon.stub(oTable, "getItems").onFirstCall().returns([]); // to force request
 */		//oTable.getItems.callThrough();

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: undefined}, "Item returned");
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
			}).finally(function () {
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key with InParameters - match from request", function(assert) {

		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", inValue: "3a" },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3" }
			]
		});

		const oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.NotValidated);
		const oInPromise = Promise.resolve({inValue: [oCondition]});
		sinon.stub(ValueHelpDelegate, "getFilterConditions").returns(oInPromise);

		sinon.stub(ValueHelpDelegate, "createConditionPayload").callsFake(function(oPayload, oContent, aValues, oContext) {
			const oData = oContext.getObject();
			if (oData.key === "I3") {
				return {inParameters: {inValue: oData.inValue}};
			}
		});

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: undefined,
			value: "I3",
			bindingContext: {getPath: function () {return "BC";}},
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		/* sinon.stub(oTable, "getItems").onFirstCall().returns([]); // to force request
		oTable.getItems.callThrough(); */

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.ok(ValueHelpDelegate.getFilterConditions.calledWith(oValueHelp, oMTable, oConfig), "ValueHelpDelegate.getFilterConditions called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: {inParameters: {inValue: "3"}}}, "Item returned");
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
			}).finally(function () {
				ValueHelpDelegate.getFilterConditions.restore();
				ValueHelpDelegate.createConditionPayload.restore();
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key - no match", function(assert) {

		const oConfig = {
			parsedValue: "X",
			parsedDescription: undefined,
			value: "X",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch called");
				assert.ok(oError instanceof ParseException, "ParseException returned");
				assert.equal(oError.message, oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["X"]), "Error message");
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for description - match", function(assert) {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: "x-item 3",
			value: "X_Item 3",
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			caseSensitive: false,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: undefined}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for description - match with case sensitive check", function(assert) {

		oMTable.setUseFirstMatch(false);
		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "item 1", key: "i1", additionalText: "Text 1b", inValue: "b" },
				{ text: "X-Item 3", key: "I3", additionalText: "Text 3", inValue: "3" }
			]
		});

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: "item 1",
			value: "item 1",
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			caseSensitive: false, // should check fallback if multiple items map  but only one case sensitive.
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "i1", description: "item 1", payload: undefined}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for description - match from request", function(assert) {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: "x-item 3",
			value: "X-Item 3",
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			caseSensitive: false,
			exception: ParseException,
			control: "MyControl"
		};

		/* sinon.stub(oTable, "getItems").onFirstCall().returns([]); // to force request
		oTable.getItems.callThrough(); */

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: undefined}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key and description - match", function(assert) {

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: "I3",
			value: "I3",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: true,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: undefined}, "Item returned");
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
			}).finally(function() {
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check for key and description - match from request", function(assert) {

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: "I3",
			value: "I3",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: true,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		/* sinon.stub(oTable, "getItems").onFirstCall().returns([]); // to force request
		oTable.getItems.callThrough(); */

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I3", description: "X-Item 3", payload: undefined}, "Item returned");
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
			}).finally(function() {
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: check missing paths", function(assert) {

		oMTable.setKeyPath();
		oMTable.setDescriptionPath();

		const oConfig = {
			parsedValue: "I3",
			parsedDescription: "I3",
			value: "I3",
			bindingContext: undefined,
			checkKey: true,
			checkDescription: true,
			caseSensitive: true,
			exception: ParseException,
			control: "MyControl"
		};

		_fakeV4Binding();

		try {
			oMTable.getItemForValue(oConfig);
			assert.ok(false, "Exception missing");
		} catch (oException) {
			assert.equal(oException.message, "MTable: KeyPath missing! " + oMTable.getId(), "Exception fired");
		}

		oConfig.checkKey = false;

		try {
			oMTable.getItemForValue(oConfig);
			assert.ok(false, "Exception missing");
		} catch (oException) {
			assert.equal(oException.message, "MTable: DescriptionPath missing! " + oMTable.getId(), "Exception fired");
		}

	});

	QUnit.test("getItemForValue: ValueHelpDelegate.getFilterConditions", function(assert) {

		oModel.setData({
			items: [
				{ text: "Item 1A", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 1B", key: "I1", additionalText: "Text 1b", inValue: "b" },
				{ text: "Item 1C", key: "I1", additionalText: "Text 1c", inValue: "c" }
			]
		});

		const oConfig = {
			parsedValue: "I1",
			parsedDescription: undefined,
			value: "I1",
			context: {payload: {inValue: "b"}},
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			caseSensitive: false,
			exception: ParseException,
			control: "MyControl"
		};

		const getFilterConditionsStub = sinon.stub(ValueHelpDelegate, "getFilterConditions");
		getFilterConditionsStub.callsFake(function (oPayload, oContent, oLocalConfig) {
			assert.ok(true, "ValueHelpDelegate.getFilterConditions is called.");
			assert.equal(oContent, oMTable, "getFilterConditions receives correct content");
			assert.equal(oLocalConfig, oConfig, "getFilterConditions receives correct config");
			return 	{"inValue": [{operator: OperatorName.EQ, values: ["b"], validated: "NotValidated"}]};
		});

		_fakeV4Binding();

		const oPromise = oMTable.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I1", description: "Item 1B", payload: undefined}, "Correct item returned");
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
			}).finally(function() {
				getFilterConditionsStub.restore();
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue: Noop config", function(assert) {

		oModel.setData({
			items: [
				{ text: "Item 1A", key: "I1", additionalText: "Text 1a", inValue: "a" },
				{ text: "Item 1B", key: "I1", additionalText: "Text 1b", inValue: "b" },
				{ text: "Item 1C", key: "I1", additionalText: "Text 1c", inValue: "c" }
			]
		});

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: undefined,
			value: "I1",
			context: {payload: {inValue: "b"}},
			bindingContext: undefined,
			checkKey: false,
			checkDescription: false,
			caseSensitive: false,
			exception: ParseException,
			control: "MyControl"
		};

		const getFilterConditionsStub = sinon.stub(ValueHelpDelegate, "getFilterConditions");
		getFilterConditionsStub.callsFake(function (oPayload, oContent, oLocalConfig) {
			assert.ok(true, "ValueHelpDelegate.getFilterConditions is called.");
			assert.equal(oContent, oMTable, "getFilterConditions receives correct content");
			assert.equal(oLocalConfig, oConfig, "getFilterConditions receives correct config");
			return 	{"inValue": [{operator: OperatorName.EQ, values: ["b"], validated: "NotValidated"}]};
		});

		_fakeV4Binding();

		assert.notOk(oMTable.getItemForValue(oConfig), "getItemForValue returns null");
	});

	QUnit.test("isValidationSupported", function(assert) {

		assert.ok(oMTable.isValidationSupported(), "validation is supported");

	});

	let iNavigate = 0;
	let oNavigateCondition;
	let sNavigateItemId;
	let bNavigateLeaveFocus;
	let iVisualFocusSet = 0;

	function _attachNavigated() {

		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		iVisualFocusSet = 0;
		oMTable.attachEvent("navigated", function(oEvent) {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
		});
		oMTable.attachEvent("visualFocusSet", function(oEvent) {
			iVisualFocusSet++;
		});

	}

	function _checkNavigatedItem(assert, oTable, bOpen, iNavigatedIndex, iSelectedIndex, oCondition, bLeaveFocus) {

		const aItems = oTable.getItems();
		assert.equal(oTable.hasStyleClass("sapMListFocus"), bOpen && iNavigatedIndex >= 0, "Table has style class sapMListFocus");
		assert.equal(iVisualFocusSet, bOpen && iNavigatedIndex >= 0 && !bNavigateLeaveFocus ? 1 : 0, "visualFocusSet event fired");

		for (let i = 0; i < aItems.length; i++) {
			const oItem = aItems[i];
			if (i === iSelectedIndex) {
				assert.ok(oItem.hasStyleClass("sapMLIBFocused"), "Item" + i + " is focused");
				if (!oItem.isA("sap.m.GroupHeaderListItem")) {
					assert.ok(oItem.getSelected(), "Item" + i + " is selected");
				}
			} else {
				assert.notOk(oItem.hasStyleClass("sapMLIBFocused"), "Item" + i + " not focused");
				if (!oItem.isA("sap.m.GroupHeaderListItem")) {
					assert.notOk(oItem.getSelected(), "Item" + i + " not selected");
				}
			}
		}

		assert.equal(iNavigate, 1, "Navigated Event fired");
		if (!bLeaveFocus && iNavigatedIndex >= 0) {
			if (bIsOpen) {
				assert.ok(oTable.scrollToIndex.calledWith(iNavigatedIndex), "Table scrolled to item");
			}
			assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
			assert.equal(sNavigateItemId, aItems[iNavigatedIndex].getId(), "Navigated itemId");
		} else {
			assert.deepEqual(oNavigateCondition, undefined, "Navigated condition");
			assert.equal(sNavigateItemId, undefined, "Navigated itemId");
		}
		assert.equal(bNavigateLeaveFocus, bLeaveFocus, "Navigated leaveFocus");
		assert.deepEqual(oMTable.getConditions(), oCondition ? [oCondition] : [], "MTable conditions");
		assert.equal(oMTable._iNavigateIndex, iNavigatedIndex, "navigated index stored");
		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		iVisualFocusSet = 0;
		if (bIsOpen) {
			oTable.scrollToIndex.reset();
		}

	}

	QUnit.test("navigate", async function(assert) {

		bIsOpen = true; // test for open navigation (for closed is tested later)
		await _renderScrollContainer();

		_attachNavigated();

		oMTable.setConditions([]);
		oMTable.onShow(); // to update selection and scroll
		oMTable.navigate(1);
		_checkNavigatedItem(assert, oTable, true, 0, 0, Condition.createItemCondition("I1", "Item 1"), false);

		// no previous item
		oMTable.navigate(-1);
		_checkNavigatedItem(assert, oTable, true, 0, 0, Condition.createItemCondition("I1", "Item 1"), true);

		// next item of selected one
		oMTable.navigate(1);
		_checkNavigatedItem(assert, oTable, true, 1, 1, Condition.createItemCondition("I2", "Item 2"), false);
		oTable.getItems()[1].setSelected(false); // initialize
		oMTable.onConnectionChange(); // simulate new assignment
		oMTable.setConditions([]);

		// no item selected -> navigate to last
		oMTable.navigate(-1);
		_checkNavigatedItem(assert, oTable, true, 2, 2, Condition.createItemCondition("I3", "X-Item 3"), false);

		// first match -> navigation starts there
		oTable.getItems()[2].setSelected(false); // initialize
		oMTable.onConnectionChange(); // simulate new assignment
		oMTable.setConditions([]);
		oMTable.setHighlightId(oTable.getItems()[0].getId());
		oMTable.navigate(0);
		_checkNavigatedItem(assert, oTable, true, 0, 0, Condition.createItemCondition("I1", "Item 1"), false);

		oMTable.onHide();
		assert.notOk(oTable.hasStyleClass("sapMListFocus"), "Table removed style class sapMListFocus");

	});

	QUnit.test("navigate to footer button", async function(assert) {

		oTable.bindItems({path: "/items", template: oItemTemplate, length: 10});
		_attachNavigated();

		await _renderScrollContainer();

		const oContainerConfig = oMTable.getContainerConfig();
		const oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];
		const oFooterContent = oPopupConfig.getFooter && oPopupConfig.getFooter();

		if (oFooterContent) {
			const fnDone = assert.async();
			oFooterContent.then(async function(oFooterContent) {
				oFooterContent.placeAt("content"); // render Footer
				await nextUIUpdate();
				const aToolbarContent = oFooterContent.getContent();
				const oButton = aToolbarContent[1];
				sinon.spy(oButton, "focus");

				oMTable.setConditions([]);
				oMTable.onShow(); // to update selection and scroll
				oMTable._iNavigateIndex = 2; // fake last item navigated
				oMTable.navigate(1);
				_checkNavigatedItem(assert, oTable, true, -1, -1, undefined, false);
				assert.ok(oButton.focus.called, "Button focused");
				sinon.stub(oContainer, "getDomRef").returns(undefined); // to fake focus in field (outside Popover)

				qutils.triggerKeydown(oButton.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
				_checkNavigatedItem(assert, oTable, true, 2, 2, Condition.createItemCondition("I3", "X-Item 3"), false);

				oContainer.getDomRef.restore();
				oFooterContent.destroy();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("navigate for multi-value", async function(assert) {

		await _renderScrollContainer();

		oTable.setMode(ListMode.MultiSelect);
		oMTable.setConfig({
			maxConditions: -1,
			operators: [OperatorName.EQ, OperatorName.BT]
		});
		sinon.spy(oTable, "focus");

		_attachNavigated();
		let iSelect = 0;
		let aConditions;
		let sType;
		oMTable.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oMTable.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		const aItems = oTable.getItems();
		sinon.spy(aItems[0], "focus");

		oMTable.setConditions([]);
		oMTable.onShow(); // to update selection and scroll
		oMTable.navigate(1);
		assert.ok(aItems[0].focus.called, "First item focused");
		assert.equal(iNavigate, 0, "Navigated Event not fired");

		qutils.triggerKeydown(aItems[0].getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.notOk(oNavigateCondition, "Navigate condition");
		assert.notOk(sNavigateItemId, "Navigate event itemId");
		assert.ok(bNavigateLeaveFocus, "Navigate event leave");

		// selection via SelectionChangeEvent (selection of items done normally in table)
		iSelect = 0;
		iConfirm = 0;
		const aNewConditions = [
			Condition.createItemCondition("I2", "Item 2")
		];
		aItems[1].setSelected(false);
		oTable.fireSelectionChange({listItems: [aItems[1]]});
		assert.equal(iSelect, 1, "select event fired");
		assert.deepEqual(aConditions, aNewConditions, "select event conditions");
		assert.equal(sType, ValueHelpSelectionType.Remove, "select event type");
		assert.equal(iConfirm, 1, "confirm event fired");

	});

	QUnit.test("navigate to footer button (multi-value)", async function(assert) {

		oTable.bindItems({path: "/items", template: oItemTemplate, length: 10});
		_attachNavigated();

		await _renderScrollContainer();

		oTable.setMode(ListMode.MultiSelect);
		oMTable.setConfig({
			maxConditions: -1,
			operators: [OperatorName.EQ, OperatorName.BT]
		});

		const aItems = oTable.getItems();
		sinon.spy(aItems[2], "focus");

		const oContainerConfig = oMTable.getContainerConfig();
		const oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];
		const oFooterContent = oPopupConfig.getFooter && oPopupConfig.getFooter();

		if (oFooterContent) {
			const fnDone = assert.async();
			oFooterContent.then(async function(oFooterContent) {
				oFooterContent.placeAt("content"); // render Footer
				await nextUIUpdate();
				const aToolbarContent = oFooterContent.getContent();
				const oButton = aToolbarContent[1];
				sinon.spy(oButton, "focus");

				oMTable.setConditions([]);
				oMTable.onShow(); // to update selection and scroll
				oMTable.navigate(3);
				assert.ok(aItems[2].focus.called, "3rd item focused");
				assert.equal(iNavigate, 0, "Navigated Event not fired");

				qutils.triggerKeydown(aItems[2].getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
				assert.equal(iNavigate, 0, "Navigated Event not fired");
				assert.ok(oButton.focus.called, "Button focused");

				aItems[2].focus.reset();
				qutils.triggerKeydown(oButton.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
				assert.ok(aItems[2].focus.called, "3rd item focused");
				assert.equal(iNavigate, 0, "Navigated Event not fired");

				oFooterContent.destroy();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("navigate grouped table with async ListBinding (closed)", function(assert) {

		bIsOpen = false; // test for closed navigation (for open is tested later)
		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1", group: "a" },
				{ text: "Item 2", key: "I2", additionalText: "Text 2", group: "b" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", group: "a" }
			]
		});
		const oSorter = new Sorter("group", false, true);
		oTable.bindItems({path: '/items', suspended: true, sorter: oSorter, template: oItemTemplate});
		const oListBinding = oTable.getBinding("items");

		_attachNavigated();

		oMTable.setConditions([]);
		oModel.checkUpdate(true); // force model update
		sinon.stub(oListBinding, "getLength").onFirstCall().returns(undefined); // to fake pending binding
		oListBinding.getLength.callThrough();

		_fakeV4Binding();

		oMTable.navigate(1);
		const fnDone = assert.async();
		setTimeout( function(){ // as waiting for Promise
			_checkNavigatedItem(assert, oTable, false, 1, 1, Condition.createItemCondition("I1", "Item 1"), false);
			let oItem = oTable.getItems()[0];
			assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item0 is GroupHeaderListItem");
			oItem = oTable.getItems()[3];
			assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item3 is GroupHeaderListItem");

			// next item
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, false, 2, 2, Condition.createItemCondition("I3", "Item 3"), false);

			// next item (ignoring group header)
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, false, 4, 4, Condition.createItemCondition("I2", "Item 2"), false);

			// previous item (ignoring group header)
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, false, 2, 2, Condition.createItemCondition("I3", "Item 3"), false);

			// previous item
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, false, 1, 1, Condition.createItemCondition("I1", "Item 1"), false);

			// no previous item
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, false, 1, 1, Condition.createItemCondition("I1", "Item 1"), true);

			oMTable.onConnectionChange(); // simulate new assignment

			fnDone();
		}, 0);

	});

	QUnit.test("navigate grouped table with async ListBinding (open)", async function(assert) {

		oModel.setData({
			items: [
				{ text: "Item 1", key: "I1", additionalText: "Text 1", group: "a" },
				{ text: "Item 2", key: "I2", additionalText: "Text 2", group: "b" },
				{ text: "Item 3", key: "I3", additionalText: "Text 3", group: "a" }
			]
		});
		const oSorter = new Sorter("group", false, true);
		oTable.bindItems({path: '/items', suspended: true, sorter: oSorter, template: oItemTemplate});
		const oListBinding = oTable.getBinding("items");

		_fakeV4Binding(oListBinding);

		await _renderScrollContainer();

		_fakeV4Binding();

		_attachNavigated();

		oMTable.setConditions([]);
		oMTable.onShow(); // to simulate Open
		oModel.checkUpdate(true); // force model update
		sinon.stub(oListBinding, "getLength").onFirstCall().returns(undefined); // to fake pending binding
		oListBinding.getLength.callThrough();

		oMTable.navigate(1);
		const fnDone = assert.async();
		setTimeout( function(){ // as waiting for Promise
			_checkNavigatedItem(assert, oTable, true, 0, 0, undefined, false);
			let oItem = oTable.getItems()[0];
			assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item0 is GroupHeaderListItem");
			oItem = oTable.getItems()[3];
			assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item3 is GroupHeaderListItem");

			// next item
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, true, 1, 1, Condition.createItemCondition("I1", "Item 1"), false);

			// next item
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, true, 2, 2, Condition.createItemCondition("I3", "Item 3"), false);

			// next item (group header)
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, true, 3, 3, undefined, false);

			// next item
			oMTable.navigate(1);
			_checkNavigatedItem(assert, oTable, true, 4, 4, Condition.createItemCondition("I2", "Item 2"), false);

			// previous item (group header)
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, true, 3, 3, undefined, false);

			// previous item
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, true, 2, 2, Condition.createItemCondition("I3", "Item 3"), false);

			// previous item
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, true, 1, 1, Condition.createItemCondition("I1", "Item 1"), false);

			// previous item (group header)
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, true, 0, 0, undefined, false);

			// no previous item
			oMTable.navigate(-1);
			_checkNavigatedItem(assert, oTable, true, 0, 0, undefined, true);

			oMTable.onHide();

			fnDone();
		}, 0);

	});

	QUnit.test("getValueHelpIcon", function(assert) {

		assert.equal(oMTable.getValueHelpIcon(), "sap-icon://slim-arrow-down", "icon");
		oMTable.setUseAsValueHelp(false);
		assert.notOk(oMTable.getValueHelpIcon(), "no icon");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		let oCheckAttributes = {
			contentId: oTable.getId(),
			ariaHasPopup: "listbox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "both"
		};
		let oAttributes = oMTable.getAriaAttributes(1);
		assert.ok(oAttributes, "Aria attributes returned for SingleSelect");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

		const oResourceBundleM = Library.getResourceBundleFor("sap.m"); // sap.m is always loaded

		oCheckAttributes = {
			contentId: oTable.getId(),
			ariaHasPopup: "listbox",
			roleDescription: oResourceBundleM.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION"),
			valueHelpEnabled: false,
			autocomplete: "both"
		};
		oAttributes = oMTable.getAriaAttributes(-1);
		assert.ok(oAttributes, "Aria attributes returned for MultiSelect");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

		oMTable.setUseAsValueHelp(false);
		oMTable.setUseFirstMatch(false);
		oCheckAttributes = {
			contentId: oTable.getId(),
			ariaHasPopup: "listbox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "none"
		};
		oAttributes = oMTable.getAriaAttributes(-1);
		assert.ok(oAttributes, "Aria attributes returned for MultiSelect with typeahead only");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("shouldOpenOnNavigate", function(assert) {

		assert.notOk(oMTable.shouldOpenOnNavigate(), "should not open on navigate for single Select");

		oTable.setMode(ListMode.MultiSelect);
		assert.ok(oMTable.shouldOpenOnNavigate(), "should open on navigate for multi Select");

	});

	QUnit.test("getContainerConfig - getContentHeight", function(assert) {

		const oFakeDom = {
			getBoundingClientRect: function() {
				return {height: 10};
			}
		};
		sinon.stub(oTable, "getDomRef"). returns(oFakeDom);

		const oContainerConfig = oMTable.getContainerConfig();
		const oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];

		assert.ok(oContainerConfig, "Config returned");
		const iHeight = oPopupConfig.getContentHeight();
		assert.equal(iHeight, 10, "height");
		oTable.getDomRef.restore();

	});

	QUnit.test("isSingleSelect", function(assert) {

		assert.ok(oMTable.isSingleSelect(), "singe-selection taken from Table");

	});

	QUnit.module("Dialog", {
		beforeEach: function() {
			bIsTypeahead = false;
			_init(false);
		},
		afterEach: _teardown
	});

	QUnit.test("getContent for dialog", function(assert) {
		let iSelect = 0;
		let aConditions;
		let sType;
		oMTable.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oMTable.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		oMTable.setFilterValue("X");
		const oContent = oMTable.getContent();

		if (oContent) {
			const fnDone = assert.async();
			oContent.then(function(oContent) {
				oMTable.onShow(); // to update selection and scroll
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.ui.layout.FixFlex"), "Content is sap.m.FixFlex");
				assert.equal(oContent.getFixContent().length, 1, "FixFlex number of Fix items");
				const oFixContent = oContent.getFixContent()[0];
				assert.ok(oFixContent.isA("sap.m.VBox"), "FixContent is sap.m.VBox");
				assert.ok(oFixContent.hasStyleClass("sapMdcValueHelpPanelFilterbar"), "VBox has style class sapMdcValueHelpPanelFilterbar");
				assert.equal(oFixContent.getItems().length, 1, "VBox number of items");
				const oFilterBar = oFixContent.getItems()[0];
				assert.ok(oFilterBar.isA("sap.ui.mdc.valuehelp.FilterBar"), "VBox item is FilterBar");
				// const oConditions = oFilterBar.getInternalConditions();
				// assert.equal(oConditions["*text,additionalText*"][0].values[0], "X", "Search condition in FilterBar");
				const oFlexContent = oContent.getFlexContent();
				assert.ok(oFlexContent.isA("sap.m.Panel"), "FlexContent is sap.m.Panel");
				assert.ok(oFlexContent.getExpanded(), "Panel is expanded");
				assert.equal(oFlexContent.getHeight(), "100%", "Panel height");
				assert.equal(oFlexContent.getHeaderText(), oResourceBundle.getText("valuehelp.TABLETITLENONUMBER"), "Panel headerText");
				assert.ok(oFlexContent.hasStyleClass("sapMdcTablePanel"), "Panel has style class sapMdcTablePanel");
				assert.equal(oFlexContent.getContent().length, 1, "Panel number of items");
				const oScrollContainer = oFlexContent.getContent()[0];
				assert.ok(oScrollContainer.isA("sap.m.ScrollContainer"), "Panel item is ScrollContainer");
				assert.equal(oScrollContainer.getContent().length, 1, "ScrollContainer number of items");
				assert.equal(oScrollContainer.getContent()[0], oTable, "Table inside ScrollContainer");

				assert.equal(oTable.getMode(), ListMode.MultiSelect, "Table mode");
				// assert.equal(oMTable.getDisplayContent(), oTable, "Table stored in displayContent"); // TODO: overwrite getDisplayContent here?
				assert.ok(oTable.hasStyleClass("sapMComboBoxList"), "List has style class sapMComboBoxList");

				const aItems = oTable.getItems();
				let oItem = aItems[0];
				assert.notOk(oItem.getSelected(), "Item0 not selected");
				oItem = aItems[1];
				assert.ok(oItem.getSelected(), "Item1 is selected");
				oItem = aItems[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");

				let aNewConditions = [
					Condition.createItemCondition("I3", "X-Item 3")
				];
				oTable.fireItemPress({listItem: oItem});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aNewConditions, "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
				assert.equal(iConfirm, 0, "confirm event not fired");
				oItem = aItems[0];
				assert.notOk(oItem.getSelected(), "Item0 not selected");
				oItem = aItems[1];
				assert.ok(oItem.getSelected(), "Item1 is selected");
				oItem = aItems[2];
				assert.ok(oItem.getSelected(), "Item2 is selected");
				// TODO: clarify if Conditions should really not be updated - so they are not in sync with Selection
				// assert.deepEqual(oMTable.getConditions(), aNewConditions, "MTable conditions");

				// selection via SelectionChangeEvent (selection of items done normally in table)
				iSelect = 0;
				iConfirm = 0;
				aNewConditions = [
					Condition.createItemCondition("I2", "Item 2")
				];
				aItems[1].setSelected(false);
				oTable.fireSelectionChange({listItems: [aItems[1]]});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aNewConditions, "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Remove, "select event type");
				assert.equal(iConfirm, 0, "confirm event not fired");

				oMTable.onHide();
				assert.notOk(oTable.hasStyleClass("sapMComboBoxList"), "List style class sapMComboBoxList removed");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("isQuickSelectSupported", function(assert) {

		assert.ok(oMTable.isQuickSelectSupported(), "quick select supported");

	});

	QUnit.test("Filter with FilterBar", function(assert) {

		const oListBinding = oTable.getBinding("items");
		sinon.spy(oListBinding, "filter");
		sinon.stub(ValueHelpDelegate, "isSearchSupported").returns(true);

		const oFilterBar = new FilterBar("FB1");
		sinon.stub(oFilterBar, "getConditions").returns({
			additionalText: [Condition.createCondition(OperatorName.Contains, "2")]
		});

		oMTable.setFilterBar(oFilterBar);
		assert.ok(oFilterBar.getBasicSearchField(), "SearchField added to FilterBar");

		oFilterBar.fireSearch();

		// compare arguments of filter as Filter object is changed during filtering
		assert.equal(oListBinding.filter.args.length, 1, "ListBinding filter called once");
		assert.equal(oListBinding.filter.args[0].length, 2, "ListBinding filter number of arguments");
		assert.equal(oListBinding.filter.args[0][0].length, 1, "ListBinding filter is array with one filter");
		assert.equal(oListBinding.filter.args[0][0][0].sPath, "additionalText", "ListBinding filter1 path");
		assert.equal(oListBinding.filter.args[0][0][0].sOperator, FilterOperator.Contains, "ListBinding filter1 operator");
		assert.equal(oListBinding.filter.args[0][0][0].oValue1, "2", "ListBinding filter1 value1");
		assert.equal(oListBinding.filter.args[0][1], FilterType.Application, "ListBinding filter type");
		let aItems = oTable.getItems();
		assert.equal(aItems.length, 1, "number of items");
		assert.equal(aItems[0].getCells()[0].getText(), "I2", "Key of item");

		// removed FilterBar should not trigger filtering
		oListBinding.filter.reset();
		oMTable.setFilterBar();
		oFilterBar.getConditions.returns({
			additionalText: [Condition.createCondition(OperatorName.Contains, "3")]
		});
		assert.notOk(oFilterBar.getBasicSearchField(), "SearchField removed from FilterBar");

		oFilterBar.fireSearch();
		assert.notOk(oListBinding.filter.called, "No filtering called");
		oFilterBar.destroy();

		// Default filterbar used now
		const oDefaultFilterBar = oMTable.getAggregation("_defaultFilterBar");
		sinon.stub(oDefaultFilterBar, "getConditions").returns({
			additionalText: [Condition.createCondition(OperatorName.Contains, "1")]
		});
		oListBinding.filter.reset();
		oDefaultFilterBar.fireSearch();
		assert.equal(oListBinding.filter.args.length, 1, "ListBinding filter called once");
		assert.equal(oListBinding.filter.args[0].length, 2, "ListBinding filter number of arguments");
		assert.equal(oListBinding.filter.args[0][0].length, 1, "ListBinding filter is array with one filter");
		assert.equal(oListBinding.filter.args[0][0][0].sPath, "additionalText", "ListBinding filter1 path");
		assert.equal(oListBinding.filter.args[0][0][0].sOperator, FilterOperator.Contains, "ListBinding filter1 operator");
		assert.equal(oListBinding.filter.args[0][0][0].oValue1, "1", "ListBinding filter1 value1");
		assert.equal(oListBinding.filter.args[0][1], FilterType.Application, "ListBinding filter type");
		aItems = oTable.getItems();
		assert.equal(aItems.length, 1, "number of items");
		assert.equal(aItems[0].getCells()[0].getText(), "I1", "Key of item");

	});

	QUnit.test("Filtering with FilterBar and $search", function(assert) {
		let iTypeaheadSuggested = 0;
		oMTable.attachEvent("typeaheadSuggested", function(oEvent) {
			iTypeaheadSuggested++;
		});

		sinon.stub(oContainer, "getValueHelpDelegate").returns(ValueHelpDelegateV4);
		sinon.stub(ValueHelpDelegateV4, "isSearchSupported").callThrough(); // returns false for non V4-ListBinding
		sinon.stub(ValueHelpDelegateV4, "updateBindingInfo").callsFake(function(oValueHelp, oContent, oBindingInfo) { //test V4 logic
			ValueHelpDelegateV4.updateBindingInfo.wrappedMethod.apply(this, arguments);

			if (oContent.getSearch() === "i" && oBindingInfo.parameters.$search === "i") { // check if standard search is already set
				oBindingInfo.parameters.$search = "I";
			}
		});

		const oListBinding = oTable.getBinding("items");
		const oListBindingInfo = oTable.getBindingInfo("items");
		oListBinding.changeParameters = function(oParameters) {}; // just fake V4 logic
		oListBinding.getRootBinding = function() {}; // just fake V4 logic
		oListBinding.requestContexts = function(iStartIndex, iRequestedItems) {return Promise.resolve(oListBinding.getContexts(iStartIndex, iRequestedItems));}; // just fake V4 logic

		const oFilterBar = new FilterBar("FB1");
		sinon.stub(oFilterBar, "getConditions").returns({
			additionalText: [Condition.createCondition(OperatorName.Contains, "2")]
		});
		sinon.stub(oFilterBar, "getSearch").returns("i");

		oMTable.setFilterValue("i");
		oMTable.setFilterBar(oFilterBar);
		oMTable.onBeforeShow(true); // filtering should happen only if open
		assert.ok(oFilterBar.getBasicSearchField(), "SearchField added to FilterBar");

		sinon.spy(oListBinding, "filter");
		sinon.spy(oListBinding, "changeParameters");
		sinon.spy(oListBinding, "suspend");

		oFilterBar.fireSearch();

		const fnDone = assert.async();
		setTimeout( function(){
			// as waiting for Promise
			assert.ok(ValueHelpDelegateV4.isSearchSupported.called, "ValueHelpDelegateV4.isSearchSupported called");
			assert.ok(ValueHelpDelegateV4.updateBindingInfo.called, "ValueHelpDelegateV4.updateBindingInfo called");
			assert.equal(oListBindingInfo.parameters.$search, "I", "ListBindingInfo: search string set to $search");
			assert.ok(oListBinding.suspend.calledOnce, "ListBinding was suspended meanwhile");
			assert.notOk(oListBinding.isSuspended(), "ListBinding is resumed");
			assert.equal(oListBinding.filter.args.length, 1, "ListBinding filter called once");
			assert.equal(oListBinding.filter.args[0].length, 2, "ListBinding filter number of arguments");
			assert.equal(oListBinding.filter.args[0][0].length, 1, "ListBinding filter is array with one filter");
			assert.equal(oListBinding.filter.args[0][0][0].sPath, "additionalText", "ListBinding filter path");
			assert.equal(oListBinding.filter.args[0][0][0].sOperator, FilterOperator.Contains, "ListBinding filter operator");
			assert.equal(oListBinding.filter.args[0][0][0].oValue1, "2", "ListBinding filter value1");
			assert.equal(oListBinding.filter.args[0][1], FilterType.Application, "ListBinding filter type");
			assert.equal(iTypeaheadSuggested, 0, "typeaheadSuggested event not fired");

			ValueHelpDelegateV4.isSearchSupported.reset();
			ValueHelpDelegateV4.isSearchSupported.returns(false); // needed for legacy free UI5
			ValueHelpDelegateV4.updateBindingInfo.reset();

			oMTable.onBeforeShow(true); // fake new opening (as just changing Delegate functionality triggers nothing)
			assert.notOk(oFilterBar.getBasicSearchField(), "SearchField removed from FilterBar");

			oContainer.getValueHelpDelegate.restore();
			ValueHelpDelegateV4.isSearchSupported.restore();
			ValueHelpDelegateV4.updateBindingInfo.restore();
			fnDone();
		}, 0);
	});

	QUnit.test("isSingleSelect", function(assert) {

		assert.notOk(oMTable.isSingleSelect(), "multi-selection taken from Table");

	});

	QUnit.test("isNavigationEnabled", function(assert) {

		assert.ok(oMTable.isNavigationEnabled(1), "Navigation is enabled for 1");
		assert.ok(oMTable.isNavigationEnabled(-1), "Navigation is enabled for -1");
		assert.notOk(oMTable.isNavigationEnabled(9999), "Navigation is disabled for 9999");
		assert.notOk(oMTable.isNavigationEnabled(-9999), "Navigation is disabled for -9999");
		assert.notOk(oMTable.isNavigationEnabled(10), "Navigation is disabled for 10");
		assert.notOk(oMTable.isNavigationEnabled(-10), "Navigation is disabled for -10");
	});

	QUnit.test("setHighlightId", function(assert) {
		const aItems = oTable.getItems();

		oMTable.setHighlightId(aItems[0].getId());
		assert.notOk(aItems[0].hasStyleClass("sapMLIBFocused"), "setHighlightId not added class sapMLIBFocused");

		oMTable.setHighlightId(aItems[1].getId());
		assert.notOk(aItems[0].hasStyleClass("sapMLIBFocused"), "setHighlightId don't have class sapMLIBFocused");
		assert.notOk(aItems[1].hasStyleClass("sapMLIBFocused"), "setHighlightId not added class sapMLIBFocused");

		sinon.spy(aItems[1], "focus");
		oMTable.navigate(0);
		assert.ok(aItems[1].focus.called, "navigation focused item");

		oMTable.setHighlightId();
	});
});
