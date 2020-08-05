// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/ListFieldHelp",
	"sap/ui/mdc/field/FieldHelpBaseDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/core/ListItem",
	"sap/ui/core/Icon",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/Filter",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/DisplayListItem"
], function (
		qutils,
		ListFieldHelp,
		FieldHelpBaseDelegate,
		Condition,
		ConditionValidated,
		ListItem,
		Icon,
		FormatException,
		ParseException,
		Filter,
		mLibrary,
		Popover,
		List,
		DisplayListItem
	) {
	"use strict";

	var oFieldHelp;
	var oField;
	var oField2;
	var iDisconnect = 0;
	var iSelect = 0;
	var aSelectConditions;
	var bSelectAdd;
	var bSelectClose;
	var iNavigate = 0;
	var sNavigateValue;
	var sNavigateKey;
	var oNavigateCondition;
	var sNavigateItemId;
	var iDataUpdate = 0;
	var iOpen = 0;

	var _myDisconnectHandler = function(oEvent) {
		iDisconnect++;
	};

	var _mySelectHandler = function(oEvent) {
		iSelect++;
		aSelectConditions = oEvent.getParameter("conditions");
		bSelectAdd = oEvent.getParameter("add");
		bSelectClose = oEvent.getParameter("close");
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
		sNavigateValue = oEvent.getParameter("value");
		sNavigateKey = oEvent.getParameter("key");
		oNavigateCondition = oEvent.getParameter("condition");
		sNavigateItemId = oEvent.getParameter("itemId");
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
	};

	var _myOpenHandler = function(oEvent) {
		iOpen++;
	};

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	var _initFields = function() {
		oField = new Icon("I1", {src:"sap-icon://sap-ui5"});
		oField2 = new Icon("I2", {src:"sap-icon://sap-ui5"});

		oField.placeAt("content");
		oField2.placeAt("content");
		sap.ui.getCore().applyChanges();
	};

	var _teardown = function() {
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		oField2.destroy();
		oField2 = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		bSelectClose = undefined;
		iNavigate = 0;
		sNavigateValue = undefined;
		sNavigateKey = undefined;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		iDataUpdate = 0;
		iOpen = 0;
		ListFieldHelp._init();
	};

	QUnit.module("ListFieldHelp", {
		beforeEach: function() {
			oFieldHelp = new ListFieldHelp("F1-H", {
				items: [new ListItem("item1", {text: "Item1", additionalText: "Text1", key: "I1"}),
						new ListItem("item2", {text: "Item2", additionalText: "Text2", key: "I2"}),
						new ListItem("item3", {text: "X-Item3", additionalText: "Text3", key: "I3"})
					   ],
				disconnect: _myDisconnectHandler,
				select: _mySelectHandler,
				navigate: _myNavigateHandler,
				dataUpdate: _myDataUpdateHandler,
				open: _myOpenHandler
			});
			_initFields();
			oField.addDependent(oFieldHelp);
		},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.ok(oFieldHelp.openByTyping(), "openByTyping");
		assert.notOk(oFieldHelp.isFocusInHelp(), "isFocusInHelp");
		assert.ok(oFieldHelp.isUsableForValidation(), "isUsableForValidation");

	});

	function _listCreation(assert) {

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			var oList = oPopover.getContent()[0];
			assert.ok(oList, "Popover has content");
			assert.ok(oList instanceof List, "content is List");
			var aItems = oList.getItems();
			assert.equal(aItems.length, 3, "List has 3 Items");
			assert.ok(aItems[0] instanceof DisplayListItem, "Item is DisplayListItem");
			assert.equal(aItems[0].getLabel(), "Item1", "Text assigned to item");
			assert.equal(aItems[0].getValue(), "Text1", "AdditinalText assigned to item");
			assert.equal(iDataUpdate, 0, "DataUpdate event not fired");
			assert.equal(oPopover.getInitialFocus(), "I1", "Initial focus on Field");
		}

	}

	QUnit.test("List creation", function(assert) {

		assert.notOk(oFieldHelp._oList, "no List created by default");

		oFieldHelp.open();

		_listCreation(assert);

	});

	QUnit.test("List creation (loading list async)", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/List").onFirstCall().returns(undefined);
		oStub.callThrough();

		oFieldHelp.open();
		var fnDone = assert.async();
		setTimeout( function(){ // to wait for loading list
			_listCreation(assert);
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("conditions", function(assert) {

		var oCondition = Condition.createItemCondition("I2", "Item2");
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			oCondition = Condition.createItemCondition("I3");
			oFieldHelp.setConditions([oCondition]);
			assert.notOk(aItems[1].getSelected(), "Item 2 is not selected");
			assert.ok(aItems[2].getSelected(), "Item 3 is selected");
		}

	});

	QUnit.test("FilterValue", function(assert) {

		oFieldHelp.setFilterValue("It");

		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.equal(aItems.length, 2, "List has 2 Items");
			assert.equal(aItems[0].getLabel(), "Item1", "Text assigned to item1");
			assert.equal(aItems[1].getLabel(), "Item2", "Text assigned to item2");
			oFieldHelp.setFilterValue("X");
			aItems = oList.getItems();
			assert.equal(aItems.length, 1, "List has 1 Item");
			assert.equal(aItems[0].getLabel(), "X-Item3", "Text assigned to item1");
		}

	});

	QUnit.test("navigate", function(assert) {

		oFieldHelp.navigate(1);

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			assert.ok(oPopover.isOpen(), "Field help opened");
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.equal(sNavigateValue, "Item1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "Item1", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate itemId");
			var aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I1", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

			oFieldHelp.navigate(1);
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iNavigate, 2, "Navigate event fired");
			assert.equal(sNavigateValue, "Item2", "Navigate event value");
			assert.equal(sNavigateKey, "I2", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I2", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "Item2", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-1", "Navigate itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I2", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

			oFieldHelp.navigate(-1);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 3, "Navigate event fired");
			assert.equal(sNavigateValue, "Item1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "Item1", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I1", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

			oFieldHelp.navigate(-1);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 3, "Navigate event not fired");

			oFieldHelp.navigate(5);
			assert.ok(aItems[2].getSelected(), "Item 3 is selected");
			assert.equal(iNavigate, 4, "Navigate event fired");
			assert.equal(sNavigateValue, "X-Item3", "Navigate event value");
			assert.equal(sNavigateKey, "I3", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I3", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "X-Item3", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-2", "Navigate itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I3", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

			oFieldHelp.setConditions([]); // to initialize
			oFieldHelp.navigate(-1);
			assert.ok(aItems[2].getSelected(), "Item 3 is selected");
			assert.equal(iNavigate, 5, "Navigate event fired");
			assert.equal(sNavigateValue, "X-Item3", "Navigate event value");
			assert.equal(sNavigateKey, "I3", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I3", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "X-Item3", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-2", "Navigate itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I3", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

			oFieldHelp.navigate(1);
			assert.ok(aItems[2].getSelected(), "Item 3 is selected");
			assert.equal(iNavigate, 5, "Navigate event not fired");

			oFieldHelp.navigate(-5);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 6, "Navigate event fired");
			assert.equal(sNavigateValue, "Item1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "Item1", "NavigateEvent condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], "I1", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
		}

	});

	QUnit.test("getTextForKey", function(assert) {

		var sText = oFieldHelp.getTextForKey("I2");
		assert.equal(sText, "Item2", "Text for key");

		sText = oFieldHelp.getTextForKey("");
		assert.equal(sText, null, "No text for empty key");

		sText = oFieldHelp.getTextForKey(null);
		assert.equal(sText, null, "No text for empty key");

		try {
			sText = oFieldHelp.getTextForKey("Test");
		} catch (oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["Test"]);
			assert.equal(oError.message, sError, "Error message");
		}

	});

	QUnit.test("getKeyForText", function(assert) {

		var sKey = oFieldHelp.getKeyForText("Item2");
		assert.equal(sKey, "I2", "key for text");

		sKey = oFieldHelp.getKeyForText("");
		assert.equal(sKey, null, "no key for empty text");

		try {
			sKey = oFieldHelp.getKeyForText("X");
		} catch (oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["X"]);
			assert.equal(oError.message, sError, "Error message");
		}

	});

	QUnit.test("select item", function(assert) {

		var oClock = sinon.useFakeTimers();
		oFieldHelp.open();
		oClock.tick(500); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			qutils.triggerEvent("tap", aItems[1].getId());
			oClock.tick(500); // fake closing time

			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectConditions.length, 1, "one condition returned");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aSelectConditions[0].values[1], "Item2", "Condition values[1}");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.ok(bSelectAdd, "Items should be added");
			assert.ok(bSelectClose, "FieldHelp closed in Event");
			var aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aConditions[0].values[0], "I2", "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.notOk(oPopover.isOpen(), "Field help closed");
		}

		oClock.restore();

	});

	QUnit.test("dataUpdate", function(assert) {

		var oItem = new ListItem({text: "Item4", additionalText: "Text4", key: "I4"});
		oFieldHelp.addItem(oItem);
		assert.equal(iDataUpdate, 1, "DataUpdateEvent fired by adding item");

		oItem.setText("Test");
		assert.equal(iDataUpdate, 2, "DataUpdateEvent fired by changing item");

		oFieldHelp.removeItem(oItem);
		assert.equal(iDataUpdate, 3, "DataUpdateEvent fired by removing item");

		oItem.setText("X");
		assert.equal(iDataUpdate, 3, "DataUpdateEvent not fired by changing removed item");

		oItem.destroy();

	});

	QUnit.test("Select-Like ListFieldHelp", function(assert) {

		oFieldHelp.setFilterList(false);
		oFieldHelp.setUseFirstMatch(true);

		assert.ok(oFieldHelp.openByClick(), "openByClick should be true, when FilterList is set to false");


		var oList;
		var aItems;

		// when setting a filterValue the number of items should be stable and not change
		oFieldHelp.setFilterValue("It");
		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			oList = oPopover.getContent()[0];
			aItems = oList.getItems();
			assert.equal(aItems.length, 3, "List has 3 Items");

			oFieldHelp.setFilterValue("X");
			aItems = oList.getItems();
			assert.equal(aItems.length, 3, "List has 3 Items");
		}


		// The first filtered and matching item should be selected when 'UseFirstMatch is true'
		oFieldHelp.setFilterValue("X");

		oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			oList = oPopover.getContent()[0];
			aItems = oList.getItems();
			assert.ok(aItems[2].getSelected(), "Item 2 is selected");
		}


		var oObj = oFieldHelp.getKeyForText("X");
		assert.equal(oObj.key, "I3", "key for text");

		try {
			oObj = oFieldHelp.getKeyForText("foo");
		} catch (oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["foo"]);
			assert.equal(oError.message, sError, "Error message");
		}
	});

});
