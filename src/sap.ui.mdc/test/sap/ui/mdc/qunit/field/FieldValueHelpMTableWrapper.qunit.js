// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/FieldValueHelpMTableWrapper",
	"sap/ui/mdc/field/FieldValueHelp",
	"sap/ui/mdc/field/FieldValueHelpDelegate",
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/field/InParameter",
	"sap/ui/mdc/field/OutParameter",
	"sap/ui/mdc/field/ValueHelpPanel",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/filterbar/vh/CollectiveSearchSelect",
	"sap/ui/mdc/FilterField",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/ScrollContainer",
	"sap/m/Popover",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes"
], function (
		qutils,
		FieldValueHelpMTableWrapper,
		FieldValueHelp,
		FieldValueHelpDelegate,
		FieldValueHelpDelegateV4,
		Condition,
		ConditionModel,
		InParameter,
		OutParameter,
		ValueHelpPanel,
		DefineConditionPanel,
		VHFilterBar,
		CollectiveSearchSelect,
		FilterField,
		Table,
		Column,
		ColumnListItem,
		Label,
		Text,
		ScrollContainer,
		Popover,
		Dialog,
		Button,
		Icon,
		JSONModel,
		FormatException,
		ParseException,
		Filter,
		FilterOperator,
		ODataModel,
		ODataListBinding,
		Device,
		KeyCodes
	) {
	"use strict";

	var iDialogDuration = sap.ui.getCore().getConfiguration().getAnimationMode() === "none" ? 15 : 500;
	var iPopoverDuration = Device.browser.firefox ? 410 : 355;

	var oModel;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	var oWrapper;
	var oFieldHelp;
	var oItemTemplate;
	var oTable;
	var oField;
	var iSelect = 0;
	var aSelectItems;
	var bSelectItemPress;
	var sSelectId;
	var iNavigate = 0;
	var sNavigateKey;
	var sNavigateDescription;
	var oNavigateInParameters;
	var oNavigateOutParameters;
	var sNavigateItemId;
	var bNavigateLeave;
	var iDataUpdate = 0;
	var bDataUpdateContentChange;
	var sDataUpdateId;

	var _mySelectionChangeHandler = function(oEvent) {
		iSelect++;
		aSelectItems = oEvent.getParameter("selectedItems");
		bSelectItemPress = oEvent.getParameter("itemPress");
		sSelectId = oEvent.oSource.getId();
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
		sNavigateKey = oEvent.getParameter("key");
		sNavigateDescription = oEvent.getParameter("description");
		oNavigateInParameters = oEvent.getParameter("inParameters");
		oNavigateOutParameters = oEvent.getParameter("outParameters");
		sNavigateItemId = oEvent.getParameter("itemId");
		bNavigateLeave = oEvent.getParameter("leave");
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
		bDataUpdateContentChange = oEvent.getParameter("contentChange");
		sDataUpdateId = oEvent.oSource.getId();
	};

	/* use dummy VieldValueHelp just to test API */
//	var bSingleSelection = true;
	var sKeyPath = "key";
	var sDescriptionPath = "text";
	var iMaxConditions = -1;
	var bUseInParameters = false;
	var oInParameter = new InParameter({helpPath: "additionalText"});
	var bUseOutParameters = false;
	var oOutParameter = new OutParameter({helpPath: "additionalText"});
	var oValueHelp = {
//			_getSingleSelection: function() {
//				return bSingleSelection;
//			},
			_getKeyPath: function() {
				return sKeyPath;
			},
			getDescriptionPath: function() {
				return sDescriptionPath;
			},
			getMaxConditions: function() {
				return iMaxConditions;
			},
			isA: function(sName) {
				return sName === "sap.ui.mdc.field.FieldValueHelp" ? true : false;
			},
			getModel: function(sName) {
				return oModel;
			},
			invalidate: function(oOrigin) {},
			getInParameters: function() {
				if (bUseInParameters) {
					return [oInParameter];
				} else {
					return [];
				}
			},
			getOutParameters: function() {
				if (bUseOutParameters) {
					return [oOutParameter];
				} else {
					return [];
				}
			},
			getDelegate: function() {
				return {name: "sap/ui/mdc/field/FieldValueHelpDelegate", payload: {}};
			},
			getControlDelegate: function () {
				return FieldValueHelpDelegate;
			},
			getPayload: function() {
				return {};
			},
			getScrollDelegate: function () {
				return undefined; // test real scrolling with FieldValueHelp and Popover
			}
	};

	var oClock;
	var _initWrapper = function(bFVH) {
		oModel = new JSONModel({
			items:[{text: "Item 1", key: "I1", additionalText: "Text 1", in2: "1"},
				   {text: "Item 2", key: "I2", additionalText: "Text 2", in2: null},
				   {text: "X-Item 3", key: "I3", additionalText: "Text 3", in2: ""}]
			});
		sap.ui.getCore().setModel(oModel);

		oItemTemplate = new ColumnListItem("MyItem", {
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		oTable = new Table("T1", {
			width: "26rem",
			columns: [ new Column({header: new Label({text: "Id"})}),
					   new Column({header: new Label({text: "Text"})}),
					   new Column({header: new Label({text: "Info"})})],
			items: {path: "/items", template: oItemTemplate}
		});

		if (!bFVH) {
			oTable.setModel(oModel); // as ValueHelp is faked
		}

		oWrapper = new FieldValueHelpMTableWrapper("W1", {
					selectedItems: [{key: "I2", description: "Item 2"}],
					selectionChange: _mySelectionChangeHandler,
					navigate: _myNavigateHandler,
					dataUpdate: _myDataUpdateHandler
				});
		if (!bFVH) {
			oWrapper.getParent = function() {
				return oValueHelp;
			};
		}
		oWrapper.setTable(oTable);
	};

	var _teardown = function() {
		if (oClock) {
			oClock.restore();
			oClock = undefined;
		}
		oTable.destroy();
		oTable = undefined;
		oItemTemplate.destroy();
		oItemTemplate = undefined;
		oWrapper.destroy();
		oWrapper = undefined;
		iSelect = 0;
		aSelectItems = undefined;
		bSelectItemPress = undefined;
		sSelectId = undefined;
		iNavigate = 0;
		sNavigateDescription = undefined;
		sNavigateKey = undefined;
		oNavigateInParameters = undefined;
		oNavigateOutParameters = undefined;
		sNavigateItemId = undefined;
		bNavigateLeave = undefined;
		iDataUpdate = 0;
		bDataUpdateContentChange = undefined;
		sDataUpdateId = undefined;
		sKeyPath = "key";
		sDescriptionPath = "text";
		iMaxConditions = -1;
		bUseInParameters = false;
		bUseOutParameters = false;
		FieldValueHelpMTableWrapper._init();
		oModel.destroy();
		oModel = undefined;
	};

	QUnit.module("API", {
		beforeEach: function() {
			_initWrapper(false);
			},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.ok(oWrapper.getFilterEnabled(), "getFilterEnabled");

		assert.equal(iDataUpdate, 1, "DataUpdate event fired from adding table");
		assert.ok(bDataUpdateContentChange, "content change");

	});

	QUnit.test("values from ValueHelp", function(assert) {

		var oFieldHelp = oWrapper._getFieldHelp();
		assert.equal(oFieldHelp, oValueHelp, "_getFieldHelp");
//		assert.ok(oWrapper._getSingleSelection(), "_getSingleSelection");
		assert.equal(oWrapper._getKeyPath(), sKeyPath, "_getKeyPath");
		assert.equal(oWrapper._getDescriptionPath(), sDescriptionPath, "_getDescriptionPath");
		assert.equal(oWrapper._getMaxConditions(), iMaxConditions, "_getMaxConditions");
		assert.ok(Array.isArray(oWrapper._getOutParameters()), "_getOutParameters");

	});

	QUnit.test("initialize", function(assert) {

		oWrapper.initialize();

		assert.ok(oWrapper._oScrollContainer, "ScrollContainer created");
		assert.ok(oWrapper._oScrollContainer.isA("sap.m.ScrollContainer"), "ScrollContainer instance");
		assert.equal(oWrapper._oScrollContainer.getId(), "W1-SC", "ScrollContainer ID");
		var aContent = oWrapper._oScrollContainer.getContent();
		assert.equal(aContent.length, 1, "ScrollContainer content length");
		assert.equal(aContent[0], oTable, "ScrollContainer content");

	});

	QUnit.test("getDialogContent (with async loading of ScrollContainer)", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/ScrollContainer").onFirstCall().returns(undefined);
		oStub.callThrough();


		oWrapper.initialize();
		var fnDone = assert.async();
		setTimeout( function(){ // to wait until ScollContainer is loaded
			var oContent = oWrapper.getDialogContent();
			assert.equal(oContent && oContent.getId(), "W1-SC", "ScrollContainer returned");
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("getSuggestionContent", function(assert) {

		var oContent = oWrapper.getSuggestionContent();
		assert.equal(oContent, oTable, "Table returned");

	});

	QUnit.test("setSelectedItems", function(assert) {

		var oNewModel = new JSONModel({
			items:[{text: "Item 1", key: "I1", additionalText: "Text 1"},
				   {text: "Item 2", key: "I2", additionalText: "Text 2"},
				   {text: "X-Item 3", key: "I3", additionalText: "Text 3"},
				   {text: "Item A1", key: "IA", additionalText: "Text 1"},
				   {text: "Item A2", key: "IA", additionalText: "Text 2"}]
			});
		oTable.setModel(oNewModel); // to test OutParameters

		var fnDone = assert.async();
		var aItems = oTable.getItems();
		setTimeout( function(){ // as model update is async
			assert.ok(aItems[1].getSelected(), "Item 1 is selected");

			oWrapper.setSelectedItems([{key: "I1", description: "Item 1"}]);
			aItems = oTable.getItems();
			assert.ok(aItems[0].getSelected(), "Item 0 is selected");

			oWrapper.setSelectedItems();
			aItems = oTable.getSelectedItems();
			assert.equal(aItems.length, 0, "no item selected");

			bUseOutParameters = true;
			oWrapper.setSelectedItems([{key: "IA", description: "Item A1", outParameters: {additionalText: "Text 1"}}]);
			aItems = oTable.getItems();
			assert.ok(aItems[3].getSelected(), "Item 3 is selected");

			oWrapper.setSelectedItems([{key: "IA", outParameters: {additionalText: "Text 2"}}]);
			aItems = oTable.getItems();
			assert.ok(aItems[4].getSelected(), "Item 4 is selected");
			var aSelectedItems = oWrapper.getSelectedItems();
			assert.equal(aSelectedItems.length, 1, "selectedItems");
			assert.equal(aSelectedItems[0].key, "IA", "selectedItem key");
			assert.equal(aSelectedItems[0].description, "Item A2", "selectedItem description");
			assert.notOk(aSelectedItems[0].inParameters, "selectedItem no in-parameters");
			assert.deepEqual(aSelectedItems[0].outParameters, {additionalText: "Text 2"} , "selectedItem out-parameters");

			oNewModel.destroy();
			fnDone();
		}, 0);

	});

	QUnit.test("fieldHelpOpen / fieldHelpClose", function(assert) {

		sinon.stub(oWrapper, "getScrollDelegate").onFirstCall().returns(true); // just to test our existance check, but nit inside table
		sinon.spy(oTable, "scrollToIndex");

		oWrapper.fieldHelpOpen(true); //suggestion
		assert.equal(oTable.getMode(), "MultiSelect", "Table mode in suggestion");
		assert.equal(oTable.getWidth(), "26rem", "Table width in suggestion");
		var aSticky = oTable.getSticky() || [];
		assert.equal(aSticky[0], "ColumnHeaders", "Table header is sticky");
		var aSelectedItems = oTable.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "1 item selected");
		assert.equal(aSelectedItems[0].getCells()[0].getText(), "I2", "selected item");
		assert.ok(oWrapper._bSuggestion, "Sugestion mode stored internally");
		assert.ok(oTable.scrollToIndex.calledWith(1), "Table scrolled to selected item");
		oTable.scrollToIndex.reset();

		oWrapper.fieldHelpClose();
		assert.notOk(oWrapper._bSuggestion, "Sugestion mode not longer stored internally");

		aSelectedItems[0].setSelected(false); // deselect item
		oWrapper.fieldHelpOpen(false); //dialog
		assert.equal(oTable.getMode(), "MultiSelect", "Table mode in dialog");
		assert.equal(oTable.getWidth(), "100%", "Table width in dialog");
		aSelectedItems = oTable.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "1 item selected");
		assert.equal(aSelectedItems[0].getCells()[0].getText(), "I2", "selected item");
		assert.notOk(oTable.scrollToIndex.calledWith(1), "Table not scrolled to selected item");
		oTable.scrollToIndex.reset();

		// Single Selection case
		oWrapper.fieldHelpClose();
		iMaxConditions = 1;

		oWrapper.fieldHelpOpen(true); //suggestion
		assert.equal(oTable.getMode(), "SingleSelectMaster", "Table mode in suggestion");
		assert.equal(oTable.getWidth(), "26rem", "Table width in suggestion");
		aSelectedItems = oTable.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "1 item selected");
		assert.equal(aSelectedItems[0].getCells()[0].getText(), "I2", "selected item");
		assert.ok(oWrapper._bSuggestion, "Sugestion mode stored internally");

		oWrapper.fieldHelpClose();

		aSelectedItems[0].setSelected(false); // deselect item
		oWrapper.fieldHelpOpen(false); //dialog
		assert.equal(oTable.getMode(), "SingleSelectLeft", "Table mode in dialog");
		assert.equal(oTable.getWidth(), "100%", "Table width in dialog");
		aSelectedItems = oTable.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "1 item selected");
		assert.equal(aSelectedItems[0].getCells()[0].getText(), "I2", "selected item");

		oWrapper.fieldHelpClose();

		oTable.scrollToIndex.reset();
		aSelectedItems[0].setSelected(false); // deselect item
		oWrapper.setSelectedItems([]); // remove selection
		oWrapper.fieldHelpOpen(true); //suggestion
		assert.equal(oTable.getMode(), "SingleSelectMaster", "Table mode in suggestion");
		aSelectedItems = oTable.getSelectedItems();
		assert.equal(aSelectedItems.length, 0, "no item selected");
		assert.notOk(oTable.scrollToIndex.called, "Table not scrolled to selected item");
		oTable.scrollToIndex.reset();

		oWrapper.fieldHelpClose();

	});

	QUnit.test("navigate in multi select", function(assert) {

		sinon.spy(oTable, "focus");
		oWrapper.fieldHelpOpen(true); //suggestion
		oWrapper.navigate(1);
		assert.ok(oTable.focus.called, "focus inside table");
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, undefined, "Navigate event description");
		assert.equal(sNavigateKey, undefined, "Navigate event key");
		assert.notOk(oNavigateInParameters, "no in-parameters set");
		assert.notOk(oNavigateOutParameters, "no out-parameters set");
		assert.equal(sNavigateItemId, undefined, "Navigate event itemId");
		var aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I2", "selectedItem key");

	});

	QUnit.test("navigate in single select", function(assert) {

		iMaxConditions = 1;
		oWrapper.fieldHelpOpen(true); //suggestion
		oWrapper.navigate(1);
		var aItems = oTable.getItems();
		assert.ok(aItems[2].getSelected(), "Item 2 is selected"); // as item 1 is set as selected
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "X-Item 3", "Navigate event description");
		assert.equal(sNavigateKey, "I3", "Navigate event key");
		assert.notOk(oNavigateInParameters, "no in-parameters set");
		assert.notOk(oNavigateOutParameters, "no out-parameters set");
		assert.equal(sNavigateItemId, "MyItem-T1-2", "Navigate event itemId");
		var aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");
		assert.notOk(aSelectedItems[0].inParameters, "selectedItem no in-parameters");
		assert.notOk(aSelectedItems[0].outParameters, "selectedItem no out-parameters");

		iNavigate = 0;
		oWrapper.navigate(1); // no next item
		aItems = oTable.getItems();
		assert.ok(aItems[2].getSelected(), "Item 2 is selected");
		assert.equal(iNavigate, 0, "no Navigate event fired");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");

		iNavigate = 0;
		oWrapper.setSelectedItems([{key: "I2"}]);
		oWrapper.navigate(-1);
		aItems = oTable.getItems();
		assert.ok(aItems[0].getSelected(), "Item 0 is selected");
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "Item 1", "Navigate event description");
		assert.equal(sNavigateKey, "I1", "Navigate event key");
		assert.equal(sNavigateItemId, "MyItem-T1-0", "Navigate event itemId");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I1", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "Item 1", "selectedItem description");

		iNavigate = 0;
		oWrapper.navigate(-1); // no previous item
		aItems = oTable.getItems();
		assert.ok(aItems[0].getSelected(), "Item 2 is selected");
		assert.equal(iNavigate, 0, "no Navigate event fired");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I1", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "Item 1", "selectedItem description");

		iNavigate = 0;
		oWrapper.setSelectedItems();
		oWrapper.navigate(3);
		aItems = oTable.getItems();
		assert.ok(aItems[2].getSelected(), "Item 2 is selected"); // as item 1 is set as selected
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "X-Item 3", "Navigate event description");
		assert.equal(sNavigateKey, "I3", "Navigate event key");
		assert.equal(sNavigateItemId, "MyItem-T1-2", "Navigate event itemId");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");

		iNavigate = 0;
		oWrapper.setSelectedItems();
		oWrapper.navigate(-2);
		aItems = oTable.getItems();
		assert.ok(aItems[1].getSelected(), "Item 1 is selected"); // as item 1 is set as selected
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "Item 2", "Navigate event description");
		assert.equal(sNavigateKey, "I2", "Navigate event key");
		assert.equal(sNavigateItemId, "MyItem-T1-1", "Navigate event itemId");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I2", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "Item 2", "selectedItem description");

		// test in/out-parameter
		bUseInParameters = true;
		bUseOutParameters = true;
		iNavigate = 0;
		oWrapper.navigate(1); // no next item
		aItems = oTable.getItems();
		assert.ok(aItems[2].getSelected(), "Item 2 is selected");
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "X-Item 3", "Navigate event description");
		assert.equal(sNavigateKey, "I3", "Navigate event key");
		assert.equal(sNavigateItemId, "MyItem-T1-2", "Navigate event itemId");
		assert.ok(oNavigateInParameters, "In-parameters set");
		assert.ok(oNavigateInParameters && oNavigateInParameters.hasOwnProperty("additionalText"), "in-parameters has additionalText");
		assert.equal(oNavigateInParameters && oNavigateInParameters.additionalText, "Text 3", "in-parameters additionalText");
		assert.ok(oNavigateOutParameters, "out-parameters set");
		assert.ok(oNavigateOutParameters && oNavigateOutParameters.hasOwnProperty("additionalText"), "out-parameters has additionalText");
		assert.equal(oNavigateOutParameters && oNavigateOutParameters.additionalText, "Text 3", "out-parameters additionalText");
		aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");
		assert.ok(aSelectedItems[0].inParameters, "selectedItem in-parameters set");
		assert.ok(aSelectedItems[0].inParameters && aSelectedItems[0].inParameters.hasOwnProperty("additionalText"), "selectedItem in-parameters has additionalText");
		assert.equal(aSelectedItems[0].inParameters && aSelectedItems[0].inParameters.additionalText, "Text 3", "selectedItem in-parameters additionalText");
		assert.ok(aSelectedItems[0].outParameters, "selectedItem out-parameters set");
		assert.ok(aSelectedItems[0].outParameters && aSelectedItems[0].outParameters.hasOwnProperty("additionalText"), "selectedItem out-parameters has additionalText");
		assert.equal(aSelectedItems[0].outParameters && aSelectedItems[0].outParameters.additionalText, "Text 3", "selectedItem out-parameters additionalText");

	});

	QUnit.test("assign table while navigate", function(assert) {

		iMaxConditions = 1;
		oWrapper.setTable();
		oWrapper.navigate(1);
		oWrapper.setTable(oTable);
		var aItems = oTable.getItems();
		assert.ok(aItems[2].getSelected(), "Item 2 is selected"); // as item 1 is set as selected
		assert.equal(iNavigate, 1, "Navigate event fired");
		assert.equal(sNavigateDescription, "X-Item 3", "Navigate event description");
		assert.equal(sNavigateKey, "I3", "Navigate event key");
		assert.equal(sNavigateItemId, "MyItem-T1-2", "Navigate event itemId");
		var aSelectedItems = oWrapper.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "selectedItems");
		assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
		assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");

	});

	QUnit.test("navigate with suspended table", function(assert) {

		iMaxConditions = 1;
		var oBinding = oTable.getBinding("items");
		oBinding.suspend();
		oWrapper.navigate(1);

		oModel.setData({
			items:[{text: "New Item 1", key: "I1", additionalText: "Text 1"},
				   {text: "New Item 2", key: "I2", additionalText: "Text 2"},
				   {text: "New X-Item 3", key: "I3", additionalText: "Text 3"}]
			});
		oBinding.resume();

		var fnDone = assert.async();
		setTimeout( function(){ // as model update is async
			var aItems = oTable.getItems();
			assert.ok(aItems[2].getSelected(), "Item 2 is selected"); // as item 1 is set as selected
			assert.equal(iNavigate, 2, "Navigate event fired");
			assert.equal(sNavigateDescription, "New X-Item 3", "Navigate event description");
			assert.equal(sNavigateKey, "I3", "Navigate event key");
			assert.equal(sNavigateItemId, "MyItem-T1-2", "Navigate event itemId");
			var aSelectedItems = oWrapper.getSelectedItems();
			assert.equal(aSelectedItems.length, 1, "selectedItems");
			assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
			assert.equal(aSelectedItems[0].description, "New X-Item 3", "selectedItem description");
			fnDone();
		}, 0);

	});

	QUnit.test("getTextForKey", function(assert) {

		var oResult = oWrapper.getTextForKey("I2");
		assert.ok(typeof oResult === "object", "Object returned");
		assert.equal(oResult.description, "Item 2", "Text for key");
		assert.equal(oResult.key, "I2", "key");
		assert.notOk(oResult.inParameters, "no in-parameters returned");
		assert.notOk(oResult.outParameters, "no out-parameters returned");

		sinon.stub(oWrapper, "_getInParameters").returns(["additionalText"]);
		sinon.stub(oWrapper, "_getOutParameters").returns(["additionalText"]);

		var oFilter = new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "Text 2"});
		oResult = oWrapper.getTextForKey("I2", oFilter);
		assert.equal(oResult.description, "Item 2", "Text for key with in-parameter");
		assert.deepEqual(oResult.inParameters, {additionalText: "Text 2"} , "in-parameters returned");
		assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");

		oResult = oWrapper.getTextForKey("I2", undefined, oFilter);
		assert.equal(oResult.description, "Item 2", "Text for key with out-parameter");
		assert.deepEqual(oResult.inParameters, {additionalText: "Text 2"} , "in-parameters returned");
		assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");
		oFilter.destroy();

		oResult = oWrapper.getTextForKey("Test");
		var oResult2 = oWrapper.getTextForKey("Test", undefined, undefined, false);
		assert.ok(oResult instanceof Promise, "Promise returned as model is asked");
		assert.equal(oResult, oResult2, "Same promise returned for same request");

		var oException;
		try {
			oWrapper.getTextForKey("Test", undefined, undefined, true);
		} catch (oError) {
			oException = oError;
		}
		assert.ok(oException instanceof FormatException, "FormatException fired");

		var fnDone = assert.async();
		oResult.then(function(oResult) {
			assert.notOk(true, "Promise Then must not be called");
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["Test"]);
			assert.equal(oError.message, sError, "Error message");

			oFilter = new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "X"});
			oResult = oWrapper.getTextForKey("I2", oFilter, oFilter);
			assert.ok(oResult instanceof Promise, "Promise returned as model is asked");
			oResult.then(function(oResult) {
				assert.notOk(true, "Promise Then must not be called");
				oFilter.destroy();
				fnDone();
			}).catch(function(oError) {
				assert.ok(oError, "Error Fired");
				assert.ok(oError instanceof FormatException, "Error is a FormatException");
				sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["I2"]);
				assert.equal(oError.message, sError, "Error message");

				oFilter.destroy();
				oFilter = new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "XX"});
				oResult = oWrapper.getTextForKey("X", undefined, oFilter);
				assert.ok(oResult instanceof Promise, "Promise returned as model is asked");
				var oData = oModel.getData();
				oModel.setData({
					items:[{text: "XXX", key: "X", additionalText: "XX"},
						   {text: "YYY", key: "Y", additionalText: "YY"}]
				});

				oResult.then(function(oResult) {
					assert.ok(true, "Promise Then must be called");
					assert.ok(typeof oResult === "object", "Object returned");
					assert.equal(oResult.description, "XXX", "Text for key");
					assert.equal(oResult.key, "X", "key");
					assert.deepEqual(oResult.inParameters, {additionalText: "XX"} , "in-parameters returned");
					assert.deepEqual(oResult.outParameters, {additionalText: "XX"} , "out-parameters returned");
					oFilter.destroy();
					oModel.setData(oData);
					oResult = oWrapper.getTextForKey("Z");

					assert.ok(oResult instanceof Promise, "Promise returned as model is asked");
					oModel.setData({
						items:[{text: "Z1", key: "Z", additionalText: "ZZ1"},
							   {text: "Z2", key: "Z", additionalText: "ZZ2"}]
					});

					oResult.then(function(oResult) {
						assert.notOk(true, "Promise Then must not be called");
						fnDone();
					}).catch(function(oError) {
						assert.ok(oError, "Error Fired");
						assert.ok(oError instanceof FormatException, "Error is a FormatException");
						sError = oResourceBundle.getText("valuehelp.VALUE_NOT_UNIQUE", ["Z"]);
						assert.equal(oError.message, sError, "Error message");

						// check again without request (data exist)
						try {
							oResult = oWrapper.getTextForKey("Z");
						} catch (error) {
							oError = error;
						}
						assert.ok(oError, "Error Fired");
						assert.ok(oError instanceof FormatException, "Error is a FormatException");
						sError = oResourceBundle.getText("valuehelp.VALUE_NOT_UNIQUE", ["Z"]);
						assert.equal(oError.message, sError, "Error message");

						// check using InParameters
						oFilter = new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "ZZ1"});
						oResult = oWrapper.getTextForKey("Z", oFilter);
						assert.ok(typeof oResult === "object", "Object returned");
						assert.equal(oResult.description, "Z1", "Text for key");
						assert.equal(oResult.key, "Z", "key");
						assert.deepEqual(oResult.inParameters, {additionalText: "ZZ1"} , "in-parameters returned");
						assert.deepEqual(oResult.outParameters, {additionalText: "ZZ1"} , "out-parameters returned");
						oFilter.destroy();
						fnDone();
					});
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");
					oFilter.destroy();
					fnDone();
				});
			});
		});

	});

	QUnit.test("getTextForKey with complex InParameters", function(assert) {

		sinon.stub(oWrapper, "_getInParameters").returns(["additionalText", "in2"]);
		sinon.stub(oWrapper, "_getOutParameters").returns(["additionalText"]);

		var aFilters = [];
		aFilters.push(new Filter({path: "in2", operator: FilterOperator.EQ, value1: ""}));
		aFilters.push(new Filter({path: "in2", operator: FilterOperator.EQ, value1: null}));
		var oFilter1 = new Filter({filters: aFilters, and: false});
		aFilters = [];
		aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.BT, value1: "A", value2: "C"}));
		aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "Text 2"}));
		var oFilter2 = new Filter({filters: aFilters, and: false});
		var oFilter = new Filter({filters: [oFilter1, oFilter2], and: true});
		var oResult = oWrapper.getTextForKey("I2", oFilter);
		assert.ok(typeof oResult === "object", "Object returned");
		assert.equal(oResult.description, "Item 2", "Text for key with in-parameter");
		assert.deepEqual(oResult.inParameters, {additionalText: "Text 2", in2: null} , "in-parameters returned");
		assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");
		oFilter.destroy();

		// check no result with AND Filters
		aFilters = [];
		aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "A"}));
		aFilters.push(new Filter({path: "in2", operator: FilterOperator.EQ, value1: "B"}));
		oFilter = new Filter({filters: aFilters, and: true});
		oResult = oWrapper.getTextForKey("I2", oFilter);
		assert.ok(oResult instanceof Promise, "Promise returned as model is asked");

		var fnDone = assert.async();
		oResult.then(function(oResult) {
			assert.notOk(true, "Promise Then must not be called");
			oFilter.destroy();
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["I2"]);
			assert.equal(oError.message, sError, "Error message");
			oFilter.destroy();

			// no result with OR Filters
			aFilters = [];
			aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "A"}));
			aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "B"}));
			oFilter = new Filter({filters: aFilters, and: false});
			oResult = oWrapper.getTextForKey("I2", oFilter);
			oResult.then(function(oResult) {
				assert.notOk(true, "Promise Then must not be called");
				oFilter.destroy();
				fnDone();
			}).catch(function(oError) {
				assert.ok(oError, "Error Fired");
				assert.ok(oError instanceof FormatException, "Error is a FormatException");
				var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["I2"]);
				assert.equal(oError.message, sError, "Error message");
				oFilter.destroy();

				// result with AND Filters and all fit
				aFilters = [];
				aFilters.push(new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "Text 2"}));
				aFilters.push(new Filter({path: "in2", operator: FilterOperator.EQ, value1: null}));
				oFilter = new Filter({filters: aFilters, and: true});
				oResult = oWrapper.getTextForKey("I2", oFilter);
				assert.ok(typeof oResult === "object", "Object returned");
				assert.equal(oResult.description, "Item 2", "Text for key with in-parameter");
				assert.deepEqual(oResult.inParameters, {additionalText: "Text 2", in2: null} , "in-parameters returned");
				assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");
				oFilter.destroy();
				fnDone();
			});
		});

	});

	QUnit.test("getTextForKey using ODataListBinding", function(assert) {

		// fake oData binding - Don't use real logic
		sinon.stub(oValueHelp, "getDelegate").returns({name: "sap/ui/mdc/odata/v4/FieldValueHelpDelegate", payload: {}});
		sinon.stub(oValueHelp, "getControlDelegate").returns(FieldValueHelpDelegateV4);
		var oDataModel = new ODataModel({synchronizationMode: "None", serviceUrl: "x/"});
		var oListBinding = new ODataListBinding(oDataModel, "/items");
		oListBinding.aContexts = [];
		sinon.stub(oListBinding, "initialize").returns(null);
		sinon.stub(oListBinding, "filter").callsFake(function() {
				oListBinding._fireChange({detailedReason: "Ignore", reason: "change"});
				oListBinding._fireChange({reason: "filter"});
		});
		sinon.stub(oListBinding, "getContexts").returns([]);
		sinon.stub(oWrapper, "getListBinding").returns(oListBinding);
		sinon.stub(oDataModel, "bindList").returns(oListBinding);

		var oResult = oWrapper.getTextForKey(""); // as for empty key no result is OK
		assert.ok(oResult instanceof Promise, "Promise returned as model is asked");

		var fnDone = assert.async();
		oResult.then(function(oResult) {
			assert.ok(true, "Promise Then must be called");
			assert.equal(oResult, null, "null returned"); // ok for empty key
			assert.ok(oListBinding.initialize.called, "ListBinding.initialize called");
			assert.ok(oListBinding.filter.called, "ListBinding.filter called");
			assert.ok(oListBinding.getContexts.calledWith(0, 2), "ListBinding.getContexts called");
			oDataModel.destroy(); // ListBinding already destroyed as reused inside Wrappe (bindList stub)
			oValueHelp.getDelegate.restore();
			oValueHelp.getControlDelegate.restore();
			fnDone();
		}).catch(function(oError) {
			assert.notOk(oError, "no Error Fired");
			oDataModel.destroy();
			oValueHelp.getDelegate.restore();
			oValueHelp.getControlDelegate.restore();
			fnDone();
		});

	});

	QUnit.test("getTextForKey - table set late", function(assert) {

		var oTable = oWrapper.getTable();
		oWrapper.setTable();
		sKeyPath = "";

		var fnDone = assert.async();
		var oResult = oWrapper.getTextForKey("I2");
		assert.ok(oResult instanceof Promise, "Promise returned as table not assigned right now");

		sKeyPath = "key";
		oWrapper.setTable(oTable);

		oResult.then(function(oResult) {
			assert.ok(true, "Promise Then must be called");
			assert.equal(oResult.description, "Item 2", "Text for key");

			// without keyPath -> exception
			oWrapper.setTable();
			sKeyPath = "";
			oResult = oWrapper.getTextForKey("I2");
			assert.ok(oResult instanceof Promise, "Promise returned as table not assigned right now");

			oWrapper.setTable(oTable);

			oResult.then(function(oResult) {
				assert.notOk(true, "Promise Then must not be called");
				sKeyPath = "key";
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch must be called");
				assert.equal(oError.message, "missing FieldPath", "Error message");
				sKeyPath = "key";
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("getTextForKey with empty key", function(assert) {

		var oResult = oWrapper.getTextForKey(null);
		assert.equal(oResult, null, "no Text for key = null");

		var fnDone = assert.async();
		oResult = oWrapper.getTextForKey("");
		assert.ok(oResult instanceof Promise, "Promise returned as entry is not found in table");

		oResult.then(function(oResult) {
			assert.ok(true, "Promise Then must be called");
			assert.equal(oResult, null, "empty result");

			oModel.setData({
				items:[{text: "Nothing", key: "", additionalText: "NULL"}]
			});

			oResult = oWrapper.getTextForKey("");
			assert.ok(typeof oResult === "object", "Object returned");
			assert.equal(oResult.description, "Nothing", "Text for key");
			assert.equal(oResult.key, "", "key");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("getKeyForText", function(assert) {

		var oResult = oWrapper.getKeyForText("Item 2");
		assert.ok(typeof oResult === "object", "Object returned");
		assert.equal(oResult.description, "Item 2", "description");
		assert.equal(oResult.key, "I2", "key for text");
		assert.notOk(oResult.inParameters, "no in-parameters returned");
		assert.notOk(oResult.outParameters, "no out-parameters returned");

		sinon.stub(oWrapper, "_getInParameters").returns(["additionalText"]);
		sinon.stub(oWrapper, "_getOutParameters").returns(["additionalText"]);

		oResult = oWrapper.getKeyForText("Item 2");
		assert.ok(typeof oResult === "object", "Object returned");
		assert.equal(oResult.description, "Item 2", "description");
		assert.equal(oResult.key, "I2", "key for text");
		assert.deepEqual(oResult.inParameters, {additionalText: "Text 2"} , "in-parameters returned");
		assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");

		oResult = oWrapper.getKeyForText("");
		assert.equal(oResult, null, "no key for empty text returned");

		var oFilter = new Filter({path: "additionalText", operator: FilterOperator.EQ, value1: "Text 2"});
		oResult = oWrapper.getKeyForText("Item 2", oFilter);
		assert.equal(oResult.description, "Item 2", "description with in-parameters");
		assert.equal(oResult.key, "I2", "key for text with in-parameters");
		assert.deepEqual(oResult.inParameters, {additionalText: "Text 2"} , "in-parameters returned");
		assert.deepEqual(oResult.outParameters, {additionalText: "Text 2"} , "out-parameters returned");
		oFilter.destroy();

		oResult = oWrapper.getKeyForText("X");
		var oResult2 = oWrapper.getKeyForText("X", undefined, false);
		assert.ok(oResult instanceof Promise, "Promise returned as model is asked");
		assert.equal(oResult, oResult2, "Same promise returned for same request");

		var oException;
		try {
			oWrapper.getKeyForText("X", undefined, true);
		} catch (oError) {
			oException = oError;
		}
		assert.ok(oException instanceof ParseException, "ParseException fired");

		var fnDone = assert.async();
		oResult.then(function(oResult) {
			assert.notOk(true, "Promise Then must not be called");
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["X"]);
			assert.equal(oError.message, sError, "Error message");

			oResult = oWrapper.getKeyForText("X");
			assert.notEqual(oResult, oResult2, "new promise returned for same request after resolved");

			fnDone();
		});

	});

	QUnit.test("getListBinding", function(assert) {

		var oListBinding = oWrapper.getListBinding();
		assert.equal(oListBinding, oTable.getBinding("items"), "ListBinding of table returned");

	});

	QUnit.test("selectionChange", function(assert) {

		oWrapper.initialize();
		var fnDone = assert.async();
		setTimeout( function(){ // as model update is async
			var oContent = oWrapper.getDialogContent();
			oContent.placeAt("content"); // render table
			sap.ui.getCore().applyChanges();

			iMaxConditions = 1;
			oWrapper.fieldHelpOpen(true); // suggestion with single selection
			var aItems = oTable.getItems();
			qutils.triggerEvent("tap", aItems[2].getId());
			setTimeout( function(){ // as itemPress is handled async
				assert.equal(iSelect, 1, "Select event fired");
				assert.equal(aSelectItems.length, 1, "one item returned");
				assert.equal(aSelectItems[0].key, "I3", "item key");
				assert.equal(aSelectItems[0].description, "X-Item 3", "item description");
				assert.ok(bSelectItemPress, "itemPress");
				var aSelectedItems = oWrapper.getSelectedItems();
				assert.equal(aSelectedItems.length, 1, "selectedItems");
				assert.equal(aSelectedItems[0].key, "I3", "selectedItem key");
				assert.equal(aSelectedItems[0].description, "X-Item 3", "selectedItem description");
				assert.notOk(aSelectedItems[0].inParameters, "selectedItem no in-parameters");
				assert.notOk(aSelectedItems[0].outParameters, "selectedItem no out-parameters");
				oWrapper.fieldHelpClose();

				iSelect = 0;
				bUseInParameters = true;
				bUseOutParameters = true;
				iMaxConditions = -1;
				oWrapper.fieldHelpOpen(false); // dialog with multi selection
				qutils.triggerEvent("tap", aItems[1].getId());
				setTimeout( function(){ // as itemPress is handled async
					assert.equal(iSelect, 1, "Select event fired");
					assert.equal(aSelectItems.length, 2, "two items returned");
					assert.equal(aSelectItems[0].key, "I2", "item key");
					assert.equal(aSelectItems[0].description, "Item 2", "item description");
					assert.ok(aSelectItems[0].inParameters, "item in-parameters set");
					assert.ok(aSelectItems[0].inParameters && aSelectItems[0].inParameters.hasOwnProperty("additionalText"), "item in-parameters has additionalText");
					assert.equal(aSelectItems[0].inParameters && aSelectItems[0].inParameters.additionalText, "Text 2", "item in-parameters additionalText");
					assert.ok(aSelectItems[0].outParameters, "item out-parameters set");
					assert.ok(aSelectItems[0].outParameters && aSelectItems[0].outParameters.hasOwnProperty("additionalText"), "item out-parameters has additionalText");
					assert.equal(aSelectItems[0].outParameters && aSelectItems[0].outParameters.additionalText, "Text 2", "item out-parameters additionalText");
					assert.equal(aSelectItems[1].key, "I3", "item key");
					assert.equal(aSelectItems[1].description, "X-Item 3", "item description");
					assert.ok(aSelectItems[1].inParameters, "item in-parameters set");
					assert.ok(aSelectItems[1].inParameters && aSelectItems[1].inParameters.hasOwnProperty("additionalText"), "item in-parameters has additionalText");
					assert.equal(aSelectItems[1].inParameters && aSelectItems[1].inParameters.additionalText, "Text 3", "item in-parameters additionalText");
					assert.ok(aSelectItems[1].outParameters, "item out-parameters set");
					assert.ok(aSelectItems[1].outParameters && aSelectItems[1].outParameters.hasOwnProperty("additionalText"), "item out-parameters has additionalText");
					assert.equal(aSelectItems[1].outParameters && aSelectItems[1].outParameters.additionalText, "Text 3", "item out-parameters additionalText");
					var aSelectedItems = oWrapper.getSelectedItems();
					assert.equal(aSelectedItems.length, 2, "selectedItems");
					assert.equal(aSelectedItems[0].key, "I2", "selectedItem key");
					assert.equal(aSelectedItems[0].description, "Item 2", "selectedItem description");
					assert.ok(aSelectedItems[0].inParameters, "selectedItem in-parameters set");
					assert.ok(aSelectedItems[0].inParameters && aSelectedItems[0].inParameters.hasOwnProperty("additionalText"), "selectedItem in-parameters has additionalText");
					assert.equal(aSelectedItems[0].inParameters && aSelectedItems[0].inParameters.additionalText, "Text 2", "selectedItem in-parameters additionalText");
					assert.ok(aSelectedItems[0].outParameters, "selectedItem out-parameters set");
					assert.ok(aSelectedItems[0].outParameters && aSelectedItems[0].outParameters.hasOwnProperty("additionalText"), "selectedItem out-parameters has additionalText");
					assert.equal(aSelectedItems[0].outParameters && aSelectedItems[0].outParameters.additionalText, "Text 2", "selectedItem out-parameters additionalText");
					assert.equal(aSelectedItems[1].key, "I3", "selectedItem key");
					assert.equal(aSelectedItems[1].description, "X-Item 3", "selectedItem description");
					assert.ok(aSelectedItems[1].inParameters, "selectedItem in-parameters set");
					assert.ok(aSelectedItems[1].inParameters && aSelectedItems[1].inParameters.hasOwnProperty("additionalText"), "selectedItem in-parameters has additionalText");
					assert.equal(aSelectedItems[1].inParameters && aSelectedItems[1].inParameters.additionalText, "Text 3", "selectedItem in-parameters additionalText");
					assert.ok(aSelectedItems[1].outParameters, "selectedItem out-parameters set");
					assert.ok(aSelectedItems[1].outParameters && aSelectedItems[1].outParameters.hasOwnProperty("additionalText"), "selectedItem out-parameters has additionalText");
					assert.equal(aSelectedItems[1].outParameters && aSelectedItems[1].outParameters.additionalText, "Text 3", "selectedItem out-parameters additionalText");

					// check selected items not in table (because filtering) untouched
					oWrapper.setSelectedItems([{key: "I4", description: "Item 4"}]);
					iSelect = 0;
					qutils.triggerEvent("tap", aItems[2].getId());
					setTimeout( function(){ // as itemPress is handled async
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(aSelectItems.length, 2, "two items returned");
						assert.equal(aSelectItems[0].key, "I4", "item key");
						assert.equal(aSelectItems[0].description, "Item 4", "item description");
						assert.equal(aSelectItems[1].key, "I3", "item key");
						assert.equal(aSelectItems[1].description, "X-Item 3", "item description");
						var aSelectedItems = oWrapper.getSelectedItems();
						assert.equal(aSelectedItems.length, 2, "selectedItems");
						assert.equal(aSelectedItems[0].key, "I4", "selectedItem key");
						assert.equal(aSelectedItems[0].description, "Item 4", "selectedItem description");
						assert.equal(aSelectedItems[1].key, "I3", "selectedItem key");
						assert.equal(aSelectedItems[1].description, "X-Item 3", "selectedItem description");
						oWrapper.fieldHelpClose();
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("clone", function(assert) {

		var oModel = new JSONModel({
			items:[]
		});
		var oTable = oWrapper.getTable();
		oTable.setModel(oModel);

		oWrapper.initialize();
		var fnDone = assert.async();
		setTimeout( function(){ // as model update is async
			var oClone = oWrapper.clone("MyClone");
			assert.ok(oClone, "Wrapper cloned");

			oClone.getParent = function() {
				return oValueHelp;
			};

			var oCloneTable = oClone.getTable();
			assert.ok(oCloneTable, "Clone has Table");
			assert.equal(oCloneTable.getId(), "T1-MyClone", "Id of cloned Table");

			// simulate update finished
			iDataUpdate = 0;
			sDataUpdateId = undefined;
			oTable.fireUpdateFinished({reason: "Test"});
			assert.equal(iDataUpdate, 1, "DataUpdate event fired once");
			assert.equal(sDataUpdateId, oWrapper.getId(), "DataUpdate Id");

			iDataUpdate = 0;
			sDataUpdateId = undefined;
			oCloneTable.fireUpdateFinished({reason: "Test"});
			assert.equal(iDataUpdate, 1, "DataUpdate event on clone fired once");
			assert.equal(sDataUpdateId, oClone.getId(), "DataUpdate Id on clone");

			// simulate selection
			oTable.fireSelectionChange();
			assert.equal(iSelect, 1, "Select event fired once");
			assert.equal(sSelectId, oWrapper.getId(), "Select Id");

			iSelect = 0;
			sSelectId = undefined;
			oCloneTable.fireSelectionChange();
			assert.equal(iSelect, 1, "Select event on clone fired once");
			assert.equal(sSelectId, oClone.getId(), "Select Id on clone");

			oModel.destroy();
			fnDone();
		}, 0);

	});

	QUnit.test("isSuspended", function(assert) {

		var oListBinding = oWrapper.getListBinding();

		assert.notOk(oWrapper.isSuspended(), "Wrapper not suspended");

		oListBinding.suspend();
		assert.ok(oWrapper.isSuspended(), "Wrapper suspended");

		oTable.setModel();
		assert.ok(oWrapper.isSuspended(), "Wrapper suspended"); // as no ListBinding

	});

	QUnit.test("applyFilters", function(assert) {

		// simulate V4 logic in this test too
		sinon.stub(oValueHelp, "getDelegate").returns({name: "sap/ui/mdc/odata/v4/FieldValueHelpDelegate", payload: {}});
		sinon.stub(oValueHelp, "getControlDelegate").returns(FieldValueHelpDelegateV4);
		sinon.spy(FieldValueHelpDelegateV4, "isSearchSupported"); // returns false for non V4-ListBinding
		sinon.spy(FieldValueHelpDelegateV4, "executeSearch"); //test V4 logic
		var oFilter = new Filter({path: "additionalText", operator: "EQ", value1: "Text 2"});
		var oListBinding = oWrapper.getListBinding(); // just test the call of the ListBinding, we need not to test the table here

		sinon.spy(oListBinding, "filter");
		oWrapper.applyFilters([oFilter]);
		assert.ok(oListBinding.filter.calledWith([oFilter], "Application"), "ListBinding filtered");
		assert.ok(FieldValueHelpDelegateV4.isSearchSupported.called, "FieldValueHelpDelegate.isSearchSupported called");
		assert.notOk(FieldValueHelpDelegateV4.executeSearch.called, "FieldValueHelpDelegate.executeSearch not called");
		oListBinding.filter.reset();

		oWrapper.applyFilters();
		assert.ok(oListBinding.filter.calledWith([], "Application"), "ListBinding filter removed");
		oListBinding.filter.reset();

		oWrapper.applyFilters();
		assert.notOk(oListBinding.filter.calledWith([], "Application"), "ListBinding filter not called again");
		oListBinding.filter.reset();

		oListBinding.suspend();
		oWrapper.applyFilters([oFilter]);
		assert.ok(oListBinding.filter.calledWith([oFilter], "Application"), "ListBinding filtered");
		oListBinding.filter.reset();
		assert.notOk(oListBinding.isSuspended(), "ListBinding is resumed");

		var oListBinding = oWrapper.getListBinding();
		oListBinding.changeParameters = function(oParameters) {}; // just fake V4 logic
		sinon.spy(oListBinding, "changeParameters");
		oWrapper.applyFilters([oFilter], "X");
		assert.ok(oListBinding.filter.calledWith([oFilter], "Application"), "ListBinding filtered");
		assert.ok(FieldValueHelpDelegateV4.isSearchSupported.called, "FieldValueHelpDelegate.isSearchSupported called");
		assert.ok(FieldValueHelpDelegateV4.executeSearch.called, "FieldValueHelpDelegate.executeSearch called");
		assert.ok(FieldValueHelpDelegateV4.executeSearch.calledWith({}, oListBinding, "X"), "FieldValueHelpDelegate.executeSearch called parameters");
		assert.ok(oListBinding.changeParameters.calledWith({$search: "X"}), "ListBinding.changeParameters called with search string");
		assert.notOk(oListBinding.isSuspended(), "ListBinding is resumed");
		oListBinding.filter.reset();

		oWrapper.applyFilters([oFilter], "");
		assert.ok(oListBinding.changeParameters.calledWith({$search: undefined}), "ListBinding.changeParameters called with no search string");
		oListBinding.filter.reset();

		FieldValueHelpDelegateV4.isSearchSupported.restore();
		FieldValueHelpDelegateV4.executeSearch.restore();
		oValueHelp.getDelegate.restore();
		oValueHelp.getControlDelegate.restore();

	});

	QUnit.test("applyFilters with Table set late", function(assert) {

		var oFilter = new Filter({path: "additionalText", operator: "EQ", value1: "Text 2"});
		var oListBinding = oWrapper.getListBinding(); // just test the call of the ListBinding, we need not to test the table here
		oWrapper.setTable();

		sinon.spy(oListBinding, "filter");
		oWrapper.applyFilters([oFilter]);
		oWrapper.setTable(oTable);

		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Table Promise is resolved
			assert.ok(oListBinding.filter.calledWith([oFilter], "Application"), "ListBinding filtered");
			oListBinding.filter.reset();
			fnDone();
		}, 0);

	});

	// test integration to FieldValueHelp //

	var iFVHSelect = 0;
	var aFVHSelectConditions;
	var bFVHSelectAdd;
	var _myFVHSelectHandler = function(oEvent) {
		iFVHSelect++;
		aFVHSelectConditions = oEvent.getParameter("conditions");
		bFVHSelectAdd = oEvent.getParameter("add");
	};

	var iFVHNavigate = 0;
	var sFVHNavigateValue;
	var sFVHNavigateKey;
	var sFVHNavigateItemId;
	var _myFVHNavigateHandler = function(oEvent) {
		iFVHNavigate++;
		sFVHNavigateValue = oEvent.getParameter("value");
		sFVHNavigateKey = oEvent.getParameter("key");
		sFVHNavigateItemId = oEvent.getParameter("itemId");
	};

	var iFVHDataUpdate = 0;
	var _myFVHDataUpdateHandler = function(oEvent) {
		iFVHDataUpdate++;
	};

	var _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable

	var _initFieldHelp = function() {
		oField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		oField.getFieldPath = function() {return "key";};
		oField.placeAt("content");

		_initWrapper(true);
		oWrapper.setSelectedItems(); // to initialize

		oFieldHelp = new FieldValueHelp("F1-H", {
					select: _myFVHSelectHandler,
					navigate: _myFVHNavigateHandler,
					dataUpdate: _myFVHDataUpdateHandler,
					content: oWrapper,
					filterFields: "*text,additionalText*",
					keyPath: "key",
					descriptionPath: "text"
				});

		sap.ui.getCore().applyChanges();

		oField.addDependent(oFieldHelp);
		oField.focus();
		oFieldHelp.connect(oField);
	};

	var _teardownFVH = function() {
		_teardown();
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		iFVHSelect = 0;
		aFVHSelectConditions = undefined;
		bFVHSelectAdd = undefined;
		iFVHNavigate = 0;
		sFVHNavigateValue = undefined;
		sFVHNavigateKey = undefined;
		sFVHNavigateItemId = undefined;
		iFVHDataUpdate = 0;
	};

	QUnit.module("FieldValueHelp integration: Suggestion", {
		beforeEach: function() {
			_initFieldHelp();
			oClock = sinon.useFakeTimers();
		},
		afterEach: _teardownFVH
	});

	QUnit.test("table display in suggestion", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.ok(oPopover.isOpen(), "Popover is open");
			var oMyTable = oPopover._getAllContent()[0];
			assert.ok(oMyTable, "Popover has content");
			assert.equal(oMyTable.getId(), "T1", "content is Table");
			assert.ok(iFVHDataUpdate > 0, "DataUpdate event fired"); // one for adding wrapper, one for table update (sometimes table updated before event assigned)
			assert.equal(oPopover.getInitialFocus(), "I1", "Initial focus on Field");
			assert.equal(oMyTable.getMode(), "SingleSelectMaster", "Table is single Select");
		}
		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("FilterValue in suggestion", function(assert) {

		oFieldHelp.setFilterValue("It");

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aItems = oTable.getItems();
			assert.equal(aItems.length, 2, "List has 2 Items");
			oFieldHelp.setFilterValue("X");
			oClock.tick(0); // update binding

			aItems = oTable.getItems();
			assert.equal(aItems.length, 1, "List has 1 Item");
			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
		}

	});

	QUnit.test("navigate in suggestion", function(assert) {

		oFieldHelp.navigate(1);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.ok(oPopover.isOpen(), "Field help opened");
			var aItems = oTable.getItems();
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iFVHNavigate, 1, "Navigate event fired");
			assert.equal(sFVHNavigateValue, "Item 1", "Navigate event value");
			assert.equal(sFVHNavigateKey, "I1", "Navigate event key");
			assert.equal(sFVHNavigateItemId, "MyItem-T1-0", "Navigate event itemId");

			oFieldHelp.navigate(1);
			aItems = oTable.getItems();
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iFVHNavigate, 2, "Navigate event fired");
			assert.equal(sFVHNavigateValue, "Item 2", "Navigate event value");
			assert.equal(sFVHNavigateKey, "I2", "Navigate event key");
			assert.equal(sFVHNavigateItemId, "MyItem-T1-1", "Navigate event itemId");
			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
		}

	});

	QUnit.test("navigate in suggestion for multi-value", function(assert) {

		oField.getMaxConditions = function() {return -1;};
		oFieldHelp.navigate(1);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.ok(oPopover.isOpen(), "Field help opened");
			assert.equal(oTable.getMode(), "MultiSelect", "Table mode in suggestion");

			var oFocusedElement = document.activeElement;
			var aItems = oTable.getItems();
			assert.notOk(aItems[0].getSelected(), "Item 1 is not selected");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.notOk(sNavigateKey, "Navigate event key");
			assert.notOk(sNavigateDescription, "Navigate event description");
			assert.notOk(sNavigateItemId, "Navigate event itemId");
			assert.notOk(bNavigateLeave, "Navigate event leave");
			assert.equal(aItems[0].getId(), oFocusedElement.id, "Item 1 is focused");

			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[0].getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 0, "Navigate event not fired");
			assert.equal(aItems[1].getId(), oFocusedElement.id, "Item 2 is focused");

			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[1].getFocusDomRef().id, KeyCodes.SPACE, false, false, false);
			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectItems.length, 1, "one item returned");
			assert.equal(aSelectItems[0].key, "I2", "item key");
			assert.equal(aSelectItems[0].description, "Item 2", "item description");
			assert.notOk(bSelectItemPress, "itemPress");

			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[1].getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 0, "Navigate event not fired");
			assert.equal(aItems[0].getId(), oFocusedElement.id, "Item 1 is focused");

			sinon.spy(oField, "focus");
			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[0].getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.notOk(sNavigateKey, "Navigate event key");
			assert.notOk(sNavigateDescription, "Navigate event description");
			assert.notOk(sNavigateItemId, "Navigate event itemId");
			assert.ok(bNavigateLeave, "Navigate event leave");
			assert.ok(oField.focus.called, "focus set on Field");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
		}

	});

	QUnit.test("select item in suggestion", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aItems = oTable.getItems();
			qutils.triggerEvent("tap", aItems[1].getId());
			oClock.tick(iPopoverDuration); // fake closing time

			assert.equal(iFVHSelect, 1, "Select event fired");
			assert.equal(aFVHSelectConditions.length, 1, "one condition returned");
			assert.equal(aFVHSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aFVHSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aFVHSelectConditions[0].values[1], "Item 2", "Condition values[1}");
			assert.ok(bFVHSelectAdd, "Items should be added");
			assert.notOk(oPopover.isOpen(), "Field help closed");
		}

	});

	QUnit.module("FieldValueHelp integration: Dialog", {
		beforeEach: function() {
			_initFieldHelp();
			oClock = sinon.useFakeTimers();
		},
		afterEach: _teardownFVH
	});

	QUnit.test("table display in dialog", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		if (oDialog) {
			assert.ok(oDialog.isOpen(), "Dialog is open");
			var oVHP = oDialog.getContent()[0];
			assert.ok(iFVHDataUpdate > 0, "DataUpdate event fired"); // one for adding wrapper, one for table update (sometimes table updated before event assigned)
			var oScroll = oVHP.getTable();
			assert.ok(oScroll, "ValueHelpPanel has table assigned");
			assert.ok(oScroll && oScroll.isA("sap.m.ScrollContainer"), "content is ScrollContainer");
			assert.equal(oScroll.getId(), "W1-SC", "ScrollContainer ID");
			var oMyTable = oScroll.getContent()[0];
			assert.ok(oMyTable, "ScrollContainer has content");
			assert.equal(oMyTable.getId(), "T1", "content is Table");
			assert.equal(oMyTable.getMode(), "SingleSelectLeft", "Table is single Select");
		}

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("selected item in dialog", function(assert) {

		oFieldHelp.setConditions([Condition.createItemCondition("I2", "Item 2")]);

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		if (oDialog) {
			var aItems = oTable.getItems();
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			oFieldHelp.setConditions([Condition.createItemCondition("I3", "Item 3")]);
			assert.notOk(aItems[1].getSelected(), "Item 2 is not selected");
			assert.ok(aItems[2].getSelected(), "Item 3 is selected");
		}

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("select item in dialog", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		if (oDialog) {
			var aItems = oTable.getItems();
			qutils.triggerEvent("tap", aItems[0].getId());
			qutils.triggerEvent("tap", aItems[1].getId());
			oClock.tick(0); // itemPress is async

			assert.equal(iFVHSelect, 0, "Select event not fired");

			var aButtons = oDialog.getButtons();
			aButtons[0].firePress(); // simulate button press
			oClock.tick(iDialogDuration); // fake closing time

			assert.equal(iFVHSelect, 1, "Select event fired after OK");
			assert.equal(aFVHSelectConditions.length, 1, "one condition returned");
			assert.equal(aFVHSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aFVHSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aFVHSelectConditions[0].values[1], "Item 2", "Condition values[1}");
			assert.notOk(bFVHSelectAdd, "Items should not be added");
			assert.notOk(oDialog.isOpen(), "Field help closed");
		}

	});

	QUnit.test("select more items in dialog", function(assert) {

		oField.getMaxConditions = function() {return -1;};
		oFieldHelp.connect(oField);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		if (oDialog) {
			oTable.focus(); // to be sure focus is on table
			var aItems = oTable.getItems();
			aItems[0]._eventHandledByControl = true; // fake press on checkBox
			qutils.triggerEvent("tap", aItems[0].getId() + "-selectMulti");
			aItems[1]._eventHandledByControl = true; // fake press on checkBox
			qutils.triggerEvent("tap", aItems[1].getId() + "-selectMulti");
			assert.equal(iFVHSelect, 0, "Select event not fired");

			var aButtons = oDialog.getButtons();
			aButtons[0].firePress(); // simulate button press
			oClock.tick(iDialogDuration); // fake closing time

			assert.equal(iFVHSelect, 1, "Select event fired after OK");
			assert.equal(aFVHSelectConditions.length, 2, "two conditions returned");
			assert.equal(aFVHSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aFVHSelectConditions[0].values[0], "I1", "Condition values[0}");
			assert.equal(aFVHSelectConditions[0].values[1], "Item 1", "Condition values[1}");
			assert.equal(aFVHSelectConditions[1].operator, "EQ", "Condition operator");
			assert.equal(aFVHSelectConditions[1].values[0], "I2", "Condition values[0}");
			assert.equal(aFVHSelectConditions[1].values[1], "Item 2", "Condition values[1}");
			assert.notOk(bFVHSelectAdd, "Items should not be added");
			assert.notOk(oDialog.isOpen(), "Field help closed");
		}

	});

	QUnit.test("navigate in table for multi-value", function(assert) {

		oField.getMaxConditions = function() {return -1;};
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		if (oDialog) {
			assert.ok(oDialog.isOpen(), "Field help opened");
			assert.equal(oTable.getMode(), "MultiSelect", "Table mode in dialog");

			oTable.focus(); // to be sure focus is on table
			var oFocusedElement = document.activeElement;
			var aItems = oTable.getItems();
			assert.equal(aItems[0].getId(), oFocusedElement.id, "Item 1 is focused");

			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[0].getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 0, "Navigate event not fired");
			assert.equal(aItems[1].getId(), oFocusedElement.id, "Item 2 is focused");

			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[1].getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 0, "Navigate event not fired");
			assert.equal(aItems[0].getId(), oFocusedElement.id, "Item 1 is focused");

			sinon.spy(oField, "focus");
			iNavigate = 0; sNavigateKey = undefined; sNavigateDescription = undefined; sNavigateItemId = undefined; bNavigateLeave = undefined;
			qutils.triggerKeyboardEvent(aItems[0].getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
			oFocusedElement = document.activeElement;
			assert.equal(iNavigate, 0, "Navigate event not fired");
			assert.notOk(oField.focus.called, "focus not set on Field");
			assert.ok(jQuery(oFocusedElement).hasClass("sapMListTblHeader"), "Focus is set on table-header");

			oFieldHelp.close();
			oClock.tick(iDialogDuration); // fake closing time
		}

	});


});
